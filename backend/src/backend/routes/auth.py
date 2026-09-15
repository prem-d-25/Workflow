from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from backend.core.dependencies import get_current_user
from backend.db.session import get_db
from backend.models import User
from backend.schemas.auth import (
    ChangePasswordRequest,
    CompanyRegisterRequest,
    LoginRequest,
    MeResponse,
    RefreshTokenRequest,
    TokenResponse,
)
from backend.schemas.company import CompanyResponse
from backend.schemas.user import UserResponse
from backend.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])

REFRESH_COOKIE_NAME = "refresh_token"
REFRESH_COOKIE_MAX_AGE = 7 * 24 * 3600  # 7 days


def set_refresh_cookie(response: Response, refresh_token: str) -> None:
    """Set secure HttpOnly cookie for refresh token so JavaScript cannot access it."""
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=refresh_token,
        httponly=True,
        samesite="lax",
        secure=False,  # Set to True when SSL/TLS is enabled in production
        path="/api/v1/auth",
        max_age=REFRESH_COOKIE_MAX_AGE,
    )


def clear_refresh_cookie(response: Response) -> None:
    """Delete HttpOnly refresh token cookie on logout."""
    response.delete_cookie(
        key=REFRESH_COOKIE_NAME,
        path="/api/v1/auth",
    )


@router.post(
    "/register-company",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new company and owner account",
)
async def register_company(
    data: CompanyRegisterRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """
    Onboards a new company tenant with an initial OWNER account and default leave quotas.
    Sets the refresh token in an HttpOnly cookie and returns access token in body.
    """
    token_response = await AuthService.register_company_with_owner(db, data)
    set_refresh_cookie(response, token_response.refresh_token)
    return token_response


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Authenticate with email and password",
)
async def login(
    data: LoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """
    Validates user credentials, checks active status, sets HttpOnly refresh cookie,
    and returns access token with force_password_reset flag.
    """
    token_response = await AuthService.authenticate_user(db, data)
    set_refresh_cookie(response, token_response.refresh_token)
    return token_response


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Refresh access token using HttpOnly cookie or request payload",
)
async def refresh_token(
    request: Request,
    response: Response,
    data: Optional[RefreshTokenRequest] = None,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """
    Issues a new access token and rotates the HttpOnly refresh token cookie.
    Automatically reads the refresh_token from the browser's HttpOnly cookie,
    with fallback to JSON body for non-browser clients.
    """
    token_str = request.cookies.get(REFRESH_COOKIE_NAME)
    if not token_str and data:
        token_str = data.refresh_token

    if not token_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token required in HttpOnly cookie or request body",
        )

    token_response = await AuthService.refresh_access_token(db, token_str)
    set_refresh_cookie(response, token_response.refresh_token)
    return token_response


@router.post(
    "/logout",
    status_code=status.HTTP_200_OK,
    summary="Log out user and clear HttpOnly refresh cookie",
)
async def logout(response: Response) -> dict:
    """
    Clears the HttpOnly refresh cookie on the client browser.
    """
    clear_refresh_cookie(response)
    return {"message": "Logged out successfully. HttpOnly session cookie cleared."}



@router.post(
    "/change-password",
    status_code=status.HTTP_200_OK,
    summary="Change account password (clears force_password_reset flag)",
)
async def change_password(
    data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """
    Allows an authenticated user to change their password.
    Clears the `force_password_reset` flag upon successful update.
    """
    await AuthService.change_user_password(db, current_user, data)
    return {"message": "Password changed successfully. You may now access all features."}


@router.get(
    "/me",
    response_model=MeResponse,
    summary="Get current authenticated user profile and company info",
)
async def get_me(
    current_user: User = Depends(get_current_user),
) -> MeResponse:
    """
    Returns the profile of the currently logged-in user and their company tenant.
    """
    return MeResponse(
        user=UserResponse.model_validate(current_user),
        company=CompanyResponse.model_validate(current_user.company),
    )
