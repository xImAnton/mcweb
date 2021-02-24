from mcweb.sanicserver import MCWeb
from mcweb.config import Config


if __name__ == "__main__":
    Config.load()
    app = MCWeb()
    app.start()
