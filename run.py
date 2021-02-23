from sanic import Sanic
from sanic.response import text
from mcweb.mc.communication import ServerCommunication

app = Sanic("TestServer")
server = ServerCommunication("java -Xmx2G -jar server.jar --nogui", "./tests/run")


@app.route("/command/<cmd>")
async def process_command(req, cmd):
    server.write_stdin(cmd)
    return text("executed command")


if __name__ == "__main__":
    server.begin()
    app.run(host="127.0.0.1", port=1337)
