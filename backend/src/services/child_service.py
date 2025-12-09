import uuid
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from src.models.child import Child
from src.auth import auth_provider


class ChildService:
    """Service for child-related operations."""

    @staticmethod
    def create_child(
        db: Session,
        family_id: str,
        username: str,
        name: str,
        password: str,
        avatar: Optional[str] = None,
        age: Optional[int] = None
    ) -> Child:
        """
        Create a new child account.

        Args:
            db: Database session
            family_id: ID of the family
            username: Username for the child
            name: Full name of the child
            password: Password for the child
            avatar: Optional emoji avatar
            age: Optional age

        Returns:
            Created Child instance

        Raises:
            ValueError: If username already exists
        """
        # Check if username is already taken
        existing_child = db.query(Child).filter(Child.username == username).first()
        if existing_child:
            raise ValueError(f"Username '{username}' is already taken")

        # Hash password
        hashed_password = auth_provider.hash_password(password)

        # Create child
        child = Child(
            id=str(uuid.uuid4()),
            family_id=family_id,
            username=username,
            name=name,
            password_hash=hashed_password,
            avatar=avatar,
            age=age,
            balance=0.00
        )

        try:
            db.add(child)
            db.commit()
            db.refresh(child)
            return child
        except IntegrityError as e:
            db.rollback()
            raise ValueError(f"Database error: {str(e)}")

    @staticmethod
    def get_child_by_id(db: Session, child_id: str) -> Optional[Child]:
        """Get a child by ID."""
        return db.query(Child).filter(Child.id == child_id).first()

    @staticmethod
    def get_child_by_username(db: Session, username: str) -> Optional[Child]:
        """Get a child by username."""
        return db.query(Child).filter(Child.username == username).first()

    @staticmethod
    def get_children_by_family(db: Session, family_id: str) -> List[Child]:
        """Get all children in a family."""
        return db.query(Child).filter(Child.family_id == family_id).all()

    @staticmethod
    def update_child(
        db: Session,
        child_id: str,
        name: Optional[str] = None,
        avatar: Optional[str] = None,
        age: Optional[int] = None
    ) -> Optional[Child]:
        """
        Update child information.

        Args:
            db: Database session
            child_id: ID of the child
            name: New name (optional)
            avatar: New avatar (optional)
            age: New age (optional)

        Returns:
            Updated Child instance or None if not found
        """
        child = db.query(Child).filter(Child.id == child_id).first()
        if not child:
            return None

        if name is not None:
            child.name = name
        if avatar is not None:
            child.avatar = avatar
        if age is not None:
            child.age = age

        try:
            db.commit()
            db.refresh(child)
            return child
        except IntegrityError as e:
            db.rollback()
            raise ValueError(f"Database error: {str(e)}")

    @staticmethod
    def delete_child(db: Session, child_id: str) -> bool:
        """
        Delete a child account.

        Args:
            db: Database session
            child_id: ID of the child

        Returns:
            True if deleted, False if not found
        """
        child = db.query(Child).filter(Child.id == child_id).first()
        if not child:
            return False

        db.delete(child)
        db.commit()
        return True
