class VersionProvider:
    def __init__(self):
        self.versions = {}

    async def reload(self):
        pass

    def get_json(self, links=False):
        return self.versions if links else list(self.versions.keys())
