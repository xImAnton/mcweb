from typing import Any, Dict
from ..mc.communication import ServerCommunication
from ..io.wsmanager import WebsocketConnectionManager
from json import dumps as json_dumps
from time import strftime
from ..io.regexes import Regexes


class MinecraftServer:
    """
    class for representing a single minecraft server
    """
    def __init__(self, mc, record):
        self.mc = mc
        self.connections = WebsocketConnectionManager()
        self.id = record["_id"]
        self.name = record["name"]
        self.display_name = record["displayName"]
        self.ram = record["allocatedRAM"]
        self.run_dir = record["dataDir"]
        self.jar = record["jarFile"]
        self.status = record["onlineStatus"]
        self.software = record["software"]
        self.port = record["port"]
        cmd = f"java -Xmx{self.ram}G -jar {self.jar} --port {self.port}"
        self.communication = ServerCommunication(self.mc.loop, cmd, self.on_output, self.on_output, self.on_stop, cwd=self.run_dir)
        self.output = []

    async def refetch(self) -> None:
        """
        refetches the current server from the database
        """
        record = await self.mc.mongo["server"].find_one({"_id": self.id})
        self.name = record["name"]
        self.display_name = record["displayName"]
        self.ram = record["allocatedRAM"]
        self.run_dir = record["dataDir"]
        self.jar = record["jarFile"]
        self.status = record["onlineStatus"]
        self.software = record["software"]
        self.port = record["port"]

    async def update(self):
        await self.mc.mongo["server"].update_one({"_id": self.id}, {"$set": self.update_doc()})

    async def set_online_status(self, status) -> None:
        """
        updates the online status of the server in the database and broadcasts the change to the connected sockets
        0 - offline
        1 - starting
        2 - online
        3 - stopping
        :param status: the server status to update
        """
        await self.mc.mongo["server"].update_one({"_id": self.id}, {"$set": {"onlineStatus": status}})
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
        self.output = []
        await self.set_online_status(1)
        await self.communication.begin()

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

    async def on_stop(self) -> None:
        """
        called on server process end
        sets the server status to offline
        """
        await self.set_online_status(0)

    async def on_output(self, line) -> None:
        """
        called when the server prints a new line to its stdout
        used to check for patterns and broadcasting to the connected websockets
        :param line: the line that is printed
        """
        self.output.append(line)
        if Regexes.DONE.match(line.strip()):
            await self.set_online_status(2)
        if Regexes.ADVANCED_TERMINAL_FEATURES.match(line.strip()):
            return
        await self.connections.broadcast(json_dumps({
            "packetType": "ServerConsoleMessagePacket",
            "data": {
                "message": line,
                "serverId": str(self.id)
            }
        }))

    async def send_command(self, cmd) -> None:
        """
        prints a command to the server stdin and flushes it
        :param cmd: the command to print
        """
        await self.connections.broadcast(json_dumps({
            "packetType": "ServerConsoleMessagePacket",
            "data": {
                "message": f"[{strftime('%H:%M:%S')} MCWEB CONSOLE COMMAND]: " + cmd,
                "serverId": str(self.id)
            }
        }))
        if cmd.startswith("stop"):
            await self.set_online_status(3)
        await self.communication.write_stdin(cmd)

    def json(self) -> Dict[str, Any]:
        """
        convert the server to a json object
        :return: a json dict
        """
        return {
            "id": str(self.id),
            "name": self.name,
            "allocatedRAM": self.ram,
            "dataDir": self.run_dir,
            "jarFile": self.jar,
            "onlineStatus": self.status,
            "ip": self.mc.public_ip,
            "displayName": self.display_name,
            "software": self.software,
            "port": self.port
        }

    def update_doc(self):
        return {
            "allocatedRAM": self.ram,
            "displayName": self.display_name,
            "port": self.port
        }

    def light_json(self):
        return {
            "id": str(self.id),
            "displayName": self.display_name
        }
