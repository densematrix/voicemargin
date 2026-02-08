"""Payment API endpoints (Creem integration)."""
import hmac
import hashlib
import httpx
from fastapi import APIRouter, HTTPException, status, Request, Header
from typing import Optional

from app.schemas.payment import CheckoutRequest, CheckoutResponse
from app.services.token_service import get_token_service
from app.config import get_settings

router = APIRouter()


# Product configurations
PRODUCTS = {
    "pack_3": {"tokens": 3, "price": 2.99, "name": "3 Excuses Pack"},
    "pack_10": {"tokens": 10, "price": 6.99, "name": "10 Excuses Pack"},
}


def get_creem_api_base(api_key: str) -> str:
    """Use test API for test keys, production API for live keys."""
    if api_key and api_key.startswith("creem_test_"):
        return "https://test-api.creem.io/v1"
    return "https://api.creem.io/v1"


def get_creem_product_id(settings, product_type: str) -> Optional[str]:
    """Get Creem product ID for a given product type."""
    product_id_map = {
        "pack_3": settings.creem_product_id_3,
        "pack_10": settings.creem_product_id_10,
    }
    return product_id_map.get(product_type)


@router.post("/checkout", response_model=CheckoutResponse)
async def create_checkout(request: CheckoutRequest) -> CheckoutResponse:
    """Create a Creem checkout session."""
    settings = get_settings()
    
    if request.product_type not in PRODUCTS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid product type: {request.product_type}",
        )
    
    if not settings.creem_api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Payment system is not configured. Please contact support.",
        )
    
    creem_product_id = get_creem_product_id(settings, request.product_type)
    if not creem_product_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Product {request.product_type} not configured in Creem",
        )
    
    product = PRODUCTS[request.product_type]
    
    # Call Creem API to create checkout session
    try:
        async with httpx.AsyncClient() as client:
            payload = {
                "product_id": creem_product_id,
                "success_url": request.success_url or "https://ai-excuse-generator.densematrix.ai/payment/success",
                "metadata": {
                    "product_type": request.product_type,
                    "device_id": request.device_id,
                    "tokens": str(product["tokens"]),
                },
            }
            
            response = await client.post(
                f"{get_creem_api_base(settings.creem_api_key)}/checkouts",
                headers={
                    "Content-Type": "application/json",
                    "x-api-key": settings.creem_api_key,
                },
                json=payload,
                timeout=30.0,
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"Creem API error: {response.text}",
                )
            
            data = response.json()
            return CheckoutResponse(
                checkout_url=data["checkout_url"],
                session_id=data["id"],
            )
            
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Payment service error: {str(e)}",
        )


@router.post("/webhook")
async def handle_webhook(
    request: Request,
    creem_signature: Optional[str] = Header(None, alias="creem-signature"),
):
    """Handle Creem webhook for payment completion."""
    settings = get_settings()
    body = await request.body()
    
    # Verify webhook signature
    if settings.creem_webhook_secret and creem_signature:
        expected_signature = hmac.new(
            settings.creem_webhook_secret.encode(),
            body,
            hashlib.sha256,
        ).hexdigest()
        
        if not hmac.compare_digest(expected_signature, creem_signature):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid webhook signature",
            )
    
    payload = await request.json()
    event_type = payload.get("eventType", "")
    obj = payload.get("object", {})
    metadata = obj.get("metadata", {})
    
    if event_type == "checkout.completed":
        device_id = metadata.get("device_id")
        product_type = metadata.get("product_type")
        
        if device_id and product_type:
            token_service = get_token_service()
            product = PRODUCTS.get(product_type)
            
            if product:
                if product_type == "unlimited":
                    token_service.set_unlimited(device_id)
                else:
                    token_service.add_tokens(device_id, product["tokens"])
    
    return {"received": True}


@router.get("/products")
async def get_products():
    """Get available products with pricing."""
    return {
        "products": [
            {
                "id": "pack_3",
                "name": "3 Excuses Pack",
                "tokens": 3,
                "price": 2.99,
                "currency": "USD",
                "description": "Perfect for trying out",
                "popular": False,
            },
            {
                "id": "pack_10",
                "name": "10 Excuses Pack",
                "tokens": 10,
                "price": 6.99,
                "currency": "USD",
                "description": "Best value for regular users",
                "popular": True,
            },
        ]
    }
