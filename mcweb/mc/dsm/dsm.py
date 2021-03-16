from .protocol import PacketBuilder, PacketBuffer, TextComponent
from json import dumps as json_dumps
import socketserver


class MinecraftClient(socketserver.BaseRequestHandler):

    DISCONNECT_STARTING_MESSAGE = TextComponent.Builder("[").set_color(TextComponent.Color.GRAY).add_extra(
        TextComponent.Builder("DSM").set_flag(TextComponent.Flag.BOLD).set_color(TextComponent.Color.GOLD).build()
    ).add_extra(
        TextComponent.Builder("] ").set_color(TextComponent.Color.GRAY).build()
    ).add_extra(
        TextComponent.Builder("Please wait a Moment").set_color(TextComponent.Color.RED).build()
    ).add_extra(
        TextComponent.Builder(", this ").set_color(TextComponent.Color.GRAY).build()
    ).add_extra(
        TextComponent.Builder("Server ").set_color(TextComponent.Color.GOLD).set_flag(TextComponent.Flag.BOLD).build()
    ).add_extra(
        TextComponent.Builder("is starting now!").set_color(TextComponent.Color.GRAY).build()
    ).build().as_json()

    QUERY_RESPONSE = {
        "version": {
            "name": "MCWeb DSM Server",
            "protocol": ""},
        "players": {
            "max": 0,
            "online": 0,
            "sample": []
        },
        "description": TextComponent.Builder("MCWeb").set_color(TextComponent.Color.GOLD).set_flag(TextComponent.Flag.BOLD).add_extra(
            TextComponent.Builder("-Server is ").set_color(TextComponent.Color.GRAY).set_reset().add_extra(
                TextComponent.Builder("offline").set_color(TextComponent.Color.RED).set_flag(TextComponent.Flag.BOLD).build()
            ).add_extra(
                TextComponent.Builder("! Join to start it!").set_color(TextComponent.Color.GRAY).build()
            ).build()
        ).build().as_json()
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.state = 1
        self.connected = True

    def handle_ping_packet(self, client_packet):
        print("Ping!")
        j = client_packet.read_long()
        packet = PacketBuilder(0x01)
        packet.add_long(j)
        self.request.sendall(packet.build())
        self.connected = False

    def handle_0_packet(self, client_packet):
        if self.state == 1:
            p = client_packet.read_varint()  # Protocol Version
            if p == 0:
                return False
            client_packet.read_string()  # Host
            client_packet.read_ushort()  # Port
            next_state = client_packet.read_varint()
            if next_state == 1:  # Status
                self.state = 1
                ping = MinecraftClient.QUERY_RESPONSE
                ping["version"]["protocol"] = p
                packet = PacketBuilder(0x00)
                packet.add_string(json_dumps(ping))
                packet = packet.build()
                self.request.sendall(packet)
            elif next_state == 2:  # Update State to login
                self.state = 2
                packet = PacketBuilder(0x00)
                packet.add_string(json_dumps(MinecraftClient.DISCONNECT_STARTING_MESSAGE))
                self.request.sendall(packet.build())
                self.server.on_player_login()
                self.connected = False
        # else:
        #    un = response.read_string()
        #    packet = PacketBuilder(0x01)  # encryption request
        #    packet.add_string(" " * 20)

    def handle(self) -> None:
        self.state = 1
        self.connected = True
        while self.connected:
            req = self.request.recv(2097151)  # max packet length
            if not req:
                continue
            client_packet = PacketBuffer(req)
            client_packet.read_varint()  # Length
            pack_id = client_packet.read_varint()
            if pack_id == 0x00:  # Login
                self.handle_0_packet(client_packet)
            elif pack_id == 0x01:  # Ping
                self.handle_ping_packet(client_packet)

    def finish(self) -> None:
        self.connected = False


class DSMPortListener(socketserver.TCPServer):
    def __init__(self, conn):
        super().__init__(conn, MinecraftClient)
        self.shall_stop = False

    def close(self):
        self._BaseServer__shutdown_request = True

    def on_player_login(self):
        self.close()

    def run(self):
        print("DSM SERVER STARTING")
        self.serve_forever()
        print("START MINECRAFT SERVER HERE")
