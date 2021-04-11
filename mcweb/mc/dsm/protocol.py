import uuid
from io import BytesIO
from struct import pack, unpack


class PacketBuilder:
    def __init__(self, pack_id):
        self.id = pack_id
        self.bytes = bytes()

    def pack_varint(self, number, max_bits=32):
        number_min = -1 << (max_bits - 1)
        number_max = +1 << (max_bits - 1)
        if not (number_min <= number < number_max):
            raise ValueError("varint does not fit in range: %d <= %d < %d"
                             % (number_min, number, number_max))
        if number < 0:
            number += 1 << 32
        out = b""
        for i in range(10):
            b = number & 0x7F
            number >>= 7
            out += pack(">B", b | (0x80 if number > 0 else 0))
            if number == 0:
                break
        return out

    def pack_uuid(self, u):
        if isinstance(u, uuid.UUID):
            return u.bytes
        return uuid.UUID(u).bytes

    def add_uuid(self, u):
        self.bytes += self.pack_uuid(u)

    def pack_string(self, s):
        data = self.pack_varint(len(s))
        data += bytes(s, "utf-8")
        return data

    def pack_long(self, l):
        return pack("<q", l)

    def add_long(self, l):
        self.bytes += self.pack_long(l)

    def add_bytes(self, b):
        self.bytes += b

    def add_string(self, s):
        self.bytes += self.pack_string(s)

    def add_varint(self, i):
        self.bytes += self.pack_varint(i)

    def build(self):
        data = self.pack_varint(self.id) + self.bytes
        data = self.pack_varint(len(data)) + data
        return data


class PacketBuffer(BytesIO):
    def read_varint(self):
        bytes_read = 0
        result = 0
        do = True
        while do:
            read = self.read(1)
            if read == b"":
                return 0
            read = read[0]
            value = (read & 0b01111111)
            result |= (value << (7 * bytes_read))
            bytes_read += 1
            do = (read & 0b10000000) != 0
        return result

    def read_string(self):
        strlen = self.read_varint()
        return self.read(strlen).decode("utf-8")

    def read_ushort(self):
        return unpack(">H", self.read(2))[0]

    def read_long(self):
        return unpack("<q", self.read(8))[0]

    def read_bytes(self, l):
        return self.read(l)


class TextComponent:
    class Color:
        WHITE = "white"
        BLACK = "black"
        DARK_BLUE = "dark_blue"
        DARK_GREEN = "dark_green"
        DARK_AQUA = "dark_aqua"
        DARK_RED = "dark_red"
        DARK_PURPLE = "dark_purple"
        GOLD = "gold"
        GRAY = "gray"
        DARK_GRAY = "dark_gray"
        BLUE = "blue"
        GREEN = "green"
        AQUA = "aqua"
        RED = "red"
        LIGHT_PURPLE = "light_purple"
        YELLOW = "yellow"
        RESET = "reset"

    class Flag:
        BOLD = 0b00000001
        ITALIC = 0b00000010
        UNDERLINED = 0b00000100
        STRIKETHROUGH = 0b00001000
        OBFUSCATED = 0b00010000

    class Builder:
        def __init__(self, text=""):
            self._component = TextComponent()
            self._component.text = text

        def set_color(self, color):
            self._component.color = color
            return self

        def add_extra(self, extra):
            self._component.extra.append(extra)
            return self

        def set_flag(self, *flags):
            flag = 0
            for f in flags:
                flag |= f
            self._component.set_flag(flag)
            return self

        def build(self):
            return self._component

        def set_reset(self):
            self._component.reset = True
            return self

    def __init__(self):
        self.content = "text"
        self.extra = []
        self.color = TextComponent.Color.WHITE
        self.flags = 0
        self.text = ""
        self.reset = False

    def set_flag(self, flag):
        self.flags |= flag

    def remove_flag(self, flag):
        self.flags &= ~flag

    def is_flag_set(self, flag):
        return self.flags & flag != 0

    def as_json(self):
        out = {"content": self.content, "text": self.text}
        if self.extra:
            out["extra"] = []
            for c in self.extra:
                out["extra"].append(c.as_json())
        out["color"] = self.color
        if self.reset:
            out["bold"] = False
            out["italic"] = False
            out["underlined"] = False
            out["strikethrough"] = False
            out["obfuscated"] = False
        if self.is_flag_set(TextComponent.Flag.BOLD):
            out["bold"] = True
        if self.is_flag_set(TextComponent.Flag.ITALIC):
            out["italic"] = True
        if self.is_flag_set(TextComponent.Flag.UNDERLINED):
            out["underlined"] = True
        if self.is_flag_set(TextComponent.Flag.STRIKETHROUGH):
            out["strikethrough"] = True
        if self.is_flag_set(TextComponent.Flag.OBFUSCATED):
            out["obfuscated"] = True
        return out


class Packet(PacketBuffer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.packet_length = self.read_varint()
        self.packet_id = self.read_varint()


class HandshakePacket:
    def __init__(self, packet):
        self.protocol_version = packet.read_varint()
        if self.protocol_version == 0:
            return
        self.host = packet.read_string()
        self.port = packet.read_ushort()
        self.next_state = packet.read_varint()


class EncryptionResponsePacket:
    def __init__(self, packet):
        s_l = packet.read_varint()
        self.secret = packet.read_bytes(s_l)
        t_l = packet.read_varint()
        self.token = packet.read_bytes(t_l)


class EncryptionRequestPacket(PacketBuilder):
    def __init__(self, public_key, token):
        super(EncryptionRequestPacket, self).__init__(0x01)
        self.add_string("")
        self.add_varint(len(public_key))
        self.add_bytes(public_key)  # public key
        self.add_varint(len(token))
        self.add_bytes(token)
