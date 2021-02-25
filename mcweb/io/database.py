from databases import Database
from ..config import Config


class DatabaseConnector(Database):
    def __init__(self, db_path):
        super().__init__(f"sqlite:///{db_path}")
        self.db_path = db_path

    async def initiate(self):
        """
        initiates a connection to the database
        """
        await self.connect()
        if Config.RESET_DB:
            with open("scheme.sql") as f:
                await self.execute(f.read())

    async def update(self, table, condition, values):
        kvalues = []
        for k, v in values.items():
            kvalues.append(" = ".join((k, str(v))))
        set_string = ", ".join(kvalues)
        await self.execute(f"UPDATE {table} SET {set_string} WHERE {condition};")
