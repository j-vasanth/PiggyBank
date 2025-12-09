from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.config.database import get_db
from src.services import ChildService
from src.auth import get_current_parent
from src.models.parent_admin import ParentAdmin
from src.api.v1.schemas import CreateChildRequest, UpdateChildRequest, ChildResponse

router = APIRouter()


@router.post("/", response_model=ChildResponse, status_code=status.HTTP_201_CREATED)
async def create_child(
    request: CreateChildRequest,
    db: Session = Depends(get_db),
    current_parent: ParentAdmin = Depends(get_current_parent)
):
    """
    Create a new child account in the parent's family.

    Requires parent authentication.
    """
    try:
        child = ChildService.create_child(
            db=db,
            family_id=current_parent.family_id,
            username=request.username,
            name=request.name,
            password=request.password,
            avatar=request.avatar,
            age=request.age
        )

        return ChildResponse.from_orm(child)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/", response_model=List[ChildResponse])
async def get_children(
    db: Session = Depends(get_db),
    current_parent: ParentAdmin = Depends(get_current_parent)
):
    """
    Get all children in the parent's family.

    Requires parent authentication.
    """
    children = ChildService.get_children_by_family(db, current_parent.family_id)
    return [ChildResponse.from_orm(child) for child in children]


@router.get("/{child_id}", response_model=ChildResponse)
async def get_child(
    child_id: str,
    db: Session = Depends(get_db),
    current_parent: ParentAdmin = Depends(get_current_parent)
):
    """
    Get a specific child by ID.

    Requires parent authentication and child must be in parent's family.
    """
    child = ChildService.get_child_by_id(db, child_id)

    if not child:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Child not found"
        )

    # Verify child belongs to parent's family
    if child.family_id != current_parent.family_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )

    return ChildResponse.from_orm(child)


@router.patch("/{child_id}", response_model=ChildResponse)
async def update_child(
    child_id: str,
    request: UpdateChildRequest,
    db: Session = Depends(get_db),
    current_parent: ParentAdmin = Depends(get_current_parent)
):
    """
    Update a child's information.

    Requires parent authentication and child must be in parent's family.
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

    # Update child
    try:
        updated_child = ChildService.update_child(
            db=db,
            child_id=child_id,
            name=request.name,
            avatar=request.avatar,
            age=request.age
        )

        if not updated_child:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Child not found"
            )

        return ChildResponse.from_orm(updated_child)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.delete("/{child_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_child(
    child_id: str,
    db: Session = Depends(get_db),
    current_parent: ParentAdmin = Depends(get_current_parent)
):
    """
    Delete a child account.

    Requires parent authentication and child must be in parent's family.
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

    # Delete child
    success = ChildService.delete_child(db, child_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Child not found"
        )

    return None
