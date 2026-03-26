"""
Sensor Data Router
-------------------
Manages sensor readings for plants. Allows recording new readings
and retrieving historical data. All endpoints require JWT auth
and verify that the plant belongs to the authenticated user.

Endpoints:
  GET  /api/plants/{plant_id}/sensor-data         - List all readings
  GET  /api/plants/{plant_id}/sensor-data/latest   - Get latest reading
  POST /api/plants/{plant_id}/sensor-data          - Record a new reading

MSc Cloud DevOpsSec - Automated Plant Care Monitoring System
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Plant, SensorData, HealthStatus, User
from app.schemas import SensorDataRequest, SensorDataResponse
from app.auth import get_current_user

router = APIRouter(prefix="/api/plants/{plant_id}/sensor-data", tags=["Sensor Data"])


def sensor_to_response(sensor: SensorData) -> dict:
    """Convert a SensorData ORM model to the frontend-expected response format."""
    return {
        "id": sensor.id,
        "soilMoisture": sensor.soil_moisture,
        "temperature": sensor.temperature,
        "lightLevel": sensor.light_level,
        "humidity": sensor.humidity,
        "recordedAt": sensor.recorded_at,
    }


def get_user_plant(plant_id: int, db: Session, current_user: User) -> Plant:
    """Helper to retrieve a plant owned by the current user or raise 404."""
    plant = (
        db.query(Plant)
        .filter(Plant.id == plant_id, Plant.owner_id == current_user.id)
        .first()
    )
    if not plant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"message": "Plant not found"},
        )
    return plant


def derive_health_status(soil_moisture: float, temperature: float, humidity: float) -> HealthStatus:
    """
    Automatically derive plant health status from sensor readings.
    Uses threshold-based logic to categorise plant health.
    """
    critical_count = 0
    attention_count = 0

    # Soil moisture thresholds
    if soil_moisture < 10 or soil_moisture > 90:
        critical_count += 1
    elif soil_moisture < 20 or soil_moisture > 80:
        attention_count += 1

    # Temperature thresholds
    if temperature < 5 or temperature > 45:
        critical_count += 1
    elif temperature < 10 or temperature > 35:
        attention_count += 1

    # Humidity thresholds
    if humidity < 10 or humidity > 95:
        critical_count += 1
    elif humidity < 20 or humidity > 85:
        attention_count += 1

    if critical_count >= 1:
        return HealthStatus.CRITICAL
    elif attention_count >= 2:
        return HealthStatus.NEEDS_ATTENTION
    return HealthStatus.HEALTHY


@router.get("", response_model=List[SensorDataResponse])
def get_sensor_data(
    plant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve all sensor readings for a plant, most recent first."""
    plant = get_user_plant(plant_id, db, current_user)
    readings = (
        db.query(SensorData)
        .filter(SensorData.plant_id == plant.id)
        .order_by(SensorData.recorded_at.desc())
        .all()
    )
    return [sensor_to_response(r) for r in readings]


@router.get("/latest", response_model=SensorDataResponse)
def get_latest_sensor_data(
    plant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve the most recent sensor reading for a plant."""
    plant = get_user_plant(plant_id, db, current_user)
    latest = (
        db.query(SensorData)
        .filter(SensorData.plant_id == plant.id)
        .order_by(SensorData.recorded_at.desc())
        .first()
    )
    if not latest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"message": "No sensor data available"},
        )
    return sensor_to_response(latest)


@router.post("", response_model=SensorDataResponse, status_code=status.HTTP_201_CREATED)
def create_sensor_data(
    plant_id: int,
    request: SensorDataRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Record a new sensor reading for a plant.
    Automatically derives and updates the plant's health status
    based on the new sensor readings.
    """
    plant = get_user_plant(plant_id, db, current_user)

    # Create the sensor reading record
    new_reading = SensorData(
        soil_moisture=request.soilMoisture,
        temperature=request.temperature,
        light_level=request.lightLevel,
        humidity=request.humidity,
        plant_id=plant.id,
    )
    db.add(new_reading)

    # Update plant health status based on the new reading
    plant.health_status = derive_health_status(
        request.soilMoisture, request.temperature, request.humidity
    )

    db.commit()
    db.refresh(new_reading)
    return sensor_to_response(new_reading)
