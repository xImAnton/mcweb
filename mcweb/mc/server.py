from ..mc.communication import ServerCommunication
from ..io.wsmanager import WebsocketConnectionManager
from json import dumps as json_dumps
import asyncio
import re


class MinecraftServer:
    def __init__(self, mc, record):
        self.mc = mc
        self.connections = WebsocketConnectionManager()
        self.id = record[0]
        self.name = record[1]
        self.ram = record[2]
        self.run_dir = record[3]
        self.jar = record[4]
        self.status = record[5]
        self.communication = ServerCommunication(f"java -Xmx{self.ram}G -jar {self.jar} --nogui", self.run_dir, on_close=self.on_stop, on_output=self.on_output)

    async def refetch(self):
        record = await self.mc.db_connection.fetch_one(f"SELECT * FROM servers WHERE id = {self.id};")
        self.name = record[1]
        self.ram = record[2]
        self.run_dir = record[3]
        self.jar = record[4]
        self.status = record[5]

    async def set_online_status(self, status):
        await self.mc.db_connection.update("servers", "id = " + str(self.id), {"online_status": status})
        await self.connections.broadcast(json_dumps({"packetType": "StateChangePacket", "update": {"server": {"onlineStatus": status}}}))

    @property
    def running(self):
        return self.communication.running

    async def start(self):
        await self.set_online_status(1)
        self.communication.begin()

    async def stop(self, force=False):
        if not force:
            await self.send_command("stop")
        else:
            await self.set_online_status(3)
            self.communication.process.kill()

    def on_stop(self):
        asyncio.run(self.set_online_status(0))

    def on_output(self, line):
        timings_reset = re.compile(r"^\[[0-9]*:[0-9]*:[0-9]* .*\]: Timings Reset$")
        if timings_reset.search(line):
            print("online")
            asyncio.run_coroutine_threadsafe(self.set_online_status(2), self.mc.loop)
        self.connections.broadcast_sync(json_dumps({
            "packetType": "ServerConsoleMessagePacket",
            "data": {
                "message": line,
                "serverId": self.id
            }
        }))

    async def send_command(self, cmd):
        if cmd.startswith("stop"):
            await self.set_online_status(3)
        self.communication.write_stdin(cmd)

    def json(self):
        return {"id": self.id,
                "name": self.name,
                "ram": self.ram,
                "run_dir": self.run_dir,
                "jar": self.jar,
                "onlineStatus": self.status}
