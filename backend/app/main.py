"""Main FastAPI application."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from prometheus_fastapi_instrumentator import Instrumentator

from app.config import get_settings
from app.api import article_router, token_router, payment_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    # Startup
    yield
    # Shutdown


settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    description="Voice annotation for reading - speak your thoughts while you read",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(article_router.router, prefix="/api", tags=["article"])
app.include_router(token_router.router, prefix="/api", tags=["tokens"])
app.include_router(payment_router.router, prefix="/api", tags=["payment"])

# Prometheus metrics
Instrumentator().instrument(app).expose(app, endpoint="/api/metrics")


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": settings.app_name}
