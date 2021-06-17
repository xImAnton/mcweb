from time import strftime

from sanic.blueprints import Blueprint
from sanic.response import file
from websockets.exceptions import ConnectionClosed

from ..util import server_endpoint, requires_server_online, json_res, requires_post_params, requires_login, \
    console_ws, catch_keyerrors
from ..io.wspackets import ConsoleInfoPacket, ConsoleConnectedPacket
from ..mc.server import MinecraftServer
from ..util import TempDir

server_blueprint = Blueprint("server", url_prefix="server")


@server_blueprint.get("/<i:string>")
@requires_login()
@server_endpoint()
async def get_server(req, i):
    """
    endpoint for getting server information for a single server
    """
    await req.ctx.user.set_last_server(req.ctx.server)
    return json_res(req.ctx.server.json())


@server_blueprint.get("/")
@requires_login()
async def get_all_servers(req):
    """
    endpoints for getting a list of all servers
    """
    o = [s.light_json() if req.args.get("idonly") else s.json() for s in req.app.server_manager.servers]
    return json_res(o)


@server_blueprint.get("/<i:string>/start")
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


@server_blueprint.websocket("/<i:string>/console")
@server_endpoint()
@console_ws()
async def console_websocket(req, ws, i):
    """
    websocket endpoints for console output and server state change
    """
    if req.ctx.user is None:
        await ConsoleInfoPacket("please login using POST to /account/login before using this").send(ws)
        await ws.close()
        return
    await req.ctx.server.connections.connected(ws, req.ctx.ticket, req.ctx.user)
    await ConsoleConnectedPacket().send(ws)
    try:
        while True:
            await ws.recv()
            await ConsoleInfoPacket("Don't send messages via websocket, use http endpoints instead").send(ws)
    except ConnectionClosed:
        await req.ctx.server.connections.disconnected(ws)


@server_blueprint.post("/<i:string>/command")
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


@server_blueprint.get("/<i:string>/stop")
@requires_login()
@server_endpoint()
@requires_server_online()
async def stop_server(req, i):
    """
    endpoint for stopping the specified server
    """
    block = req.args.get("blockuntilstopped")
    stop_event = await req.ctx.server.stop()
    if stop_event is None:
        return json_res({"error": "Error stopping server", "description": "", "status": 500}, status=500)
    if block:
        await stop_event.wait()
    return json_res({"success": "server stopped", "update": {"server": {"online_status": 0 if block else 3}}})


@server_blueprint.get("/<i:string>/restart")
@requires_login()
@server_endpoint()
@requires_server_online()
async def restart(req, i):
    """
    endpoints for restarting the specified server
    """
    stop_event = await req.ctx.server.stop()
    if not stop_event:
        raise ValueError("impossible")
    await stop_event.wait()
    await req.ctx.server.start()
    return json_res({"success": "Server Restarted"})


@server_blueprint.patch("/<i:string>")
@requires_login()
@server_endpoint()
async def update_server(req, i):
    out = {}
    for k, v in req.json.items():
        if k not in MinecraftServer.CHANGEABLE_FIELDS.keys():
            return json_res({"error": "Invalid Key", "description": f"Server has no editable attribute: {k}", "status": 400, "key": k}, status=400)
        if not MinecraftServer.CHANGEABLE_FIELDS[k](v):
            return json_res({"error": "ValueError", "description": f"the value you specified is not valid for {k}", "status": 400, "key": k}, status=400)
        out[k] = v
    await req.ctx.server.update(out)
    await req.ctx.server.refetch()
    return json_res({"success": "Updated Server", "update": {"server": req.ctx.server.json()}})


@server_blueprint.put("/<i:string>/addons")
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


@server_blueprint.delete("/<i:string>/addons/<addon_id:int>")
@requires_login()
@server_endpoint()
async def remove_addon(req, i, addon_id):
    if await req.ctx.server.remove_addon(addon_id):
        return json_res({"success": "Addon Removed"})
    else:
        return json_res({"error": "Addon Not Found", "description": "addon couldn't be found on the server", "status": 400}, status=400)


@server_blueprint.put("/create/<server:string>/<major_version:string>/<minor_version:string>")
@requires_login()
@requires_post_params("name", "port")
async def create(req, server, major_version, minor_version):
    ram = 2 if "allocatedRAM" not in req.json.keys() else req.json["allocatedRAM"]
    java_version = "default" if "javaVersion" not in req.json.keys() else req.json["javaVersion"]
    name = req.json["name"]
    port = req.json["port"]
    version_provider = await req.app.server_manager.versions.provider_by_name(server)
    return await req.app.server_manager.create_server(name, version_provider, major_version, minor_version, ram, port, java_version)


@server_blueprint.get("/versions")
@requires_login()
async def get_all_versions(req):
    return json_res(await req.app.server_manager.versions.get_all_major_versions_json())


@server_blueprint.get("/versions/<software:string>/<major_version:string>")
@requires_login()
async def get_minor_versions(req, software, major_version):
    prov = await req.app.server_manager.versions.provider_by_name(software)
    if not prov:
        return json_res({"error": "Invalid Software", "description": "there is no server software with that name: " + str(software), "status": 400}, status=400)
    return json_res(await prov.get_minor_versions(major_version))


@server_blueprint.get("/<i:string>/addons/download")
@requires_login()
@server_endpoint()
async def download_addons(req, i):
    async with TempDir() as tmp:
        name = f"addons-{req.ctx.server.name}.zip"
        f = tmp.use_file(name)
        await req.ctx.server.pack_addons(f)
        return await file(f, filename=name)


@server_blueprint.delete("/<i:string>")
@requires_login()
@server_endpoint()
async def delete_server(req, i):
    await req.ctx.server.delete()
    return json_res({"success": "Removed Server Successfully"})
