from sanic.blueprints import Blueprint
from websockets.exceptions import ConnectionClosed
from mcweb.util import server_endpoint, requires_server_online, json_res, requires_post_params, requires_login, console_ws
from json import dumps as json_dumps
from time import strftime


server_blueprint = Blueprint("server", url_prefix="server")


@server_blueprint.route("/<i:string>")
@requires_login()
@server_endpoint()
async def get_server(req, i):
    """
    endpoint for getting server information for a single server
    """
    return json_res(req.ctx.server.json())


@server_blueprint.route("/")
@requires_login()
async def get_all_servers(req):
    """
    endpoints for getting a list of all servers
    """
    o = [s.light_json() if req.args.get("idonly") else s.json() for s in req.app.server_manager.servers]
    return json_res(o)


@server_blueprint.route("/<i>/start")
@requires_login()
@server_endpoint()
@requires_server_online(False)
async def start_server(req, i):
    """
    endpoints for starting the specified server
    """
    await req.ctx.server.start()
    return json_res({"success": "server started", "update": {"server": {"online_status": 1}}})


@server_blueprint.websocket("/<i>/console")
@server_endpoint()
@console_ws()
async def console_websocket(req, ws, i):
    """
    websocket endpoints for console output and server state change
    """
    if not req.ctx.user:
        await ws.send(json_dumps({
            "packetType": "ConsoleInfoPacket",
            "data": {
                "message": "please login using POST to /account/login before using this"
            }
        }))
        await ws.close()
        return
    await req.ctx.server.connections.connected(ws)
    await ws.send(json_dumps({
            "packetType": "ConsoleConnectedPacket",
            "data": {
            }
        }))
    await ws.send(json_dumps({
        "packetType": "BulkConsoleMessagePacket",
        "data": {
            "lines": req.ctx.server.output,
            "reset": True
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
@requires_login()
@server_endpoint()
@requires_server_online()
@requires_post_params("command")
async def execute_console_command(req, i):
    """
    endpoints for sending console commands to the server
    """
    command = req.json["command"]
    req.ctx.server.output.append(f"[{strftime('%H:%M:%S')} MCWEB CONSOLE COMMAND]: " + command)
    await req.ctx.server.send_command(command)
    return json_res({"success": "command sent", "update": {}})


@server_blueprint.route("/<i>/stop")
@requires_login()
@server_endpoint()
@requires_server_online()
async def stop_server(req, i):
    """
    endpoint for stopping the specified server
    """
    force = False
    if "force" in req.args.keys():
        force = bool(req.args["force"])
    await req.ctx.server.stop(force)
    return json_res({"success": "server stopped", "update": {"server": {"online_status": 3}}})


@server_blueprint.route("<i>/restart")
@requires_login()
@server_endpoint()
@requires_server_online()
async def restart(req, i):
    """
    endpoints for restarting the specified server
    """
    await req.ctx.server.stop()
    while req.ctx.server.running:
        pass
    await req.ctx.server.start()


@server_blueprint.put("/create/<server>/<version>")
@requires_login()
@requires_post_params("name")
async def create(req, server, version):
    ram = 2 if "ram" not in req.json.keys() else req.json["ram"]
    name = req.json["name"]
    return await req.app.server_manager.create_server(name, server, version, ram)


@server_blueprint.get("/versions")
@requires_login()
async def get_all_versions(req):
    return json_res(await req.app.server_manager.versions.get_json())
