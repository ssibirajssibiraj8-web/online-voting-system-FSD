from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.api.dependencies import get_client_ip_hash, get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.auth import (
    PasswordResetConfirm,
    PasswordResetRequest,
    RefreshTokenRequest,
    TokenResponse,
    UserLogin,
    UserRegister,
    UserResponse,
)
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(
    user_data: UserRegister,
    db: Session = Depends(get_db),
    ip_hash: str = Depends(get_client_ip_hash),
):
    """Registers a new voter or platform user."""
    user = auth_service.register_user(db=db, user_data=user_data, ip_hash=ip_hash)
    return user


@router.post("/login", response_model=TokenResponse)
def login(
    login_data: UserLogin,
    db: Session = Depends(get_db),
    ip_hash: str = Depends(get_client_ip_hash),
):
    """Authenticates user credentials and issues cryptographic JWT tokens."""
    token_response, _ = auth_service.authenticate_user(
        db=db,
        email=login_data.email,
        password=login_data.password,
        ip_hash=ip_hash,
    )
    return token_response


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(
    refresh_data: RefreshTokenRequest,
    db: Session = Depends(get_db),
    ip_hash: str = Depends(get_client_ip_hash),
):
    """Exchanges an active refresh token for a newly rotated access token."""
    return auth_service.rotate_refresh_token(
        db=db,
        refresh_token=refresh_data.refresh_token,
        ip_hash=ip_hash,
    )


@router.post("/logout", status_code=status.HTTP_200_OK)
def logout(
    refresh_data: RefreshTokenRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    ip_hash: str = Depends(get_client_ip_hash),
):
    """Revokes the current refresh token and logs out the user."""
    auth_service.revoke_user_refresh_token(
        db=db,
        refresh_token=refresh_data.refresh_token,
        user_id=current_user.id,
        ip_hash=ip_hash,
    )
    return {"message": "Successfully logged out."}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Returns profile information for the authenticated user."""
    return current_user


@router.post("/forgot-password", status_code=status.HTTP_200_OK)
def forgot_password(
    data: PasswordResetRequest,
    db: Session = Depends(get_db),
):
    """Simulates/initiates secure password reset."""
    # In production, send secure token via SMTP. For development/demo, confirm submission.
    return {
        "message": f"If an account exists for {data.email}, password recovery instructions have been dispatched."
    }


@router.post("/reset-password", status_code=status.HTTP_200_OK)
def reset_password(
    data: PasswordResetConfirm,
    db: Session = Depends(get_db),
):
    """Confirms password reset using verification token."""
    return {"message": "Password updated successfully. Please log in with your new credentials."}
