"""Tests for payment API."""
import pytest
import json
import hmac
import hashlib
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock, AsyncMock

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


@pytest.fixture
def mock_creem_settings():
    """Mock settings with Creem configuration."""
    mock_settings = MagicMock()
    mock_settings.creem_api_key = "creem_test_mock_key"
    mock_settings.creem_webhook_secret = None
    mock_settings.creem_product_id_3 = "prod_test_3"
    mock_settings.creem_product_id_10 = "prod_test_10"
    return mock_settings


class TestCreateCheckout:
    """Tests for POST /api/checkout endpoint."""
    
    def test_checkout_pack_3(self, client, test_device_id, mock_creem_settings):
        """Should create checkout for 3 pack."""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "checkout_url": "https://checkout.creem.io/test",
            "id": "session_test_123",
        }
        
        with patch("app.api.payment_router.get_settings", return_value=mock_creem_settings):
            with patch("httpx.AsyncClient.post", new_callable=AsyncMock, return_value=mock_response):
                response = client.post(
                    "/api/checkout",
                    json={
                        "product_type": "pack_3",
                        "device_id": test_device_id,
                    },
                )
        
        assert response.status_code == 200
        data = response.json()
        assert "checkout_url" in data
        assert "session_id" in data
    
    def test_checkout_pack_10(self, client, test_device_id, mock_creem_settings):
        """Should create checkout for 10 pack."""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "checkout_url": "https://checkout.creem.io/test",
            "id": "session_test_123",
        }
        
        with patch("app.api.payment_router.get_settings", return_value=mock_creem_settings):
            with patch("httpx.AsyncClient.post", new_callable=AsyncMock, return_value=mock_response):
                response = client.post(
                    "/api/checkout",
                    json={
                        "product_type": "pack_10",
                        "device_id": test_device_id,
                    },
                )
        
        assert response.status_code == 200
        data = response.json()
        assert "checkout_url" in data
    
    def test_checkout_invalid_product(self, client, test_device_id):
        """Should reject invalid product type."""
        response = client.post(
            "/api/checkout",
            json={
                "product_type": "invalid_product",
                "device_id": test_device_id,
            },
        )
        
        assert response.status_code == 422
    
    def test_checkout_invalid_device_id(self, client):
        """Should reject invalid device ID."""
        response = client.post(
            "/api/checkout",
            json={
                "product_type": "pack_10",
                "device_id": "short",
            },
        )
        
        assert response.status_code == 422
    
    def test_checkout_with_urls(self, client, test_device_id, mock_creem_settings):
        """Should accept success and cancel URLs."""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "checkout_url": "https://checkout.creem.io/test",
            "id": "session_test_123",
        }
        
        with patch("app.api.payment_router.get_settings", return_value=mock_creem_settings):
            with patch("httpx.AsyncClient.post", new_callable=AsyncMock, return_value=mock_response):
                response = client.post(
                    "/api/checkout",
                    json={
                        "product_type": "pack_10",
                        "device_id": test_device_id,
                        "success_url": "https://example.com/success",
                        "cancel_url": "https://example.com/cancel",
                    },
                )
        
        assert response.status_code == 200
    
    def test_checkout_no_api_key(self, client, test_device_id):
        """Should return 503 when Creem is not configured."""
        mock_settings = MagicMock()
        mock_settings.creem_api_key = None
        
        with patch("app.api.payment_router.get_settings", return_value=mock_settings):
            response = client.post(
                "/api/checkout",
                json={
                    "product_type": "pack_10",
                    "device_id": test_device_id,
                },
            )
        
        assert response.status_code == 503


class TestWebhook:
    """Tests for POST /api/webhook endpoint."""
    
    def test_webhook_checkout_completed(self, client, test_device_id):
        """Should handle checkout.completed event."""
        payload = {
            "eventType": "checkout.completed",
            "object": {
                "metadata": {
                    "device_id": test_device_id,
                    "product_type": "pack_10",
                },
            },
        }
        
        response = client.post("/api/webhook", json=payload)
        
        assert response.status_code == 200
        assert response.json()["received"] == True
        
        # Verify tokens were added
        status_response = client.get(f"/api/tokens/{test_device_id}")
        data = status_response.json()
        assert data["total_tokens"] == 10
    
    def test_webhook_pack_3(self, client, test_device_id):
        """Should handle pack_3 purchase."""
        payload = {
            "eventType": "checkout.completed",
            "object": {
                "metadata": {
                    "device_id": test_device_id,
                    "product_type": "pack_3",
                },
            },
        }
        
        response = client.post("/api/webhook", json=payload)
        
        assert response.status_code == 200
        
        # Verify tokens were added
        status_response = client.get(f"/api/tokens/{test_device_id}")
        data = status_response.json()
        assert data["total_tokens"] == 3
    
    def test_webhook_unknown_event(self, client):
        """Should handle unknown event types gracefully."""
        payload = {
            "eventType": "unknown.event",
            "object": {},
        }
        
        response = client.post("/api/webhook", json=payload)
        
        assert response.status_code == 200
    
    def test_webhook_missing_metadata(self, client):
        """Should handle missing metadata gracefully."""
        payload = {
            "eventType": "checkout.completed",
            "object": {},
        }
        
        response = client.post("/api/webhook", json=payload)
        
        assert response.status_code == 200
    
    def test_webhook_invalid_signature(self, client):
        """Should reject invalid webhook signature when secret is configured."""
        payload = {
            "eventType": "checkout.completed",
            "object": {},
        }
        
        mock_settings = MagicMock()
        mock_settings.creem_webhook_secret = "test_secret"
        
        with patch("app.api.payment_router.get_settings", return_value=mock_settings):
            response = client.post(
                "/api/webhook",
                json=payload,
                headers={"creem-signature": "invalid_signature"},
            )
        
        assert response.status_code == 401
    
    def test_webhook_valid_signature(self, client, test_device_id):
        """Should accept valid webhook signature."""
        payload = {
            "eventType": "checkout.completed",
            "object": {
                "metadata": {
                    "device_id": test_device_id,
                    "product_type": "pack_10",
                },
            },
        }
        
        secret = "test_secret"
        body = json.dumps(payload).encode()
        signature = hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
        
        mock_settings = MagicMock()
        mock_settings.creem_webhook_secret = secret
        
        with patch("app.api.payment_router.get_settings", return_value=mock_settings):
            response = client.post(
                "/api/webhook",
                content=body,
                headers={
                    "Content-Type": "application/json",
                    "creem-signature": signature,
                },
            )
        
        assert response.status_code == 200


class TestGetProducts:
    """Tests for GET /api/products endpoint."""
    
    def test_get_products(self, client):
        """Should return all products."""
        response = client.get("/api/products")
        
        assert response.status_code == 200
        data = response.json()
        assert "products" in data
        assert len(data["products"]) == 2
    
    def test_products_have_required_fields(self, client):
        """Each product should have required fields."""
        response = client.get("/api/products")
        data = response.json()
        
        for product in data["products"]:
            assert "id" in product
            assert "name" in product
            assert "price" in product
            assert "currency" in product
            assert "description" in product
    
    def test_products_have_popular_flag(self, client):
        """Products should have popular flag."""
        response = client.get("/api/products")
        data = response.json()
        
        popular_products = [p for p in data["products"] if p.get("popular")]
        assert len(popular_products) == 1
        assert popular_products[0]["id"] == "pack_10"
