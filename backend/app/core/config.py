from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "AegisAI WebShield"
    debug: bool = True
    secret_key: str = "supersecretkey"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()

__all__ = ["Settings", "settings"]
