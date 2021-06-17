import secrets
import time
from typing import Optional

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

from .io.config import Config


class User:
    __slots__ = "db", "id", "name", "password", "perms", "salt", "last_server"

    """
    class for representing a single registered user
    """
    def __init__(self, db):
        self.db = db
        self.id = None
        self.name = ""
        self.password = ""
        self.perms = ""
        self.salt = b""
        self.last_server = None

    async def fetch_by_name(self, name):
        """
        fetches this user from the database by its name
        :param name: the username to search for
        :return: User if user was found, None if not
        """
        user = await self.db["user"].find_one({"name": name})
        if user:
            await self._populate(user)
            return self
        else:
            return None

    async def _populate(self, user):
        self.id = user["_id"]
        self.name = user["name"]
        self.password = user["password"]
        self.perms = user["permissions"]
        self.salt = user["salt"].encode()
        self.last_server = user["lastServer"]

    async def fetch_by_id(self, i):
        """
        fetches this user from the database by its user id
        :param i: the user id to search for
        :return: User if user was found, None if not
        """
        user = await self.db["user"].find_one({"_id": i})
        if user:
            await self._populate(user)
            return self
        else:
            return None

    @staticmethod
    def hash_password(hasher: PasswordHasher, pwd: str, salt: bytes, pepper: bytes):
        return hasher.hash(salt + pwd.encode() + pepper)

    async def check_password(self, hasher: PasswordHasher, pwd: str, pepper: bytes) -> bool:
        """
        compares a password to the password of the user
        :param hasher: PasswordHasher of MCWeb instance
        :param pwd: the entered password
        :param pepper: pepper  of the MCWeb instance
        :return: whether the password is correct
        """
        spp = self.salt + pwd.encode() + pepper
        try:
            if hasher.verify(self.password, spp):
                if hasher.check_needs_rehash(self.password):
                    hsh = hasher.hash(spp)
                    await self.db["user"].update_one({"_id": self.id}, {"$set": {"password": hsh}})
                return True
        except VerifyMismatchError:
            return False

    async def get_new_sid(self):
        """
        Method to make sure that the session id is unique
        :return: a unique session id
        """
        sid = secrets.token_urlsafe(32)
        while await self.db["session"].find_one({"sid": sid}):
            sid = secrets.token_urlsafe(32)
        return sid

    async def login(self) -> str:
        """
        creates a new session for the user
        :return: the new session id
        """
        sess_id = await self.get_new_sid()
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
        if user:
            await self._populate(user)
            return self
        return None

    def __repr__(self):
        return f"User[name={self.name}]"

    async def set_last_server(self, s):
        await self.db["user"].update_one({"_id": self.id}, {"$set": {"lastServer": s.id}})


class Session:
    __slots__ = "db", "sid", "user_id", "expiration", "id", "fetched"

    """
    represents a users session
    """
    def __init__(self, db):
        self.db = db
        self.sid = ""
        self.user_id = 0
        self.expiration = 0
        self.id = None
        self.fetched = False

    async def refetch(self):
        assert self.fetched
        await self.fetch_by_sid(self.sid)

    async def fetch_by_sid(self, sid):
        """
        fetches this session by a session id
        :param sid: the session id to search for
        :return: Session if session was found, None if not
        """
        s = await self.db["session"].find_one({"sid": sid})
        if s:
            self.fetched = True
            self.id = s["_id"]
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

    async def is_expired(self):
        return self.expiration < time.time()

    async def refresh(self):
        await self.db["user"].update_one({"_id": self.sid}, {"$set": {"expiration": int(time.time() + Config.SESSION_EXPIRATION)}})

    async def logout(self) -> None:
        """
        deletes this session
        """
        await self.db["session"].delete_one({"sid": self.sid})

    def __repr__(self):
        return f"Session[id={self.sid}]"
