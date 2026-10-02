from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.router import api_router
from app.core.config import settings
from app.core.database import init_db
from app.utils.seed import seed_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initializes database schema and ensures seed data on startup."""
    init_db()
    try:
        seed_database()
    except Exception as e:
        print(f"Seed note: {e}")
    yield


app = FastAPI(
    title="Indian Election Voting Simulation Platform",
    description=(
        "**Indian Election Voting Simulation Platform** — Academic demonstration and electoral governance simulation engine.\n\n"
        "Notice: Academic Election Simulation — This platform is a demonstration project. "
        "Votes cast here are simulated and have no connection to official elections.\n\n"
        "Features:\n"
        "- Tamil Nadu Legislative Assembly Election 2026 Simulation (All 234 Assembly Constituencies)\n"
        "- Lok Sabha Parliamentary General Election Simulation (Indian Parliamentary Structure)\n"
        "- Real-world Reference Candidate & Political Party Systems (ECI Public Sources)\n"
        "- Cryptographic Anonymous Ballot Ledger & Verifiable Receipts (SIM-XXXXXXXX)\n"
        "- Strict Double-Vote Prevention (Database Unique Constraints)\n"
        "- Administrative Analytics & CSV/JSON Electoral Data Import"
    ),
    version="3.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else [settings.CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Ensures consistent, safe JSON error responses."""
    import traceback
    traceback.print_exc()
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal system error occurred. Please contact the administrator."},
    )


# Mount all API endpoints
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["Health"])
def health_check():
    """System health check and simulated election engine status."""
    return {
        "status": "healthy",
        "service": "Indian Election Voting Simulation Platform",
        "version": "3.0.0",
        "simulation_disclaimer": "Academic Election Simulation — This platform is a demonstration project. Votes cast here are simulated and have no connection to official elections.",
        "environment": settings.ENVIRONMENT,
    }


@app.get("/", tags=["Root"])
def root():
    """Root platform discovery endpoint."""
    return {
        "platform": "Indian Election Voting Simulation Platform",
        "description": "Academic simulation of State Assembly and Parliamentary elections in India.",
        "notice": "Academic Election Simulation — This platform is a demonstration project. Votes cast here are simulated and have no connection to official elections.",
        "documentation": "/docs",
        "api_v1": settings.API_V1_STR,
    }
