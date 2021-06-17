import socket
from json import dumps as json_dumps

from .connection import ClientConnection
from .encryption import generate_keypair
from .protocol import PacketBuilder, TextComponent


class Messages:
    __slots__ = ()

    DISCONNECT_STARTING_MESSAGE = TextComponent.Builder("[").set_color(TextComponent.Color.GRAY).add_extra(TextComponent.Builder("DSM").set_flag(TextComponent.Flag.BOLD).set_color(TextComponent.Color.GOLD).build()).add_extra(TextComponent.Builder("] ").set_color(TextComponent.Color.GRAY).build()).add_extra(TextComponent.Builder("Please wait a Moment").set_color(TextComponent.Color.RED).build()).add_extra(TextComponent.Builder(", this ").set_color(TextComponent.Color.GRAY).build()).add_extra(TextComponent.Builder("Server ").set_color(TextComponent.Color.GOLD).set_flag(TextComponent.Flag.BOLD).build()).add_extra(TextComponent.Builder("is ").set_color(TextComponent.Color.GRAY).build()).add_extra(TextComponent.Builder("starting ").set_color(TextComponent.Color.GREEN).build()).add_extra(TextComponent.Builder("now!").set_color(TextComponent.Color.GRAY).build()).build().as_json()
    DISCONNECT_NO_PERM_MESSAGE = TextComponent.Builder("[").set_color(TextComponent.Color.GRAY).add_extra(TextComponent.Builder("DSM").set_flag(TextComponent.Flag.BOLD).set_color(TextComponent.Color.GOLD).build()).add_extra(TextComponent.Builder("] ").set_color(TextComponent.Color.GRAY).build()).add_extra(TextComponent.Builder("You are not permitted ").set_color(TextComponent.Color.RED).build()).add_extra(TextComponent.Builder("to ").set_color(TextComponent.Color.GRAY).build()).add_extra(TextComponent.Builder("start ").set_color(TextComponent.Color.GREEN).build()).add_extra(TextComponent.Builder("this ").set_color(TextComponent.Color.GRAY).build()).add_extra(TextComponent.Builder("Server!").set_color(TextComponent.Color.GOLD).set_flag(TextComponent.Flag.BOLD).build()).build().as_json()
    DISCONNECT_ERROR_MESSAGE = TextComponent.Builder("[").set_color(TextComponent.Color.GRAY).add_extra(TextComponent.Builder("DSM").set_flag(TextComponent.Flag.BOLD).set_color(TextComponent.Color.GOLD).build()).add_extra(TextComponent.Builder("] ").set_color(TextComponent.Color.GRAY).build()).add_extra(TextComponent.Builder("There was an error while checking your username").set_color(TextComponent.Color.RED).build()).add_extra(TextComponent.Builder("!\n\nPlease try again in a few seconds").set_color(TextComponent.Color.GRAY).build()).build().as_json()


class DSMClientConnection(ClientConnection):
    __slots__ = "permitted_players", "onclose"

    QUERY_RESPONSE = {
        "version": {
            "name": "MCWeb DSM Server",
            "protocol": ""},
        "players": {
            "max": 0,
            "online": 0,
            "sample": []
        },
        "description": TextComponent.Builder("MCWeb").set_color(TextComponent.Color.GOLD).set_flag(
            TextComponent.Flag.BOLD).add_extra(
            TextComponent.Builder("-Server is ").set_color(TextComponent.Color.GRAY).set_reset().add_extra(
                TextComponent.Builder("offline").set_color(TextComponent.Color.RED).set_flag(
                    TextComponent.Flag.BOLD).build()
            ).add_extra(
                TextComponent.Builder("! Join to start it!").set_color(TextComponent.Color.GRAY).build()
            ).build()
        ).build().as_json()
    }

    def __init__(self, permitted_players, onclose, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.permitted_players = permitted_players
        self.onclose = onclose

    def handle_query(self, handshake_packet):
        packet = PacketBuilder(0x00)
        # use our mcweb response
        query = DSMClientConnection.QUERY_RESPONSE
        # set protocol version to protocol of client so it seems like server for every version
        query["version"]["protocol"] = handshake_packet.protocol_version
        packet.add_string(json_dumps(query))
        self.send_packet(packet.build())

    def pre_login(self, uuid, name):
        # check if player is permitted to start server
        if (name.lower() in self.permitted_players) | (self.permitted_players == []):
            packet = PacketBuilder(0x00)
            # if yes, send starting message
            packet.add_string(json_dumps(Messages.DISCONNECT_STARTING_MESSAGE))
            self.send_packet(packet.build())
            # and close connection
            self.onclose()
            self.connected = False
        else:
            # if no, send error message and close connection
            packet = PacketBuilder(0x00)
            packet.add_string(json_dumps(Messages.DISCONNECT_NO_PERM_MESSAGE))
            self.send_packet(packet.build())
            self.connected = False
        # cancel event everytime
        return False

    def login_error(self):
        packet = PacketBuilder(0x00)
        packet.add_string(json_dumps(Messages.DISCONNECT_ERROR_MESSAGE))
        self.send_packet(packet.build())
        self.connected = False


class DSMServer:
    __slots__ = "conn", "serversocket", "keypair", "running", "eligible_players", "loop"

    def __init__(self, conn, loop):
        self.conn = conn
        self.serversocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.keypair = generate_keypair()
        self.running = False
        self.eligible_players = ["bedrockcrafterlp"]
        self.loop = loop

    def stop(self):
        if self.running:
            self.running = False
            self.serversocket.close()
            print("START MC")

    async def start(self):
        self.serversocket.bind(self.conn)
        self.serversocket.listen(4)
        self.serversocket.setblocking(False)
        self.running = True
        while self.running:
            try:
                client, _ = await self.loop.sock_accept(self.serversocket)
            except OSError:
                self.stop()
                continue
            self.loop.create_task(self.handle_connection(client))

    async def handle_connection(self, conn):
        print("Client Connected")
        connection = DSMClientConnection(self.eligible_players, self.stop, conn, self.loop, self.keypair[0], self.keypair[1])
        await connection.block()
        print("Connection Ended")
