from functools import wraps
from sanic.response import json, redirect
from json import dumps as json_dumps, loads as json_loads


def json_res(*args, **kwargs):
    """
    straight wrapper for sanic.response.json
    adds indent to the output json
    :return: the created sanic.response.HTTPResponse
    """
    return json(*args, dumps=lambda s: json_dumps(s, indent=2), **kwargs)


def server_endpoint():
    """
    marks an api endpoint as a server endpoint
    needs <i> parameter in path
    fetches the server for the id and saves it to request.ctx.server for access in the endpoint
    raises json error when server couldn't be found
    """
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
    """
    decorator for a @server_endpoint()
    raises json error when the server from the @server_endpoint() hasn't the running state that is specified
    :param online: whether the server has to be online or offline for the request to pass to the handler
    """
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
    """
    rejects post requests if they have not the specified json keys in it
    :param json_keys: the json keys that the request has to have for the handler to call
    """
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


def requires_login(logged_in=True):
    """
    requires the user to be logged in to access this endpoint
    :param logged_in: whether the user has to be logged in or has to be not logged in
    """
    def decorator(f):
        @wraps(f)
        async def decorated_function(req, *args, **kwargs):
            if logged_in and not req.ctx.user:
                return redirect("/account/login")
            if not logged_in and req.ctx.user:
                return json_res({"error": "Logged In", "status": 401,
                                 "description": "you need to be logged out to use this"},
                                status=401)
            response = await f(req, *args, **kwargs)
            return response
        return decorated_function
    return decorator


def requires_permission(*perms):
    """
    requires a user to have the specified permissions to access this endpoint
    :param perms: the permissions that the user has to have
    :return:
    """
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
