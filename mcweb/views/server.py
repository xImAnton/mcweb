from sanic.blueprints import Blueprint
from websockets.exceptions import ConnectionClosed
from .deco import server_endpoint, requires_server_online, json_res, requires_post_params
from json import dumps as json_dumps


server_blueprint = Blueprint("server", url_prefix="server")


@server_blueprint.route("/<i>")
@server_endpoint()
async def get_server(req, i):
    print(req.ctx.user)
    return json_res(req.ctx.server.json())


@server_blueprint.route("/")
async def get_all_servers(req):
    l = []
    for server in req.app.server_manager.servers:
        l.append(server.json())
    return json_res(l)


@server_blueprint.route("/<i>/start")
@server_endpoint()
@requires_server_online(False)
async def start_server(req, i):
    await req.ctx.server.start()
    return json_res({"success": "server started", "update": {"server": {"online_status": 1}}})


@server_blueprint.websocket("/<i>/console")
@server_endpoint()
async def console_websocket(req, ws, i):
    await req.ctx.server.connections.connected(ws)
    await ws.send(json_dumps({
            "packetType": "ConsoleConnectedPacket",
            "data": {
            }
        }))
    try:
        while True:
            await ws.recv()
            await ws.send(json_dumps({
                "packetType": "ConsoleInfoPacket",
                "data": {
                    "message": "Don't send messages via websocket, use http methods instead"
                }
            }))
    except ConnectionClosed:
        await req.ctx.server.connections.disconnected(ws)


@server_blueprint.route("/<i>/command", methods=frozenset({"POST"}))
@server_endpoint()
@requires_server_online()
@requires_post_params("command")
async def execute_console_command(req, i):
    await req.ctx.server.send_command(req.json["command"])
    return json_res({"success": "command sent", "update": {}})


@server_blueprint.route("/<i>/stop")
@server_endpoint()
@requires_server_online()
async def stop_server(req, i):
    force = False
    if "force" in req.args.keys():
        force = bool(req.args["force"])
    await req.ctx.server.stop(force)
    return json_res({"success": "server stopped", "update": {"server": {"online_status": 3}}})
