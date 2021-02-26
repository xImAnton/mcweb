from typing import Optional
from .server import MinecraftServer


class ServerManager:
    """
    class for managing all servers of the mcweb instance
    """
    def __init__(self, mc):
        self.mc = mc
        self.servers = []

    async def init(self) -> None:
        """
        fetches all servers and adds them to its server list
        :return:
        """
        servers = await self.mc.db_connection.fetch_all("SELECT * FROM servers;")
        for server in servers:
            self.servers.append(MinecraftServer(self.mc, server))

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
