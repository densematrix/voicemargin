"""Tests for excuse generation API."""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock, MagicMock

from app.main import app
from app.schemas.excuse import Excuse
from app.services.token_service import get_token_service


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
    import app.services.excuse_service as es
    ts._token_service = None
    es._excuse_service = None
    yield
    ts._token_service = None
    es._excuse_service = None


class TestGenerateExcuses:
    """Tests for POST /api/generate endpoint."""
    
    def test_generate_with_free_trial(self, client, test_device_id):
        """Should allow generation with free trial."""
        mock_excuses = [
            Excuse(text="Test excuse 1", tone="sincere", tip="Stay calm"),
            Excuse(text="Test excuse 2", tone="apologetic", tip="Look sorry"),
            Excuse(text="Test excuse 3", tone="dramatic", tip="Be emotional"),
        ]
        
        with patch(
            "app.api.excuse_router.get_excuse_service"
        ) as mock_get_service:
            mock_service = MagicMock()
            mock_service.generate_excuses = AsyncMock(return_value=mock_excuses)
            mock_get_service.return_value = mock_service
            
            response = client.post(
                "/api/generate",
                json={
                    "category": "late",
                    "urgency": "normal",
                    "device_id": test_device_id,
                },
            )
        
        assert response.status_code == 200
        data = response.json()
        assert "excuses" in data
        assert len(data["excuses"]) == 3
    
    def test_generate_without_tokens_after_free_trial(self, client, test_device_id):
        """Should reject generation when no tokens and free trial used."""
        # Use free trial first
        mock_excuses = [
            Excuse(text="Test", tone="test", tip="test"),
        ]
        
        with patch(
            "app.api.excuse_router.get_excuse_service"
        ) as mock_get_service:
            mock_service = MagicMock()
            mock_service.generate_excuses = AsyncMock(return_value=mock_excuses)
            mock_get_service.return_value = mock_service
            
            # First call uses free trial
            client.post(
                "/api/generate",
                json={
                    "category": "late",
                    "urgency": "normal",
                    "device_id": test_device_id,
                },
            )
            
            # Second call should fail
            response = client.post(
                "/api/generate",
                json={
                    "category": "late",
                    "urgency": "normal",
                    "device_id": test_device_id,
                },
            )
        
        assert response.status_code == 402
    
    def test_generate_with_invalid_device_id(self, client):
        """Should reject invalid device ID."""
        response = client.post(
            "/api/generate",
            json={
                "category": "late",
                "urgency": "normal",
                "device_id": "short",  # Too short
            },
        )
        
        assert response.status_code == 422
    
    def test_generate_with_invalid_category(self, client, test_device_id):
        """Should reject invalid category."""
        response = client.post(
            "/api/generate",
            json={
                "category": "invalid_category",
                "urgency": "normal",
                "device_id": test_device_id,
            },
        )
        
        assert response.status_code == 422
    
    def test_generate_with_invalid_urgency(self, client, test_device_id):
        """Should reject invalid urgency."""
        response = client.post(
            "/api/generate",
            json={
                "category": "late",
                "urgency": "invalid_urgency",
                "device_id": test_device_id,
            },
        )
        
        assert response.status_code == 422
    
    def test_generate_with_context(self, client, test_device_id):
        """Should accept optional context."""
        mock_excuses = [
            Excuse(text="Test", tone="test", tip="test"),
        ]
        
        with patch(
            "app.api.excuse_router.get_excuse_service"
        ) as mock_get_service:
            mock_service = MagicMock()
            mock_service.generate_excuses = AsyncMock(return_value=mock_excuses)
            mock_get_service.return_value = mock_service
            
            response = client.post(
                "/api/generate",
                json={
                    "category": "late",
                    "urgency": "urgent",
                    "device_id": test_device_id,
                    "context": "Traffic was terrible",
                    "language": "en",
                },
            )
        
        assert response.status_code == 200
    
    def test_generate_all_categories(self, client, test_device_id):
        """Should accept all valid categories."""
        categories = ["late", "sick_leave", "decline", "forgot", "deadline", "meeting", "homework", "other"]
        
        mock_excuses = [
            Excuse(text="Test", tone="test", tip="test"),
        ]
        
        for category in categories:
            with patch(
                "app.api.excuse_router.get_excuse_service"
            ) as mock_get_service:
                mock_service = MagicMock()
                mock_service.generate_excuses = AsyncMock(return_value=mock_excuses)
                mock_get_service.return_value = mock_service
                
                # Reset token service for each category test
                import app.services.token_service as ts
                ts._token_service = None
                
                response = client.post(
                    "/api/generate",
                    json={
                        "category": category,
                        "urgency": "normal",
                        "device_id": f"{test_device_id}_{category}",
                    },
                )
                
                assert response.status_code == 200, f"Failed for category: {category}"
    
    def test_generate_all_urgency_levels(self, client, test_device_id):
        """Should accept all valid urgency levels."""
        levels = ["normal", "urgent", "extreme"]
        
        mock_excuses = [
            Excuse(text="Test", tone="test", tip="test"),
        ]
        
        for level in levels:
            with patch(
                "app.api.excuse_router.get_excuse_service"
            ) as mock_get_service:
                mock_service = MagicMock()
                mock_service.generate_excuses = AsyncMock(return_value=mock_excuses)
                mock_get_service.return_value = mock_service
                
                # Reset token service for each level test
                import app.services.token_service as ts
                ts._token_service = None
                
                response = client.post(
                    "/api/generate",
                    json={
                        "category": "late",
                        "urgency": level,
                        "device_id": f"{test_device_id}_{level}",
                    },
                )
                
                assert response.status_code == 200, f"Failed for urgency: {level}"
    
    def test_generate_service_error(self, client, test_device_id):
        """Should handle service errors gracefully."""
        with patch(
            "app.api.excuse_router.get_excuse_service"
        ) as mock_get_service:
            mock_service = MagicMock()
            mock_service.generate_excuses = AsyncMock(
                side_effect=Exception("LLM service unavailable")
            )
            mock_get_service.return_value = mock_service
            
            response = client.post(
                "/api/generate",
                json={
                    "category": "late",
                    "urgency": "normal",
                    "device_id": test_device_id,
                },
            )
        
        assert response.status_code == 503


class TestCategories:
    """Tests for GET /api/categories endpoint."""
    
    def test_get_categories(self, client):
        """Should return all categories."""
        response = client.get("/api/categories")
        
        assert response.status_code == 200
        data = response.json()
        assert "categories" in data
        assert len(data["categories"]) == 8
    
    def test_categories_have_required_fields(self, client):
        """Each category should have id, name, icon."""
        response = client.get("/api/categories")
        data = response.json()
        
        for cat in data["categories"]:
            assert "id" in cat
            assert "name" in cat
            assert "icon" in cat


class TestUrgencyLevels:
    """Tests for GET /api/urgency-levels endpoint."""
    
    def test_get_urgency_levels(self, client):
        """Should return all urgency levels."""
        response = client.get("/api/urgency-levels")
        
        assert response.status_code == 200
        data = response.json()
        assert "levels" in data
        assert len(data["levels"]) == 3
    
    def test_urgency_levels_have_required_fields(self, client):
        """Each level should have id, name, description, icon."""
        response = client.get("/api/urgency-levels")
        data = response.json()
        
        for level in data["levels"]:
            assert "id" in level
            assert "name" in level
            assert "description" in level
            assert "icon" in level
