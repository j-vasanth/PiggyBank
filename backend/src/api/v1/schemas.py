from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from decimal import Decimal


# Auth schemas
class RegisterFamilyRequest(BaseModel):
    family_name: str = Field(..., min_length=1, max_length=100)
    parent_username: str = Field(..., min_length=3, max_length=50, pattern="^[a-zA-Z0-9_]+$")
    parent_name: str = Field(..., min_length=1, max_length=100)
    parent_password: str = Field(..., min_length=8)


class LoginRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=1)


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


# Child schemas
class CreateChildRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, pattern="^[a-zA-Z0-9_]+$")
    name: str = Field(..., min_length=1, max_length=100)
    password: str = Field(..., min_length=4, max_length=4, pattern="^[0-9]{4}$")  # 4-digit PIN
    avatar: Optional[str] = Field(None, max_length=10)
    age: Optional[int] = Field(None, ge=1, le=18)


class UpdateChildRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    avatar: Optional[str] = Field(None, max_length=10)
    age: Optional[int] = Field(None, ge=1, le=18)


class ChildResponse(BaseModel):
    id: str
    username: str
    name: str
    avatar: Optional[str]
    age: Optional[int]
    balance: Decimal
    created_at: datetime

    class Config:
        from_attributes = True


# Transaction schemas
class CreateTransactionRequest(BaseModel):
    child_id: str
    type: str = Field(..., pattern="^(credit|debit)$")
    amount: Decimal = Field(..., gt=0, decimal_places=2)
    description: Optional[str] = None
    category: Optional[str] = Field(None, max_length=50)

    @validator('amount')
    def validate_amount(cls, v):
        if v <= 0:
            raise ValueError('Amount must be positive')
        return round(v, 2)


class TransactionResponse(BaseModel):
    id: str
    child_id: str
    parent_admin_id: Optional[str]
    type: str
    amount: Decimal
    balance_before: Decimal
    balance_after: Decimal
    description: Optional[str]
    category: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

    @validator('type', pre=True)
    def extract_enum_value(cls, v):
        """Convert enum to string value."""
        if hasattr(v, 'value'):
            return v.value
        return v
