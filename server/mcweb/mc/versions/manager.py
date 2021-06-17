from .forge import ForgeVersionProvider
from .paper import PaperVersionProvider
from .vanilla import SnapshotVersionProvider, VanillaVersionProvider


class VersionManager:
    def __init__(self):
        # register version provider
        self.provider = [
            PaperVersionProvider(),
            ForgeVersionProvider(),
            SnapshotVersionProvider(),
            VanillaVersionProvider()
        ]

    async def reload_all(self):
        for p in self.provider:
            await p.reload()

    async def provider_by_name(self, s):
        for p in self.provider:
            if p.NAME == s:
                return p
        return None

    async def get_all_major_versions_json(self):
        out = {}
        for v in self.provider:
            out[v.NAME] = await v.get_major_versions()
        return out
