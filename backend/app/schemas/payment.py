"""Payment-related schemas."""
from pydantic import BaseModel, Field
from typing import Optional, Literal


class CheckoutRequest(BaseModel):
    """Request to create a checkout session."""
    product_type: Literal["pack_3", "pack_10"] = Field(..., description="Product to purchase")
    device_id: str = Field(..., min_length=10, max_length=100)
    success_url: Optional[str] = None
    cancel_url: Optional[str] = None


class CheckoutResponse(BaseModel):
    """Response with checkout URL."""
    checkout_url: str
    session_id: str


class WebhookPayload(BaseModel):
    """Creem webhook payload."""
    event_type: str
    data: dict
