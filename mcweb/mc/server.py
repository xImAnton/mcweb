from typing import Any, Dict

from ..mc.communication import ServerCommunication
from ..io.wsmanager import WebsocketConnectionManager
from json import dumps as json_dumps
import asyncio
import re


class MinecraftServer:
    """
    class for representing a single minecraft server
    """
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

    async def refetch(self) -> None:
        """
        refetches the current server from the database
        """
        record = await self.mc.db_connection.fetch_one(f"SELECT * FROM servers WHERE id = {self.id};")
        self.name = record[1]
        self.ram = record[2]
        self.run_dir = record[3]
        self.jar = record[4]
        self.status = record[5]

    async def set_online_status(self, status) -> None:
        """
        updates the online status of the server in the database and broadcasts the change to the connected sockets
        0 - offline
        1 - starting
        2 - online
        3 - stopping
        :param status: the server status to update
        """
        await self.mc.db_connection.update("servers", "id = " + str(self.id), {"online_status": status})
        await self.connections.broadcast(json_dumps({"packetType": "StateChangePacket", "update": {"server": {"onlineStatus": status}}}))

    @property
    def running(self) -> bool:
        """
        whether the server process is running or not.
        """
        return self.communication.running

    async def start(self) -> None:
        """
        starts the server and updates it status
        check if server is not running before calling
        """
        await self.set_online_status(1)
        self.communication.begin()

    async def stop(self, force=False) -> None:
        """
        stops the server
        check if server is running before calling
        :param force: whether the process should be killed or the stop command should be executed
        :return:
        """
        if not force:
            await self.send_command("stop")
        else:
            await self.set_online_status(3)
            self.communication.process.kill()

    def on_stop(self) -> None:
        """
        called on server process end
        sets the server status to offline
        """
        asyncio.run(self.set_online_status(0))

    def on_output(self, line) -> None:
        """
        called when the server prints a new line to its stdout
        used to check for patterns and broadcasting to the connected websockets
        :param line: the line that is printed
        """
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

    async def send_command(self, cmd) -> None:
        """
        prints a command to the server stdin and flushes it
        :param cmd: the command to print
        """
        if cmd.startswith("stop"):
            await self.set_online_status(3)
        self.communication.write_stdin(cmd)

    def json(self) -> Dict[str, Any]:
        """
        convert the server to a json object
        :return: a json dict
        """
        return {"id": self.id,
                "name": self.name,
                "ram": self.ram,
                "run_dir": self.run_dir,
                "jar": self.jar,
                "onlineStatus": self.status}
