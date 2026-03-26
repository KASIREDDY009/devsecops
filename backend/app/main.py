"""
FastAPI Application Entry Point
---------------------------------
Initialises the FastAPI application, configures CORS middleware,
registers API routers, and creates the database tables on startup.

The application serves the PlantCare Monitoring System backend,
providing RESTful endpoints for user authentication, plant management,
and sensor data recording.

MSc Cloud DevOpsSec - Automated Plant Care Monitoring System
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
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


@app.on_event("startup")
def on_startup():
    """Create database tables on application startup if they do not exist."""
    try:
        Base.metadata.create_all(bind=engine)
    except Exception:
        # Database may not be available during testing; tables are
        # created by the test fixtures using the in-memory SQLite engine.
        pass


@app.get("/actuator/health")
def health_check():
    """Health check endpoint for monitoring and load balancer probes."""
    return {"status": "UP", "application": settings.APP_NAME}
