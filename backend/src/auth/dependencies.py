from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from src.config.database import get_db
from src.auth.jwt_utils import verify_token
from src.models.parent_admin import ParentAdmin
from src.models.child import Child

# HTTP Bearer token scheme
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> dict:
    """
    Dependency to get the current authenticated user from JWT token.

    Returns:
        Dictionary containing user information from the token
    """
    token = credentials.credentials
    payload = verify_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return payload


async def get_current_parent(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> ParentAdmin:
    """
    Dependency to get the current authenticated parent user.

    Returns:
        ParentAdmin model instance
    """
    if current_user.get("user_type") != "parent":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized as parent"
        )

    parent = db.query(ParentAdmin).filter(ParentAdmin.id == current_user["sub"]).first()

    if not parent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parent not found"
        )

    return parent


async def get_current_child(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Child:
    """
    Dependency to get the current authenticated child user.

    Returns:
        Child model instance
    """
    if current_user.get("user_type") != "child":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized as child"
        )

    child = db.query(Child).filter(Child.id == current_user["sub"]).first()

    if not child:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Child not found"
        )

    return child


async def get_current_user_flexible(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Dependency to get the current authenticated user (parent or child).

    Returns:
        Either ParentAdmin or Child model instance
    """
    user_type = current_user.get("user_type")
    user_id = current_user.get("sub")

    if user_type == "parent":
        user = db.query(ParentAdmin).filter(ParentAdmin.id == user_id).first()
    elif user_type == "child":
        user = db.query(Child).filter(Child.id == user_id).first()
    else:
        user = None

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return user
