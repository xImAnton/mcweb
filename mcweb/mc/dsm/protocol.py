import io
import struct


class PacketBuilder:
    def __init__(self, pack_id):
        self.id = pack_id
        self.bytes = bytes()

    @staticmethod
    def pack(fmt, *fields):
        return struct.pack(">" + fmt, *fields)

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
            out += PacketBuilder.pack("B", b | (0x80 if number > 0 else 0))
            if number == 0:
                break
        return out

    def pack_string(self, s):
        data = self.pack_varint(len(s))
        data += bytes(s, "utf-8")
        return data

    def add_string(self, s):
        self.bytes += self.pack_string(s)

    def add_varint(self, i):
        self.bytes += self.pack_varint(i)

    def build(self):
        data = self.pack_varint(self.id) + self.bytes
        data = self.pack_varint(len(data)) + data
        return data


class PacketBuffer(io.BytesIO):
    def read_varint(self):
        bytes_read = 0
        result = 0
        do = True
        while do:
            read = self.read(1)[0]
            value = (read & 0b01111111)
            result |= (value << (7 * bytes_read))
            bytes_read += 1
            do = (read & 0b10000000) != 0
        return result

    def read_string(self):
        strlen = self.read_varint()
        return self.read(strlen).decode("utf-8")

    def read_ushort(self):
        return int.from_bytes(self.read(2), "little")
