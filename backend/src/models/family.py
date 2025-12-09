from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from src.config.database import Base


class Family(Base):
    """Family entity - represents a family unit in the system."""

    __tablename__ = "families"

    id = Column(String(36), primary_key=True)  # UUID
    family_code = Column(String(8), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    parent_admins = relationship("ParentAdmin", back_populates="family", cascade="all, delete-orphan")
    children = relationship("Child", back_populates="family", cascade="all, delete-orphan")
    invitations = relationship("Invitation", back_populates="family", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Family(id={self.id}, name={self.name}, family_code={self.family_code})>"
