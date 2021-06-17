import os
import socket
import time

import aiohttp
from argon2 import PasswordHasher
import pymongo.errors
from sanic import Sanic

from .auth import User, Session
from .util import json_res
from .endpoints.auth import account_blueprint
from .endpoints.misc import misc_blueprint
from .endpoints.server import server_blueprint
from .io.config import Config
from .io.mongo import MongoClient
from .mc.servermanager import ServerManager
from .io.regexes import Regexes


class MCWeb(Sanic):
    __slots__ = "server_manager", "public_ip", "mongo", "password_hasher", "pepper"

    """
    class that represents this Sanic instance
    """
    def __init__(self):
        super().__init__(__name__)
        Config.load(self)
        self.server_manager = ServerManager(self)
        self.register_routes()
        self.public_ip = ""
        self.mongo = None
        self.password_hasher = PasswordHasher()
        self.pepper = (Config.get_docker_secret("pepper") or Config.PEPPER).encode()

    def register_routes(self) -> None:
        """
        registers middleware, listeners and routes to sanic
        """
        self.blueprint(server_blueprint)
        self.blueprint(account_blueprint)
        self.blueprint(misc_blueprint)
        self.register_listener(self.before_server_start, "before_server_start")
        self.register_listener(self.after_server_stop, "after_server_stop")
        self.register_middleware(self.set_session_middleware, "request")

    async def after_server_stop(self, app, loop):
        await self.server_manager.shutdown_all()

    async def _check_ip(self, s):
        result = Regexes.IP.match(s)
        if not result:
            socket.gethostbyname(s)
        return s

    async def reload_ip(self):
        if Config.STATIC_IP:
            ip = Config.STATIC_IP
        else:
            async with aiohttp.ClientSession() as session:
                async with session.get("https://api.ipify.org/") as resp:
                    ip = await resp.text()
        self.public_ip = await self._check_ip(ip)

    async def before_server_start(self, app, loop):
        self.mongo = MongoClient(self, loop).db
        await self.reload()

    async def reload(self):
        await self.reload_ip()
        try:
            await self.mongo["session"].delete_many({"expiration": {"$lt": time.time()}})
            await self.mongo["wsticket"].delete_many({"expiration": {"$lt": time.time()}})
            await self.server_manager.init()
        except pymongo.errors.ServerSelectionTimeoutError:
            print("No connection to mongodb could be established. Check your preferences in the config.json and if your mongo server is running!")
            self.stop()
            exit(1)

    async def set_session_middleware(self, req) -> None:
        """
        middleware that fetches and sets the session on the request object
        """
        sid = req.token
        if sid:
            session = Session(self.mongo)
            await session.fetch_by_sid(sid)
            if not await session.is_expired():
                await session.refresh()
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
