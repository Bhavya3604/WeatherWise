from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="allow")

    app_name: str = "WeatherWise API"
    environment: str = "development"
    debug: bool = False
    database_url: str = "sqlite+aiosqlite:///./weatherwise.db"
    secret_key: str = "change-me"
    access_token_expire_minutes: int = 60
    jwt_algorithm: str = "HS256"

    openweather_api_key: str | None = None

    allowed_origins: List[str] = ["http://localhost:3000"]

    ml_model_path: str = "../ml/models/weather_lstm.pt"
    ml_scaler_path: str = "../ml/models/scaler.pkl"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

