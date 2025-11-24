from fastapi import APIRouter, HTTPException, Query

from app.db.schemas import WeatherResponse
from app.services.weather_client import WeatherClientError, fetch_current_weather

router = APIRouter(prefix="/api", tags=["weather"])


@router.get("/current", response_model=WeatherResponse)
async def get_current_weather(city: str = Query(..., min_length=2)) -> WeatherResponse:
    try:
        return await fetch_current_weather(city)
    except WeatherClientError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

