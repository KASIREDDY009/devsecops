"""
Authentication Endpoint Tests
-------------------------------
Tests for the signup and login endpoints covering:
  - Successful registration
  - Duplicate username/email handling
  - Successful login with valid credentials
  - Failed login with invalid credentials
  - Input validation enforcement

MSc Cloud DevOpsSec - Automated Plant Care Monitoring System
"""


def test_signup_success(client):
    """Test that a new user can register successfully."""
    response = client.post("/api/auth/signup", json={
        "username": "newuser",
        "email": "new@example.com",
        "password": "securepass123",
    })
    assert response.status_code == 201
    assert response.json()["message"] == "User registered successfully"


def test_signup_duplicate_username(client, test_user):
    """Test that registering with an existing username returns 400."""
    response = client.post("/api/auth/signup", json={
        "username": "testuser",
        "email": "different@example.com",
        "password": "securepass123",
    })
    assert response.status_code == 400


def test_signup_duplicate_email(client, test_user):
    """Test that registering with an existing email returns 400."""
    response = client.post("/api/auth/signup", json={
        "username": "anotheruser",
        "email": "test@example.com",
        "password": "securepass123",
    })
    assert response.status_code == 400


def test_signup_invalid_email(client):
    """Test that an invalid email format is rejected."""
    response = client.post("/api/auth/signup", json={
        "username": "newuser",
        "email": "not-an-email",
        "password": "securepass123",
    })
    assert response.status_code == 422


def test_signup_short_password(client):
    """Test that a password shorter than 6 characters is rejected."""
    response = client.post("/api/auth/signup", json={
        "username": "newuser",
        "email": "new@example.com",
        "password": "short",
    })
    assert response.status_code == 422


def test_login_success(client, test_user):
    """Test that a user can log in with valid credentials and receive a token."""
    response = client.post("/api/auth/login", json={
        "username": "testuser",
        "password": "password123",
    })
    assert response.status_code == 200
    data = response.json()
    assert "token" in data
    assert data["username"] == "testuser"


def test_login_wrong_password(client, test_user):
    """Test that login fails with an incorrect password."""
    response = client.post("/api/auth/login", json={
        "username": "testuser",
        "password": "wrongpassword",
    })
    assert response.status_code == 401


def test_login_nonexistent_user(client):
    """Test that login fails for a user that does not exist."""
    response = client.post("/api/auth/login", json={
        "username": "ghost",
        "password": "password123",
    })
    assert response.status_code == 401
