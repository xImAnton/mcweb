import socket
from .protocol import PacketBuilder, PacketBuffer


class DSMPortListener:
    def __init__(self, conn):
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.socket.bind(conn)

    def run(self):
        while True:
            self.socket.listen(5)
            client, address = self.socket.accept()
            print("{} connected".format(address))

            response = PacketBuffer(client.recv(2097151))
            response.read_varint()  # Length
            packId = response.read_varint()
            response.read_varint()  # Protocol Version
            if packId == 0:  # Login
                response.read_string()  # Host
                response.read_ushort()  # Port
                next_state = response.read_varint()
                if next_state == 1:
                    ping = """{
            "version": {
                "name": "1.16.4",
                "protocol": 47
            },
            "players": {
                "max": 100,
                "online": 0,
                "sample": []
            },
            "description": {
                "text": "Hello world"
            },
            "favicon": "data:image/png;base64,<data>"
        }
                    """

                    packet = PacketBuilder(0x00)
                    packet.add_string(ping)
                    packet = packet.build()
                    client.sendall(packet)
