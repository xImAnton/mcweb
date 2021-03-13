# MongoDB Collections

## server

represents a minecraft server

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

represents a user that is able to login to the webinterface

```json
{
    "name": "xImAnton_",                    -- name of the user
    "password": "...",                      -- password hash
    "permissions": {
    	"global": [
    		"global.server.create",        -- create a server
    		"global.server.delete",        -- delete a server
   			"global.user.create",          -- create a new user
    		"global.user.delete",          -- delete a user
    		"global.user.modify"           -- set/ remove global permissions for a user
    	],
		"server.myserver": [               -- permissions for a single server
            "server.myserver.start",        -- start a server
            "server.myserver.stop",         -- stop a server
            "server.myserver.console",      -- read console
            "server.myserver.command.kick", -- execute a specific console command
            "server.myserver.command.*",    -- execute all console commands
            "server.myserver.command.~op"   -- blacklist a command
            "server.myserver.permissions"   -- manage permissions for users for this server
        ]
	}
}
```

## session

represents a login session of a specific user

```json
{
    "sid": "...",             -- 32 bit session id
    "userId": "1"             -- owner of the session
    "expiration": 1615676934  -- expiration timestamp
}
```

## wsticket

represents a websocket ticket of a user

used for authentication when accessing websocket endpoints

```json
{
	"ticket": "...",              -- 24 bit ticket id
	"userId": 1,                  -- owner of the ticket
    "endpoint": {
   		"type": "server.console", -- type of the ws endpoint
    	"data": {
			"serverId": 1        -- in this case the server id of the console
	}
}
}
```

