"""Whisper transcription service."""
from openai import AsyncOpenAI
from typing import Optional
import io

from app.config import get_settings


class TranscribeService:
    """Service for transcribing audio using OpenAI Whisper."""
    
    def __init__(self):
        settings = get_settings()
        # Support custom base_url (e.g., for LLM Proxy)
        client_kwargs = {"api_key": settings.openai_api_key}
        if hasattr(settings, 'openai_base_url') and settings.openai_base_url:
            client_kwargs["base_url"] = settings.openai_base_url
        self.client = AsyncOpenAI(**client_kwargs)
    
    async def transcribe(self, audio_data: bytes, filename: str = "audio.webm") -> dict:
        """Transcribe audio data using Whisper API.
        
        Args:
            audio_data: Raw audio bytes
            filename: Filename with extension (used to determine format)
            
        Returns:
            dict with text, language, and duration
        """
        try:
            # Create a file-like object from bytes
            audio_file = io.BytesIO(audio_data)
            audio_file.name = filename
            
            response = await self.client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                response_format="verbose_json",
            )
            
            return {
                "text": response.text,
                "language": getattr(response, "language", None),
                "duration_seconds": getattr(response, "duration", None),
            }
        except Exception as e:
            raise ValueError(f"Transcription failed: {str(e)}")


_transcribe_service: Optional[TranscribeService] = None


def get_transcribe_service() -> TranscribeService:
    global _transcribe_service
    if _transcribe_service is None:
        _transcribe_service = TranscribeService()
    return _transcribe_service
