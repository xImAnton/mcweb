from sanic.blueprints import Blueprint
from websockets.exceptions import ConnectionClosed
from mcweb.util import server_endpoint, requires_server_online, json_res, requires_post_params, requires_login, console_ws, catch_keyerrors
from json import dumps as json_dumps
from time import strftime
import asyncio
from ..io.regexes import Regexes
from ..io.config import Config


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
    if await req.app.server_manager.server_running_on(port=req.ctx.server.port):
        return json_res({"error": "Port Unavailable", "description": "there is already a server running on that port", "status": 423}, status=423)
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

    async def server_stopped(s):
        while s.running:
            pass

    await asyncio.wait_for(server_stopped(req.ctx.server), 30)
    await req.ctx.server.start()


@server_blueprint.patch("/<i>")
@requires_login()
@server_endpoint()
async def update_server(req, i):
    for k, v in req.json.items():
        if k == "displayName":
            if not Regexes.SERVER_DISPLAY_NAME.match(v):
                return json_res({"error": "Illegal Server Name", "description": f"the server name doesn't match the regex for server names", "status": 400, "regex": Regexes.SERVER_DISPLAY_NAME.pattern}, status=400)
            req.ctx.server.display_name = v
        elif k == "port":
            if not isinstance(v, int):
                return json_res({"error": "TypeError", "description": "port has to be int", "status": 400}, status=400)
            if v < 25000 | v > 30000:
                return json_res(
                    {"error": "Invalid Port", "description": f"Port range is between 25000 and 30000", "status": 400}, status=400)
            req.ctx.server.port = v
        elif k == "allocatedRAM":
            if not isinstance(v, int):
                return json_res({"error": "TypeError", "description": "allocatedRAM has to be int", "status": 400}, status=400)
            if v > Config.MAX_RAM:
                return json_res({"error": "Too Much RAM", "description": "maximal ram is " + str(Config.MAX_RAM), "status": 400, "maxRam": Config.MAX_RAM}, status=400)
            req.ctx.server.ram = v
        else:
            return json_res({"error": "Invalid Key", "description": f"Server has no editable attribute: {v}", "status": 400}, status=400)
    await req.ctx.server.update()
    return json_res({"success": "Updated Server", "update": {"server": req.ctx.server.json()}})


@server_blueprint.put("/<i>/addons")
@requires_login()
@server_endpoint()
@requires_post_params("addonId", "addonType", "addonVersion")
@catch_keyerrors()
async def add_addon(req, i):
    if not await req.ctx.server.supports(req.json["addonType"]):
        return json_res({"error": "Invalid Addon Type", "description": "this server doesn't support " + req.json["addonType"], "status": 400}, status=400)
    addon = await req.ctx.server.add_addon(req.json["addonId"], req.json["addonType"], req.json["addonVersion"])
    if addon:
        return json_res({"success": "Addon added", "data": {"addon": addon}})
    else:
        return json_res({"error": "Error while creating Addon", "description": "maybe the addon id is wrong, the file couldn't be downloaded or this server doesn't support addons yet", "status": 400}, status=400)


@server_blueprint.put("/create/<server>/<version>")
@requires_login()
@requires_post_params("name", "port")
async def create(req, server, version):
    ram = 2 if "allocatedRAM" not in req.json.keys() else req.json["allocatedRAM"]
    name = req.json["name"]
    port = req.json["port"]
    version_provider = await req.app.server_manager.versions.provider_by_name(server)
    return await req.app.server_manager.create_server(name, version_provider, version, ram, port)


@server_blueprint.get("/versions")
@requires_login()
async def get_all_versions(req):
    return json_res(await req.app.server_manager.versions.get_json())
