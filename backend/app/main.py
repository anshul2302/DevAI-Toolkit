import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from app.database import init_db
from app.routers import converter, token_tools, waste_detector, prompt_templates, file_tools

ENV = os.getenv("ENVIRONMENT", "development")

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
]

FRONTEND_URL = os.getenv("FRONTEND_URL")
if FRONTEND_URL:
    ALLOWED_ORIGINS.append(FRONTEND_URL)


# ─── Security: add headers to every response ─────────────────────────
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "no-referrer"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        return response


app = FastAPI(
    title="DevAI Toolkit API",
    description="Backend API for the DevAI Toolkit.",
    version="1.0.0",
    docs_url="/docs" if ENV == "development" else None,
    redoc_url=None,
)

app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type", "Accept"],
)

app.include_router(converter.router, prefix="/api/convert", tags=["Converters"])
app.include_router(token_tools.router, prefix="/api/tokens", tags=["Token Tools"])
app.include_router(waste_detector.router, prefix="/api/waste", tags=["Waste Detector"])
app.include_router(prompt_templates.router, prefix="/api/prompts", tags=["Prompt Templates"])
app.include_router(file_tools.router, prefix="/api/files", tags=["File Tools"])


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "app": "DevAI Toolkit", "environment": ENV}
