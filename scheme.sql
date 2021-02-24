CREATE TABLE servers (
    id INTEGER PRIMARY KEY,
    name TEXT, -- the server name
    allocated_ram NUMERIC DEFAULT 2, -- maximum ram for java process, default 2 GB
    data_dir TEXT NOT NULL, -- the path to the server data directory
    jar_file TEXT NOT NULL, -- start jar file of server
    online_status INTEGER  -- online status of server: 0 = offline; 1 = starting; 2 = online; 3 = stopping
);
