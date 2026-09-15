from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional
import bcrypt
import jwt
from backend.core.config import settings


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain-text password against a bcrypt hash."""
    pwd_bytes = plain_password.encode("utf-8")[:72]
    hashed_bytes = hashed_password.encode("utf-8")
    return bcrypt.checkpw(pwd_bytes, hashed_bytes)


def get_password_hash(password: str) -> str:
    """Hash a plain-text password using bcrypt."""
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def generate_default_password(email: str) -> str:
    """
    Generate default auto-generated password:
    First 3 alphanumeric letters of email + '1234' (e.g. joh1234).
    """
    prefix = email.split("@")[0]
    cleaned = "".join(ch for ch in prefix if ch.isalnum()).lower()
    # Fallback padding if email prefix has fewer than 3 alphanumeric characters
    if len(cleaned) < 3:
        cleaned = (cleaned + "emp")[:3]
    return f"{cleaned[:3]}1234"


def create_access_token(
    user_id: int,
    role: str,
    company_id: int,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Create a signed short-lived JWT access token."""
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    payload: Dict[str, Any] = {
        "sub": str(user_id),
        "role": role,
        "company_id": company_id,
        "type": "access",
        "iat": now,
        "exp": expire,
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(
    user_id: int,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Create a signed long-lived JWT refresh token."""
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

    payload: Dict[str, Any] = {
        "sub": str(user_id),
        "type": "refresh",
        "iat": now,
        "exp": expire,
    }
    return jwt.encode(
        payload,
        settings.JWT_REFRESH_SECRET,
        algorithm=settings.JWT_ALGORITHM,
    )


def decode_access_token(token: str) -> Dict[str, Any]:
    """
    Decode and validate a JWT access token.
    Raises jwt.PyJWTError or ValueError if invalid or expired.
    """
    payload = jwt.decode(
        token,
        settings.JWT_SECRET,
        algorithms=[settings.JWT_ALGORITHM],
    )
    if payload.get("type") != "access":
        raise ValueError("Invalid token type: expected access token")
    return payload


def decode_refresh_token(token: str) -> Dict[str, Any]:
    """
    Decode and validate a JWT refresh token.
    Raises jwt.PyJWTError or ValueError if invalid or expired.
    """
    payload = jwt.decode(
        token,
        settings.JWT_REFRESH_SECRET,
        algorithms=[settings.JWT_ALGORITHM],
    )
    if payload.get("type") != "refresh":
        raise ValueError("Invalid token type: expected refresh token")
    return payload
