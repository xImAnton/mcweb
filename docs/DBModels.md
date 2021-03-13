# MongoDB Collections

## server

Represents a minecraft server

``````json
{
    "name": "myserver",                  -- Name of the Server
    "displayName": "My Server",          -- name to display in the interface
    "allocatedRAM": 2,                   -- java -Xmx2G
    "dataDir": "/var/servers/myserver",  -- working dir of serve
    "jarFile": "server.jar",             -- jarfile to start
    "onlineStatus": 2,                   -- 0 = Offline, 1 = Starting, 2 = Online, 3 = Stopping
    "software": {
    	"server": "paper",
    	"version": "1.16.4"
	}
}
``````

## user

```json
{
    "name": "xImAnton_",                 -- name of the user
    "password": "...",                   -- password hash
    "permissions": {
    	"global": [
    		"global.server.create",
    		"global.server.delete",
   			"global.user.create",
    		"global.user.delete",
    		"global.user.modify"
    	],
		"server.myserver": [
            "server.myserver.start",
            "server.myserver.stop",
            "server.myserver.console",
            "server.myserver.command.kick"
            "server.myserver.command.*"
        ]
}
}
```

