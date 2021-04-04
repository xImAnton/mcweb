from sanic import Sanic
from .mc.servermanager import ServerManager
from .endpoints.server import server_blueprint
from .endpoints.auth import account_blueprint
from .endpoints.misc import misc_blueprint
from mcweb.login import User, Session
import time
from mcweb.util import json_res
import aiohttp
import os
from .io.mongo import MongoClient


class MCWeb(Sanic):
    """
    class that represents this Sanic instance
    """
    def __init__(self):
        super().__init__(__name__)
        self.server_manager = ServerManager(self)
        self.register_routes()
        self.public_ip = ""
        self.mongo = None

    def register_routes(self) -> None:
        """
        registers middleware, listeners and routes to sanic
        """
        self.blueprint(server_blueprint)
        self.blueprint(account_blueprint)
        self.blueprint(misc_blueprint)
        self.register_listener(self.after_server_start, "after_server_start")
        self.register_middleware(self.set_session_middleware, "request")

    async def after_server_start(self, app, loop) -> None:
        """
        listener to be called after server start
        """
        self.mongo = MongoClient(self, loop).db
        await self.server_manager.init()
        async with aiohttp.ClientSession() as session:
            async with session.get("https://api.ipify.org/") as resp:
                self.public_ip = await resp.text()

    async def set_session_middleware(self, req) -> None:
        """
        middleware that fetches and sets the session on the request object
        """
        sid = req.token
        if sid:
            session = Session(self.mongo)
            await session.fetch_by_sid(sid)
            if session.expiration > time.time():
                user = User(self.mongo)
                req.ctx.user = await user.fetch_by_sid(sid)
                req.ctx.session = session
            else:
                await session.logout()
                req.ctx.user = None
                req.ctx.session = None
                return json_res({"error": "session id not existing", "status": 401}, status=401)
        else:
            req.ctx.user = None
            req.ctx.session = None

    def start(self) -> None:
        """
        starts up sanic
        """
        if not os.path.isdir(os.path.join(os.getcwd(), "servers")):
            os.mkdir(os.path.join(os.getcwd(), "servers"))
        self.run(host=os.getenv("BACKEND_HOST") or "localhost", port=os.getenv("BACKEND_PORT") or 5001)
