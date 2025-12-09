from abc import ABC, abstractmethod
from typing import Optional, Tuple
from sqlalchemy.orm import Session


class AuthProvider(ABC):
    """Abstract base class for authentication providers."""

    @abstractmethod
    def authenticate(self, db: Session, identifier: str, password: str) -> Optional[Tuple[str, dict]]:
        """
        Authenticate a user and return a token with user data.

        Args:
            db: Database session
            identifier: User identifier (e.g., username)
            password: User password

        Returns:
            Tuple of (token, user_data) if successful, None otherwise
        """
        pass

    @abstractmethod
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """
        Verify a password against its hash.

        Args:
            plain_password: Plain text password
            hashed_password: Hashed password

        Returns:
            True if password matches, False otherwise
        """
        pass

    @abstractmethod
    def hash_password(self, password: str) -> str:
        """
        Hash a password.

        Args:
            password: Plain text password

        Returns:
            Hashed password
        """
        pass
