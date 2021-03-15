# MCWeb - a minecraft server web interface

MCWeb is a web-remote minecraft server wrapper for controlling your minecraft server  

**Currently in development!**, not safe to use

## Preview
UI gets better sometime
![Screenshot of Webinterface](/docs/webinterface.png)

## Todo
* implement more server types (forge, vanilla)
* let get all servers endpoint only return server ids and display names, fetch server on server change

## Todo Server
* add global ws broadcast for e.g. server creation
* use regex to validate api input, filter code injections
* add {supports: {mods: true, plugins: false}} attribute to server for mod/ plugin adding on client

## Todo Client
* design ui components

## Coming Features
* backups
* world management
* implement curseforge api for modpack downloading
* (spigotmc + dev.bukkit for plugin installation)
* online player api to kick/ban/op a player
* (web ftp in client)
* dynamic server management
* server.properties api
