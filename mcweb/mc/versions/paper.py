import aiohttp
from ...config import Config


class PaperVersionProvider:
    def __init__(self):
        self.versions = {}

    async def reload(self):
        # TODO: Cache Versions <-- Too many requests per start
        async with aiohttp.ClientSession() as session:
            async with session.get(Config.DOWNLOADS["paper"]["getVersions"]) as r:
                resp = await r.json()
            versions = resp["versions"]
            for version in versions:
                async with session.get(Config.DOWNLOADS["paper"]["getBuilds"].format(version=version)) as r:
                    resp = await r.json()
                last_build = resp["builds"][-1]
                async with session.get(Config.DOWNLOADS["paper"]["getBuildDownload"].format(version=version, build=last_build)) as r:
                    resp = await r.json()
                download = resp["downloads"]["application"]["name"]
                self.versions[version] = Config.DOWNLOADS["paper"]["downloadBuild"].format(version=version, build=last_build, download=download)
