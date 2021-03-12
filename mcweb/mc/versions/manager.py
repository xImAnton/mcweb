from .paper import PaperVersionProvider
from .forge import ForgeVersionProvider


class VersionManager:
    def __init__(self):
        self.paper_provider = PaperVersionProvider()
        self.forge_provider = ForgeVersionProvider()

    async def reload_all(self):
        await self.paper_provider.reload()
        await self.forge_provider.reload()

    async def get_json(self, links=False):
        return {"paper": self.paper_provider.get_json(links), "forge": self.forge_provider.get_json(links)}
