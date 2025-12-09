"""Simplify invitations - remove expires_at and EXPIRED status

Revision ID: 002_simplify_invitations
Revises: 5409a9570a99
Create Date: 2025-12-08

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '002_simplify_invitations'
down_revision: Union[str, Sequence[str], None] = '5409a9570a99'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Remove expires_at column and simplify status enum."""
    # SQLite doesn't support ALTER TABLE DROP COLUMN or enum modification
    # So we need to recreate the table

    # Create new table with simplified schema
    op.create_table('invitations_new',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('family_id', sa.String(length=36), nullable=False),
        sa.Column('invite_code', sa.String(length=12), nullable=False),
        sa.Column('created_by_parent_id', sa.String(length=36), nullable=False),
        sa.Column('status', sa.Enum('PENDING', 'ACCEPTED', name='invitationstatus'), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('accepted_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['family_id'], ['families.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Copy data from old table (excluding expires_at, converting EXPIRED to PENDING)
    op.execute("""
        INSERT INTO invitations_new (id, family_id, invite_code, created_by_parent_id, status, created_at, accepted_at)
        SELECT id, family_id, invite_code, created_by_parent_id,
               CASE WHEN status = 'EXPIRED' THEN 'PENDING' ELSE status END,
               created_at, accepted_at
        FROM invitations
    """)

    # Drop old table
    op.drop_index('ix_invitations_invite_code', table_name='invitations')
    op.drop_index('ix_invitations_family_id', table_name='invitations')
    op.drop_table('invitations')

    # Rename new table to original name
    op.rename_table('invitations_new', 'invitations')

    # Create indexes on renamed table
    op.create_index('ix_invitations_family_id', 'invitations', ['family_id'], unique=False)
    op.create_index('ix_invitations_invite_code', 'invitations', ['invite_code'], unique=True)


def downgrade() -> None:
    """Restore expires_at column and EXPIRED status."""
    # Create table with original schema
    op.create_table('invitations_old',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('family_id', sa.String(length=36), nullable=False),
        sa.Column('invite_code', sa.String(length=12), nullable=False),
        sa.Column('created_by_parent_id', sa.String(length=36), nullable=False),
        sa.Column('status', sa.Enum('PENDING', 'ACCEPTED', 'EXPIRED', name='invitationstatus'), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('accepted_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['family_id'], ['families.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Copy data back (setting expires_at to created_at + 7 days as default)
    op.execute("""
        INSERT INTO invitations_old (id, family_id, invite_code, created_by_parent_id, status, created_at, expires_at, accepted_at)
        SELECT id, family_id, invite_code, created_by_parent_id, status, created_at,
               datetime(created_at, '+7 days'), accepted_at
        FROM invitations
    """)

    # Drop new table
    op.drop_index('ix_invitations_invite_code', table_name='invitations')
    op.drop_index('ix_invitations_family_id', table_name='invitations')
    op.drop_table('invitations')

    # Rename old table
    op.rename_table('invitations_old', 'invitations')
    op.create_index('ix_invitations_family_id', 'invitations', ['family_id'], unique=False)
    op.create_index('ix_invitations_invite_code', 'invitations', ['invite_code'], unique=True)
