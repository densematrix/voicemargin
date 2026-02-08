"""Tests for token service."""
import pytest
from datetime import datetime, timedelta
from unittest.mock import patch

from app.services.token_service import TokenService, get_token_service


@pytest.fixture
def token_service():
    return TokenService()


@pytest.fixture
def test_device_id():
    return "test_device_123456789"


class TestTokenService:
    """Tests for TokenService class."""
    
    def test_new_device_has_no_tokens(self, token_service, test_device_id):
        """New device should have zero tokens."""
        status = token_service.get_token_status(test_device_id)
        
        assert status.total_tokens == 0
        assert status.used_tokens == 0
        assert status.remaining_tokens == 0
    
    def test_new_device_has_free_trial(self, token_service, test_device_id):
        """New device should have unused free trial."""
        status = token_service.get_token_status(test_device_id)
        
        assert status.free_trial_used == False
    
    def test_new_device_not_unlimited(self, token_service, test_device_id):
        """New device should not be unlimited."""
        status = token_service.get_token_status(test_device_id)
        
        assert status.is_unlimited == False
    
    def test_can_generate_with_free_trial(self, token_service, test_device_id):
        """Device with free trial should be able to generate."""
        assert token_service.can_generate(test_device_id) == True
    
    def test_use_free_trial(self, token_service, test_device_id):
        """Using token should consume free trial first."""
        result = token_service.use_token(test_device_id)
        
        assert result.success == True
        assert "Free trial" in result.message
        
        status = token_service.get_token_status(test_device_id)
        assert status.free_trial_used == True
    
    def test_cannot_generate_after_free_trial_without_tokens(
        self, token_service, test_device_id
    ):
        """Cannot generate after free trial without tokens."""
        token_service.use_token(test_device_id)  # Use free trial
        
        assert token_service.can_generate(test_device_id) == False
    
    def test_add_tokens(self, token_service, test_device_id):
        """Should be able to add tokens."""
        status = token_service.add_tokens(test_device_id, 10)
        
        assert status.total_tokens == 10
        assert status.remaining_tokens == 10
    
    def test_use_paid_tokens(self, token_service, test_device_id):
        """Should be able to use paid tokens."""
        token_service.use_token(test_device_id)  # Use free trial
        token_service.add_tokens(test_device_id, 5)
        
        result = token_service.use_token(test_device_id)
        
        assert result.success == True
        assert result.remaining_tokens == 4
    
    def test_cannot_use_when_no_tokens(self, token_service, test_device_id):
        """Should fail when no tokens remaining."""
        token_service.use_token(test_device_id)  # Use free trial
        
        result = token_service.use_token(test_device_id)
        
        assert result.success == False
        assert "No tokens remaining" in result.message
    
    def test_set_unlimited(self, token_service, test_device_id):
        """Should be able to set unlimited access."""
        status = token_service.set_unlimited(test_device_id)
        
        assert status.is_unlimited == True
        assert status.remaining_tokens == 999999
    
    def test_unlimited_can_always_generate(self, token_service, test_device_id):
        """Unlimited users can always generate."""
        token_service.set_unlimited(test_device_id)
        
        for _ in range(10):
            result = token_service.use_token(test_device_id)
            assert result.success == True
    
    def test_unlimited_returns_high_remaining(self, token_service, test_device_id):
        """Unlimited users should see high remaining tokens."""
        token_service.set_unlimited(test_device_id)
        result = token_service.use_token(test_device_id)
        
        assert result.remaining_tokens == 999999
    
    def test_unlimited_expiration(self, token_service, test_device_id):
        """Unlimited should expire after set duration."""
        token_service.set_unlimited(test_device_id, months=1)
        
        # Manually expire the subscription
        data = token_service._get_device_data(test_device_id)
        data["unlimited_until"] = datetime.now() - timedelta(days=1)
        
        status = token_service.get_token_status(test_device_id)
        assert status.is_unlimited == False
    
    def test_reset_device(self, token_service, test_device_id):
        """Should be able to reset device data."""
        token_service.add_tokens(test_device_id, 10)
        token_service.use_token(test_device_id)
        
        token_service.reset_device(test_device_id)
        
        status = token_service.get_token_status(test_device_id)
        assert status.total_tokens == 0
        assert status.free_trial_used == False
    
    def test_reset_nonexistent_device(self, token_service, test_device_id):
        """Resetting nonexistent device should not error."""
        token_service.reset_device("nonexistent_device_12345")
        # No exception should be raised
    
    def test_multiple_devices_independent(self, token_service):
        """Multiple devices should have independent data."""
        device1 = "device_1_123456789"
        device2 = "device_2_123456789"
        
        token_service.add_tokens(device1, 10)
        
        status1 = token_service.get_token_status(device1)
        status2 = token_service.get_token_status(device2)
        
        assert status1.total_tokens == 10
        assert status2.total_tokens == 0


class TestGetTokenServiceSingleton:
    """Tests for get_token_service singleton."""
    
    def test_returns_same_instance(self):
        """Should return the same instance."""
        import app.services.token_service as ts
        ts._token_service = None  # Reset
        
        service1 = get_token_service()
        service2 = get_token_service()
        
        assert service1 is service2
        
        ts._token_service = None  # Clean up
