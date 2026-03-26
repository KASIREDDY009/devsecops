"""
Sensor Data Endpoint Tests
----------------------------
Tests for sensor data recording and retrieval covering:
  - Recording new sensor readings
  - Retrieving all readings for a plant
  - Retrieving the latest reading
  - Health status auto-derivation from sensor values
  - Handling missing plant or missing data scenarios

MSc Cloud DevOpsSec - Automated Plant Care Monitoring System
"""

import pytest


@pytest.fixture
def plant_id(client, auth_headers):
    """Create a plant and return its ID for use in sensor data tests."""
    response = client.post("/api/plants", json={
        "name": "Test Plant",
        "species": "Test Species",
        "location": "Lab",
        "wateringFrequencyDays": 5,
        "healthStatus": "HEALTHY",
    }, headers=auth_headers)
    return response.json()["id"]


def test_create_sensor_data(client, auth_headers, plant_id):
    """Test recording a new sensor reading for a plant."""
    response = client.post(f"/api/plants/{plant_id}/sensor-data", json={
        "soilMoisture": 45.5,
        "temperature": 22.0,
        "lightLevel": 5000,
        "humidity": 60.0,
    }, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["soilMoisture"] == 45.5
    assert data["temperature"] == 22.0
    assert data["lightLevel"] == 5000
    assert data["humidity"] == 60.0
    assert "recordedAt" in data


def test_get_sensor_data_list(client, auth_headers, plant_id):
    """Test listing all sensor readings for a plant."""
    # Add two readings
    for moisture in [40.0, 50.0]:
        client.post(f"/api/plants/{plant_id}/sensor-data", json={
            "soilMoisture": moisture,
            "temperature": 22.0,
            "lightLevel": 5000,
            "humidity": 60.0,
        }, headers=auth_headers)

    response = client.get(f"/api/plants/{plant_id}/sensor-data", headers=auth_headers)
    assert response.status_code == 200
    readings = response.json()
    assert len(readings) == 2


def test_get_latest_sensor_data(client, auth_headers, plant_id):
    """Test retrieving the most recent sensor reading."""
    # Add two readings
    client.post(f"/api/plants/{plant_id}/sensor-data", json={
        "soilMoisture": 30.0,
        "temperature": 20.0,
        "lightLevel": 3000,
        "humidity": 50.0,
    }, headers=auth_headers)
    client.post(f"/api/plants/{plant_id}/sensor-data", json={
        "soilMoisture": 55.0,
        "temperature": 25.0,
        "lightLevel": 8000,
        "humidity": 70.0,
    }, headers=auth_headers)

    response = client.get(
        f"/api/plants/{plant_id}/sensor-data/latest", headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    # The latest reading should be the second one added
    assert data["soilMoisture"] == 55.0


def test_get_latest_sensor_data_no_data(client, auth_headers, plant_id):
    """Test that requesting latest data when none exists returns 404."""
    response = client.get(
        f"/api/plants/{plant_id}/sensor-data/latest", headers=auth_headers
    )
    assert response.status_code == 404


def test_sensor_data_for_nonexistent_plant(client, auth_headers):
    """Test that sensor data endpoints return 404 for a non-existent plant."""
    response = client.get("/api/plants/99999/sensor-data", headers=auth_headers)
    assert response.status_code == 404


def test_sensor_data_invalid_values(client, auth_headers, plant_id):
    """Test that out-of-range sensor values are rejected."""
    response = client.post(f"/api/plants/{plant_id}/sensor-data", json={
        "soilMoisture": 150,  # exceeds max of 100
        "temperature": 22.0,
        "lightLevel": 5000,
        "humidity": 60.0,
    }, headers=auth_headers)
    assert response.status_code == 422


def test_critical_sensor_data_updates_health(client, auth_headers, plant_id):
    """Test that extreme sensor values trigger a CRITICAL health status update."""
    # Submit critically low soil moisture reading
    client.post(f"/api/plants/{plant_id}/sensor-data", json={
        "soilMoisture": 5.0,   # critically low
        "temperature": 50.0,   # critically high
        "lightLevel": 5000,
        "humidity": 5.0,       # critically low
    }, headers=auth_headers)

    # Check that the plant health was updated
    response = client.get(f"/api/plants/{plant_id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["healthStatus"] == "CRITICAL"


def test_sensor_data_requires_auth(client, plant_id):
    """Test that sensor data endpoints require authentication."""
    response = client.get(f"/api/plants/{plant_id}/sensor-data")
    assert response.status_code in [401, 403]
