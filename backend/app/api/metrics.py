from __future__ import annotations

from fastapi import APIRouter

from app.services.honeypot_service import get_attack_logs

router = APIRouter(tags=["Metrics"])


@router.get("/")
def get_metrics() -> dict[str, int]:
    logs = get_attack_logs()
    total = len(logs)
    sql_count = sum(1 for log in logs if log.get("attack_type") == "SQLi")
    xss_count = sum(1 for log in logs if log.get("attack_type") == "XSS")
    return {"total_attacks": total, "sql_injection": sql_count, "xss": xss_count}


__all__ = ["router"]

