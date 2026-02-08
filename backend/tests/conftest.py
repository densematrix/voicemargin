"""Test configuration and fixtures."""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch

from app.main import app
from app.services.token_service import TokenService, get_token_service
from app.services.excuse_service import ExcuseService


@pytest.fixture
def client():
    """Create a test client."""
    return TestClient(app)


@pytest.fixture
def test_device_id():
    """Return a valid test device ID."""
    return "test_device_123456789"


@pytest.fixture
def token_service():
    """Get a fresh token service instance."""
    service = TokenService()
    return service


@pytest.fixture
def mock_llm_response():
    """Mock LLM response for excuse generation."""
    return '''[
        {"text": "Test excuse 1", "tone": "sincere", "tip": "Say it calmly"},
        {"text": "Test excuse 2", "tone": "apologetic", "tip": "Look sorry"},
        {"text": "Test excuse 3", "tone": "dramatic", "tip": "Add emotion"}
    ]'''


@pytest.fixture
def reset_services():
    """Reset singleton services after each test."""
    import app.services.token_service as ts
    import app.services.excuse_service as es
    
    ts._token_service = None
    es._excuse_service = None
    yield
    ts._token_service = None
    es._excuse_service = None
