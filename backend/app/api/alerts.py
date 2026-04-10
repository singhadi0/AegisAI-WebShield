from __future__ import annotations

from fastapi import APIRouter

from app.services.honeypot_service import get_attack_logs

router = APIRouter(tags=["Alerts"])


@router.get("/")
def list_attack_logs() -> dict:
    logs = get_attack_logs()
    return {"total": len(logs), "data": logs}


__all__ = ["router"]
