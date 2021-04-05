class VersionProvider:
    NAME = "version provider"
    DOWNLOAD_FILE_NAME = "server.jar"

    async def reload(self):
        pass

    async def has_version(self, major, minor):
        return False

    async def get_download(self, major, minor):
        return "//"

    async def post_download(self, directory, major, minor):
        pass

    async def add_addon(self, addon_id, addon_type, addon_version, server_dir):
        # {"filePath": "./plugins/jei.jar", "name": "JEI", "description": "..."}
        return {}

    async def get_major_versions(self):
        return []

    async def get_minor_versions(self, major):
        return []

    async def get_minecraft_version(self, major, minor):
        return ""
