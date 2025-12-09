from sqlalchemy import Column, String, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from src.config.database import Base
import enum


class InvitationStatus(enum.Enum):
    """Invitation status enumeration."""
    PENDING = "pending"
    ACCEPTED = "accepted"


class Invitation(Base):
    """Invitation entity - represents an invitation to join a family."""

    __tablename__ = "invitations"

    id = Column(String(36), primary_key=True)  # UUID
    family_id = Column(String(36), ForeignKey("families.id", ondelete="CASCADE"), nullable=False, index=True)
    invite_code = Column(String(12), unique=True, nullable=False, index=True)
    created_by_parent_id = Column(String(36), nullable=False)
    status = Column(SQLEnum(InvitationStatus), default=InvitationStatus.PENDING, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    accepted_at = Column(DateTime, nullable=True)

    # Relationships
    family = relationship("Family", back_populates="invitations")

    def __repr__(self):
        return f"<Invitation(id={self.id}, invite_code={self.invite_code}, status={self.status.value})>"
