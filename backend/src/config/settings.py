import os
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

    # CORS
    cors_origins: List[str] = ["http://localhost:5173", "http://localhost:3000"]

    # Logging
    log_level: str = "INFO"

    class Config:
        env_file = ".env"
        case_sensitive = False

        @classmethod
        def parse_env_var(cls, field_name: str, raw_val: str):
            if field_name == 'cors_origins':
                return [origin.strip() for origin in raw_val.split(',')]
            return raw_val


# Global settings instance
settings = Settings()
