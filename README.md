# MCWeb - a minecraft web interface

MCWeb is a web-remote minecraft server wrapper for controlling your minecraft server  

**Currently in development**, doesn't do much for now

## Todo

* encapsulate mc server code to server.py
* special endpoint for each server with id in path (eg. /server/1/console)
* design webinterface
* transmit json objects and not plain text with ws
* server.properties api
* let various mc servers run at once
* server database table
* api to create servers
* backups
* world management
* implement curseforge api for modpack downloading
* (spigotmc + dev.bukkit for plugin installation)
* (bungeecord/ waterfall mode)
  * send players between servers
  * bungeecord config api
* cache console output to send on client reload
* online player api to kick/ban/op a player
* web ftp in client
