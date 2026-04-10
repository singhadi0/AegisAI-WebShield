from __future__ import annotations

import uuid
from datetime import datetime, timezone

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from backend.shared.core.config import get_settings
from backend.shared.core.logging import configure_logging
from backend.shared.db.models import ThreatEvent
from backend.shared.db.session import get_sessionmaker
from backend.shared.schemas import Classification, ThreatDecision, ThreatEventIn


def create_app() -> FastAPI:
    settings = get_settings()
    configure_logging(settings.log_level)

    app = FastAPI(title="Aegis-Deception Gateway", version="0.1.0")

    @app.get("/health")
    def health() -> dict[str, str]:
        # Minimal DB check (no migrations yet). Failures are visible in logs/health.
        try:
            SessionLocal = get_sessionmaker()
            with SessionLocal() as s:
                s.execute("SELECT 1")
        except Exception:
            return {"status": "degraded", "service": "gateway"}
        return {"status": "ok", "service": "gateway"}

    @app.post("/api/gateway/inspect")
    async def inspect(request: Request) -> dict:
        # MVP: capture request, run a trivial decision (AI stub added later).
        body = await request.body()
        body_text = body.decode("utf-8", errors="ignore") if body else ""

        decision = ThreatDecision(
            classification=Classification.safe,
            threat_score=0.0,
            attack_type=None,
            confidence=0.0,
        )
        evt = ThreatEventIn(
            ip_address=(request.client.host if request.client else None),
            method=request.method,
            path=str(request.url.path),
            user_agent=request.headers.get("user-agent"),
            content_type=request.headers.get("content-type"),
            body_text=body_text,
            decision=decision,
        )

        # Store event (best-effort).
        try:
            SessionLocal = get_sessionmaker()
            with SessionLocal() as s:
                db_evt = ThreatEvent(
                    ip_address=evt.ip_address,
                    method=evt.method,
                    path=evt.path,
                    user_agent=evt.user_agent,
                    content_type=evt.content_type,
                    body_text=evt.body_text,
                    classification=evt.decision.classification.value,
                    threat_score=evt.decision.threat_score,
                    attack_type=evt.decision.attack_type,
                    confidence=evt.decision.confidence,
                    explanations=evt.decision.explanations,
                )
                s.add(db_evt)
                s.commit()
        except Exception:
            # Keep MVP stable even if DB is down.
            pass

        return {
            "id": str(uuid.uuid4()),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "event": evt.model_dump(),
        }

    # A simple demo endpoint to show "allow" behavior.
    @app.get("/api/main/ping")
    def main_ping() -> dict[str, str]:
        return {"message": "main app pong"}

    # Fallback JSON handler for unknown routes in MVP.
    @app.exception_handler(404)
    def not_found(_request: Request, _exc) -> JSONResponse:
        return JSONResponse(status_code=404, content={"detail": "not found"})

    return app


app = create_app()

