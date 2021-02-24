from sanic import Sanic
from mcweb.mc.communication import ServerCommunication
from .views.remoteconsole import rconsole
import asyncio
from websockets.exceptions import ConnectionClosedOK


class SanicServer:
    def __init__(self):
        self.app = Sanic(__name__)
        self.set_configs()
        self.register_routes()
        self.app.ws_connections = []
        self.app.server = ServerCommunication("java -Xmx2G -jar server.jar --nogui", "./tests/run", on_output=self.on_console_out, on_close=self.server_close)
        self.app.start_server = self.start_server

    def set_configs(self):
        pass
        # For later use of sanic_mysql
        # self.app.config.update(dict(MYSQL=dict(host="", port=3306, user="", password="", db="minecraft")))

    def on_console_out(self, msg):
        asyncio.run(self.broadcast_console(msg))

    async def start_server(self):
        if not self.app.server.running:
            await self.broadcast_console("--- SERVER START ---\n")
            self.app.server.begin()

    async def broadcast_console(self, msg):
        for ws in self.app.ws_connections:
            try:
                await ws.send(msg)
            except ConnectionClosedOK:
                self.app.ws_connections.remove(ws)

    def server_close(self):
        asyncio.run(self.broadcast_console("--- SERVER STOPPED ---\n"))

    def register_routes(self):
        self.app.blueprint(rconsole)
        self.app.register_listener(self.post_server_start, "after_server_start")

    async def post_server_start(self, app, loop):
        await self.start_server()

    def start(self):
        self.app.run(host="127.0.0.1", port=1337)
