from sanic.blueprints import Blueprint
from .deco import json_res, requires_post_params, requires_login
from ..login import User
from json import loads as json_loads
import secrets


def remove_lead_and_trail_slash(s):
    if s.startswith('/'):
        s = s[1:]
    if s.endswith('/'):
        s = s[:-1]
    return s


account_blueprint = Blueprint("account", url_prefix="account")


@account_blueprint.post("/login")
@requires_login(False)
@requires_post_params("username", "password")
async def login_post(req):
    """
    post endpoint for logging in a user
    """
    user = User(req.app.db_connection)
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
    return json_res({"username": req.ctx.user.name, "permissions": json_loads(req.ctx.user.perms)})


@account_blueprint.get("/ticket/<ep:path>")
@requires_login()
async def open_ticket(req, ep):
    user = req.ctx.user
    ep = remove_lead_and_trail_slash(ep)
    rec = await req.app.db_connection.fetch_one(f"SELECT * FROM ws_tickets WHERE user_id={user.id} AND endpoint=\"{ep}\";")
    if rec:
        return json_res({"ticket": rec[0], "endpoint": ep})
    ticket = secrets.token_urlsafe(24)
    await req.app.db_connection.execute(f"INSERT INTO ws_tickets (id, user_id, endpoint) VALUES (\"{ticket}\", {user.id}, \"{ep}\");")
    return json_res({"ticket": ticket, "endpoint": ep})
