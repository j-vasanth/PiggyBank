from sqlalchemy import Column, String, DateTime, ForeignKey, Numeric, Enum as SQLEnum, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from src.config.database import Base
import enum


class TransactionType(enum.Enum):
    """Transaction type enumeration."""
    CREDIT = "credit"
    DEBIT = "debit"


class Transaction(Base):
    """Transaction entity - represents a balance change for a child."""

    __tablename__ = "transactions"

    id = Column(String(36), primary_key=True)  # UUID
    child_id = Column(String(36), ForeignKey("children.id", ondelete="CASCADE"), nullable=False, index=True)
    parent_admin_id = Column(String(36), ForeignKey("parent_admins.id", ondelete="SET NULL"), nullable=True, index=True)
    type = Column(SQLEnum(TransactionType), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    balance_before = Column(Numeric(10, 2), nullable=False)
    balance_after = Column(Numeric(10, 2), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    child = relationship("Child", back_populates="transactions")
    parent_admin = relationship("ParentAdmin", back_populates="transactions")

    def __repr__(self):
        return f"<Transaction(id={self.id}, type={self.type.value}, amount={self.amount}, child_id={self.child_id})>"
