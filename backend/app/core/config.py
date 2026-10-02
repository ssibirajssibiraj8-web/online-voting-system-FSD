import os
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Aethelgard Secure Governance Platform"
    PROJECT_DESCRIPTION: str = (
        "Enterprise-Grade Cryptographic Online Voting & Governance System"
    )
    VERSION: str = "2.4.0"
    API_V1_STR: str = "/api"
    ENVIRONMENT: str = "development"

    # Database: Supports SQLite (for instant local zero-setup dev) and PostgreSQL (for docker/production)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./voting.db",
    )

    # JWT Secrets
    JWT_SECRET: str = os.getenv(
        "JWT_SECRET", "super-secret-aethelgard-crypto-key-change-in-production-2026-xyz"
    )
    JWT_REFRESH_SECRET: str = os.getenv(
        "JWT_REFRESH_SECRET", "super-refresh-crypto-key-change-in-production-2026-xyz"
    )
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours for dev convenience
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS Origins
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:80",
        "http://127.0.0.1:80",
        "*",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # Seed Defaults
    SEED_ADMIN_EMAIL: str = "admin@voting.system"
    SEED_ADMIN_PASSWORD: str = "Admin@123456"
    SEED_MANAGER_EMAIL: str = "manager@voting.system"
    SEED_MANAGER_PASSWORD: str = "Manager@123456"
    SEED_VOTER_PASSWORD: str = "Voter@123456"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
