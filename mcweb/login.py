import hashlib
import secrets
import time
from .config import Config


class User:
    def __init__(self, db):
        self.db = db
        self.id = 0
        self.name = ""
        self.password = ""
        self.perms = ""

    async def fetch_by_name(self, name):
        user = await self.db.fetch_one(f"SELECT * FROM users WHERE name='{name}'")
        if user:
            self.id = user[0]
            self.name = user[1]
            self.password = user[2]
            self.perms = user[3]
            return self
        else:
            return None

    async def fetch_by_id(self, i):
        user = await self.db.fetch_one(f"SELECT * FROM users WHERE id={i}")
        if user:
            self.id = user[0]
            self.name = user[1]
            self.password = user[2]
            self.perms = user[3]
            return self
        else:
            return None

    async def check_password(self, pw):
        print(hashlib.sha256(pw.encode()).hexdigest())
        print(self.password)
        return hashlib.sha256(pw.encode()).hexdigest() == self.password

    async def login(self):
        sess_id = secrets.token_urlsafe(32)
        sess_key = secrets.token_urlsafe(12)
        expires = int(time.time() + Config.SESSION_EXPIRATION)
        await self.db.execute(f"INSERT INTO sessions VALUES (\"{sess_id}\", {self.id}, {expires}, \"{sess_key}\")")
        return sess_id, sess_key, expires

    async def logout(self):
        await self.db.execute(f"DELETE FROM sessions WHERE user_id={self.id}")

    async def fetch_by_sid(self, sid):
        session = Session(self.db)
        session = await session.fetch_by_sid(sid)
        return await self.fetch_by_id(session.user_id)


class Session:
    def __init__(self, db):
        self.db = db
        self.sid = ""
        self.user_id = 0
        self.expiration = 0
        self.sesskey = ""

    async def fetch_by_sid(self, sid):
        s = await self.db.fetch_one(f"SELECT * FROM sessions WHERE id=\"{sid}\"")
        if s:
            self.sid = s[0]
            self.user_id = s[1]
            self.expiration = s[2]
            self.sesskey = s[3]
            return self
        return None

    async def fetch_user(self):
        return await self.db.fetch_one(f"SELECT * FROM users WHERE id={self.user_id}")
