from .exceptions import ApiError
from .responses import *


def get_uuid(player_name):
	resp = rq.get(f"https://api.mojang.com/users/profiles/minecraft/{player_name}")
	if resp.status_code != 200:
		raise ApiError(f"Name {player_name} wasn't found by the API. Status code: {resp.status_code}")
	else:
		resp_json = resp.json()
		return UUIDResponse(resp_json["name"], resp_json["id"])


def get_skin_by_uuid(uuid):
	resp = rq.get(f"https://sessionserver.mojang.com/session/minecraft/profile/{uuid}")
	
	if resp.status_code != 200:
		raise ApiError(f"Unknown UUID: {uuid}. Status code: {resp.status_code}")
	
	resp_json = resp.json()
	
	return SkinResponse(resp_json)
		

def get_skin_by_name(player_name):
	uuid = get_uuid(player_name).get_uuid()
	return get_skin_by_uuid(uuid)


def has_player_joined(hash, name):
	resp = rq.get(f"https://sessionserver.mojang.com/session/minecraft/hasJoined?username={name}&serverId={hash}")

	if not resp.ok:
		raise ApiError(f"Request Failed. Status: {resp.status_code}")

	if not resp.content:
		return HasPlayerJoinedResponse({})
	resp_json = resp.json()
	return HasPlayerJoinedResponse(resp_json)
