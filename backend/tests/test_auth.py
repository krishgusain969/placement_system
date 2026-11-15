"""
Tests for authentication endpoints.
"""
from fastapi import status


def test_login_success(client):
    response = client.post("/auth/login", json={
        "email": "admin@test.edu",
        "password": "password123",
    })
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["role"] == "admin"


def test_login_failure(client):
    response = client.post("/auth/login", json={
        "email": "admin@test.edu",
        "password": "wrongpassword",
    })
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert "Invalid credentials" in response.json()["detail"]


def test_root(client):
    response = client.get("/")
    assert response.status_code == status.HTTP_200_OK
    assert "Placement Management System API" in response.json()["message"]


def test_health(client):
    response = client.get("/health")
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["status"] == "healthy"
