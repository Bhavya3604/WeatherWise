"""
AI Weather Prediction Endpoints
Protected routes for authenticated users only
"""
from fastapi import APIRouter, Depends, HTTPException, Query

from app.api.deps import get_current_user
from app.db.models import User
from app.db.schemas import PredictionResponse, PredictionDay
from app.ml.predictor import get_predictor
from app.services.weather_client import WeatherClientError, fetch_current_weather

router = APIRouter(prefix="/api", tags=["predictions"])


@router.get("/predict", response_model=PredictionResponse)
async def get_weather_prediction(
    city: str = Query(..., min_length=2),
    current_user: User = Depends(get_current_user),
):
    """
    Get AI-powered 7-day weather prediction for a city
    Requires authentication
    """
    try:
        # Get current weather to use as input for prediction
        current_weather = await fetch_current_weather(city)

        # Get predictor
        predictor = get_predictor()

        # Generate prediction
        predictions = predictor.predict(
            current_temp=current_weather.metrics.temperature_c,
            current_humidity=current_weather.metrics.humidity,
            current_precip=0.0,  # Use 0 if not available
        )

        # Format response
        prediction_days = [
            PredictionDay(
                day=p["day"],
                temperature_c=p["temperature_c"],
                humidity=p["humidity"],
                precipitation_mm=p["precipitation_mm"],
            )
            for p in predictions
        ]

        return PredictionResponse(
            city=current_weather.city,
            country=current_weather.country,
            predictions=prediction_days,
        )

    except WeatherClientError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(exc)}") from exc

