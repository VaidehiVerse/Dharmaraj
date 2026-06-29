"""Auth utilities + router for Dharmaraj Ayurveda.

Email/password JWT auth following the project integration playbook.
Tokens are issued via httpOnly cookies; the Authorization: Bearer header
is supported as fallback (for non-browser clients / admin tools).
"""
from __future__ import annotations

import os
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
import jwt
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from pydantic import BaseModel, EmailStr, Field

JWT_ALGORITHM = "HS256"
ACCESS_TTL_MINUTES = 60 * 24
REFRESH_TTL_DAYS = 14
COOKIE_NAME_ACCESS = "access_token"
COOKIE_NAME_REFRESH = "refresh_token"


def _now() -> datetime:
    return datetime.now(timezone.utc)


def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except ValueError:
        return False


def _secret() -> str:
    return os.environ.get("JWT_SECRET", "super_secret_key_change_me_in_production")


def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "type": "access",
        "exp": _now() + timedelta(minutes=ACCESS_TTL_MINUTES),
    }
    return jwt.encode(payload, _secret(), algorithm=JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "type": "refresh",
        "exp": _now() + timedelta(days=REFRESH_TTL_DAYS),
    }
    return jwt.encode(payload, _secret(), algorithm=JWT_ALGORITHM)


def _is_local_dev() -> bool:
    url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
    return "localhost" in url or "127.0.0.1" in url


def _set_cookies(response: Response, access: str, refresh: str) -> None:
    secure = not _is_local_dev()
    samesite = "lax" if _is_local_dev() else "none"
    response.set_cookie(
        COOKIE_NAME_ACCESS, access, httponly=True, secure=secure, samesite=samesite,
        max_age=ACCESS_TTL_MINUTES * 60, path="/",
    )
    response.set_cookie(
        COOKIE_NAME_REFRESH, refresh, httponly=True, secure=secure, samesite=samesite,
        max_age=REFRESH_TTL_DAYS * 86400, path="/",
    )


def _clear_cookies(response: Response) -> None:
    response.delete_cookie(COOKIE_NAME_ACCESS, path="/")
    response.delete_cookie(COOKIE_NAME_REFRESH, path="/")


def _extract_token(request: Request) -> Optional[str]:
    token = request.cookies.get(COOKIE_NAME_ACCESS)
    if token:
        return token
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        return auth[7:]
    return None


# ---------- Models ----------
class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    name: str = Field(min_length=1, max_length=80)
    mobile: Optional[str] = None


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: str
    mobile: Optional[str] = None
    created_at: str


class AuthResponse(UserOut):
    access_token: str


class ForgotIn(BaseModel):
    email: EmailStr


class ResetIn(BaseModel):
    token: str
    password: str = Field(min_length=6, max_length=128)


