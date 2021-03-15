from .paper import PaperVersionProvider
from .forge import ForgeVersionProvider


class VersionManager:
    def __init__(self):
        self.paper_provider = PaperVersionProvider()
        self.forge_provider = ForgeVersionProvider()

    async def reload_all(self):
        await self.paper_provider.reload()
        await self.forge_provider.reload()

    async def get_json(self):
        return {"paper": await self.paper_provider.get_versions(), "forge": await self.forge_provider.get_versions()}

    async def get_provider(self):
        return {"paper": self.paper_provider, "forge": self.forge_provider}
