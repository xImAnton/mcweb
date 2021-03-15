from mcweb import MCWeb
from mcweb.io.config import Config


if __name__ == "__main__":
    Config.load()
    app = MCWeb()
    app.start()
