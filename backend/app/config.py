"""Application configuration."""
from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional
import json


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # App settings
    app_name: str = "VoiceMargin"
    debug: bool = False
    
    # OpenAI settings (for Whisper)
    openai_api_key: str = ""
    openai_base_url: Optional[str] = None
    
    # Notion settings
    notion_api_key: str = ""
    notion_database_id: Optional[str] = None
    
    # Database settings
    database_url: Optional[str] = None
    
    # Creem payment settings
    creem_api_key: Optional[str] = None
    creem_webhook_secret: Optional[str] = None
    creem_product_ids: Optional[str] = None
    
    creem_product_id_10: Optional[str] = None
    creem_product_id_50: Optional[str] = None
    
    # Free trial settings
    free_trial_count: int = 10  # 10 free transcriptions
    
    def model_post_init(self, __context) -> None:
        """Parse creem_product_ids JSON into individual fields."""
        if self.creem_product_ids:
            try:
                product_ids = json.loads(self.creem_product_ids)
                if not self.creem_product_id_10:
                    object.__setattr__(self, "creem_product_id_10", product_ids.get("pack_10"))
                if not self.creem_product_id_50:
                    object.__setattr__(self, "creem_product_id_50", product_ids.get("pack_50"))
            except json.JSONDecodeError:
                pass
    
    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
