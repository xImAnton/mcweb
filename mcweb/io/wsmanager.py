from websockets.exceptions import ConnectionClosedOK, ConnectionClosedError
import asyncio


class WebsocketConnectionManager:
    """
    class for managing all websocket connections to a MinecraftServer
    """
    def __init__(self):
        self.connections = []

    async def connected(self, ws):
        """
        registers a websocket to the manager
        :param ws: the websocket to register
        """
        self.connections.append(ws)

    async def disconnected(self, ws):
        """
        unregisters a websocket connection to the server
        :param ws: the websocket to unregister
        """
        self.connections.remove(ws)

    async def broadcast(self, msg, except_=None):
        """
        broadcasts a message to all connections
        :param msg: the msg to broadcast
        :param except_: a websocket the packet shouldn't be sent to
        """
        for ws in self.connections:
            if ws == except_:
                continue
            try:
                await ws.send(msg)
            except (ConnectionClosedOK, ConnectionClosedError):
                await self.disconnected(ws)

    def broadcast_sync(self, msg, except_=None):
        """
        sync call for coroutine broadcast
        """
        asyncio.run(self.broadcast(msg, except_))

    async def disconnect_all(self):
        for conn in self.connections:
            await conn.close()
