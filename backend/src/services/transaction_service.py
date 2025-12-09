import uuid
from decimal import Decimal
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.models.transaction import Transaction, TransactionType
from src.models.child import Child


class TransactionService:
    """Service for transaction operations with pessimistic locking."""

    @staticmethod
    def create_transaction(
        db: Session,
        child_id: str,
        parent_admin_id: str,
        transaction_type: TransactionType,
        amount: Decimal,
        description: Optional[str] = None,
        category: Optional[str] = None
    ) -> Transaction:
        """
        Create a new transaction with pessimistic locking.

        Uses BEGIN IMMEDIATE to acquire an exclusive lock on the database,
        preventing concurrent writes and ensuring balance consistency.

        Args:
            db: Database session
            child_id: ID of the child
            parent_admin_id: ID of the parent who created the transaction
            transaction_type: Type of transaction (CREDIT or DEBIT)
            amount: Transaction amount (must be positive)
            description: Optional description
            category: Optional category

        Returns:
            Created Transaction instance

        Raises:
            ValueError: If amount is invalid or insufficient funds for debit
        """
        if amount <= 0:
            raise ValueError("Transaction amount must be positive")

        # BEGIN IMMEDIATE transaction for pessimistic locking
        # This acquires a RESERVED lock immediately, preventing other writes
        db.execute(text("BEGIN IMMEDIATE"))

        try:
            # Fetch and lock the child record
            child = db.query(Child).filter(Child.id == child_id).with_for_update().first()

            if not child:
                db.rollback()
                raise ValueError(f"Child with ID {child_id} not found")

            balance_before = child.balance

            # Calculate new balance
            if transaction_type == TransactionType.CREDIT:
                balance_after = balance_before + amount
            elif transaction_type == TransactionType.DEBIT:
                if balance_before < amount:
                    db.rollback()
                    raise ValueError(
                        f"Insufficient funds. Current balance: {balance_before}, "
                        f"Attempted debit: {amount}"
                    )
                balance_after = balance_before - amount
            else:
                db.rollback()
                raise ValueError(f"Invalid transaction type: {transaction_type}")

            # Update child balance
            child.balance = balance_after

            # Create transaction record
            transaction = Transaction(
                id=str(uuid.uuid4()),
                child_id=child_id,
                parent_admin_id=parent_admin_id,
                type=transaction_type,
                amount=amount,
                balance_before=balance_before,
                balance_after=balance_after,
                description=description,
                category=category,
                created_at=datetime.utcnow()
            )

            db.add(transaction)
            db.commit()
            db.refresh(transaction)

            return transaction

        except Exception as e:
            db.rollback()
            raise e

    @staticmethod
    def get_transaction_by_id(db: Session, transaction_id: str) -> Optional[Transaction]:
        """Get a transaction by ID."""
        return db.query(Transaction).filter(Transaction.id == transaction_id).first()

    @staticmethod
    def get_transactions_by_child(
        db: Session,
        child_id: str,
        limit: int = 50,
        offset: int = 0
    ) -> List[Transaction]:
        """
        Get transactions for a child, ordered by most recent first.

        Args:
            db: Database session
            child_id: ID of the child
            limit: Maximum number of transactions to return
            offset: Number of transactions to skip

        Returns:
            List of Transaction instances
        """
        return (
            db.query(Transaction)
            .filter(Transaction.child_id == child_id)
            .order_by(Transaction.created_at.desc())
            .limit(limit)
            .offset(offset)
            .all()
        )

    @staticmethod
    def get_transactions_by_family(
        db: Session,
        family_id: str,
        limit: int = 50,
        offset: int = 0
    ) -> List[Transaction]:
        """
        Get all transactions for a family, ordered by most recent first.

        Args:
            db: Database session
            family_id: ID of the family
            limit: Maximum number of transactions to return
            offset: Number of transactions to skip

        Returns:
            List of Transaction instances
        """
        return (
            db.query(Transaction)
            .join(Child, Transaction.child_id == Child.id)
            .filter(Child.family_id == family_id)
            .order_by(Transaction.created_at.desc())
            .limit(limit)
            .offset(offset)
            .all()
        )

    @staticmethod
    def get_child_balance(db: Session, child_id: str) -> Optional[Decimal]:
        """Get the current balance for a child."""
        child = db.query(Child).filter(Child.id == child_id).first()
        return child.balance if child else None
