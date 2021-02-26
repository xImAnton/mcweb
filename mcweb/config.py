import json


class Config:
    """
    static class for managing configurations
    """

    ATTR_KEYS = {
        "DB_PATH": ("dbPath", "data.db"),
        "RESET_DB": ("resetDB", False),
        "SESSION_EXPIRATION": ("sessionExpiration", 7200)
    }

    DB_PATH = "data.db"
    RESET_DB = False

    @staticmethod
    def load() -> None:
        """
        loads the config file and stores it's values as class attributes
        """
        with open("config.json") as f:
            data = json.loads(f.read())

        for attr, key in Config.ATTR_KEYS.items():
            try:
                setattr(Config, attr, data[key[0]])
            except KeyError:
                setattr(Config, attr, key[1])
