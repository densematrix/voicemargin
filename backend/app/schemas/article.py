"""Article-related schemas."""
from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List
from datetime import datetime


class ExtractRequest(BaseModel):
    """Request to extract article from URL."""
    url: str = Field(..., description="URL of the article to extract")


class ExtractResponse(BaseModel):
    """Response with extracted article content."""
    title: str
    content: str
    author: Optional[str] = None
    publish_date: Optional[str] = None
    source_url: str
    word_count: int


class TranscribeRequest(BaseModel):
    """Request to transcribe audio (sent as multipart/form-data)."""
    device_id: str = Field(..., min_length=10, max_length=100)


class TranscribeResponse(BaseModel):
    """Response with transcribed text."""
    text: str
    language: Optional[str] = None
    duration_seconds: Optional[float] = None
    tokens_remaining: int = -1


class MarginNote(BaseModel):
    """A single margin note (voice annotation)."""
    highlight_text: str = Field(..., description="The highlighted text")
    voice_note: str = Field(..., description="Transcribed voice note")
    highlight_start: Optional[int] = None
    highlight_end: Optional[int] = None
    created_at: Optional[datetime] = None


class SyncNotionRequest(BaseModel):
    """Request to sync notes to Notion."""
    device_id: str = Field(..., min_length=10, max_length=100)
    article_title: str
    article_url: str
    margins: List[MarginNote]


class SyncNotionResponse(BaseModel):
    """Response with Notion page URL."""
    success: bool
    notion_url: Optional[str] = None
    message: str = ""
