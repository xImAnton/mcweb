import time

from websockets.exceptions import ConnectionClosedOK, ConnectionClosedError

from ..io.wspackets import PermissionErrorPacket


class WebsocketConnectionManager:
    """
    class for managing all websocket connections to a MinecraftServer
    """
    def __init__(self):
        self.connections = []

    async def connected(self, ws, ticket, user):
        """
        registers a websocket to the manager
        :param ws: the websocket to register
        """
        self.connections.append(WebSocketConnection(ws, ticket, user))

    async def disconnected(self, ws):
        """
        unregisters a websocket connection to the server
        :param ws: the websocket to unregister
        """
        if isinstance(ws, WebSocketConnection):
            self.connections.remove(ws)
        else:
            for conn in self.connections:
                if conn.ws == ws:
                    self.connections.remove(conn)

    async def broadcast(self, msg):
        """
        broadcasts a message to all connections
        :param msg: the msg to broadcast
        :param except_: a websocket the packet shouldn't be sent to
        """
        for ws in self.connections:
            try:
                await ws.send(msg)
            except (ConnectionClosedOK, ConnectionClosedError):
                await self.disconnected(ws)

    async def send(self, msg):
        return await self.broadcast(msg)

    async def disconnect_all(self):
        for conn in self.connections:
            await conn.close()


class WebSocketConnection:
    def __init__(self, ws, ticket, user):
        self.ws = ws
        self.ticket = ticket
        self.user = user

    async def send(self, msg):
        if self.ticket["expiration"] < time.time():
            await PermissionErrorPacket("Invalid Session", "your session is expired?").send(self.ws)
            await self.ws.close()
            return
        return await self.ws.send(msg)

    async def close(self):
        return await self.ws.close()
