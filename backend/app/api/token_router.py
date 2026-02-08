"""Token management API endpoints."""
from fastapi import APIRouter, HTTPException, status

from app.schemas.token import TokenStatus
from app.services.token_service import get_token_service

router = APIRouter()


@router.get("/tokens/{device_id}", response_model=TokenStatus)
async def get_token_status(device_id: str) -> TokenStatus:
    """Get token status for a device."""
    if len(device_id) < 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid device_id",
        )
    
    token_service = get_token_service()
    return token_service.get_token_status(device_id)


@router.get("/tokens/{device_id}/can-generate")
async def can_generate(device_id: str) -> dict:
    """Check if a device can generate excuses."""
    if len(device_id) < 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid device_id",
        )
    
    token_service = get_token_service()
    can_gen = token_service.can_generate(device_id)
    status_info = token_service.get_token_status(device_id)
    
    return {
        "can_generate": can_gen,
        "free_trial_available": not status_info.free_trial_used,
        "tokens_remaining": status_info.remaining_tokens,
        "is_unlimited": status_info.is_unlimited,
    }
