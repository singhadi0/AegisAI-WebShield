from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Awaitable, Callable

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, Response

from app.services.honeypot_service import handle_honeypot
from app.services.waf_service import detect_attack


def register_security_middleware(app: FastAPI) -> None:
    """
    Registers a simple WAF middleware that inspects request bodies for common
    SQLi/XSS patterns. If malicious, it blocks the request with a JSON response.
    """

    @app.middleware("http")
    async def waf_middleware(
        request: Request,
        call_next: Callable[[Request], Awaitable[Response]],
    ) -> Response:
        # Read body safely. Starlette caches `request.body()`, but we also
        # re-inject the bytes into the request stream to avoid breaking handlers
        # that may read the body again.
        body_bytes = await request.body()

        async def receive() -> dict:
            return {"type": "http.request", "body": body_bytes, "more_body": False}

        request = Request(request.scope, receive)

        body_str = body_bytes.decode("utf-8", errors="ignore") if body_bytes else ""
        details = detect_attack(body_str)

        if details["is_attack"]:
            # Trap attacks by forwarding the payload to the honeypot instead of blocking.
            # We try to decode JSON into a dict; if that fails, we store a minimal record.
            ip = request.client.host if request.client else None
            timestamp = datetime.now(timezone.utc).isoformat()

            payload: dict = {}
            if body_str:
                try:
                    parsed = json.loads(body_str)
                    if isinstance(parsed, dict):
                        payload = parsed
                    else:
                        payload = {"_raw": body_str, "_parsed_type": type(parsed).__name__}
                except json.JSONDecodeError:
                    payload = {"_raw": body_str}

            honeypot_event = {"ip": ip, "timestamp": timestamp, "payload": payload}
            response = handle_honeypot(honeypot_event)
            return JSONResponse(status_code=200, content=response)

        return await call_next(request)


__all__ = ["register_security_middleware"]

