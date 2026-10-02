from fastapi import APIRouter
from app.api.routes import admin, auth, candidates, elections, geographic, parties, public, voting

api_router = APIRouter()

api_router.include_router(public.router)
api_router.include_router(auth.router)
api_router.include_router(elections.router)
api_router.include_router(candidates.router)
api_router.include_router(geographic.router)
api_router.include_router(parties.router)
api_router.include_router(voting.router)
api_router.include_router(admin.router)
