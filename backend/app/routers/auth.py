"""Authentication router for registration, login, refresh, logout, and current user info."""

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


def _set_refresh_cookie(response: Response, refresh_token: str) -> None:
    """Set the HTTP-only refresh token cookie with configured security flags."""
    max_age_seconds = settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        max_age=max_age_seconds,
        httponly=True,
        samesite="lax",
        secure=settings.COOKIE_SECURE,
        path="/api/auth",
    )


def _clear_refresh_cookie(response: Response) -> None:
    """Clear the refresh token cookie by setting an expired cookie."""
    response.delete_cookie(
        key="refresh_token",
        path="/api/auth",
        httponly=True,
        samesite="lax",
        secure=settings.COOKIE_SECURE,
    )


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(
    data: RegisterRequest,
    response: Response,
    db: Session = Depends(get_db),
) -> TokenResponse:
    """Register a new company and owner, log them in, and set the refresh cookie."""
    token_response, refresh_token = auth_service.register_company_owner(db, data)
    _set_refresh_cookie(response, refresh_token)
    return token_response


@router.post("/login", response_model=TokenResponse)
def login(
    data: LoginRequest,
    response: Response,
    db: Session = Depends(get_db),
) -> TokenResponse:
    """Log in with email and password, returning an access token and setting a refresh cookie."""
    token_response, refresh_token = auth_service.authenticate_user(db, data.email, data.password)
    _set_refresh_cookie(response, refresh_token)
    return token_response


@router.post("/refresh", response_model=TokenResponse)
def refresh(
    refresh_token: str | None = Cookie(default=None),
    db: Session = Depends(get_db),
) -> TokenResponse:
    """Exchange the HTTP-only refresh cookie for a fresh access token."""
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token missing",
        )
    return auth_service.refresh_access_token(db, refresh_token)


@router.post("/logout")
def logout(response: Response) -> dict[str, str]:
    """Log out by clearing the refresh cookie."""
    _clear_refresh_cookie(response)
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
def get_me(
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    """Fetch the profile of the currently logged in user."""
    return UserResponse.model_validate(current_user)
