import motor.motor_asyncio
from mcweb.io.config import Config


class MongoClient(motor.motor_asyncio.AsyncIOMotorClient):
    def __init__(self, mc, loop):
        username = Config.get_docker_secret("mongo_user") or Config.MONGO['username']
        password = Config.get_docker_secret("mongo_password") or Config.MONGO['password']
        uri = f"mongodb://{username}:{password}@{Config.MONGO['host']}:{Config.MONGO['port']}"
        super(MongoClient, self).__init__(uri, io_loop=loop)
        self.mc = mc
        self.db = self[Config.MONGO["database"]]
