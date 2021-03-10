from typing import Optional
from .server import MinecraftServer
import aiohttp
import aiofiles
from ..config import Config
import os
from .versions.manager import VersionManager
from ..views.deco import json_res


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
        :return:
        """
        servers = await self.mc.db_connection.fetch_all("SELECT * FROM servers;")
        for server in servers:
            s = MinecraftServer(self.mc, server)
            await s.set_online_status(0)
            self.servers.append(s)
        await self.versions.reload_all()

    async def get_server(self, i) -> Optional[MinecraftServer]:
        """
        returns a server for the given id
        :param i: the id of the server
        :return:
        """
        for server in self.servers:
            if server.id == i:
                return server
        return None

    async def create_server(self, name, server, version, ram):
        # check if version existing
        versions = await self.versions.get_json(True)
        if server not in versions.keys():
            return json_res({"error": "Invalid Server", "description": "use /server/versions to view all valid servers and versions", "status": 404}, status=404)
        if version not in versions[server].keys():
            return json_res({"error": "Invalid Version", "description": "use /server/versions to view all valid servers and versions", "status": 404}, status=404)

        # Check ram
        if ram > Config.MAX_RAM:
            return json_res({"error": "Too Much RAM", "description": "maximal ram is " + str(Config.MAX_RAM), "status": 400, "maxRam": Config.MAX_RAM}, status=400)

        # check if server with name is existing
        if not await self.is_name_available(name):
            return json_res({"error": "Duplicate Name", "description": "the server name you specified is already existing", "status": 400}, status=400)

        # generate path name and dir
        dir_ = os.path.join(os.path.join(os.getcwd(), "servers"), name)
        while os.path.isdir(dir_):
            dir_ += "-server"
        os.mkdir(dir_)

        # Download Server jar
        await ServerManager.download_and_save(versions[server][version], os.path.join(dir_, "server.jar"))
        # save agreed eula
        await ServerManager.save_eula(dir_)

        # insert into db
        id_ = await self.get_first_free_id()
        await self.mc.db_connection.execute(f"INSERT INTO servers (name, allocated_ram, data_dir, jar_file) VALUES (\"{name}\", {ram}, \"{dir_}\", \"server.jar\");")

        # add server record to db and register to server manager
        rec = await self.mc.db_connection.fetch_one(f"SELECT * FROM servers WHERE id={id_};")
        s = MinecraftServer(self.mc, rec)
        await s.set_online_status(0)
        self.servers.append(s)

        return json_res({"success": "Server successfully created", "add": {"server": s.json()}})

    async def is_name_available(self, name):
        return not bool(await self.mc.db_connection.fetch_one(f"SELECT * FROM servers WHERE name=\"{name}\";"))

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
        return max([s.id for s in self.servers]) + 1
