from sanic import Sanic
from .io.database import DatabaseConnector
from .config import Config
from .mc.servermanager import ServerManager
from .views.server import server_blueprint
from .views.auth import account_blueprint
from .login import User, Session
import time


class MCWeb(Sanic):
    def __init__(self):
        super().__init__(__name__)
        self.db_connection = DatabaseConnector(Config.DB_PATH)
        self.server_manager = ServerManager(self)
        self.register_routes()

    def register_routes(self):
        self.blueprint(server_blueprint)
        self.blueprint(account_blueprint)
        self.register_listener(self.after_server_start, "after_server_start")
        self.register_middleware(self.set_session_middleware, "request")
        self.static("", "./tests/testclient.html")

    async def after_server_start(self, app, loop):
        await self.server_manager.init()

    async def set_session_middleware(self, req):
        sid = req.cookies.get("MCWeb-Session")
        if sid:
            session = Session(self.db_connection)
            await session.fetch_by_sid(sid)
            if session.expiration > time.time():
                user = User(self.db_connection)
                req.ctx.user = await user.fetch_by_sid(sid)
                req.ctx.session = session
            else:
                await session.delete()
                req.ctx.user = None
                req.ctx.session = None
        else:
            req.ctx.user = None
            req.ctx.session = None

    def start(self):
        self.run(host="localhost", port=1337)
