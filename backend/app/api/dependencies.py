from typing import Optional
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_token, hash_ip_address
from app.models.user import User, UserRole

security_bearer = HTTPBearer(auto_error=False)


def get_client_ip_hash(request: Request) -> str:
    """Extracts client IP safely and returns a hashed identifier for audit purposes."""
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        ip = forwarded_for.split(",")[0].strip()
    elif request.client and request.client.host:
        ip = request.client.host
    else:
        ip = "127.0.0.1"
    return hash_ip_address(ip)


def get_optional_user(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """Retrieves authenticated user if valid token exists, otherwise returns None."""
    if not auth or not auth.credentials:
        return None
    try:
        payload = decode_token(auth.credentials)
        user_id = int(payload.get("sub"))
        user = db.query(User).filter(User.id == user_id, User.is_active.is_(True)).first()
        return user
    except Exception:
        return None


def get_current_user(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
    db: Session = Depends(get_db),
) -> User:
    """Strictly requires an authenticated active user."""
    if not auth or not auth.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is required.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        payload = decode_token(auth.credentials)
        user_id = int(payload.get("sub"))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has expired or credentials could not be validated.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account no longer exists.",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated.",
        )
    return user


def require_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    """Requires the authenticated user to hold the ADMIN role."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator access required.",
        )
    return current_user


def require_manager_or_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    """Requires the authenticated user to hold either ADMIN or ELECTION_MANAGER role."""
    if current_user.role not in [UserRole.ADMIN, UserRole.ELECTION_MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Election manager or administrator access required.",
        )
    return current_user