# ---------- Dependency injection ----------
def get_auth_dependencies(db):
    """Returns (router, get_current_user, get_optional_user, require_admin, seed_admin_fn)."""

    async def get_current_user(request: Request) -> dict:
        token = _extract_token(request)
        if not token:
            raise HTTPException(401, "Not authenticated")
        try:
            payload = jwt.decode(token, _secret(), algorithms=[JWT_ALGORITHM])
            if payload.get("type") != "access":
                raise HTTPException(401, "Invalid token type")
            user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
            if not user:
                raise HTTPException(401, "User not found")
            return user
        except jwt.ExpiredSignatureError:
            raise HTTPException(401, "Token expired")
        except jwt.InvalidTokenError:
            raise HTTPException(401, "Invalid token")

    async def get_optional_user(request: Request) -> Optional[dict]:
        try:
            return await get_current_user(request)
        except HTTPException:
            return None

    async def require_admin(user: dict = Depends(get_current_user)) -> dict:
        if user.get("role") != "admin":
            raise HTTPException(403, "Admin access required")
        return user

    router = APIRouter(prefix="/auth")

    @router.post("/register", response_model=AuthResponse)
    async def register(payload: RegisterIn, response: Response):
        email = payload.email.lower().strip()
        exists = await db.users.find_one({"email": email})
        if exists:
            raise HTTPException(400, "Email already registered")
        import uuid
        user_doc = {
            "id": str(uuid.uuid4()),
            "email": email,
            "name": payload.name.strip(),
            "mobile": payload.mobile,
            "role": "customer",
            "password_hash": hash_password(payload.password),
            "wishlist": [],
            "created_at": _now().isoformat(),
        }
        await db.users.insert_one(user_doc)
        access = create_access_token(user_doc["id"], email, "customer")
        refresh = create_refresh_token(user_doc["id"])
        _set_cookies(response, access, refresh)
        user_doc.pop("password_hash", None)
        user_doc.pop("_id", None)
        return AuthResponse(**user_doc, access_token=access)

    @router.post("/login", response_model=AuthResponse)
    async def login(payload: LoginIn, request: Request, response: Response):
        email = payload.email.lower().strip()
        ip = request.client.host if request.client else "unknown"
        identifier = f"{ip}:{email}"

        attempts = await db.login_attempts.find_one({"identifier": identifier})
        if attempts and attempts.get("count", 0) >= 5:
            locked_until = attempts.get("locked_until")
            if locked_until and datetime.fromisoformat(locked_until) > _now():
                raise HTTPException(429, "Too many failed attempts. Try again in 15 minutes.")

        user = await db.users.find_one({"email": email})
        if not user or not verify_password(payload.password, user["password_hash"]):
            await db.login_attempts.update_one(
                {"identifier": identifier},
                {"$inc": {"count": 1}, "$set": {"locked_until": (_now() + timedelta(minutes=15)).isoformat()}},
                upsert=True,
            )
            raise HTTPException(401, "Invalid email or password")

        await db.login_attempts.delete_one({"identifier": identifier})
        access = create_access_token(user["id"], email, user.get("role", "customer"))
        refresh = create_refresh_token(user["id"])
        _set_cookies(response, access, refresh)
        user.pop("password_hash", None)
        user.pop("_id", None)
        return AuthResponse(**user, access_token=access)

    @router.post("/logout")
    async def logout(response: Response):
        _clear_cookies(response)
        return {"ok": True}

    @router.get("/me", response_model=UserOut)
    async def me(user: dict = Depends(get_current_user)):
        return UserOut(**user)

    @router.post("/refresh")
    async def refresh(request: Request, response: Response):
        token = request.cookies.get(COOKIE_NAME_REFRESH)
        if not token:
            raise HTTPException(401, "No refresh token")
        try:
            payload = jwt.decode(token, _secret(), algorithms=[JWT_ALGORITHM])
            if payload.get("type") != "refresh":
                raise HTTPException(401, "Invalid token type")
            user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0})
            if not user:
                raise HTTPException(401, "User not found")
            access = create_access_token(user["id"], user["email"], user.get("role", "customer"))
            new_refresh = create_refresh_token(user["id"])
            _set_cookies(response, access, new_refresh)
            return {"ok": True}
        except jwt.PyJWTError as exc:
            raise HTTPException(401, f"Invalid refresh token: {exc}")

    @router.post("/forgot-password")
    async def forgot(payload: ForgotIn):
        email = payload.email.lower().strip()
        user = await db.users.find_one({"email": email})
        if user:
            token = secrets.token_urlsafe(32)
            await db.password_reset_tokens.insert_one({
                "token": token,
                "user_id": user["id"],
                "expires_at": _now() + timedelta(hours=1),
                "used": False,
                "created_at": _now().isoformat(),
            })
            import logging
            logging.getLogger(__name__).info(f"[PASSWORD RESET] {email}: token={token}")
        return {"ok": True, "message": "If that email exists, a reset link has been sent."}

    @router.post("/reset-password")
    async def reset(payload: ResetIn):
        doc = await db.password_reset_tokens.find_one({"token": payload.token})
        if not doc or doc.get("used") or doc["expires_at"] < _now():
            raise HTTPException(400, "Invalid or expired token")
        await db.users.update_one(
            {"id": doc["user_id"]},
            {"$set": {"password_hash": hash_password(payload.password)}},
        )
        await db.password_reset_tokens.update_one({"_id": doc["_id"]}, {"$set": {"used": True}})
        return {"ok": True, "message": "Password reset successful."}

    async def seed_admin() -> None:
        email = os.environ.get("ADMIN_EMAIL", "admin@dharmarajayurveda.in").lower()
        password = os.environ.get("ADMIN_PASSWORD", "Dharmaraj@2026")
        existing = await db.users.find_one({"email": email})
        import uuid
        if existing is None:
            await db.users.insert_one({
                "id": str(uuid.uuid4()),
                "email": email,
                "name": "Dharmaraj Admin",
                "mobile": None,
                "role": "admin",
                "password_hash": hash_password(password),
                "wishlist": [],
                "created_at": _now().isoformat(),
            })
        elif not verify_password(password, existing["password_hash"]):
            await db.users.update_one(
                {"email": email},
                {"$set": {"password_hash": hash_password(password), "role": "admin"}},
            )

    return router, get_current_user, get_optional_user, require_admin, seed_admin