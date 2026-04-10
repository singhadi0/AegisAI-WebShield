from __future__ import annotations

import re
from typing import Literal, TypedDict


AttackType = Literal["SQLi", "XSS", "None"]


class DetectionResult(TypedDict):
    is_attack: bool
    type: AttackType
    confidence: float


# We keep these patterns intentionally conservative to reduce false positives.
# They focus on high-signal tokens commonly used in basic payloads.
_SQLI_PATTERNS: tuple[re.Pattern[str], ...] = (
    # Typical tautology / boolean-based injection: `' OR 1=1` (with flexible spacing/quotes)
    re.compile(r"(?i)(?:'|\")\s*or\s*\d+\s*=\s*\d+"),
    # UNION-based extraction
    re.compile(r"(?i)\bunion\s+select\b"),
    # Destructive DDL attempts
    re.compile(r"(?i)\bdrop\s+table\b"),
)

_XSS_PATTERNS: tuple[re.Pattern[str], ...] = (
    # Script tag injection (including attributes/whitespace)
    re.compile(r"(?i)<\s*script\b"),
    # javascript: URLs in href/src/etc
    re.compile(r"(?i)\bjavascript\s*:"),
    # Common DOM event handler injection
    re.compile(r"(?i)\bonerror\s*="),
)


def _confidence_from_hits(hits: int, total_patterns: int) -> float:
    """
    Simple heuristic: more distinct pattern hits -> higher confidence.
    Clamped to [0, 1] and intentionally non-linear to avoid overconfidence.
    """
    if hits <= 0 or total_patterns <= 0:
        return 0.0
    if hits == 1:
        return 0.6
    if hits == 2:
        return 0.85
    return 0.95


def detect_attack(request_data: str) -> DetectionResult:
    """
    Detect basic SQL injection (SQLi) and XSS patterns in an input string.
    This is a lightweight, regex-based detector intended for early-stage WAF filtering.
    """
    data = request_data or ""

    sqli_hits = sum(1 for p in _SQLI_PATTERNS if p.search(data) is not None)
    xss_hits = sum(1 for p in _XSS_PATTERNS if p.search(data) is not None)

    if sqli_hits == 0 and xss_hits == 0:
        return {"is_attack": False, "type": "None", "confidence": 0.0}

    if sqli_hits >= xss_hits:
        return {
            "is_attack": True,
            "type": "SQLi",
            "confidence": _confidence_from_hits(sqli_hits, len(_SQLI_PATTERNS)),
        }

    return {
        "is_attack": True,
        "type": "XSS",
        "confidence": _confidence_from_hits(xss_hits, len(_XSS_PATTERNS)),
    }


__all__ = ["DetectionResult", "detect_attack"]
