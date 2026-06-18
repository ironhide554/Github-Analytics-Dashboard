from fastapi import APIRouter
from app.services.analytics import analytics_pipeline

router = APIRouter()

@router.get("/analyze/{username}")
def analyze(username: str, months: int = 12):
    return analytics_pipeline(username, months)