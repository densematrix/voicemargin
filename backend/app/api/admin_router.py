"""Admin API endpoints."""
from fastapi import APIRouter, HTTPException, status, Header
from typing import Optional
import os

from app.schemas.token import TokenStatus
from app.services.token_service import get_token_service

router = APIRouter()

# Simple admin key for demo - in production use proper auth
ADMIN_KEY = os.getenv("ADMIN_KEY", "voicemargin-admin-2026")


def verify_admin(x_admin_key: Optional[str] = Header(None)):
    if x_admin_key != ADMIN_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin key",
        )


@router.post("/admin/set-unlimited/{device_id}", response_model=TokenStatus)
async def set_unlimited(
    device_id: str,
    months: int = 0,
    x_admin_key: Optional[str] = Header(None),
) -> TokenStatus:
    """Set unlimited access for a device.
    
    Args:
        device_id: Device identifier
        months: Number of months (0 = permanent)
        x_admin_key: Admin key in header
    """
    verify_admin(x_admin_key)
    
    token_service = get_token_service()
    return token_service.set_unlimited(device_id, months)


@router.post("/admin/add-tokens/{device_id}", response_model=TokenStatus)
async def add_tokens(
    device_id: str,
    amount: int = 100,
    x_admin_key: Optional[str] = Header(None),
) -> TokenStatus:
    """Add tokens to a device.
    
    Args:
        device_id: Device identifier
        amount: Number of tokens to add
        x_admin_key: Admin key in header
    """
    verify_admin(x_admin_key)
    
    token_service = get_token_service()
    return token_service.add_tokens(device_id, amount)
