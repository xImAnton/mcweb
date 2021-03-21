class VersionProvider:
    NAME = "version provider"
    DOWNLOAD_FILE_NAME = "server.jar"

    async def reload(self):
        pass

    async def has_version(self, version):
        return False

    async def get_download(self, version):
        return ""

    async def get_versions(self):
        return []

    async def post_download(self, directory, version):
        pass
