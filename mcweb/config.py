import json


class Config:

    ATTR_KEYS = {
        "DB_PATH": ("dbPath", "data.db"),
        "RESET_DB": ("resetDB", False)
    }

    DB_PATH = "data.db"
    RESET_DB = False

    @staticmethod
    def load():
        with open("config.json") as f:
            data = json.loads(f.read())

        for attr, key in Config.ATTR_KEYS.items():
            try:
                setattr(Config, attr, data[key[0]])
            except KeyError:
                setattr(Config, attr, key[1])
