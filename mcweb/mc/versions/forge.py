import aiohttp
from mcweb.io.config import Config
import xml.etree.ElementTree as xml
from .base import VersionProvider
import os
import subprocess


class ForgeVersionProvider(VersionProvider):
    NAME = "forge"
    DOWNLOAD_FILE_NAME = "installer.jar"

    def __init__(self):
        self.versions = {}

    async def has_version(self, version):
        return version in self.versions.keys()

    async def reload(self):
        async with aiohttp.ClientSession() as session:
            async with session.get(Config.VERSIONS["forge"]["getVersions"]) as r:
                resp = await r.text()
        root = xml.fromstring(resp)
        versions = root.find("versioning").find("versions")
        for version in versions.findall("version"):
            self.versions[version.text] = Config.VERSIONS["forge"]["downloadBuild"].format(build=version.text)

    async def get_versions(self):
        return list(self.versions.keys())

    async def get_download(self, version):
        return self.versions[version]

    async def post_download(self, directory, version):
        null = open(os.devnull, "w")
        subprocess.call("java -jar installer.jar --installServer", stdout=null, stderr=null, cwd=directory)
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
