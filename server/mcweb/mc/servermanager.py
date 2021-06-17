import os
from typing import Optional
import shutil
import asyncio

import aiofiles

from ..io.config import Config
from .server import MinecraftServer
from .versions.base import VersionProvider
from .versions.manager import VersionManager
from ..io.regexes import Regexes
from ..io.wspackets import ServerCreationPacket, ServerDeletionPacket
from ..util import json_res, download_and_save


class ServerManager:
    __slots__ = "mc", "servers", "versions"

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
        self.servers = []
        async for server in self.mc.mongo["server"].find({}):
            s = MinecraftServer(self.mc, server)
            if s.status == 2:  # if the server was online, start it
                await s.start()
            elif s.status != 0:
                await s.set_online_status(0)
            self.servers.append(s)

        await self.versions.reload_all()

    async def server_running_on(self, port):
        """
        checks if a server is running on the specified port
        :param port: the port to check
        :return: whether there is a server running or not
        """
        res = await self.mc.mongo["server"].find_one({"port": port, "onlineStatus": {"$ne": 0}})
        return res is not None

    async def get_ids(self):
        """
        :return: ids of all loaded servers
        """
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

    async def remove_server(self, id_):
        o = []
        for s in self.servers:
            if s.id != id_:
                o.append(s)
        self.servers = o

    async def delete_server(self, server):
        """
        Closes and deletes a server.
        Removes server files and database references
        Broadcasts deletion to clients and unloads the server from server manager
        :param server:
        :return:
        """
        if server not in self.servers:
            raise ValueError("invalid server")
        # stop server when it is online
        if 0 < server.status < 3:
            stop_event = await server.stop(force=True)
            await stop_event.wait()
        # remove server files
        shutil.rmtree(server.run_dir, ignore_errors=False)
        # Remove server document
        await self.mc.mongo["server"].delete_one({"_id": server.id})

        # send packet before unregistering, otherwise we couldn't broadcast to the ws clients of the server console
        await ServerDeletionPacket(server.id).send(self)
        self.servers.remove(server)

        # Remove all lastServer references
        await self.mc.mongo["user"].update_many({"lastServer": server.id}, {"$set": {"lastServer": None}})

    async def create_server(self, name, version_provider, major_version, minor_version, ram, port, java_version):
        """
        creates a new server
        :param name: the new servers name
        :param version_provider: the version provider that is used to get the version download link
        :param major_version: major version of server to install
        :param minor_version: minor version of server to install
        :param ram: the ram the server should have, can be changed later
        :param port: the port the server should run on in the future
        :param java_version: the java version that runs the server
        :return: sanic json response
        """
        # check if version existing
        if not isinstance(version_provider, VersionProvider):
            return json_res({"error": "Invalid Server", "description": "use /server/versions to view all valid servers and versions", "status": 404}, status=404)
        if not await version_provider.has_version(major_version, minor_version):
            return json_res({"error": "Invalid Version", "description": "use /server/versions to view all valid servers and their versions", "status": 404}, status=404)

        # Check ram
        if ram > Config.MAX_RAM:
            return json_res({"error": "Too Much RAM", "description": "maximal ram is " + str(Config.MAX_RAM), "status": 400, "maxRam": Config.MAX_RAM}, status=400)

        if not isinstance(port, int):
            return json_res({"error": "TypeError", "description": "port has to be int", "status": 400}, status=400)

        if port < 25000 | port > 30000:
            return json_res({"error": "Invalid Port", "description": f"Port range is between 25000 and 30000", "status": 400}, status=400)

        if not Regexes.SERVER_DISPLAY_NAME.match(name):
            return json_res({"error": "Illegal Server Name", "description": f"the server name doesn't match the regex for server names", "status": 400, "regex": Regexes.SERVER_DISPLAY_NAME.pattern}, status=400)

        if java_version not in Config.JAVA["installations"].keys():
            return json_res({"error": "Invalid Java Version", "description": "there is no such java version: " + java_version, "status": 400}, status=400)

        # Lowercase, no special char server name
        display_name = name
        name = ServerManager.format_name(name)

        # check if server with name is existing
        while not await self.is_name_available(name):
            name += "-"

        # generate path name and dir
        dir_ = os.path.join(os.path.join(os.getcwd(), Config.SERVER_DIR), name)
        while os.path.isdir(dir_):
            dir_ += "-server"
        os.mkdir(dir_)

        # Download Server jar
        out_file = version_provider.DOWNLOAD_FILE_NAME
        await download_and_save(await version_provider.get_download(major_version, minor_version), os.path.join(dir_, out_file))
        # save agreed eula
        await ServerManager.save_eula(dir_)

        # insert into db
        doc = {"name": name, "allocatedRAM": ram, "dataDir": dir_, "jarFile": "server.jar", "onlineStatus": 0, "software": {"server": version_provider.NAME, "majorVersion": major_version, "minorVersion": minor_version, "minecraftVersion": await version_provider.get_minecraft_version(major_version, minor_version)}, "displayName": display_name, "port": port, "addons": [], "javaVersion": java_version}
        insert_result = await self.mc.mongo["server"].insert_one(doc)
        doc["_id"] = insert_result.inserted_id

        # add server record to db and register to server manager
        s = MinecraftServer(self.mc, doc)
        await s.set_online_status(0)
        self.servers.append(s)
        try:
            await version_provider.post_download(dir_, major_version, minor_version)
        except Exception as e:
            await self.mc.mongo["server"].delete_one({"_id": insert_result.inserted_id})
            return json_res({"error": "Error during Server Creation", "description": " ".join(e.args), "status": 500}, status=500)

        await ServerCreationPacket(s).send(self)

        return json_res({"success": "Server successfully created", "add": {"server": s.json()}})

    async def is_name_available(self, name):
        """
        checks whether there is no server with the specified name
        :param name: the name to check
        """
        return await self.mc.mongo["server"].find_one({"name": name}) is None

    @staticmethod
    async def save_eula(path):
        """
        saves a static minecraft eula to the specified folder
        :param path: the directory to save the eula in
        """
        async with aiofiles.open(os.path.join(path, "eula.txt"), mode="w") as f:
            await f.write("""#By changing the setting below to TRUE you are indicating your agreement to our EULA (https://account.mojang.com/documents/minecraft_eula).
#You also agree that tacos are tasty, and the best food in the world.
#Wed Mar 10 14:26:14 CEST 2020
eula=true
""")

    async def send(self, msg):
        return await self.global_broadcast(msg)

    async def global_broadcast(self, msg):
        """
        broadcasts a message to all connected clients of this mcweb instance
        :param msg: the message to broadcast
        """
        for server in self.servers:
            await server.connections.broadcast(msg)

    async def shutdown_all(self):
        stop_events = []
        for server in self.servers:
            stop_events.append((await server.stop()).wait())
        await asyncio.gather(*stop_events)

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
