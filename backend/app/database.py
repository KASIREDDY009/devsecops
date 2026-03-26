"""
Database Configuration Module
------------------------------
Sets up the SQLAlchemy engine, session factory, and declarative base.
Provides a dependency function (get_db) for injecting database sessions
into FastAPI route handlers. Supports both PostgreSQL and SQLite.

MSc Cloud DevOpsSec - Automated Plant Care Monitoring System
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

# Build engine kwargs based on database type
engine_kwargs = {}
if settings.DATABASE_URL.startswith("sqlite"):
    # SQLite does not support pool_size or pool_pre_ping
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    # PostgreSQL connection pooling settings
    engine_kwargs["pool_size"] = 20
    engine_kwargs["max_overflow"] = 0
    engine_kwargs["pool_pre_ping"] = True

# Create the SQLAlchemy engine
engine = create_engine(settings.DATABASE_URL, **engine_kwargs)

# Session factory for creating new database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all ORM models
Base = declarative_base()


def get_db():
    """
    FastAPI dependency that provides a database session.
    Ensures the session is properly closed after each request.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
