"""
Plants Router
--------------
Provides CRUD endpoints for managing plants belonging to the
authenticated user. All endpoints require a valid JWT token.

Endpoints:
  GET    /api/plants          - List all plants for the current user
  GET    /api/plants/{id}     - Get a specific plant by ID
  POST   /api/plants          - Create a new plant
  PUT    /api/plants/{id}     - Update an existing plant
  DELETE /api/plants/{id}     - Delete a plant

MSc Cloud DevOpsSec - Automated Plant Care Monitoring System
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Plant, HealthStatus, User
from app.schemas import PlantRequest, PlantResponse
from app.auth import get_current_user

router = APIRouter(prefix="/api/plants", tags=["Plants"])


def plant_to_response(plant: Plant) -> dict:
    """Convert a Plant ORM model to the frontend-expected response format."""
    return {
        "id": plant.id,
        "name": plant.name,
        "species": plant.species,
        "location": plant.location,
        "wateringFrequencyDays": plant.watering_frequency_days,
        "healthStatus": plant.health_status.value if plant.health_status else "HEALTHY",
        "createdAt": plant.created_at,
    }


@router.get("", response_model=List[PlantResponse])
def get_plants(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve all plants belonging to the authenticated user."""
    plants = db.query(Plant).filter(Plant.owner_id == current_user.id).all()
    return [plant_to_response(p) for p in plants]


@router.get("/{plant_id}", response_model=PlantResponse)
def get_plant(
    plant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve a single plant by ID. Must belong to the current user."""
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
    return plant_to_response(plant)


@router.post("", response_model=PlantResponse, status_code=status.HTTP_201_CREATED)
def create_plant(
    request: PlantRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new plant for the authenticated user."""
    new_plant = Plant(
        name=request.name,
        species=request.species,
        location=request.location,
        watering_frequency_days=request.wateringFrequencyDays,
        health_status=HealthStatus(request.healthStatus),
        owner_id=current_user.id,
    )
    db.add(new_plant)
    db.commit()
    db.refresh(new_plant)
    return plant_to_response(new_plant)


@router.put("/{plant_id}", response_model=PlantResponse)
def update_plant(
    plant_id: int,
    request: PlantRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update an existing plant. Must belong to the current user."""
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

    plant.name = request.name
    plant.species = request.species
    plant.location = request.location
    plant.watering_frequency_days = request.wateringFrequencyDays
    plant.health_status = HealthStatus(request.healthStatus)
    db.commit()
    db.refresh(plant)
    return plant_to_response(plant)


@router.delete("/{plant_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_plant(
    plant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a plant and its associated sensor data. Must belong to the current user."""
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

    db.delete(plant)
    db.commit()
