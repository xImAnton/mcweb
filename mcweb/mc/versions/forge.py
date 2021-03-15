import aiohttp
from mcweb.io.config import Config
import xml.etree.ElementTree as xml
from .base import VersionProvider


class ForgeVersionProvider(VersionProvider):
    def __init__(self):
        self.versions = {}

    async def reload(self):
        async with aiohttp.ClientSession() as session:
            async with session.get(Config.DOWNLOADS["forge"]["getVersions"]) as r:
                resp = await r.text()
        root = xml.fromstring(resp)
        versions = root.find("versioning").find("versions")
        for version in versions.findall("version"):
            self.versions[version.text] = Config.DOWNLOADS["forge"]["downloadBuild"].format(build=version.text)

    async def get_versions(self):
        return list(self.versions.keys())

    async def get_download(self, version):
        return self.versions[version]
