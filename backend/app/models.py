"""
SQLAlchemy ORM Models
----------------------
Defines the database schema for the PlantCare application.
Three core models:
  - User: stores credentials and profile data (BCrypt-hashed passwords)
  - Plant: represents a monitored plant belonging to a user
  - SensorData: immutable sensor readings linked to a specific plant

MSc Cloud DevOpsSec - Automated Plant Care Monitoring System
"""

from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Float, DateTime, ForeignKey, Enum
)
from sqlalchemy.orm import relationship
import enum
from app.database import Base


class HealthStatus(str, enum.Enum):
    """Enumeration of possible plant health states."""
    HEALTHY = "HEALTHY"
    NEEDS_ATTENTION = "NEEDS_ATTENTION"
    CRITICAL = "CRITICAL"


class User(Base):
    """User model - stores authentication credentials and profile."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # One-to-many relationship: a user can have many plants
    plants = relationship("Plant", back_populates="owner", cascade="all, delete-orphan")


class Plant(Base):
    """Plant model - represents a monitored plant belonging to a user."""
    __tablename__ = "plants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    species = Column(String(100), nullable=False)
    location = Column(String(100), nullable=False)
    watering_frequency_days = Column(Integer, nullable=False)
    health_status = Column(
        Enum(HealthStatus),
        default=HealthStatus.HEALTHY,
        nullable=False,
    )
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Foreign key linking this plant to its owner
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Relationships
    owner = relationship("User", back_populates="plants")
    sensor_data = relationship(
        "SensorData", back_populates="plant", cascade="all, delete-orphan"
    )


class SensorData(Base):
    """SensorData model - immutable sensor readings for a plant."""
    __tablename__ = "sensor_data"

    id = Column(Integer, primary_key=True, index=True)
    soil_moisture = Column(Float, nullable=False)   # 0-100 percentage
    temperature = Column(Float, nullable=False)      # -40 to 60 Celsius
    light_level = Column(Float, nullable=False)      # 0-100000 lux
    humidity = Column(Float, nullable=False)          # 0-100 percentage
    recorded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Foreign key linking this reading to a plant
    plant_id = Column(Integer, ForeignKey("plants.id"), nullable=False)

    # Relationship back to the parent plant
    plant = relationship("Plant", back_populates="sensor_data")
