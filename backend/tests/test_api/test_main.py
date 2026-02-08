"""Tests for main application endpoints."""
import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    return TestClient(app)


class TestHealthEndpoint:
    """Tests for /health endpoint."""
    
    def test_health_returns_200(self, client):
        """Health check should return 200."""
        response = client.get("/health")
        assert response.status_code == 200
    
    def test_health_returns_status_healthy(self, client):
        """Health check should return healthy status."""
        response = client.get("/health")
        data = response.json()
        assert data["status"] == "healthy"
    
    def test_health_returns_service_name(self, client):
        """Health check should return service name."""
        response = client.get("/health")
        data = response.json()
        assert "service" in data
        assert data["service"] == "AI Excuse Generator"


class TestRootEndpoint:
    """Tests for / endpoint."""
    
    def test_root_returns_200(self, client):
        """Root endpoint should return 200."""
        response = client.get("/")
        assert response.status_code == 200
    
    def test_root_returns_app_name(self, client):
        """Root endpoint should return app name."""
        response = client.get("/")
        data = response.json()
        assert data["name"] == "AI Excuse Generator"
    
    def test_root_returns_version(self, client):
        """Root endpoint should return version."""
        response = client.get("/")
        data = response.json()
        assert "version" in data
        assert data["version"] == "1.0.0"
    
    def test_root_returns_status(self, client):
        """Root endpoint should return running status."""
        response = client.get("/")
        data = response.json()
        assert data["status"] == "running"
