import motor.motor_asyncio
import asyncio


async def main():
    print(await client.mcweb.server.find_one({"name": "asdb"}))


client = motor.motor_asyncio.AsyncIOMotorClient("mongodb://admin:dbfgi345jo%C3%BCsd@localhost:5002/?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&ssl=false")

loop = asyncio.get_event_loop()
loop.run_until_complete(main())
