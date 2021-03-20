import aiohttp
from ...io.config import Config
from .base import VersionProvider


class SnapshotVersionProvider(VersionProvider):
    def __init__(self):
        self.versions = {}

    async def reload(self):
        async with aiohttp.ClientSession() as session:
            async with session.get(Config.DOWNLOADS["vanilla"]["getVersions"]) as r:
                resp = await r.json()
        for v in resp["versions"]:
            if v["type"] == "snapshot":
                self.versions[v["id"]] = v["url"]

    async def get_versions(self):
        return list(reversed(self.versions.keys()))

    async def get_download(self, version):
        async with aiohttp.ClientSession() as session:
            async with session.get(self.versions[version]) as r:
                resp = await r.json()

        url = resp["downloads"]["server"]["url"]
        return url


class VanillaVersionProvider(SnapshotVersionProvider):
    async def reload(self):
        async with aiohttp.ClientSession() as session:
            async with session.get(Config.DOWNLOADS["vanilla"]["getVersions"]) as r:
                resp = await r.json()
        for v in resp["versions"]:
            if v["type"] == "release":
                self.versions[v["id"]] = v["url"]
