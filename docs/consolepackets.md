# Console Websocket Packets

# StateChangePacket

Sent by the server when something on the minecraft server changed (e.g. onlineStatus)

```json
{
    "packetType": "StateChangePacket",
    "update": {
        "server": {
            "onlineStatus": 2
        }
    }
}
```

## ConsoleMessagePacket

Sent when a console message is put out by the minecraft server

```json
{
    "packetType": "ConsoleMessagePacket",
    "data": {
        "message": "Message",
    }
}
```

## ConsoleConnectedPacket

Sent when the client successfully connects to the ws endpoint

```json
{
    "packetType": "ConsoleConnectedPacket"
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

## AddonUpdatePacket

sent when an addon gets added or removed to this server

```json
{
    "packetType": "AddonUpdatePacket",
    "type": "<add|remove>",
    "data": {
        "addon_": "data"
    }
}
```

## PermissionErrorPacket

Sent when something is requested via websocket and the user is not permitted to do that.  
Currently only used for expired sessions.

```json
{
    "packetType": "PermissionErrorPacket",
    "data": {
        "error": "short error type",
        "description": "error description"
    }
}
```

## ServerDeletionPacket

Sent on server deletion

```json
{
    "packetType": "ServerDeletionPacket",
    "data": {
        "id": "server id"
    }
}
```