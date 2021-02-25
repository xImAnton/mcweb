from .server import MinecraftServer

class ServerManager:
    def __init__(self, mc):
        self.mc = mc
        self.servers = []

    async def init(self):
        servers = await self.mc.db_connection.fetch_all("SELECT * FROM servers;")
        for server in servers:
            self.servers.append(MinecraftServer(self.mc, server))

    async def get_server(self, i):
        for server in self.servers:
            if server.id == i:
                return server
        return None
