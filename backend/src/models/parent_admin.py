from sqlalchemy import Column, String, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from src.config.database import Base
import enum


class ParentRole(enum.Enum):
    """Parent role enumeration."""
    OWNER = "owner"
    CO_PARENT = "co_parent"


class ParentAdmin(Base):
    """ParentAdmin entity - represents a parent user in the system."""

    __tablename__ = "parent_admins"

    id = Column(String(36), primary_key=True)  # UUID
    family_id = Column(String(36), ForeignKey("families.id", ondelete="CASCADE"), nullable=False, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(SQLEnum(ParentRole), default=ParentRole.OWNER, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    family = relationship("Family", back_populates="parent_admins")
    transactions = relationship("Transaction", back_populates="parent_admin")
    notifications = relationship("Notification", back_populates="parent_admin", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<ParentAdmin(id={self.id}, username={self.username}, role={self.role.value})>"
