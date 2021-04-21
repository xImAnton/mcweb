import json
from typing import Any, Dict


class ServerWebSocketPacket:
    PACKET_TYPE = "NullPacket"

    def __init__(self):
        self.json: Dict[str, Any] = {
            "packetType": self.PACKET_TYPE
        }

    async def send(self, ws):
        await ws.send(json.dumps(self.json))


class ConsoleConnectedPacket(ServerWebSocketPacket):
    PACKET_TYPE = "ConsoleConnectedPacket"


class StateChangePacket(ServerWebSocketPacket):
    PACKET_TYPE = "StateChangePacket"

    def __init__(self, **kwargs):
        super(StateChangePacket, self).__init__()
        self.json["update"] = {
            "server": kwargs
        }


class ConsoleMessagePacket(ServerWebSocketPacket):
    PACKET_TYPE = "ConsoleMessagePacket"

    def __init__(self, msg):
        super(ConsoleMessagePacket, self).__init__()
        self.json["data"] = {
            "message": msg
        }


class ConsoleInfoPacket(ConsoleMessagePacket):
    PACKET_TYPE = "ConsoleInfoPacket"


class ServerCreationPacket(ServerWebSocketPacket):
    PACKET_TYPE = "ServerCreationPacket"

    def __init__(self, mcserver):
        super(ServerCreationPacket, self).__init__()
        self.json["data"] = {
            "server": mcserver.json()
        }


class AddonUpdatePacket(ServerWebSocketPacket):
    PACKET_TYPE = "AddonUpdatePacket"

    class Mode:
        ADD = "add"
        REMOVE = "remove"

    def __init__(self, mode, addon_data):
        super(AddonUpdatePacket, self).__init__()
        self.json["type"] = mode
        self.json["data"] = addon_data


class PermissionErrorPacket(ServerWebSocketPacket):
    PACKET_TYPE = "PermissionErrorPacket"

    def __init__(self, error, description):
        super(PermissionErrorPacket, self).__init__()
        self.json["data"] = {
            "error": error,
            "description": description
        }


class ServerDeletionPacket(ServerWebSocketPacket):
    PACKET_TYPE = "ServerDeletionPacket"

    def __init__(self, server_id):
        super(ServerDeletionPacket, self).__init__()
        self.json["data"] = {
            "id": str(server_id)
        }
