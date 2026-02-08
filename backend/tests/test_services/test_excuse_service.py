"""Tests for excuse service."""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from app.services.excuse_service import ExcuseService, get_excuse_service
from app.schemas.excuse import ExcuseCategory, UrgencyLevel


@pytest.fixture
def excuse_service():
    return ExcuseService()


class TestExcuseService:
    """Tests for ExcuseService class."""
    
    def test_get_category_description_english(self, excuse_service):
        """Should return English description for category."""
        desc = excuse_service._get_category_description(ExcuseCategory.LATE, "en")
        assert "late" in desc.lower()
    
    def test_get_category_description_chinese(self, excuse_service):
        """Should return Chinese description for category."""
        desc = excuse_service._get_category_description(ExcuseCategory.LATE, "zh")
        assert "迟到" in desc
    
    def test_get_category_description_fallback(self, excuse_service):
        """Should fallback to English for unknown language."""
        desc = excuse_service._get_category_description(ExcuseCategory.LATE, "xx")
        assert "late" in desc.lower()
    
    def test_get_category_description_all_categories(self, excuse_service):
        """Should have descriptions for all categories."""
        for category in ExcuseCategory:
            desc = excuse_service._get_category_description(category, "en")
            assert len(desc) > 0
    
    def test_get_urgency_instruction_normal(self, excuse_service):
        """Should return normal urgency instruction."""
        inst = excuse_service._get_urgency_instruction(UrgencyLevel.NORMAL, "en")
        assert "believable" in inst.lower()
    
    def test_get_urgency_instruction_urgent(self, excuse_service):
        """Should return urgent instruction."""
        inst = excuse_service._get_urgency_instruction(UrgencyLevel.URGENT, "en")
        assert "dramatic" in inst.lower()
    
    def test_get_urgency_instruction_extreme(self, excuse_service):
        """Should return extreme instruction."""
        inst = excuse_service._get_urgency_instruction(UrgencyLevel.EXTREME, "en")
        assert "wild" in inst.lower()
    
    def test_get_urgency_instruction_chinese(self, excuse_service):
        """Should return Chinese urgency instruction."""
        inst = excuse_service._get_urgency_instruction(UrgencyLevel.NORMAL, "zh")
        assert "可信" in inst
    
    def test_get_urgency_instruction_fallback(self, excuse_service):
        """Should fallback to English for unknown language."""
        inst = excuse_service._get_urgency_instruction(UrgencyLevel.NORMAL, "xx")
        assert "believable" in inst.lower()
    
    @pytest.mark.asyncio
    async def test_generate_excuses_success(self, excuse_service):
        """Should generate excuses successfully."""
        mock_response = MagicMock()
        mock_response.choices = [
            MagicMock(
                message=MagicMock(
                    content='[{"text": "Test excuse", "tone": "sincere", "tip": "Stay calm"}]'
                )
            )
        ]
        
        with patch.object(
            excuse_service.client.chat.completions,
            "create",
            new_callable=AsyncMock,
            return_value=mock_response,
        ):
            excuses = await excuse_service.generate_excuses(
                category=ExcuseCategory.LATE,
                urgency=UrgencyLevel.NORMAL,
                context="",
                language="en",
            )
        
        assert len(excuses) >= 1
        assert excuses[0].text == "Test excuse"
    
    @pytest.mark.asyncio
    async def test_generate_excuses_with_context(self, excuse_service):
        """Should include context in generation."""
        mock_response = MagicMock()
        mock_response.choices = [
            MagicMock(
                message=MagicMock(
                    content='[{"text": "Traffic excuse", "tone": "apologetic", "tip": "Mention time"}]'
                )
            )
        ]
        
        with patch.object(
            excuse_service.client.chat.completions,
            "create",
            new_callable=AsyncMock,
            return_value=mock_response,
        ):
            excuses = await excuse_service.generate_excuses(
                category=ExcuseCategory.LATE,
                urgency=UrgencyLevel.NORMAL,
                context="Traffic was bad",
                language="en",
            )
        
        assert len(excuses) >= 1
    
    @pytest.mark.asyncio
    async def test_generate_excuses_handles_markdown(self, excuse_service):
        """Should handle markdown code blocks in response."""
        mock_response = MagicMock()
        mock_response.choices = [
            MagicMock(
                message=MagicMock(
                    content='```json\n[{"text": "Test", "tone": "test", "tip": "test"}]\n```'
                )
            )
        ]
        
        with patch.object(
            excuse_service.client.chat.completions,
            "create",
            new_callable=AsyncMock,
            return_value=mock_response,
        ):
            excuses = await excuse_service.generate_excuses(
                category=ExcuseCategory.LATE,
                urgency=UrgencyLevel.NORMAL,
            )
        
        assert len(excuses) >= 1
    
    @pytest.mark.asyncio
    async def test_generate_excuses_handles_invalid_json(self, excuse_service):
        """Should handle invalid JSON response gracefully."""
        mock_response = MagicMock()
        mock_response.choices = [
            MagicMock(message=MagicMock(content="This is not JSON"))
        ]
        
        with patch.object(
            excuse_service.client.chat.completions,
            "create",
            new_callable=AsyncMock,
            return_value=mock_response,
        ):
            excuses = await excuse_service.generate_excuses(
                category=ExcuseCategory.LATE,
                urgency=UrgencyLevel.NORMAL,
            )
        
        # Should return a fallback excuse
        assert len(excuses) >= 1
        assert "This is not JSON" in excuses[0].text
    
    @pytest.mark.asyncio
    async def test_generate_excuses_all_languages(self, excuse_service):
        """Should handle all supported languages."""
        languages = ["en", "zh", "ja", "de", "fr", "ko", "es"]
        
        mock_response = MagicMock()
        mock_response.choices = [
            MagicMock(
                message=MagicMock(
                    content='[{"text": "Test", "tone": "test", "tip": "test"}]'
                )
            )
        ]
        
        for lang in languages:
            with patch.object(
                excuse_service.client.chat.completions,
                "create",
                new_callable=AsyncMock,
                return_value=mock_response,
            ):
                excuses = await excuse_service.generate_excuses(
                    category=ExcuseCategory.LATE,
                    urgency=UrgencyLevel.NORMAL,
                    language=lang,
                )
            
            assert len(excuses) >= 1


class TestGetExcuseServiceSingleton:
    """Tests for get_excuse_service singleton."""
    
    def test_returns_same_instance(self):
        """Should return the same instance."""
        import app.services.excuse_service as es
        es._excuse_service = None  # Reset
        
        service1 = get_excuse_service()
        service2 = get_excuse_service()
        
        assert service1 is service2
        
        es._excuse_service = None  # Clean up
