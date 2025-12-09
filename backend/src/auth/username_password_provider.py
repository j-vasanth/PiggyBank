from typing import Optional, Tuple
from sqlalchemy.orm import Session
import bcrypt
from src.auth.provider import AuthProvider
from src.auth.jwt_utils import create_access_token
from src.models.parent_admin import ParentAdmin
from src.models.child import Child


class UsernamePasswordProvider(AuthProvider):
    """Username/password authentication provider using bcrypt."""

    def __init__(self):
        # Using bcrypt directly instead of passlib to avoid compatibility issues
        pass

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash."""
        return bcrypt.checkpw(
            plain_password.encode('utf-8'),
            hashed_password.encode('utf-8')
        )

    def hash_password(self, password: str) -> str:
        """Hash a password using bcrypt."""
        # Truncate to 72 bytes (bcrypt limit) to avoid errors
        password_bytes = password.encode('utf-8')[:72]
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password_bytes, salt).decode('utf-8')

    def authenticate(self, db: Session, username: str, password: str, user_type: str = "parent") -> Optional[Tuple[str, dict]]:
        """
        Authenticate a user and return JWT token with user data.

        Args:
            db: Database session
            username: Username
            password: Password
            user_type: Type of user ("parent" or "child")

        Returns:
            Tuple of (token, user_data) if successful, None otherwise
        """
        # Determine which model to query based on user type
        if user_type == "parent":
            user = db.query(ParentAdmin).filter(ParentAdmin.username == username).first()
        elif user_type == "child":
            user = db.query(Child).filter(Child.username == username).first()
        else:
            return None

        # Check if user exists and password is correct
        if not user or not self.verify_password(password, user.password_hash):
            return None

        # Create JWT token with user info
        token_data = {
            "sub": user.id,
            "username": user.username,
            "user_type": user_type,
            "family_id": user.family_id,
        }

        token = create_access_token(token_data)

        # Prepare user data to return
        user_data = {
            "id": user.id,
            "username": user.username,
            "name": user.name,
            "family_id": user.family_id,
            "user_type": user_type,
        }

        if user_type == "parent":
            user_data["role"] = user.role.value

        if user_type == "child":
            user_data["balance"] = float(user.balance)
            user_data["avatar"] = user.avatar

        return token, user_data


# Global instance
auth_provider = UsernamePasswordProvider()
