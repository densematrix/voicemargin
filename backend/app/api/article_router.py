"""Article API endpoints."""
from fastapi import APIRouter, HTTPException, status, UploadFile, File, Form

from app.schemas.article import (
    ExtractRequest,
    ExtractResponse,
    TranscribeResponse,
    SyncNotionRequest,
    SyncNotionResponse,
)
from app.services.article_service import get_article_service
from app.services.transcribe_service import get_transcribe_service
from app.services.notion_service import get_notion_service
from app.services.token_service import get_token_service

router = APIRouter()


@router.post("/extract", response_model=ExtractResponse)
async def extract_article(request: ExtractRequest) -> ExtractResponse:
    """Extract article content from a URL.
    
    This endpoint is free (no token required).
    """
    article_service = get_article_service()
    
    try:
        result = await article_service.extract(request.url)
        return ExtractResponse(**result)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Failed to extract article: {str(e)}",
        )


@router.post("/transcribe", response_model=TranscribeResponse)
async def transcribe_audio(
    audio: UploadFile = File(...),
    device_id: str = Form(...),
) -> TranscribeResponse:
    """Transcribe audio to text using Whisper.
    
    Requires a valid device_id with available tokens.
    Consumes 1 token per transcription.
    """
    if len(device_id) < 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid device_id",
        )
    
    token_service = get_token_service()
    
    # Check if user can transcribe
    if not token_service.can_generate(device_id):
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="No tokens remaining. Please purchase more to continue.",
        )
    
    # Use a token
    use_result = token_service.use_token(device_id)
    if not use_result.success:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=use_result.message,
        )
    
    # Read audio data
    audio_data = await audio.read()
    if len(audio_data) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Empty audio file",
        )
    
    # Transcribe
    transcribe_service = get_transcribe_service()
    try:
        result = await transcribe_service.transcribe(
            audio_data,
            filename=audio.filename or "audio.webm",
        )
        
        # Get remaining tokens
        status_info = token_service.get_token_status(device_id)
        
        return TranscribeResponse(
            text=result["text"],
            language=result.get("language"),
            duration_seconds=result.get("duration_seconds"),
            tokens_remaining=status_info.remaining_tokens,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Transcription failed: {str(e)}",
        )


@router.post("/sync-notion", response_model=SyncNotionResponse)
async def sync_to_notion(request: SyncNotionRequest) -> SyncNotionResponse:
    """Sync margin notes to Notion.
    
    This endpoint is free (no token required).
    """
    if len(request.device_id) < 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid device_id",
        )
    
    if not request.margins:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No margins to sync",
        )
    
    notion_service = get_notion_service()
    result = await notion_service.sync_margins(
        article_title=request.article_title,
        article_url=request.article_url,
        margins=request.margins,
    )
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=result["message"],
        )
    
    return SyncNotionResponse(**result)
