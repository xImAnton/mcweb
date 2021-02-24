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
        self.app.server = ServerCommunication("java -Xmx2G -jar server.jar --nogui", "./tests/run", on_output=self.on_console_out)

    def set_configs(self):
        pass
        # For later use of sanic_mysql
        # self.app.config.update(dict(MYSQL=dict(host="", port=3306, user="", password="", db="minecraft")))

    def on_console_out(self, msg):
        #self.app.add_task(self.broadcast_console(msg))
        asyncio.run(self.broadcast_console(msg))
        # self.app.loop.call_soon_threadsafe(self.broadcast_console(msg))
        # asyncio.run_coroutine_threadsafe(self.broadcast_console(msg), loop=self.app.loop)

    async def broadcast_console(self, msg):
        for ws in self.app.ws_connections:
            try:
                await ws.send(msg)
            except ConnectionClosedOK:
                self.app.ws_connections.remove(ws)

    def register_routes(self):
        self.app.blueprint(rconsole)
        self.app.register_listener(self.post_server_start, "after_server_start")

    async def post_server_start(self, app, loop):
        self.app.server.begin()

    def start(self):
        self.app.run(host="127.0.0.1", port=1337)
