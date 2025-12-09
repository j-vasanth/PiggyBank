from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from datetime import datetime
from src.config.database import Base


class Child(Base):
    """Child entity - represents a child account in the system."""

    __tablename__ = "children"

    id = Column(String(36), primary_key=True)  # UUID
    family_id = Column(String(36), ForeignKey("families.id", ondelete="CASCADE"), nullable=False, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    password_hash = Column(String(255), nullable=False)
    avatar = Column(String(10), nullable=True)  # Emoji or small identifier
    age = Column(Integer, nullable=True)
    balance = Column(Numeric(10, 2), default=0.00, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    family = relationship("Family", back_populates="children")
    transactions = relationship("Transaction", back_populates="child", cascade="all, delete-orphan")
    requests = relationship("Request", back_populates="child", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="child", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Child(id={self.id}, username={self.username}, name={self.name}, balance={self.balance})>"
