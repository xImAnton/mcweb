import aiohttp
from ...io.config import Config
from .base import VersionProvider


class PaperVersionProvider(VersionProvider):
    def __init__(self):
        self.versions = []

    async def reload(self):
        async with aiohttp.ClientSession() as session:
            async with session.get(Config.DOWNLOADS["paper"]["getVersions"]) as r:
                resp = await r.json()
            self.versions = resp["versions"]

    async def get_download(self, version):
        async with aiohttp.ClientSession() as session:
            async with session.get(Config.DOWNLOADS["paper"]["getBuilds"].format(version=version)) as r:
                resp = await r.json()
            last_build = resp["builds"][-1]
            async with session.get(
                    Config.DOWNLOADS["paper"]["getBuildDownload"].format(version=version, build=last_build)) as r:
                resp = await r.json()
            download = resp["downloads"]["application"]["name"]
            return Config.DOWNLOADS["paper"]["downloadBuild"].format(version=version, build=last_build, download=download)

    async def get_versions(self):
        return self.versions
