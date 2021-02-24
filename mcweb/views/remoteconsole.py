from sanic import Blueprint
from websockets.exceptions import ConnectionClosed


rconsole = Blueprint("console", url_prefix="console")

@rconsole.websocket("/")
async def ws(req, ws):
    req.app.ws_connections.append(ws)
    await ws.send("connected\n")
    try:
        while True:
            msg = await ws.recv()
            if msg:
                req.app.server.write_stdin(msg)
    except ConnectionClosed:
        req.app.ws_connections.remove(ws)
