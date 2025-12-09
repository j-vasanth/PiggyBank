from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.config.database import get_db
from src.services import FamilyService, AuthService
from src.api.v1.schemas import RegisterFamilyRequest, LoginRequest, AuthResponse

router = APIRouter()


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register_family(
    request: RegisterFamilyRequest,
    db: Session = Depends(get_db)
):
    """
    Register a new family with the owner parent admin.

    Creates both a family and the first parent admin account.
    Returns authentication token and family code.
    """
    try:
        family, parent = FamilyService.create_family(
            db=db,
            family_name=request.family_name,
            parent_username=request.parent_username,
            parent_name=request.parent_name,
            parent_password=request.parent_password
        )

        # Generate token for the new parent
        result = AuthService.login_parent(db, request.parent_username, request.parent_password)

        if not result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to authenticate after registration"
            )

        token, user_data = result
        user_data["family_code"] = family.family_code

        return AuthResponse(
            access_token=token,
            user=user_data
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/login/parent", response_model=AuthResponse)
async def login_parent(
    request: LoginRequest,
    db: Session = Depends(get_db)
):
    """
    Authenticate a parent user.

    Returns JWT token and user information.
    """
    result = AuthService.login_parent(db, request.username, request.password)

    if not result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token, user_data = result

    return AuthResponse(
        access_token=token,
        user=user_data
    )


@router.post("/login/child", response_model=AuthResponse)
async def login_child(
    request: LoginRequest,
    db: Session = Depends(get_db)
):
    """
    Authenticate a child user.

    Returns JWT token and user information.
    """
    result = AuthService.login_child(db, request.username, request.password)

    if not result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token, user_data = result

    return AuthResponse(
        access_token=token,
        user=user_data
    )
