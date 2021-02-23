from sanic import Sanic
from sanic.response import text

app = Sanic("TestServer")


@app.route("/")
async def hello_world(req):
    return text("hello, world")


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=1337)
