from functools import wraps
from sanic.response import json
from json import dumps as json_dumps, loads as json_loads


def json_res(*args, **kwargs):
    return json(*args, dumps=lambda s: json_dumps(s, indent=2), **kwargs)


def server_endpoint():
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


def requires_post_params(*json_keys):
    def decorator(f):
        @wraps(f)
        async def decorated_function(req, *args, **kwargs):
            for prop in json_keys:
                if prop not in req.json.keys():
                    return json_res({"error": "KeyError", "status": 400, "description": "you need to specify " + prop}, status=404)
            response = await f(req, *args, **kwargs)
            return response
        return decorated_function
    return decorator


def requires_login():
    def decorator(f):
        @wraps(f)
        async def decorated_function(req, *args, **kwargs):
            if not req.ctx.user:
                return json_res({"error": "Not Logged In", "status": 401, "description": "please login using POST to /account/login"},
                                status=401)
            response = await f(req, *args, **kwargs)
            return response
        return decorated_function
    return decorator


def requires_permission(*perms):
    def decorator(f):
        @wraps(f)
        async def decorated_function(req, *args, **kwargs):
            user_perms = json_loads(req.ctx.user.perms)
            for perm in perms:
                if perm not in user_perms:
                    return json_res({"error": "No Permission", "status": 403, "description": "you don't have the permission to access this endpoint"},
                                status=403)
            response = await f(req, *args, **kwargs)
            return response
        return decorated_function
    return decorator
