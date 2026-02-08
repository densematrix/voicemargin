"""Tests for token management API."""
import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def test_device_id():
    return "test_device_123456789"


@pytest.fixture(autouse=True)
def reset_services():
    """Reset singleton services after each test."""
    import app.services.token_service as ts
    ts._token_service = None
    yield
    ts._token_service = None


class TestGetTokenStatus:
    """Tests for GET /api/tokens/{device_id} endpoint."""
    
    def test_get_status_new_device(self, client, test_device_id):
        """New device should have zero tokens and unused free trial."""
        response = client.get(f"/api/tokens/{test_device_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["device_id"] == test_device_id
        assert data["total_tokens"] == 0
        assert data["used_tokens"] == 0
        assert data["remaining_tokens"] == 0
        assert data["free_trial_used"] == False
        assert data["is_unlimited"] == False
    
    def test_get_status_invalid_device_id(self, client):
        """Should reject invalid device ID (too short)."""
        response = client.get("/api/tokens/short")
        
        assert response.status_code == 400
        assert "Invalid device_id" in response.json()["detail"]
    
    def test_get_status_empty_device_id(self, client):
        """Should handle empty device ID."""
        response = client.get("/api/tokens/")
        
        # FastAPI returns 404 for missing path parameter
        assert response.status_code == 404


class TestCanGenerate:
    """Tests for GET /api/tokens/{device_id}/can-generate endpoint."""
    
    def test_can_generate_new_device(self, client, test_device_id):
        """New device should be able to generate (free trial)."""
        response = client.get(f"/api/tokens/{test_device_id}/can-generate")
        
        assert response.status_code == 200
        data = response.json()
        assert data["can_generate"] == True
        assert data["free_trial_available"] == True
    
    def test_can_generate_invalid_device_id(self, client):
        """Should reject invalid device ID."""
        response = client.get("/api/tokens/short/can-generate")
        
        assert response.status_code == 400
    
    def test_can_generate_returns_token_info(self, client, test_device_id):
        """Should return token information."""
        response = client.get(f"/api/tokens/{test_device_id}/can-generate")
        
        data = response.json()
        assert "can_generate" in data
        assert "free_trial_available" in data
        assert "tokens_remaining" in data
        assert "is_unlimited" in data
