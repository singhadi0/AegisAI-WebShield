import logging
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth_router, honeypot_router
from app.middleware import register_security_middleware


def _configure_logging() -> None:
    logging.basicConfig(
        level=os.getenv("LOG_LEVEL", "INFO").upper(),
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )


def create_app() -> FastAPI:
    _configure_logging()

    app = FastAPI(title="AegisAI WebShield", version="0.1.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    register_security_middleware(app)

    @app.get("/", tags=["root"])
    def root() -> dict[str, str]:
        return {"message": "AegisAI WebShield Running"}

    app.include_router(auth_router)
    app.include_router(honeypot_router, prefix="/api/honeypot")

    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", "8000")),
        reload=False,
        log_level=os.getenv("UVICORN_LOG_LEVEL", "info"),
    )
