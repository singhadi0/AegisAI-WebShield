from __future__ import annotations

from typing import Any

# In-memory store for captured attacker payloads.
# Purpose: simulate a vulnerable endpoint while collecting inputs for analysis.
_honeypot_events: list[dict[str, Any]] = []


def handle_honeypot(request_data: dict[str, Any]) -> dict[str, str]:
    """
    Simulate a vulnerable system by "accepting" attacker input and responding
    with a fake success message while recording the payload for inspection.
    """
    # For now, we log with print as requested (swap for structured logging later).
    print(f"[HONEYPOT] captured payload: {request_data!r}")

    # Store attacker data in memory (no persistence yet).
    _honeypot_events.append(request_data)

    # Fake success response to encourage continued interaction.
    return {"status": "success", "message": "Login successful"}


__all__ = ["handle_honeypot"]
