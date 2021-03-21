import aiohttp
from ...io.config import Config
from .base import VersionProvider


class PaperVersionProvider(VersionProvider):
    NAME = "paper"

    def __init__(self):
        self.versions = []

    async def has_version(self, version):
        return version in self.versions

    async def reload(self):
        async with aiohttp.ClientSession() as session:
            async with session.get(Config.VERSIONS["paper"]["getVersions"]) as r:
                resp = await r.json()
            self.versions = resp["versions"]

    async def get_download(self, version):
        async with aiohttp.ClientSession() as session:
            async with session.get(Config.VERSIONS["paper"]["getBuilds"].format(version=version)) as r:
                resp = await r.json()
            last_build = resp["builds"][-1]
            async with session.get(
                    Config.VERSIONS["paper"]["getBuildDownload"].format(version=version, build=last_build)) as r:
                resp = await r.json()
            download = resp["downloads"]["application"]["name"]
            return Config.VERSIONS["paper"]["downloadBuild"].format(version=version, build=last_build, download=download)

    async def get_versions(self):
        return self.versions
