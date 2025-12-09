from typing import List
import uuid
import secrets
import string
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.config.database import get_db
from src.auth import get_current_parent
from src.models.parent_admin import ParentAdmin
from src.models.invitation import Invitation, InvitationStatus
from src.api.v1.schemas import InvitationResponse

router = APIRouter()

MAX_PENDING_INVITATIONS = 2


def generate_invite_code() -> str:
    """Generate a random 8-character alphanumeric invite code."""
    chars = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(chars) for _ in range(8))


@router.post("/", response_model=InvitationResponse, status_code=status.HTTP_201_CREATED)
async def create_invitation(
    db: Session = Depends(get_db),
    current_parent: ParentAdmin = Depends(get_current_parent)
):
    """
    Create a new invitation for the parent's family.

    Limited to MAX_PENDING_INVITATIONS pending invitations per family.
    """
    # Check existing pending invitations count
    pending_count = db.query(Invitation).filter(
        Invitation.family_id == current_parent.family_id,
        Invitation.status == InvitationStatus.PENDING
    ).count()

    if pending_count >= MAX_PENDING_INVITATIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Maximum {MAX_PENDING_INVITATIONS} pending invitations allowed"
        )

    # Generate unique invite code
    invite_code = generate_invite_code()

    # Ensure code is unique (unlikely collision but check anyway)
    while db.query(Invitation).filter(Invitation.invite_code == invite_code).first():
        invite_code = generate_invite_code()

    # Create invitation
    invitation = Invitation(
        id=str(uuid.uuid4()),
        family_id=current_parent.family_id,
        invite_code=invite_code,
        created_by_parent_id=current_parent.id,
        status=InvitationStatus.PENDING
    )

    db.add(invitation)
    db.commit()
    db.refresh(invitation)

    return InvitationResponse.from_orm(invitation)


@router.get("/", response_model=List[InvitationResponse])
async def get_invitations(
    db: Session = Depends(get_db),
    current_parent: ParentAdmin = Depends(get_current_parent)
):
    """
    Get all pending invitations for the parent's family.
    """
    invitations = db.query(Invitation).filter(
        Invitation.family_id == current_parent.family_id,
        Invitation.status == InvitationStatus.PENDING
    ).order_by(Invitation.created_at.desc()).all()

    return [InvitationResponse.from_orm(inv) for inv in invitations]


@router.delete("/{invitation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_invitation(
    invitation_id: str,
    db: Session = Depends(get_db),
    current_parent: ParentAdmin = Depends(get_current_parent)
):
    """
    Delete a pending invitation.

    Only pending invitations can be deleted.
    """
    invitation = db.query(Invitation).filter(
        Invitation.id == invitation_id,
        Invitation.family_id == current_parent.family_id
    ).first()

    if not invitation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invitation not found"
        )

    if invitation.status != InvitationStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending invitations can be deleted"
        )

    db.delete(invitation)
    db.commit()

    return None
