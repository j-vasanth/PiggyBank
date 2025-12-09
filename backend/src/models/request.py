from sqlalchemy import Column, String, DateTime, ForeignKey, Numeric, Enum as SQLEnum, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from src.config.database import Base
import enum


class RequestType(enum.Enum):
    """Request type enumeration."""
    CREDIT = "credit"
    EXPENSE = "expense"


class RequestStatus(enum.Enum):
    """Request status enumeration."""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class Request(Base):
    """Request entity - represents a child's request for money action."""

    __tablename__ = "requests"

    id = Column(String(36), primary_key=True)  # UUID
    child_id = Column(String(36), ForeignKey("children.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(SQLEnum(RequestType), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(SQLEnum(RequestStatus), default=RequestStatus.PENDING, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    resolved_at = Column(DateTime, nullable=True)
    resolved_by_parent_id = Column(String(36), nullable=True)

    # Relationships
    child = relationship("Child", back_populates="requests")

    def __repr__(self):
        return f"<Request(id={self.id}, type={self.type.value}, status={self.status.value}, amount={self.amount})>"
