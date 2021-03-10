from .paper import PaperVersionProvider


class VersionManager:
    def __init__(self):
        self.paper_provider = PaperVersionProvider()

    async def reload_all(self):
        await self.paper_provider.reload()

    async def get_json(self, links=False):
        return {"paper": self.paper_provider.versions if links else self.paper_provider.versions.keys()}
