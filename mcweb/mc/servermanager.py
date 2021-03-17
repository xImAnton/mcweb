from typing import Optional
from .server import MinecraftServer
import aiohttp
import aiofiles
from mcweb.io.config import Config
import os
from .versions.manager import VersionManager
from mcweb.util import json_res
import subprocess
from bson.objectid import ObjectId
import pymongo.errors
import sys
from json import dumps as json_dumps


class ServerManager:
    """
    class for managing all servers of the mcweb instance
    """
    def __init__(self, mc):
        self.mc = mc
        self.servers = []
        self.versions = VersionManager()

    async def init(self) -> None:
        """
        fetches all servers and adds them to its server list
        """
        try:
            async for server in self.mc.mongo["server"].find({}):
                s = MinecraftServer(self.mc, server)
                await s.set_online_status(0)
                self.servers.append(s)
        except pymongo.errors.ServerSelectionTimeoutError:
            print("No connection to mongodb could be established. Check your preferences in the config.json and if your mongo server is running!")
            self.mc.stop()
            sys.exit(1)

        await self.versions.reload_all()

    async def get_ids(self):
        return [x.id for x in self.servers]

    async def get_server(self, i) -> Optional[MinecraftServer]:
        """
        returns a server for the given id
        :param i: the id of the server
        """
        for server in self.servers:
            if str(server.id) == i:
                return server
        return None

    async def create_server(self, name, server, version, ram):
        # check if version existing
        versions = await self.versions.get_json()
        if server not in versions.keys():
            return json_res({"error": "Invalid Server", "description": "use /server/versions to view all valid servers and versions", "status": 404}, status=404)
        if version not in versions[server]:
            return json_res({"error": "Invalid Version", "description": "use /server/versions to view all valid servers and versions", "status": 404}, status=404)

        # Check ram
        if ram > Config.MAX_RAM:
            return json_res({"error": "Too Much RAM", "description": "maximal ram is " + str(Config.MAX_RAM), "status": 400, "maxRam": Config.MAX_RAM}, status=400)

        # Lowercase, no special char server name
        display_name = name
        name = ServerManager.format_name(name)

        # check if server with name is existing
        while not await self.is_name_available(name):
            name += "-"

        # generate path name and dir
        dir_ = os.path.join(os.path.join(os.getcwd(), "servers"), name)
        while os.path.isdir(dir_):
            dir_ += "-server"
        os.mkdir(dir_)

        # Download Server jar
        out_file = "server.jar"
        if server == "forge":
            out_file = "installer.jar"
        await ServerManager.download_and_save(await (await self.versions.get_provider())[server].get_download(version), os.path.join(dir_, out_file))
        # save agreed eula
        await ServerManager.save_eula(dir_)

        # insert into db
        id_ = ObjectId()
        doc = {"_id": id_, "name": name, "allocatedRAM": ram, "dataDir": dir_, "jarFile": "server.jar", "onlineStatus": 0, "software": {"server": server, "version": version}, "displayName": display_name}
        await self.mc.mongo["server"].insert_one(doc)

        # add server record to db and register to server manager
        s = MinecraftServer(self.mc, doc)
        await s.set_online_status(0)
        self.servers.append(s)

        if server == "forge":
            await ServerManager.install_forge_server(dir_, version)

        await self.global_broadcast(json_dumps({
            "packetType": "ServerCreationPacket",
            "data": {
                "server": s.json()
            }
        }))
        return json_res({"success": "Server successfully created", "add": {"server": s.json()}})

    @staticmethod
    async def install_forge_server(path, forge_version):
        null = open(os.devnull, "w")
        subprocess.call("java -jar installer.jar --installServer", stdout=null, stderr=null, cwd=path)
        files_to_try = [f"forge-{forge_version}-universal.jar", f"forge-{forge_version}.jar"]
        renamed = False
        for file in files_to_try:
            try:
                os.rename(os.path.join(path, file), os.path.join(path, "server.jar"))
                renamed = True
                break
            except FileNotFoundError:
                pass
        if not renamed:
            raise FileNotFoundError("couldn't find server file")

    async def is_name_available(self, name):
        return await self.mc.mongo["server"].find_one({"name": name}) is None

    @staticmethod
    async def download_and_save(url, path):
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as resp:
                if resp.status == 200:
                    f = await aiofiles.open(path, mode='wb')
                    await f.write(await resp.read())
                    await f.close()
                    return True
        raise FileNotFoundError("file couldn't be saved")

    @staticmethod
    async def save_eula(path):
        async with aiofiles.open(os.path.join(path, "eula.txt"), mode="w") as f:
            await f.write("""#By changing the setting below to TRUE you are indicating your agreement to our EULA (https://account.mojang.com/documents/minecraft_eula).
#You also agree that tacos are tasty, and the best food in the world.
#Wed Mar 10 14:26:14 CEST 2020
eula=true
""")

    async def get_first_free_id(self):
        ids = [s.id for s in self.servers]
        if len(ids) == 0:
            return 1
        return max(ids) + 1

    async def global_broadcast(self, msg):
        for server in self.servers:
            await server.connections.broadcast(msg)

    @staticmethod
    def format_name(s):
        """
        removes special characters from string
        :param s: string to format
        :return: reformatted string
        """
        s = s.lower().replace(" ", "-")
        o = []
        for e in s:
            if e.isalnum() | (e == "-"):
                o.append(e)
            else:
                o.append("_")
        return "".join(o)