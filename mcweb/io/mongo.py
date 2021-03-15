import motor.motor_asyncio
from ..config import Config


class MongoClient(motor.motor_asyncio.AsyncIOMotorClient):
    def __init__(self, mc):
        self.mc = mc
        uri = f"mongodb://{Config.MONGO['username']}:{Config.MONGO['password']}@{Config.MONGO['host']}:{Config.MONGO['port']}"
        super().__init__(uri, io_loop=mc.loop)
        self.db = self["mcweb"]
