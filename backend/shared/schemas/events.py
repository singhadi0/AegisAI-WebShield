from __future__ import annotations

from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class Classification(str, Enum):
    safe = "SAFE"
    suspicious = "SUSPICIOUS"
    attack = "ATTACK"


class ThreatDecision(BaseModel):
    classification: Classification
    threat_score: float = Field(ge=0.0, le=1.0)
    attack_type: str | None = None
    confidence: float = Field(ge=0.0, le=1.0, default=0.0)
    explanations: dict[str, Any] | None = None


class ThreatEventIn(BaseModel):
    ip_address: str | None = None
    method: str
    path: str
    user_agent: str | None = None
    content_type: str | None = None
    body_text: str = ""
    decision: ThreatDecision


class ThreatEventOut(ThreatEventIn):
    id: str
    created_at: str

