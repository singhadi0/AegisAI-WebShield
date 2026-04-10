from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Body

from app.services.honeypot_service import handle_honeypot

router = APIRouter(tags=["Honeypot"])


@router.post("/")
def honeypot(payload: dict[str, Any] = Body(...)) -> dict[str, str]:
    return handle_honeypot(payload)


__all__ = ["router"]

