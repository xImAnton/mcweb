from sanic.blueprints import Blueprint
from mcweb.util import json_res, requires_post_params, requires_login, catch_keyerrors
from mcweb.views.login import User
import secrets
from bson.objectid import ObjectId
from ..io.regexes import Regexes


account_blueprint = Blueprint("account", url_prefix="account")


@account_blueprint.post("/login")
@requires_login(False)
@requires_post_params("username", "password")
async def login_post(req):
    """
    post endpoint for logging in a user
    """
    user = User(req.app.mongo)
    user = await user.fetch_by_name(req.json["username"])
    if user:
        if await user.check_password(req.json["password"]):
            sess_id = await user.login()
            resp = json_res({"success": "logged in successfully", "data": {"sessionId": sess_id}})
            return resp
    return json_res({"error": "Wrong Credentials", "status": 401, "description": "either username or password are wrong"}, status=401)


@account_blueprint.get("/login")
async def login_get(req):
    """
    endpoint to redirect on wrong login
    """
    if not req.ctx.session:
        return json_res({"error": "Not Logged In", "status": 401, "description": "please login using POST to /account/login"}, status=401)
    else:
        return json_res({"info": "you are already logged in", "status": 200})


@account_blueprint.get("/logout")
@requires_login()
async def logout(req):
    """
    get endpoint for logging out a user
    """
    await req.ctx.session.logout()
    return json_res({"success": "logged out successfully", "data": {}})


@account_blueprint.get("/")
@requires_login()
async def fetch_me(req):
    """
    sends information about the current user to the client
    """
    return json_res({"username": req.ctx.user.name, "permissions": req.ctx.user.perms})


@account_blueprint.post("/ticket")
@requires_login()
@requires_post_params("type", "data")
@catch_keyerrors()
async def open_ticket(req):
    user = req.ctx.user
    type_ = req.json["type"].lower()
    data = req.json["data"]
    if type_ == "server.console":
        if "serverId" not in data.keys():
            return json_res({"error": "Missing Server Id", "description": "you have to specify the server id for the type server.console", "status": 400}, status=400)
        # Check if serverId is valid bson ObjectId and if a server with that id exists
        if (not ObjectId.is_valid(data["serverId"])) | (ObjectId(data["serverId"]) not in await req.app.server_manager.get_ids()):
            return json_res({"error": "Invalid Server Id", "description": "the server id you entered is either no valid bson ObjectId or does not match a server", "status": 400}, status=400)
        # save ObjectId string from request as ObjectId in mongo
        data["serverId"] = ObjectId(data["serverId"])
    rec = await req.app.mongo["wsticket"].find_one({"userId": user.id, "endpoint": {"type": type_, "data": data}})
    if rec:
        return json_res(rec)
    ticket = secrets.token_urlsafe(24)
    doc = {"ticket": ticket, "userId": user.id, "endpoint": {"type": type_, "data": data}}
    await req.app.mongo["wsticket"].insert_one(doc)
    return json_res(doc)
