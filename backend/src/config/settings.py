import os
from pathlib import Path
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings

# Project root directory
BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database
    database_url: str = f"sqlite:///{BASE_DIR}/database/piggybank.db"

    # JWT Authentication
    jwt_secret_key: str = "dev-secret-key-change-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # Application
    environment: str = "development"
    api_v1_prefix: str = "/api/v1"
    project_name: str = "PiggyBank Family Banking System"

    # CORS - accepts comma-separated string or list
    cors_origins: List[str] = ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"]

    # Logging
    log_level: str = "INFO"

    @field_validator('cors_origins', mode='before')
    @classmethod
    def parse_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(',')]
        return v

    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()
