import os
import subprocess

import aiohttp

from .base import VersionProvider
from ...io.config import Config
from ...util import get_path, download_and_save


class ForgeVersionProvider(VersionProvider):
    NAME = "forge"
    DOWNLOAD_FILE_NAME = "installer.jar"

    def __init__(self):
        self.versions = {}

    async def has_version(self, major, minor):
        return major in self.versions.keys() and minor in self.versions[major]

    async def reload(self):
        async with aiohttp.ClientSession() as session:
            async with session.get(Config.VERSIONS["forge"]["getVersions"]) as r:
                resp = await r.json()
        self.versions = resp

    async def get_major_versions(self):
        return list(self.versions.keys())

    async def get_minor_versions(self, major):
        if major not in self.versions.keys():
            return []
        return self.versions[major]

    async def get_download(self, major, minor):
        return Config.VERSIONS["forge"]["downloadBuild"].format(build=minor)

    async def post_download(self, directory, major, version):
        subprocess.call("java -jar installer.jar --installServer", stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, cwd=directory, shell=Config.get_docker_secret("mongo_user") is not None)
        files_to_try = [f"forge-{version}-universal.jar", f"forge-{version}.jar"]
        renamed = False
        for file in files_to_try:
            try:
                os.rename(os.path.join(directory, file), os.path.join(directory, "server.jar"))
                renamed = True
                break
            except FileNotFoundError:
                pass
        if not renamed:
            raise FileNotFoundError("couldn't find server file")

    async def add_addon(self, addon_id, addon_type, addon_version, server_dir):
        if addon_type != "mods":
            return {}
        url = Config.ADDONS["mods"]["getDownloadUrl"].format(addon_id=addon_id, file_id=addon_version)
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as r:
                url = await r.text()
            async with session.get(Config.ADDONS["mods"]["getModInfo"].format(addon_id=addon_id)) as r:
                info = await r.json()
        if not url:
            return {}
        file_name = get_path(url)[-1]
        image_url = None
        if len(info["attachments"]) > 0:
            image_url = info["attachments"][0]["thumbnailUrl"]
        mods_dir = os.path.join(server_dir, "mods")
        if not os.path.isdir(mods_dir):
            os.mkdir(mods_dir)
        file_path = os.path.join(mods_dir, file_name)
        await download_and_save(url, file_path)
        return {"filePath": file_path, "name": info["name"], "description": info["summary"], "id": addon_id, "fileId": addon_version, "imageUrl": image_url}

    async def get_minecraft_version(self, major, minor):
        return major
