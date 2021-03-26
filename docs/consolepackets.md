# Console Websocket Packets

# StateChangePacket

Sent by the server when something on the minecraft server changed (e.g. onlineStatus)

```json
{
    "packetType": "StateChangePacket",
    "update": {
        "server": {
            "serverId": "123456",
            "onlineStatus": 2
        }
    }
}
```

## ServerConsoleMessagePacket

Sent when a console message is put out by the minecraft server

```json
{
    "packetType": "ServerConsoleMessagePacket",
    "data": {
        "message": "Message",
        "serverId": "123456"
    }
}
```

## ConsoleConnectedPacket

Sent when the client successfully connects to the ws endpoint

```json
{
    "packetType": "ConsoleConnectedPacket",
    "data": {}
}
```

## ConsoleInfoPacket

Sent for meta information for developers

```json
{
    "packetType": "ConsoleInfoPacket",
    "data": {
        "message": "Please use this websocket only to retreive server changed and don't send messages"
    }
}
```

## ServerCreationPacket

sent when a server was created on another client

```json
{
    "packetType": "ServerCreationPacket",
    "data": {
        "server": {
            "the new": "server object"
        }
    }
}
```

## AddonAddPacket

sent when an addon gets added to this server

```json
{
    "packetType": "AddonUpdatePacket",
    "type": "add",
    "data": {
        "addon_": "data"
    }
}
```