"""
Authentication Router
----------------------
Handles user registration (signup) and login endpoints.
Both endpoints are public and do not require JWT authentication.

Endpoints:
  POST /api/auth/signup  - Register a new user account
  POST /api/auth/login   - Authenticate and receive a JWT token

MSc Cloud DevOpsSec - Automated Plant Care Monitoring System
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import SignupRequest, LoginRequest, AuthResponse, MessageResponse
from app.auth import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/signup", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def signup(request: SignupRequest, db: Session = Depends(get_db)):
    """
    Register a new user account.
    Validates that the username and email are unique before creating
    the account with a BCrypt-hashed password.
    """
    # Check if username already exists
    if db.query(User).filter(User.username == request.username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"message": "Username already exists"},
        )

    # Check if email already exists
    if db.query(User).filter(User.email == request.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"message": "Email already exists"},
        )

    # Create new user with hashed password
    new_user = User(
        username=request.username,
        email=request.email,
        password_hash=hash_password(request.password),
    )
    db.add(new_user)
    db.commit()

    return {"message": "User registered successfully"}


@router.post("/login", response_model=AuthResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate a user and return a JWT access token.
    Looks up the user by username and verifies the password.
    """
    # Find user by username
    user = db.query(User).filter(User.username == request.username).first()
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"message": "Invalid username or password"},
        )

    # Generate JWT token with username as the subject claim
    token = create_access_token(data={"sub": user.username})

    return {"token": token, "username": user.username}
