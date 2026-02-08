"""Token-related schemas."""
from pydantic import BaseModel, Field
from typing import Optional


class TokenStatus(BaseModel):
    """Token status for a device."""
    device_id: str
    total_tokens: int = Field(default=0, description="Total tokens purchased")
    used_tokens: int = Field(default=0, description="Tokens used")
    remaining_tokens: int = Field(default=0, description="Remaining tokens")
    free_trial_used: bool = Field(default=False, description="Whether free trial has been used")
    is_unlimited: bool = Field(default=False, description="Whether user has unlimited access")


class TokenUseRequest(BaseModel):
    """Request to use a token."""
    device_id: str = Field(..., min_length=10, max_length=100)


class TokenUseResponse(BaseModel):
    """Response after using a token."""
    success: bool
    remaining_tokens: int
    message: str = ""
