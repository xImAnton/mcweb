class VersionProvider:
    async def reload(self):
        pass

    async def get_download(self, version):
        return ""

    async def get_versions(self):
        return []
