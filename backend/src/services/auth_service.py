from typing import Optional, Tuple
from sqlalchemy.orm import Session
from src.auth import auth_provider


class AuthService:
    """Service for authentication operations."""

    @staticmethod
    def login_parent(
        db: Session,
        username: str,
        password: str
    ) -> Optional[Tuple[str, dict]]:
        """
        Authenticate a parent user.

        Args:
            db: Database session
            username: Parent username
            password: Parent password

        Returns:
            Tuple of (token, user_data) if successful, None otherwise
        """
        return auth_provider.authenticate(db, username, password, user_type="parent")

    @staticmethod
    def login_child(
        db: Session,
        username: str,
        password: str
    ) -> Optional[Tuple[str, dict]]:
        """
        Authenticate a child user.

        Args:
            db: Database session
            username: Child username
            password: Child password

        Returns:
            Tuple of (token, user_data) if successful, None otherwise
        """
        return auth_provider.authenticate(db, username, password, user_type="child")
