from __future__ import annotations
import hashlib
import secrets
import time
from typing import Optional, Tuple

from .config import Config


class User:
    """
    class for representing a single registered user
    """
    def __init__(self, db):
        self.db = db
        self.id = 0
        self.name = ""
        self.password = ""
        self.perms = ""

    async def fetch_by_name(self, name) -> Optional[User]:
        """
        fetches this user from the database by its name
        :param name: the username to search for
        :return: User if user was found, None if not
        """
        user = await self.db.fetch_one(f"SELECT * FROM users WHERE name='{name}';")
        if user:
            self.id = user[0]
            self.name = user[1]
            self.password = user[2]
            self.perms = user[3]
            return self
        else:
            return None

    async def fetch_by_id(self, i) -> Optional[User]:
        """
        fetches this user from the database by its user id
        :param i: the user id to search for
        :return: User if user was found, None if not
        """
        user = await self.db.fetch_one(f"SELECT * FROM users WHERE id={i};")
        if user:
            self.id = user[0]
            self.name = user[1]
            self.password = user[2]
            self.perms = user[3]
            return self
        else:
            return None

    async def check_password(self, pw) -> bool:
        """
        compares the specified password with the password in the database
        :param pw: the password to check
        :return: True if password was correct, False if not
        """
        return hashlib.sha256(pw.encode()).hexdigest() == self.password

    async def login(self) -> Tuple[str, str, int]:
        """
        creates a new session for the user
        :return: Tuple of the new session id, the new session key and session expiration timestamp
        """
        sess_id = secrets.token_urlsafe(32)
        expires = int(time.time() + Config.SESSION_EXPIRATION)
        await self.db.execute(f"INSERT INTO sessions VALUES (\"{sess_id}\", {self.id}, {expires});")
        return sess_id

    async def fetch_by_sid(self, sid) -> Optional[User]:
        """
        fetches this user by a session id assigned to this user
        :param sid: the session if to search for
        :return: User if user was found, None if not
        """
        session = Session(self.db)
        session = await session.fetch_by_sid(sid)
        return await self.fetch_by_id(session.user_id)

    async def fetch_by_ticket(self, ticket):
        user_id = await self.db.fetch_one(f"SELECT * FROM ws_tickets WHERE id=\"{ticket}\";")
        if not user_id:
            return None
        user = await self.db.fetch_one(f"SELECT * FROM users WHERE id={user_id[1]};")
        return user


class Session:
    """
    represents a users session
    """
    def __init__(self, db):
        self.db = db
        self.sid = ""
        self.user_id = 0
        self.expiration = 0

    async def fetch_by_sid(self, sid) -> Optional[Session]:
        """
        fetches this session by a session id
        :param sid: the session id to search for
        :return: Session if session was found, None if not
        """
        s = await self.db.fetch_one(f"SELECT * FROM sessions WHERE id=\"{sid}\";")
        if s:
            self.sid = s[0]
            self.user_id = s[1]
            self.expiration = s[2]
            return self
        return None

    async def fetch_user(self) -> Optional[User]:
        """
        fetches the user for this session
        :return: the user if it was found else None
        """
        user = User(self.db)
        return await user.fetch_by_sid(self.sid)

    async def logout(self) -> None:
        """
        deletes this session
        """
        await self.db.execute(f"DELETE FROM sessions WHERE id=\"{self.sid}\";")
