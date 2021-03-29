import hashlib
import secrets
import time
from typing import Optional, Tuple
from mcweb.io.config import Config


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

    async def fetch_by_name(self, name):
        """
        fetches this user from the database by its name
        :param name: the username to search for
        :return: User if user was found, None if not
        """
        user = await self.db["user"].find_one({"name": name})
        if user:
            self.id = user["_id"]
            self.name = user["name"]
            self.password = user["password"]
            self.perms = user["permissions"]
            return self
        else:
            return None

    async def fetch_by_id(self, i):
        """
        fetches this user from the database by its user id
        :param i: the user id to search for
        :return: User if user was found, None if not
        """
        user = await self.db["user"].find_one({"_id": i})
        if user:
            self.id = user["_id"]
            self.name = user["name"]
            self.password = user["password"]
            self.perms = user["permissions"]
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
        await self.db["session"].insert_one({"sid": sess_id, "userId": self.id, "expiration": expires})
        return sess_id

    async def fetch_by_sid(self, sid):
        """
        fetches this user by a session id assigned to this user
        :param sid: the session if to search for
        :return: User if user was found, None if not
        """
        session = Session(self.db)
        session = await session.fetch_by_sid(sid)
        return await self.fetch_by_id(session.user_id)

    async def fetch_by_ticket(self, ticket):
        ticket = await self.db["wsticket"].find_one({"ticket": ticket})
        if not ticket:
            return None
        user = await self.db["user"].find_one({"_id": ticket["userId"]})
        return user

    def __repr__(self):
        return f"User[name={self.name}]"


class Session:
    """
    represents a users session
    """
    def __init__(self, db):
        self.db = db
        self.sid = ""
        self.user_id = 0
        self.expiration = 0

    async def fetch_by_sid(self, sid):
        """
        fetches this session by a session id
        :param sid: the session id to search for
        :return: Session if session was found, None if not
        """
        s = await self.db["session"].find_one({"sid": sid})
        if s:
            self.sid = s["sid"]
            self.user_id = s["userId"]
            self.expiration = s["expiration"]
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
        await self.db["session"].delete_one({"sid": self.sid})

    def __repr__(self):
        return f"Session[id={self.sid}]"
