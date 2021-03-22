import motor.motor_asyncio
from mcweb.io.config import Config


class MongoClient(motor.motor_asyncio.AsyncIOMotorClient):
    def __init__(self, mc, loop):
        uri = f"mongodb://{Config.MONGO['username']}:{Config.MONGO['password']}@{Config.MONGO['host']}:{Config.MONGO['port']}"
        super(MongoClient, self).__init__(uri, io_loop=loop)
        self.mc = mc
        self.db = self[Config.MONGO["database"]]
