from __future__ import annotations

from datetime import datetime
from typing import Any

# In-memory store for captured attacker payloads.
# Purpose: simulate a vulnerable endpoint while collecting inputs for analysis.
_honeypot_events: list[dict[str, Any]] = []

# In-memory attack log store (simple, no persistence yet).
attack_logs: list[dict[str, Any]] = []


def handle_honeypot(request_data: dict[str, Any]) -> dict[str, str]:
    """
    Simulate a vulnerable system by "accepting" attacker input and responding
    with a fake success message while recording the payload for inspection.
    """
    # For now, we log with print as requested (swap for structured logging later).
    print(f"[HONEYPOT] captured payload: {request_data!r}")

    # Store attacker data in memory (no persistence yet).
    _honeypot_events.append(request_data)

    # Store an "attack log" entry for later review.
    # `attack_type` is optional and may be provided by upstream detectors.
    attack_logs.append(
        {
            "payload": request_data,
            "timestamp": datetime.now().isoformat(),
            "attack_type": str(request_data.get("attack_type") or "Unknown"),
        }
    )

    # Fake success response to encourage continued interaction.
    return {"status": "success", "message": "Login successful"}


def get_attack_logs() -> list[dict[str, Any]]:
    return list(attack_logs)


__all__ = ["attack_logs", "get_attack_logs", "handle_honeypot"]
