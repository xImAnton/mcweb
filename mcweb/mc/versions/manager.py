from .paper import PaperVersionProvider
from .forge import ForgeVersionProvider
from .vanilla import SnapshotVersionProvider, VanillaVersionProvider


class VersionManager:
    def __init__(self):
        self.provider = [
            PaperVersionProvider(),
            ForgeVersionProvider(),
            SnapshotVersionProvider(),
            VanillaVersionProvider()
        ]

    async def reload_all(self):
        for p in self.provider:
            await p.reload()

    async def get_json(self):
        out = {}
        for v in self.provider:
            out[v.NAME] = await v.get_versions()
        return out

    async def provider_by_name(self, s):
        for p in self.provider:
            if p.NAME == s:
                return p
        return None
