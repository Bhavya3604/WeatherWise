from datetime import datetime
from typing import List

from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    email: EmailStr
    full_name: str | None = None


class UserCreate(UserBase):
    password: str = Field(min_length=8)


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)


class UserRead(UserBase):
    id: int
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: str | None = None
    exp: int | None = None


class WeatherMetrics(BaseModel):
    temperature_c: float
    humidity: float
    wind_speed: float
    description: str
    icon: str


class WeatherResponse(BaseModel):
    city: str
    country: str
    fetched_at: datetime
    metrics: WeatherMetrics


class PredictionDay(BaseModel):
    day: int
    temperature_c: float
    humidity: float
    precipitation_mm: float


class PredictionResponse(BaseModel):
    city: str
    country: str
    predictions: List[PredictionDay]

