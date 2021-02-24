from sanic import Sanic
from .io.database import DatabaseConnector
from .config import Config
from .mc.servermanager import ServerManager
from .views.server import server_blueprint


class MCWeb(Sanic):
    def __init__(self):
        super().__init__(__name__)
        self.db_connection = DatabaseConnector(Config.DB_PATH)
        self.server_manager = ServerManager(self)
        self.register_routes()

    def register_routes(self):
        self.blueprint(server_blueprint)
        self.register_listener(self.after_server_start, "after_server_start")

    async def after_server_start(self, app, loop):
        await self.server_manager.init()

    def start(self):
        self.run(host="localhost", port=1337)
