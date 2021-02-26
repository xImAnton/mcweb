from sanic.blueprints import Blueprint
from .deco import json_res, requires_post_params, requires_login
from ..login import User
from datetime import datetime


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
            sess_id, sesskey, expires = await user.login()
            resp = json_res({"success": "logged in successfully", "data": {"sesskey": sesskey}})
            resp.cookies["MCWeb-Session"] = sess_id
            resp.cookies["MCWeb-Session"]["expires"] = datetime.fromtimestamp(expires)
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
        return json_res({"info": "you are logged in", "status": 200})


@account_blueprint.get("/logout")
@requires_login()
async def logout(req):
    """
    get endpoint for logging out a user
    """
    await req.ctx.session.logout()
    return json_res({"success": "logged out successfully", "data": {}})
