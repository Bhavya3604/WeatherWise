from datetime import datetime

import httpx
from loguru import logger

from app.core.config import settings
from app.db.schemas import WeatherResponse, WeatherMetrics


class WeatherClientError(Exception):
    pass


OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5/weather"


async def fetch_current_weather(city: str) -> WeatherResponse:
    """
    Fetch current weather using OpenWeather API.
    """
    api_key = settings.openweather_api_key
    if not api_key:
        raise WeatherClientError("OpenWeather API key isn't configured")

    params = {
        "q": city,
        "appid": api_key,
        "units": "metric",
    }

    async with httpx.AsyncClient(timeout=15) as client:
        try:
            response = await client.get(OPENWEATHER_BASE_URL, params=params)
            response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            detail = "Unable to fetch weather data"
            try:
                error_payload = exc.response.json()
                detail = error_payload.get("message", detail)
            except ValueError:
                pass

            if exc.response.status_code == 404:
                raise WeatherClientError(f"City '{city}' not found") from exc

            logger.error("OpenWeather HTTP error: %s", detail)
            raise WeatherClientError(detail) from exc
        except httpx.HTTPError as exc:
            logger.error("OpenWeather request error: %s", str(exc))
            raise WeatherClientError("Network error calling OpenWeather") from exc

    data = response.json()
    weather_info = (data.get("weather") or [{}])[0]
    main_info = data.get("main") or {}
    wind_info = data.get("wind") or {}
    sys_info = data.get("sys") or {}

    description = weather_info.get("description", "Unknown").title()
    icon = weather_info.get("icon", "01d")

    metrics = WeatherMetrics(
        temperature_c=main_info.get("temp", 0.0),
        humidity=main_info.get("humidity", 0.0),
        wind_speed=wind_info.get("speed", 0.0),
        description=description,
        icon=icon,
    )

    return WeatherResponse(
        city=data.get("name", city),
        country=sys_info.get("country", ""),
        fetched_at=datetime.utcnow(),
        metrics=metrics,
    )

