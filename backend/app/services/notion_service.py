"""Notion sync service."""
from notion_client import AsyncClient
from typing import Optional, List
from datetime import datetime

from app.config import get_settings
from app.schemas.article import MarginNote


class NotionService:
    """Service for syncing notes to Notion."""
    
    def __init__(self):
        settings = get_settings()
        self.client = AsyncClient(auth=settings.notion_api_key)
        self.database_id = settings.notion_database_id
    
    async def sync_margins(
        self,
        article_title: str,
        article_url: str,
        margins: List[MarginNote],
    ) -> dict:
        """Sync margin notes to a Notion page.
        
        Creates a new page in the configured database with all margin notes.
        """
        try:
            # Build content blocks
            children = []
            
            # Add source link
            children.append({
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text": [
                        {"type": "text", "text": {"content": "Source: "}},
                        {"type": "text", "text": {"content": article_url, "link": {"url": article_url}}},
                    ]
                }
            })
            
            children.append({
                "object": "block",
                "type": "divider",
                "divider": {}
            })
            
            # Add each margin note
            for i, margin in enumerate(margins, 1):
                # Highlighted text as quote
                children.append({
                    "object": "block",
                    "type": "quote",
                    "quote": {
                        "rich_text": [{"type": "text", "text": {"content": margin.highlight_text}}]
                    }
                })
                
                # Voice note as paragraph
                children.append({
                    "object": "block",
                    "type": "paragraph",
                    "paragraph": {
                        "rich_text": [
                            {"type": "text", "text": {"content": "💬 "}, "annotations": {"bold": True}},
                            {"type": "text", "text": {"content": margin.voice_note}},
                        ]
                    }
                })
                
                # Divider between notes
                if i < len(margins):
                    children.append({
                        "object": "block",
                        "type": "divider",
                        "divider": {}
                    })
            
            # Create the page
            if self.database_id:
                # Create in database
                response = await self.client.pages.create(
                    parent={"database_id": self.database_id},
                    properties={
                        "Name": {"title": [{"text": {"content": article_title}}]},
                        "URL": {"url": article_url},
                    },
                    children=children,
                )
            else:
                # Create as standalone page (fallback)
                response = await self.client.pages.create(
                    parent={"page_id": "YOUR_PARENT_PAGE_ID"},  # Needs config
                    properties={
                        "title": {"title": [{"text": {"content": article_title}}]}
                    },
                    children=children,
                )
            
            return {
                "success": True,
                "notion_url": response.get("url"),
                "message": f"Synced {len(margins)} notes to Notion",
            }
            
        except Exception as e:
            return {
                "success": False,
                "notion_url": None,
                "message": f"Sync failed: {str(e)}",
            }


_notion_service: Optional[NotionService] = None


def get_notion_service() -> NotionService:
    global _notion_service
    if _notion_service is None:
        _notion_service = NotionService()
    return _notion_service
