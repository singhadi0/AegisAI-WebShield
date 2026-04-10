from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from fastapi import FastAPI, Request

from backend.shared.core.config import get_settings
from backend.shared.core.logging import configure_logging


def create_app() -> FastAPI:
    settings = get_settings()
    configure_logging(settings.log_level)

    app = FastAPI(title="Aegis-Deception Honeypot", version="0.1.0")

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok", "service": "honeypot"}

    @app.post("/api/honeypot/capture")
    async def capture(request: Request) -> dict[str, Any]:
        body = await request.body()
        return {
            "status": "success",
            "message": "Login successful",
            "deception": True,
            "captured_at": datetime.now(timezone.utc).isoformat(),
            "ip_address": request.client.host if request.client else None,
            "raw": body.decode("utf-8", errors="ignore"),
        }

    # Fake endpoints (expanded later)
    @app.post("/api/auth/login")
    async def fake_login(payload: dict[str, Any]) -> dict[str, Any]:
        return {"status": "success", "token": "hp_fake_token", "user": payload.get("username", "user")}

    return app


app = create_app()

