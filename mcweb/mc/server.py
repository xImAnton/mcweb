from typing import Any, Dict
from ..mc.communication import ServerCommunication
from ..io.wsmanager import WebsocketConnectionManager
from json import dumps as json_dumps
from time import strftime
from ..io.regexes import Regexes
from ..io.config import Config
import os
from ..io.wspackets import StateChangePacket, ConsoleMessagePacket, AddonUpdatePacket


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
        self.addons = record["addons"]
        self.java_version = record["javaVersion"]
        self.communication = None
        self.output = []
        self.files_to_remove = []

    async def generate_command(self) -> str:
        return f"{Config.JAVA['installations'][self.java_version]['path'] + Config.JAVA['installations'][self.java_version]['additionalArguments']} -Xmx{self.ram}G -jar {self.jar} --port {self.port}"

    async def refetch(self) -> None:
        """
        refetches the current server from the database
        """
        record = await self.mc.mongo["server"].find_one({"_id": self.id})
        if not record:
            return await self.mc.server_manager.remove_server(self.id)
        self.name = record["name"]
        self.display_name = record["displayName"]
        self.ram = record["allocatedRAM"]
        self.run_dir = record["dataDir"]
        self.jar = record["jarFile"]
        self.status = record["onlineStatus"]
        self.software = record["software"]
        self.port = record["port"]
        self.addons = record["addons"]
        self.java_version = record["javaVersion"]

    async def update(self):
        await StateChangePacket(**self.update_doc()).send(self.connections)
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
        await StateChangePacket(onlineStatus=status).send(self.connections)
        self.status = status

    @property
    def running(self) -> bool:
        """
        whether the server process is running or not.
        """
        if not self.communication:
            return False
        return self.communication.running

    async def start(self) -> None:
        """
        starts the server and updates it status
        check if server is not running before calling
        """
        # shell has to be True when running with docker
        self.communication = ServerCommunication(self.mc.loop, await self.generate_command(), self.on_output, self.on_output, self.on_stop, cwd=self.run_dir, shell=Config.get_docker_secret("mongo_user") is not None)
        self.output = []
        await self.set_online_status(1)
        try:
            await self.communication.begin()
        except FileNotFoundError as e:
            await ConsoleMessagePacket("FileNotFoundError: " + str(e)).send(self.connections)
            await self.set_online_status(0)

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
        self.communication.running = False
        await self.set_online_status(0)
        for f in self.files_to_remove:
            os.remove(f)
        self.files_to_remove = []

    async def on_output(self, line) -> None:
        """
        called when the server prints a new line to its stdout
        used to check for patterns and broadcasting to the connected websockets
        :param line: the line that is printed
        """
        self.output.append(line)
        if self.status == 1:
            if Regexes.DONE.match(line.strip()):
                await self.set_online_status(2)
        await ConsoleMessagePacket(line).send(self.connections)

    async def send_command(self, cmd) -> None:
        """
        prints a command to the server stdin and flushes it
        :param cmd: the command to print
        """
        await ConsoleMessagePacket(f"[{strftime('%H:%M:%S')} MCWEB CONSOLE COMMAND]: {cmd}").send(self.connections)
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
            "port": self.port,
            "supports": Config.VERSIONS[self.software["server"]]["supports"],
            "addons": self.addons,
            "javaVersion": self.java_version,
            "full": True
        }

    async def get_version_provider(self):
        return await self.mc.server_manager.versions.provider_by_name(self.software["server"])

    async def add_addon(self, addon_id, addon_type, addon_version):
        await self.remove_addon(addon_id)
        res = await (await self.get_version_provider()).add_addon(addon_id, addon_type, addon_version, self.run_dir)
        if res:
            await AddonUpdatePacket(AddonUpdatePacket.Mode.ADD, res).send(self.connections)
            await self.mc.mongo["server"].update_one({"_id": self.id}, {"$addToSet": {"addons": res}})
        return res

    async def remove_addon(self, addon_id):
        addon = await self.get_installed_addon(addon_id)
        if addon is None:
            return False
        if self.running:
            self.files_to_remove.append(addon["filePath"])
        else:
            os.remove(addon["filePath"])
        new_addon_list = []
        for ad in self.addons:
            if ad["id"] != addon_id:
                new_addon_list.append(ad)
        await AddonUpdatePacket(AddonUpdatePacket.Mode.REMOVE, addon).send(self.connections)
        self.mc.mongo["server"].update_one({"_id": self.id}, {"$set": {"addons": new_addon_list}})
        return True

    async def get_installed_addon(self, addon_id):
        for ad in self.addons:
            if ad["id"] == addon_id:
                return ad
        return None

    async def supports(self, addon_type):
        return Config.VERSIONS[self.software["server"]]["supports"][addon_type]

    def update_doc(self):
        return {
            "allocatedRAM": self.ram,
            "displayName": self.display_name,
            "port": self.port,
            "javaVersion": self.java_version
        }

    def light_json(self):
        return {
            "id": str(self.id),
            "displayName": self.display_name,
            "full": False
        }
