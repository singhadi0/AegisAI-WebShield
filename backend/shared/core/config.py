from __future__ import annotations

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Aegis-Deception"
    environment: str = "dev"
    log_level: str = "INFO"

    # Services
    gateway_host: str = "0.0.0.0"
    gateway_port: int = 8000
    honeypot_host: str = "0.0.0.0"
    honeypot_port: int = 8002

    # Data
    postgres_dsn: str = "postgresql+psycopg://postgres:postgres@postgres:5432/aegis"
    redis_url: str = "redis://redis:6379/0"

    # Security / routing thresholds (MVP)
    suspicious_threshold: float = 0.55
    attack_threshold: float = 0.80

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()


__all__ = ["Settings", "get_settings"]

