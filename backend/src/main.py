from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.config.settings import settings
from src.api.v1.auth import router as auth_router
from src.api.v1.children import router as children_router
from src.api.v1.transactions import router as transactions_router
from src.api.v1.invitations import router as invitations_router

# Create FastAPI app
app = FastAPI(
    title=settings.project_name,
    version="1.0.0",
    description="Family Banking System API for managing children's allowances"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix=f"{settings.api_v1_prefix}/auth", tags=["auth"])
app.include_router(children_router, prefix=f"{settings.api_v1_prefix}/children", tags=["children"])
app.include_router(transactions_router, prefix=f"{settings.api_v1_prefix}/transactions", tags=["transactions"])
app.include_router(invitations_router, prefix=f"{settings.api_v1_prefix}/invitations", tags=["invitations"])


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Welcome to PiggyBank Family Banking System API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get(f"{settings.api_v1_prefix}/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
