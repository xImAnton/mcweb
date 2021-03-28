import json


class Config:
    """
    static class for managing configurations
    """

    ATTR_KEYS = {
        "DB_PATH": ("dbPath", "data.db"),
        "SESSION_EXPIRATION": ("sessionExpiration", 7200),
        "VERSIONS": ("versions", {}),
        "MAX_RAM": ("maxRam", 2),
        "MONGO":  ("mongoDB", {}),
        "SERVER_DIR": ("serverDir", "./servers"),
        "ADDONS": ("addons", {}),
        "JAVA": ("javaSettings", {})
    }

    DB_PATH = "data.db"
    VERSIONS = {}
    SESSION_EXPIRATION = 7200
    MAX_RAM = 2
    MONGO = {}
    SERVER_DIR = "./servers"
    ADDONS = {}
    JAVA = {}

    @staticmethod
    def load() -> None:
        """
        loads the config file and stores it's values as class attributes
        """
        with open("config.json", "r", encoding="utf-8") as f:
            data = json.loads(f.read())

        for attr, key in Config.ATTR_KEYS.items():
            try:
                setattr(Config, attr, data[key[0]])
            except KeyError:
                setattr(Config, attr, key[1])

    @staticmethod
    def public_json():
        java_versions = {}
        for k, v in Config.JAVA["installations"].items():
            java_versions[k] = v["displayName"]
        return {
            "javaVersions": java_versions,
            "maxRam": Config.MAX_RAM
        }
