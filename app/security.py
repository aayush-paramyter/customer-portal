import datetime
import os
import secrets
from typing import Any, Optional

import bcrypt
import jwt
from dotenv import load_dotenv
from fastapi import HTTPException, status

load_dotenv()

SECRET_KEY = os.getenv("PORTAL_JWT_SECRET_KEY") or os.getenv("JWT_SECRET_KEY") or "dev-portal-secret-change-me"
ALGORITHM = "HS256"
ACCESS_EXPIRE_MINUTES = int(os.getenv("PORTAL_ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
REFRESH_EXPIRE_DAYS = int(os.getenv("PORTAL_REFRESH_TOKEN_EXPIRE_DAYS", "30"))
MAGIC_EXPIRE_MINUTES = int(os.getenv("PORTAL_MAGIC_LINK_EXPIRE_MINUTES", "15"))


def hash_password(password: str) -> str:
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(password: str, hashed_password: str | None) -> bool:
    if not hashed_password:
        return False
    try:
        return bcrypt.checkpw(password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False


def create_access_token(subject: str, schema: str, portal_user_id: int) -> str:
    exp = datetime.datetime.now(datetime.UTC) + datetime.timedelta(minutes=ACCESS_EXPIRE_MINUTES)
    payload = {"sub": subject, "schema": schema, "portal_user_id": portal_user_id, "type": "access", "exp": exp}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(subject: str, schema: str, portal_user_id: int) -> str:
    exp = datetime.datetime.now(datetime.UTC) + datetime.timedelta(days=REFRESH_EXPIRE_DAYS)
    payload = {"sub": subject, "schema": schema, "portal_user_id": portal_user_id, "type": "refresh", "exp": exp}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict[str, Any]:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


def generate_magic_token() -> str:
    return secrets.token_urlsafe(32)


def get_magic_expiry() -> datetime.datetime:
    return datetime.datetime.now(datetime.UTC) + datetime.timedelta(minutes=MAGIC_EXPIRE_MINUTES)
