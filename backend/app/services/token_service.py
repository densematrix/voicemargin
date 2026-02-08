"""Token management service."""
from typing import Dict, Optional
from datetime import datetime, timedelta

from app.config import get_settings
from app.schemas.token import TokenStatus, TokenUseResponse


class TokenService:
    """Service for managing generation tokens.
    
    Note: This is an in-memory implementation for demo purposes.
    In production, this would use a database.
    """
    
    def __init__(self):
        self.settings = get_settings()
        # In-memory storage: device_id -> token data
        self._tokens: Dict[str, dict] = {}
    
    def _get_device_data(self, device_id: str) -> dict:
        """Get or create device data."""
        if device_id not in self._tokens:
            self._tokens[device_id] = {
                "total_tokens": 0,
                "used_tokens": 0,
                "free_trial_count": self.settings.free_trial_count,  # 10 free transcriptions
                "free_trial_used": 0,  # How many free trials used
                "is_unlimited": False,
                "unlimited_until": None,
            }
        return self._tokens[device_id]
    
    def get_token_status(self, device_id: str) -> TokenStatus:
        """Get token status for a device."""
        data = self._get_device_data(device_id)
        
        # Check if unlimited subscription has expired
        is_unlimited = data["is_unlimited"]
        if is_unlimited and data["unlimited_until"]:
            if datetime.now() > data["unlimited_until"]:
                is_unlimited = False
                data["is_unlimited"] = False
        
        # Calculate remaining
        free_remaining = data["free_trial_count"] - data["free_trial_used"]
        paid_remaining = data["total_tokens"] - data["used_tokens"]
        
        if is_unlimited:
            remaining = 999999
        else:
            remaining = free_remaining + paid_remaining
        
        # free_trial_used flag: True if all free trials exhausted
        all_free_used = data["free_trial_used"] >= data["free_trial_count"]
        
        return TokenStatus(
            device_id=device_id,
            total_tokens=data["total_tokens"] + data["free_trial_count"],
            used_tokens=data["used_tokens"] + data["free_trial_used"],
            remaining_tokens=remaining,
            free_trial_used=all_free_used,
            is_unlimited=is_unlimited,
        )
    
    def can_generate(self, device_id: str) -> bool:
        """Check if device can generate (has tokens or free trial)."""
        status = self.get_token_status(device_id)
        
        if status.is_unlimited:
            return True
        
        return status.remaining_tokens > 0
    
    def use_token(self, device_id: str) -> TokenUseResponse:
        """Use a token for generation."""
        data = self._get_device_data(device_id)
        status = self.get_token_status(device_id)
        
        if status.is_unlimited:
            return TokenUseResponse(
                success=True,
                remaining_tokens=999999,
                message="Unlimited access",
            )
        
        # Use free trial if available
        free_remaining = data["free_trial_count"] - data["free_trial_used"]
        if free_remaining > 0:
            data["free_trial_used"] += 1
            new_free_remaining = data["free_trial_count"] - data["free_trial_used"]
            paid_remaining = data["total_tokens"] - data["used_tokens"]
            return TokenUseResponse(
                success=True,
                remaining_tokens=new_free_remaining + paid_remaining,
                message=f"Free trial: {new_free_remaining} free uses remaining",
            )
        
        # Use paid token
        paid_remaining = data["total_tokens"] - data["used_tokens"]
        if paid_remaining > 0:
            data["used_tokens"] += 1
            remaining = data["total_tokens"] - data["used_tokens"]
            return TokenUseResponse(
                success=True,
                remaining_tokens=remaining,
                message=f"{remaining} tokens remaining",
            )
        
        return TokenUseResponse(
            success=False,
            remaining_tokens=0,
            message="No tokens remaining. Please purchase more.",
        )
    
    def add_tokens(self, device_id: str, amount: int) -> TokenStatus:
        """Add tokens to a device (after successful payment)."""
        data = self._get_device_data(device_id)
        data["total_tokens"] += amount
        return self.get_token_status(device_id)
    
    def set_unlimited(self, device_id: str, months: int = 0) -> TokenStatus:
        """Set unlimited access for a device.
        
        Args:
            device_id: Device identifier
            months: Number of months (0 = permanent unlimited)
        """
        data = self._get_device_data(device_id)
        data["is_unlimited"] = True
        if months > 0:
            data["unlimited_until"] = datetime.now() + timedelta(days=30 * months)
        else:
            data["unlimited_until"] = None  # Permanent
        return self.get_token_status(device_id)
    
    def reset_device(self, device_id: str) -> None:
        """Reset device data (for testing)."""
        if device_id in self._tokens:
            del self._tokens[device_id]


# Singleton instance
_token_service: TokenService | None = None


def get_token_service() -> TokenService:
    """Get token service singleton."""
    global _token_service
    if _token_service is None:
        _token_service = TokenService()
    return _token_service
