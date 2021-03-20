from .paper import PaperVersionProvider
from .forge import ForgeVersionProvider
from .vanilla import SnapshotVersionProvider, VanillaVersionProvider


class VersionManager:
    def __init__(self):
        self.provider = {
            "paper": PaperVersionProvider(),
            "forge": ForgeVersionProvider(),
            "snapshot": SnapshotVersionProvider(),
            "vanilla": VanillaVersionProvider()
        }

    async def reload_all(self):
        for p in self.provider.values():
            await p.reload()

    async def get_json(self):
        out = {}
        for k, v in self.provider.items():
            out[k] = await v.get_versions()
        return out

    async def get_provider(self):
        return self.provider
