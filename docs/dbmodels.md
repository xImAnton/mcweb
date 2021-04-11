# MongoDB Collections

## server

represents a minecraft server

``````json
{
	"name": "myserver",                  -- Name of the Server (unique)        "^[a-z0-9\-_]*$"
	"displayName": "My Server",          -- name to display in the interface   "^[a-zA-Z0-9_\- ]*$"
	"allocatedRAM": 2,                   -- java -Xmx2G                        int
	"dataDir": "/var/servers/myserver",  -- working dir of server              path
	"jarFile": "server.jar",             -- jarfile to start                   "^.*\.jar$"
	"onlineStatus": 2,                   -- 0 = Offline, 1 = Starting, 2 = Online, 3 = Stopping
	"software": {
		"server": "paper",
		"majorVersion": "1.16.4",
		"minorVersion": "443",
		"minecraftVersion": "1.16.4"
	},
	"port": 25565,
	"addons": [
        {
            "filePath": "/var/servers/myserver/mods/immersiveengineering.jar",
            "name": "Immersive Engineering",
            "id": 231951,
            "fileId": 3141693,
            "imageUrl": "https://media.forgecdn.net/avatars/thumbnails/20/135/256/256/635707329671959611.png"
        }
    ],
	"javaVersion": "default"
}
``````

## user

represents a user that is able to login to the webinterface

```json
{
    "name": "xImAnton_",                    -- name of the user  (unique) "^[a-z0-9_-A-Z]{6,15}$"
    "email": "ximanton@example.com",        -- email for login and first password creation --> users cannot sign up by theirselfes (unique) "/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/"
    "password": "...",                      -- argon2 password hash
    "salt": "...",                          -- random salt, 20 bytes
    "permissions": {
    	"global": [
    		"global.server.create",        -- create a server
    		"global.server.delete",        -- delete a server
   			"global.user.create",          -- create a new user
    		"global.user.delete",          -- delete a user
    		"global.user.modify",          -- set/ remove global permissions for a user
             "global.*"                     -- all global permissions, defaults to admin
    	],
		"server.myserver": [               -- permissions for a single server
            "server.myserver.start",        -- start a server
            "server.myserver.stop",         -- stop a server
            "server.myserver.console",      -- read console
            "server.myserver.command.kick", -- execute a specific console command
            "server.myserver.command.*",    -- execute all console commands
            "~server.myserver.command.op"   -- blacklist a command
            "server.myserver.permissions"   -- manage permissions for users for this server
        ],
        "server.*": [                       -- permissions for all servers, additional overridden by permisions for specific server that are not negated
            "server.*.*",                   -- admin for all servers
            "server.*.command.op"                   -- user can although not use op command for server.myserver because he has negated permission there
        ]                      
	}
}
```

## session

represents a login session of a specific user

```json
{
    "sid": "...",             -- 32 bit session id (unique)
    "userId": 1,             -- owner of the session
    "expiration": 1615676934  -- expiration timestamp
}
```

## wsticket

represents a websocket ticket of a user

used for authentication when accessing websocket endpoints

```json
{
	"ticket": "...",              -- 24 bit ticket id (unique)
	"userId": 1,                  -- owner of the ticket
    "endpoint": {
   		"type": "server.console", -- type of the ws endpoint
    	"data": {
			"serverId": 1        -- in this case the server id of the console
	}
}
}
```

