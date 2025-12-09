from typing import List
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from src.config.database import get_db
from src.services import TransactionService, ChildService
from src.auth import get_current_parent, get_current_child
from src.models.parent_admin import ParentAdmin
from src.models.child import Child
from src.models.transaction import TransactionType
from src.api.v1.schemas import CreateTransactionRequest, TransactionResponse

router = APIRouter()


@router.post("/", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    request: CreateTransactionRequest,
    db: Session = Depends(get_db),
    current_parent: ParentAdmin = Depends(get_current_parent)
):
    """
    Create a new transaction (deposit or deduction) for a child.

    Requires parent authentication. Uses pessimistic locking to ensure
    balance consistency.
    """
    # Verify child exists and belongs to parent's family
    child = ChildService.get_child_by_id(db, request.child_id)

    if not child:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Child not found"
        )

    if child.family_id != current_parent.family_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )

    # Parse transaction type
    transaction_type = TransactionType.CREDIT if request.type == "credit" else TransactionType.DEBIT

    # Create transaction
    try:
        transaction = TransactionService.create_transaction(
            db=db,
            child_id=request.child_id,
            parent_admin_id=current_parent.id,
            transaction_type=transaction_type,
            amount=request.amount,
            description=request.description,
            category=request.category
        )

        return TransactionResponse.from_orm(transaction)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/child/{child_id}", response_model=List[TransactionResponse])
async def get_child_transactions(
    child_id: str,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_parent: ParentAdmin = Depends(get_current_parent)
):
    """
    Get transactions for a specific child.

    Requires parent authentication. Child must be in parent's family.
    """
    # Verify child exists and belongs to parent's family
    child = ChildService.get_child_by_id(db, child_id)

    if not child:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Child not found"
        )

    if child.family_id != current_parent.family_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )

    transactions = TransactionService.get_transactions_by_child(
        db=db,
        child_id=child_id,
        limit=limit,
        offset=offset
    )

    return [TransactionResponse.from_orm(t) for t in transactions]


@router.get("/family", response_model=List[TransactionResponse])
async def get_family_transactions(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_parent: ParentAdmin = Depends(get_current_parent)
):
    """
    Get all transactions for the parent's family.

    Requires parent authentication.
    """
    transactions = TransactionService.get_transactions_by_family(
        db=db,
        family_id=current_parent.family_id,
        limit=limit,
        offset=offset
    )

    return [TransactionResponse.from_orm(t) for t in transactions]


@router.get("/my-transactions", response_model=List[TransactionResponse])
async def get_my_transactions(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_child: Child = Depends(get_current_child)
):
    """
    Get transactions for the authenticated child.

    Requires child authentication.
    """
    transactions = TransactionService.get_transactions_by_child(
        db=db,
        child_id=current_child.id,
        limit=limit,
        offset=offset
    )

    return [TransactionResponse.from_orm(t) for t in transactions]


@router.get("/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(
    transaction_id: str,
    db: Session = Depends(get_db),
    current_parent: ParentAdmin = Depends(get_current_parent)
):
    """
    Get a specific transaction by ID.

    Requires parent authentication. Transaction must be in parent's family.
    """
    transaction = TransactionService.get_transaction_by_id(db, transaction_id)

    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )

    # Verify transaction belongs to parent's family
    child = ChildService.get_child_by_id(db, transaction.child_id)

    if not child or child.family_id != current_parent.family_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )

    return TransactionResponse.from_orm(transaction)
