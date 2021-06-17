import os
import shutil

import requests as rq
from PIL import Image

from .exceptions import DirectoryNotFoundError
from .util import decode_base64_str, json_str_to_dict


class UUIDResponse:
	def __init__(self, name, uuid):
		self.__name = name
		self.__uuid = uuid
	
	def get_name(self):
		return self.__name
	
	def get_uuid(self):
		return self.__uuid

class SkinResponse:
	def __init__(self, json):
		self.__json = json
		self.__name = self.__json["name"]
		self.__uuid = self.__json["id"]
		self.__dec_json = json_str_to_dict(decode_base64_str(self.__json["properties"][0]["value"]))
		
		textures_tree = self.__dec_json["textures"]
		
		self.__has_skin = False if "SKIN" not in textures_tree.keys() else True
		self.__has_cape = False if "CAPE" not in textures_tree.keys() else True
		skin_tree = textures_tree["SKIN"]
		self.__is_slim = True if "metadata" in skin_tree.keys() else False
		self.__url = skin_tree["url"]
	
	def __checkdir(self, dire):
		if not os.path.exists(dire):
			raise DirectoryNotFoundError(f"Dir {dire} does not exist")
	
	def get_player_name(self):
		return self.__name
	
	def get_player_uuid(self):
		return self.__uuid
	
	def get_skin_url(self):
		return self.__url
	
	def has_cape(self):
		return self.__has_cape
	
	def is_slim(self):
		return self.__is_slim
	
	def has_skin(self):
		return self.__has_skin
	
	def save_player_head(self, path, name=None):
		self.__checkdir(path)
		tmp_file_path = self.save_player_skin(path=path, name="tmp")

		head_file_name = path + self.__uuid + ".png" if name is None else path + name + ".png"
		
		img = Image.open(tmp_file_path)
		img = img.crop((8, 8, 16, 16))
		img.save(head_file_name)
		os.remove(tmp_file_path)
		
		return head_file_name
	
	def save_player_skin(self, path, name=None):
		self.__checkdir(path)
		path = path + "/" if not path.endswith("/") else path
		resp = rq.get(self.__url, stream=True)
		file_path_name = path + self.__uuid + ".png" if name is None else path + name + ".png"
		resp.raw.decode_content = True
		
		with open(file_path_name, "wb") as f:
			shutil.copyfileobj(resp.raw, f)
		
		return file_path_name


class HasPlayerJoinedResponse:
	def __init__(self, json):
		if "id" not in json.keys():
			self.uuid = None
			self.name = None
			return
		self.uuid = json["id"]
		self.name = json["name"]
