"""
Plant CRUD Endpoint Tests
---------------------------
Tests for plant management endpoints covering:
  - Creating, reading, updating, and deleting plants
  - Authorization enforcement (401 without token)
  - Resource not found handling (404)
  - Input validation

MSc Cloud DevOpsSec - Automated Plant Care Monitoring System
"""


def test_create_plant(client, auth_headers):
    """Test creating a new plant with valid data."""
    response = client.post("/api/plants", json={
        "name": "Sunflower",
        "species": "Helianthus annuus",
        "location": "Garden",
        "wateringFrequencyDays": 3,
        "healthStatus": "HEALTHY",
    }, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Sunflower"
    assert data["species"] == "Helianthus annuus"
    assert data["wateringFrequencyDays"] == 3


def test_get_plants_empty(client, auth_headers):
    """Test that an authenticated user with no plants gets an empty list."""
    response = client.get("/api/plants", headers=auth_headers)
    assert response.status_code == 200
    assert response.json() == []


def test_get_plants_with_data(client, auth_headers):
    """Test listing plants after creating one."""
    # Create a plant first
    client.post("/api/plants", json={
        "name": "Fern",
        "species": "Polypodiopsida",
        "location": "Bathroom",
        "wateringFrequencyDays": 2,
        "healthStatus": "HEALTHY",
    }, headers=auth_headers)

    response = client.get("/api/plants", headers=auth_headers)
    assert response.status_code == 200
    plants = response.json()
    assert len(plants) == 1
    assert plants[0]["name"] == "Fern"


def test_get_plant_by_id(client, auth_headers):
    """Test retrieving a specific plant by its ID."""
    create_resp = client.post("/api/plants", json={
        "name": "Cactus",
        "species": "Cactaceae",
        "location": "Desk",
        "wateringFrequencyDays": 14,
        "healthStatus": "HEALTHY",
    }, headers=auth_headers)
    plant_id = create_resp.json()["id"]

    response = client.get(f"/api/plants/{plant_id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["name"] == "Cactus"


def test_get_plant_not_found(client, auth_headers):
    """Test that requesting a non-existent plant returns 404."""
    response = client.get("/api/plants/99999", headers=auth_headers)
    assert response.status_code == 404


def test_update_plant(client, auth_headers):
    """Test updating an existing plant's details."""
    create_resp = client.post("/api/plants", json={
        "name": "Old Name",
        "species": "Species A",
        "location": "Room A",
        "wateringFrequencyDays": 5,
        "healthStatus": "HEALTHY",
    }, headers=auth_headers)
    plant_id = create_resp.json()["id"]

    response = client.put(f"/api/plants/{plant_id}", json={
        "name": "New Name",
        "species": "Species B",
        "location": "Room B",
        "wateringFrequencyDays": 7,
        "healthStatus": "NEEDS_ATTENTION",
    }, headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["name"] == "New Name"
    assert response.json()["healthStatus"] == "NEEDS_ATTENTION"


def test_delete_plant(client, auth_headers):
    """Test deleting a plant removes it from the database."""
    create_resp = client.post("/api/plants", json={
        "name": "To Delete",
        "species": "Deleteus",
        "location": "Bin",
        "wateringFrequencyDays": 1,
        "healthStatus": "CRITICAL",
    }, headers=auth_headers)
    plant_id = create_resp.json()["id"]

    # Delete the plant
    response = client.delete(f"/api/plants/{plant_id}", headers=auth_headers)
    assert response.status_code == 204

    # Verify it no longer exists
    response = client.get(f"/api/plants/{plant_id}", headers=auth_headers)
    assert response.status_code == 404


def test_plants_require_auth(client):
    """Test that plant endpoints return 403 without authentication."""
    response = client.get("/api/plants")
    assert response.status_code in [401, 403]


def test_create_plant_invalid_data(client, auth_headers):
    """Test that invalid plant data is rejected with 422."""
    response = client.post("/api/plants", json={
        "name": "X",
        "species": "",
        "location": "",
        "wateringFrequencyDays": 0,
        "healthStatus": "HEALTHY",
    }, headers=auth_headers)
    assert response.status_code == 422
