"""
FastAPI Application Entry Point
---------------------------------
Initialises the FastAPI application, configures CORS middleware,
registers API routers, and creates the database tables on startup.
Seeds a demo account with sample data so the examiner can log in
without needing to register.

The application serves the PlantCare Monitoring System backend,
providing RESTful endpoints for user authentication, plant management,
and sensor data recording.

MSc Cloud DevOpsSec - Automated Plant Care Monitoring System
"""

from datetime import datetime, timezone
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.models import User, Plant, SensorData, HealthStatus
from app.auth import hash_password
from app.routers import auth, plants, sensor_data

# Create the FastAPI application instance
app = FastAPI(
    title=settings.APP_NAME,
    description="Backend API for the Automated Plant Care Monitoring System",
    version="1.0.0",
)

# Configure CORS to allow the React frontend to communicate with the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to the frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers for each feature module
app.include_router(auth.router)
app.include_router(plants.router)
app.include_router(sensor_data.router)


def seed_demo_data():
    """
    Seed the database with a demo user account and sample plant data.
    This allows the examiner to log in and explore the application
    without needing to create an account. Runs only if the demo user
    does not already exist.
    """
    db = SessionLocal()
    try:
        # Check if demo user already exists
        existing = db.query(User).filter(User.username == "examiner").first()
        if existing:
            return

        # Create the demo user account
        demo_user = User(
            username="examiner",
            email="examiner@nci.ie",
            password_hash=hash_password("PlantCare2024"),
        )
        db.add(demo_user)
        db.flush()

        # Create sample plants with different health statuses
        plants_data = [
            {
                "name": "Monstera Deliciosa",
                "species": "Monstera deliciosa",
                "location": "Living Room",
                "watering_frequency_days": 7,
                "health_status": HealthStatus.HEALTHY,
            },
            {
                "name": "Peace Lily",
                "species": "Spathiphyllum wallisii",
                "location": "Office Desk",
                "watering_frequency_days": 5,
                "health_status": HealthStatus.NEEDS_ATTENTION,
            },
            {
                "name": "Snake Plant",
                "species": "Dracaena trifasciata",
                "location": "Bedroom Window",
                "watering_frequency_days": 14,
                "health_status": HealthStatus.HEALTHY,
            },
            {
                "name": "Aloe Vera",
                "species": "Aloe barbadensis miller",
                "location": "Kitchen Counter",
                "watering_frequency_days": 21,
                "health_status": HealthStatus.CRITICAL,
            },
        ]

        created_plants = []
        for pdata in plants_data:
            plant = Plant(owner_id=demo_user.id, **pdata)
            db.add(plant)
            created_plants.append(plant)

        db.flush()

        # Add sample sensor readings for each plant
        sensor_readings = [
            # Monstera - healthy readings
            {"soil_moisture": 55.0, "temperature": 22.5, "light_level": 8000, "humidity": 65.0},
            {"soil_moisture": 50.0, "temperature": 23.0, "light_level": 7500, "humidity": 62.0},
            # Peace Lily - needs attention
            {"soil_moisture": 25.0, "temperature": 28.0, "light_level": 3000, "humidity": 40.0},
            {"soil_moisture": 20.0, "temperature": 30.0, "light_level": 2500, "humidity": 35.0},
            # Snake Plant - healthy
            {"soil_moisture": 35.0, "temperature": 21.0, "light_level": 5000, "humidity": 50.0},
            # Aloe Vera - critical readings
            {"soil_moisture": 5.0, "temperature": 38.0, "light_level": 15000, "humidity": 8.0},
        ]

        plant_indices = [0, 0, 1, 1, 2, 3]
        for i, reading in enumerate(sensor_readings):
            sensor = SensorData(
                plant_id=created_plants[plant_indices[i]].id,
                **reading,
            )
            db.add(sensor)

        db.commit()
    except Exception:
        db.rollback()
    finally:
        db.close()


@app.on_event("startup")
def on_startup():
    """Create database tables on startup and seed demo data for the examiner."""
    try:
        Base.metadata.create_all(bind=engine)
        seed_demo_data()
    except Exception:
        # Database may not be available during testing; tables are
        # created by the test fixtures using the in-memory SQLite engine.
        pass


@app.get("/actuator/health")
def health_check():
    """Health check endpoint for monitoring and load balancer probes."""
    return {"status": "UP", "application": settings.APP_NAME}
