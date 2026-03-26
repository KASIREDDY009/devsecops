"""
Pydantic Schemas (Data Transfer Objects)
-----------------------------------------
Defines request and response schemas for input validation and
JSON serialisation. Pydantic ensures that incoming data conforms
to the expected shape and types before it reaches the business logic.

MSc Cloud DevOpsSec - Automated Plant Care Monitoring System
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


# ── Authentication Schemas ──────────────────────────────────────

class SignupRequest(BaseModel):
    """Schema for user registration requests."""
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)


class LoginRequest(BaseModel):
    """Schema for user login requests."""
    username: str = Field(..., min_length=3)
    password: str = Field(..., min_length=6)


class AuthResponse(BaseModel):
    """Schema for authentication responses containing JWT token."""
    token: str
    username: str


class MessageResponse(BaseModel):
    """Generic message response schema."""
    message: str


# ── Plant Schemas ───────────────────────────────────────────────

class PlantRequest(BaseModel):
    """Schema for creating or updating a plant."""
    name: str = Field(..., min_length=2, max_length=100)
    species: str = Field(..., min_length=1)
    location: str = Field(..., min_length=1)
    wateringFrequencyDays: int = Field(..., ge=1, le=90)
    healthStatus: str = Field(default="HEALTHY")


class PlantResponse(BaseModel):
    """Schema for plant data returned to the client."""
    id: int
    name: str
    species: str
    location: str
    wateringFrequencyDays: int
    healthStatus: str
    createdAt: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Sensor Data Schemas ─────────────────────────────────────────

class SensorDataRequest(BaseModel):
    """Schema for submitting a new sensor reading."""
    soilMoisture: float = Field(..., ge=0, le=100)
    temperature: float = Field(..., ge=-40, le=60)
    lightLevel: float = Field(..., ge=0, le=100000)
    humidity: float = Field(..., ge=0, le=100)


class SensorDataResponse(BaseModel):
    """Schema for sensor data returned to the client."""
    id: int
    soilMoisture: float
    temperature: float
    lightLevel: float
    humidity: float
    recordedAt: Optional[datetime] = None

    class Config:
        from_attributes = True
