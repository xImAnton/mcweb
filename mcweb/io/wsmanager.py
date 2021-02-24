from websockets.exceptions import ConnectionClosedOK
import asyncio


class WebsocketConnectionManager:
    def __init__(self):
        self.connections = []

    async def connected(self, ws):
        self.connections.append(ws)

    async def disconnected(self, ws):
        self.connections.remove(ws)

    async def broadcast(self, msg, except_=None):
        for ws in self.connections:
            if ws == except_:
                continue
            try:
                await ws.send(msg)
            except ConnectionClosedOK:
                await self.disconnected(ws)

    def broadcast_sync(self, msg, except_=None):
        asyncio.run(self.broadcast(msg, except_))
