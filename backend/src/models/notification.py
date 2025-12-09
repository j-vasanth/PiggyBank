from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from src.config.database import Base
import enum


class NotificationType(enum.Enum):
    """Notification type enumeration."""
    REQUEST_SUBMITTED = "request_submitted"
    REQUEST_APPROVED = "request_approved"
    REQUEST_REJECTED = "request_rejected"
    TRANSACTION_CREDIT = "transaction_credit"
    TRANSACTION_DEBIT = "transaction_debit"
    FAMILY_INVITE = "family_invite"


class Notification(Base):
    """Notification entity - represents a notification for a user."""

    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True)  # UUID
    parent_admin_id = Column(String(36), ForeignKey("parent_admins.id", ondelete="CASCADE"), nullable=True, index=True)
    child_id = Column(String(36), ForeignKey("children.id", ondelete="CASCADE"), nullable=True, index=True)
    type = Column(SQLEnum(NotificationType), nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    parent_admin = relationship("ParentAdmin", back_populates="notifications")
    child = relationship("Child", back_populates="notifications")

    def __repr__(self):
        return f"<Notification(id={self.id}, type={self.type.value}, is_read={self.is_read})>"
