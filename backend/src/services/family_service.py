import uuid
import random
import string
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from src.models.family import Family
from src.models.parent_admin import ParentAdmin, ParentRole
from src.auth import auth_provider


class FamilyService:
    """Service for family-related operations."""

    @staticmethod
    def generate_family_code(length: int = 8) -> str:
        """Generate a unique family code."""
        return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

    @staticmethod
    def create_family(
        db: Session,
        family_name: str,
        parent_username: str,
        parent_name: str,
        parent_password: str
    ) -> tuple[Family, ParentAdmin]:
        """
        Create a new family with the owner parent admin.

        Args:
            db: Database session
            family_name: Name of the family
            parent_username: Username for the parent
            parent_name: Full name of the parent
            parent_password: Password for the parent

        Returns:
            Tuple of (Family, ParentAdmin)

        Raises:
            ValueError: If username already exists or family code collision
        """
        # Generate unique family code
        max_retries = 10
        family_code = None

        for _ in range(max_retries):
            code = FamilyService.generate_family_code()
            existing = db.query(Family).filter(Family.family_code == code).first()
            if not existing:
                family_code = code
                break

        if not family_code:
            raise ValueError("Could not generate unique family code")

        # Check if username is already taken
        existing_parent = db.query(ParentAdmin).filter(ParentAdmin.username == parent_username).first()
        if existing_parent:
            raise ValueError(f"Username '{parent_username}' is already taken")

        # Create family
        family = Family(
            id=str(uuid.uuid4()),
            family_code=family_code,
            name=family_name
        )

        # Create owner parent admin
        hashed_password = auth_provider.hash_password(parent_password)
        parent = ParentAdmin(
            id=str(uuid.uuid4()),
            family_id=family.id,
            username=parent_username,
            name=parent_name,
            password_hash=hashed_password,
            role=ParentRole.OWNER
        )

        try:
            db.add(family)
            db.add(parent)
            db.commit()
            db.refresh(family)
            db.refresh(parent)
            return family, parent
        except IntegrityError as e:
            db.rollback()
            raise ValueError(f"Database error: {str(e)}")

    @staticmethod
    def get_family_by_code(db: Session, family_code: str) -> Optional[Family]:
        """Get a family by its code."""
        return db.query(Family).filter(Family.family_code == family_code).first()

    @staticmethod
    def get_family_by_id(db: Session, family_id: str) -> Optional[Family]:
        """Get a family by its ID."""
        return db.query(Family).filter(Family.id == family_id).first()
