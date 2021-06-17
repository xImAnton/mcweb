from server.mcweb.mc import DSMServer
import asyncio


loop = asyncio.get_event_loop()
server = DSMServer(("localhost", 25565), loop)
loop.run_until_complete(server.start())
