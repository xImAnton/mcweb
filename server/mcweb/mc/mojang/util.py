import base64 as b64
import json


def decode_base64_str(string):
		g_bytes = string.encode("ascii")
		dec_bytes = b64.b64decode(g_bytes)
		resp = dec_bytes.decode('ascii')
		return str(resp)


def json_str_to_dict(string):
	return json.loads(string)


def long_uuid(uuid):
	return uuid[:8] + "-" + uuid[8:12] + "-" + uuid[12:16] + "-" + uuid[16:20] + "-" + uuid[20:]
