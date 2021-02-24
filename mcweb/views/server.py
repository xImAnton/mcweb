from sanic.blueprints import Blueprint
from sanic.response import json
from json import dumps as json_dumps
from functools import wraps
from websockets.exceptions import ConnectionClosed


server_blueprint = Blueprint("server", url_prefix="server")


def json_res(*args, **kwargs):
    return json(*args, dumps=lambda s: json_dumps(s, indent=2), **kwargs)


def server_method():
    def decorator(f):
        @wraps(f)
        async def decorated_function(req, *args, **kwargs):
            if "i" not in kwargs.keys():
                return json_res({"error": "KeyError", "status": 400, "description": "please specify the server id"}, status=404)
            i = kwargs["i"]
            try:
                i = int(i)
            except ValueError:
                return json_res({"error": "ValueError", "status": 400, "description": "the server id has to be int"}, status=404)
            server = await req.app.server_manager.get_server(i)
            if server is None:
                return json_res({"error": "Not Found", "status": 404, "description": "no server was found for your id"}, status=404)
            await server.refetch()
            req.ctx.server = server
            response = await f(req, *args, **kwargs)
            return response
        return decorated_function
    return decorator


def requires_server_online(online=True):
    def decorator(f):
        @wraps(f)
        async def decorated_function(req, *args, **kwargs):
            if online != req.ctx.server.running:
                return json_res({"error": "Invalid State", "status": 423, "description": "this endpoint requires the server to be " + ("online" if online else "offline")},
                                status=423)
            response = await f(req, *args, **kwargs)
            return response
        return decorated_function
    return decorator


@server_blueprint.route("/<i>")
@server_method()
async def get_server(req, i):
    return json_res(req.ctx.server.json())


@server_blueprint.route("/list")
async def get_all_servers(req):
    l = []
    for server in req.app.server_manager.servers:
        l.append(server.json())
    return json_res(l)


@server_blueprint.route("/<i>/start")
@server_method()
@requires_server_online(False)
async def start_server(req, i):
    await req.ctx.server.start()
    return json_res({"success": "server started", "update": {"server": {"online_status": 1}}})


@server_blueprint.websocket("/<i>/console")
@server_method()
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
@server_method()
@requires_server_online()
async def execute_console_command(req, i):
    if "command" in req.json.keys():
        await req.ctx.server.send_command(req.json["command"])
        return json_res({"success": "command sent", "update": {}})
    else:
        return json_res({"error": "KeyError", "status": 400, "description": "please specify the command you want to send"}, status=400)


@server_blueprint.route("/<i>/stop")
@server_method()
@requires_server_online()
async def stop_server(req, i):
    force = False
    if "force" in req.args.keys():
        force = bool(req.args["force"])
    print(force)
    await req.ctx.server.stop(force)
    return json_res({"success": "server stopped", "update": {"server": {"online_status": 3}}})
