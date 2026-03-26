"""
Application Configuration Module
---------------------------------
Centralises all application settings using pydantic-settings.
Values are loaded from environment variables with sensible defaults
for local development. In production, these should be overridden
via environment variables set on the EC2 instance.

MSc Cloud DevOpsSec - Automated Plant Care Monitoring System
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database configuration
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/plantcare"

    # JWT configuration
    JWT_SECRET_KEY: str = "dev-secret-key-change-in-production-min-32-chars!!"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 1440  # 24 hours

    # Application settings
    APP_NAME: str = "PlantCare Monitor API"
    DEBUG: bool = False

    class Config:
        env_file = ".env"
        case_sensitive = True


# Singleton settings instance used across the application
settings = Settings()
