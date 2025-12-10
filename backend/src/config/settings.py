import os
from functools import cached_property
from pathlib import Path
from typing import List
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

    # CORS - stored as comma-separated string to avoid pydantic-settings JSON parsing
    cors_origins_str: str = "http://localhost:5173,http://localhost:5174,http://localhost:3000"

    # Logging
    log_level: str = "INFO"

    @property
    def cors_origins(self) -> List[str]:
        """Parse CORS origins from comma-separated string."""
        return [origin.strip() for origin in self.cors_origins_str.split(',')]

    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()
