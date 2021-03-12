import aiohttp
from ...config import Config
import xml.etree.ElementTree as xml
from .base import VersionProvider


class ForgeVersionProvider(VersionProvider):
    async def reload(self):
        # TODO: Cache Versions and check root->versioning->lastUpdated <-- Too big request per start
        async with aiohttp.ClientSession() as session:
            async with session.get(Config.DOWNLOADS["forge"]["getVersions"]) as r:
                resp = await r.text()
        root = xml.fromstring(resp)
        versions = root.find("versioning").find("versions")
        for version in versions.findall("version"):
            self.versions[version.text] = Config.DOWNLOADS["forge"]["downloadBuild"].format(build=version.text)
