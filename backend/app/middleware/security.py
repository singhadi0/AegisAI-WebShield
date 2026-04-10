from __future__ import annotations

from typing import Awaitable, Callable

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, Response

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
            return JSONResponse(
                status_code=400,
                content={
                    "status": "blocked",
                    "reason": "malicious activity detected",
                    "details": details,
                },
            )

        return await call_next(request)


__all__ = ["register_security_middleware"]

