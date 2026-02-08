"""Tests for configuration."""
import pytest
from unittest.mock import patch
import os


class TestSettings:
    """Tests for Settings configuration."""
    
    def test_default_app_name(self):
        """Should have correct default app name."""
        # Clear cache to get fresh settings
        from app.config import get_settings
        get_settings.cache_clear()
        
        with patch.dict(os.environ, {}, clear=True):
            from app.config import Settings
            settings = Settings()
            assert settings.app_name == "AI Excuse Generator"
    
    def test_parse_creem_product_ids_json(self):
        """Should parse CREEM_PRODUCT_IDS JSON into individual fields."""
        from app.config import Settings
        
        settings = Settings(
            creem_product_ids='{"pack_3":"prod_3","pack_10":"prod_10"}'
        )
        
        assert settings.creem_product_id_3 == "prod_3"
        assert settings.creem_product_id_10 == "prod_10"
    
    def test_individual_product_ids_override_json(self):
        """Individual product IDs should not be overwritten if already set."""
        from app.config import Settings
        
        settings = Settings(
            creem_product_ids='{"pack_10":"prod_json"}',
            creem_product_id_10="prod_individual"
        )
        
        assert settings.creem_product_id_10 == "prod_individual"
    
    def test_invalid_creem_product_ids_json(self):
        """Should handle invalid JSON gracefully."""
        from app.config import Settings
        
        settings = Settings(
            creem_product_ids='invalid json'
        )
        
        assert settings.creem_product_id_3 is None
        assert settings.creem_product_id_10 is None
    
    def test_empty_creem_product_ids(self):
        """Should handle empty/None creem_product_ids."""
        from app.config import Settings
        
        settings = Settings(creem_product_ids=None)
        
        assert settings.creem_product_id_10 is None
