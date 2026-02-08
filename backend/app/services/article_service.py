"""Article extraction service."""
import httpx
from newspaper import Article
from readability import Document
from typing import Optional
import re


class ArticleService:
    """Service for extracting articles from URLs."""
    
    def __init__(self):
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
        }
    
    async def extract(self, url: str) -> dict:
        """Extract article content from URL.
        
        Uses newspaper3k as primary extractor, falls back to readability.
        """
        try:
            # Try newspaper3k first
            article = Article(url)
            article.download()
            article.parse()
            
            if article.text and len(article.text) > 100:
                return {
                    "title": article.title or "Untitled",
                    "content": article.text,
                    "author": ", ".join(article.authors) if article.authors else None,
                    "publish_date": article.publish_date.isoformat() if article.publish_date else None,
                    "source_url": url,
                    "word_count": len(article.text.split()),
                }
        except Exception:
            pass
        
        # Fallback to readability
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=self.headers, timeout=30)
                response.raise_for_status()
                
            doc = Document(response.text)
            content = doc.summary()
            # Strip HTML tags
            content = re.sub(r'<[^>]+>', '', content)
            content = re.sub(r'\s+', ' ', content).strip()
            
            return {
                "title": doc.title() or "Untitled",
                "content": content,
                "author": None,
                "publish_date": None,
                "source_url": url,
                "word_count": len(content.split()),
            }
        except Exception as e:
            raise ValueError(f"Failed to extract article: {str(e)}")


_article_service: Optional[ArticleService] = None


def get_article_service() -> ArticleService:
    global _article_service
    if _article_service is None:
        _article_service = ArticleService()
    return _article_service
