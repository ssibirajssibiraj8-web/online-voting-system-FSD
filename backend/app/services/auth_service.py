from datetime import datetime, timezone
from typing import Optional, Tuple
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    hash_token,
    verify_password,
)
from app.models.refresh_token import RefreshToken
from app.models.user import User, UserRole
from app.schemas.auth import TokenResponse, UserRegister, UserResponse
from app.services.audit_service import log_action


def register_user(
    db: Session,
    user_data: UserRegister,
    ip_hash: Optional[str] = None,
) -> User:
    """Registers a new user account with hashed password and verification checks."""
    existing_user = db.query(User).filter(User.email == user_data.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists.",
        )

    # First user can be made admin if none exists; otherwise respect requested role or default to VOTER
    user_count = db.query(User).count()
    assigned_role = UserRole.ADMIN if user_count == 0 else (user_data.role or UserRole.VOTER)

    hashed_pw = get_password_hash(user_data.password)
    user = User(
        first_name=user_data.first_name.strip(),
        last_name=user_data.last_name.strip(),
        email=user_data.email.lower().strip(),
        password_hash=hashed_pw,
        role=assigned_role,
        is_active=True,
        is_verified=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    log_action(
        db=db,
        action="USER_CREATED",
        entity_type="USER",
        entity_id=str(user.id),
        user_id=user.id,
        details=f"User {user.email} registered with role {user.role.value}",
        ip_hash=ip_hash,
    )

    return user


def authenticate_user(
    db: Session,
    email: str,
    password: str,
    ip_hash: Optional[str] = None,
) -> Tuple[TokenResponse, User]:
    """Authenticates credentials and returns JWT access and refresh tokens."""
    user = db.query(User).filter(User.email == email.lower().strip()).first()
    if not user or not verify_password(password, user.password_hash):
        log_action(
            db=db,
            action="LOGIN_FAILED",
            entity_type="USER",
            details=f"Failed login attempt for email {email}",
            ip_hash=ip_hash,
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact an administrator.",
        )

    # Update last login timestamp
    user.last_login_at = datetime.now(timezone.utc)
    db.commit()

    # Generate Tokens
    access_token = create_access_token(
        subject=user.id,
        role=user.role.value,
        extra_claims={"email": user.email, "name": user.full_name},
    )
    refresh_token = create_refresh_token(subject=user.id)

    # Store refresh token hash for rotation & revocation tracking
    refresh_hash = hash_token(refresh_token)
    decoded_refresh = decode_token(refresh_token, is_refresh=True)
    exp_dt = datetime.fromtimestamp(decoded_refresh["exp"], tz=timezone.utc)

    db_token = RefreshToken(
        user_id=user.id,
        token_hash=refresh_hash,
        expires_at=exp_dt,
    )
    db.add(db_token)
    db.commit()

    log_action(
        db=db,
        action="LOGIN_SUCCESS",
        entity_type="USER",
        entity_id=str(user.id),
        user_id=user.id,
        details=f"User {user.email} logged in successfully",
        ip_hash=ip_hash,
    )

    token_resp = TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=60 * 60 * 24,
        user=UserResponse.model_validate(user),
    )
    return token_resp, user


def rotate_refresh_token(
    db: Session,
    refresh_token: str,
    ip_hash: Optional[str] = None,
) -> TokenResponse:
    """Rotates refresh token and generates new access token."""
    try:
        payload = decode_token(refresh_token, is_refresh=True)
        user_id = int(payload.get("sub"))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token.",
        )

    token_hash_val = hash_token(refresh_token)
    db_token = (
        db.query(RefreshToken)
        .filter(
            RefreshToken.token_hash == token_hash_val,
            RefreshToken.revoked_at.is_(None),
        )
        .first()
    )

    if not db_token or db_token.expires_at < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token is revoked or expired.",
        )

    # Revoke old refresh token (Token Rotation)
    db_token.revoked_at = datetime.now(timezone.utc)

    user = db.query(User).filter(User.id == user_id, User.is_active.is_(True)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User associated with token no longer exists.",
        )

    # Issue new pair
    new_access_token = create_access_token(
        subject=user.id,
        role=user.role.value,
        extra_claims={"email": user.email, "name": user.full_name},
    )
    new_refresh_token = create_refresh_token(subject=user.id)

    new_hash = hash_token(new_refresh_token)
    new_decoded = decode_token(new_refresh_token, is_refresh=True)
    new_exp = datetime.fromtimestamp(new_decoded["exp"], tz=timezone.utc)

    db_new_token = RefreshToken(
        user_id=user.id,
        token_hash=new_hash,
        expires_at=new_exp,
    )
    db.add(db_new_token)
    db.commit()

    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        expires_in=60 * 60 * 24,
        user=UserResponse.model_validate(user),
    )


def revoke_user_refresh_token(
    db: Session,
    refresh_token: str,
    user_id: int,
    ip_hash: Optional[str] = None,
) -> None:
    """Revokes refresh token on user logout."""
    token_hash_val = hash_token(refresh_token)
    db_token = (
        db.query(RefreshToken)
        .filter(
            RefreshToken.token_hash == token_hash_val,
            RefreshToken.user_id == user_id,
        )
        .first()
    )
    if db_token:
        db_token.revoked_at = datetime.now(timezone.utc)
        db.commit()

    log_action(
        db=db,
        action="LOGOUT",
        entity_type="USER",
        entity_id=str(user_id),
        user_id=user_id,
        details="User logged out and session revoked",
        ip_hash=ip_hash,
    )
