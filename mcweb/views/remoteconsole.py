from sanic import Blueprint
from websockets.exceptions import ConnectionClosed


rconsole = Blueprint("console", url_prefix="console")

@rconsole.websocket("/socket")
async def ws(req, ws):
    req.app.ws_connections.append(ws)
    await ws.send("connected\n")
    try:
        while True:
            msg = await ws.recv()
            if msg:
                if msg == "start":
                    if not req.app.server.running:
                        await req.app.start_server()
                        continue
                    else:
                        await ws.send("server is already running\n")
                        continue
                if not req.app.server.running:
                    await ws.send("server not running. use 'start' to start\n")
                    continue
                req.app.server.write_stdin(msg)
    except ConnectionClosed:
        req.app.ws_connections.remove(ws)

rconsole.static("", "./tests/testclient.html")
