DROP TABLE IF EXISTS servers;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS ws_tickets;
DROP TABLE IF EXISTS users;

CREATE TABLE servers (
    id             INTEGER  PRIMARY KEY,
    name           TEXT,               -- the server name
    allocated_ram  NUMERIC  DEFAULT 2,  -- maximum ram for java process, default 2 GB
    data_dir       TEXT     NOT NULL,   -- the path to the server data directory
    jar_file       TEXT     NOT NULL,   -- start jar file of server
    online_status  INTEGER  DEFAULT 0   -- online status of server: 0 = offline; 1 = starting; 2 = online; 3 = stopping
);

CREATE TABLE users (
    id          INTEGER  PRIMARY KEY,
    name        TEXT     NOT NULL UNIQUE, -- user name
    password    TEXT,                     -- hashed user password
    permissions TEXT                      -- json string
);

CREATE TABLE sessions (
    id         TEXT      PRIMARY KEY UNIQUE, -- session id
	user_id    INTEGER,
	expiration INTEGER,                      -- expiration timestamp

    FOREIGN KEY (user_id) REFERENCES users (id) -- user reference
);

CREATE TABLE ws_tickets (
    id        TEXT   PRIMARY KEY UNIQUE,
    user_id   INTEGER,
    endpoint  TEXT,

    FOREIGN KEY (user_id) REFERENCES users (id)
)