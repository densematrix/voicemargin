# 📖 VoiceMargin

Read. Speak. Remember.

Voice annotation for reading — capture your thoughts while you read, sync to Notion.

## Features

- 📑 **Article Extraction**: Paste any URL, get clean reading view
- 🎤 **Voice Margins**: Select text, record your thoughts
- 🔄 **Notion Sync**: One-click sync all margin notes to Notion
- 💾 **Local Storage**: Notes saved locally until synced

## Quick Start

### Backend

```bash
cd backend
pip install -r requirements.txt
cp ../.env.example .env
# Edit .env with your API keys
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

```env
# OpenAI API Key (for Whisper transcription)
OPENAI_API_KEY=sk-xxx

# Notion API
NOTION_API_KEY=ntn_xxx
NOTION_DATABASE_ID=xxx

# Optional: Creem payment
CREEM_API_KEY=creem_xxx
```

## Tech Stack

- **Backend**: FastAPI, OpenAI Whisper, Notion API
- **Frontend**: React, Vite, Tailwind CSS
- **Infrastructure**: Docker, Cloudflare, Prometheus

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/extract` | POST | Extract article from URL |
| `/api/transcribe` | POST | Transcribe audio to text |
| `/api/sync-notion` | POST | Sync notes to Notion |
| `/api/tokens/{device_id}` | GET | Check token balance |
| `/health` | GET | Health check |

## Pricing

- **Free Trial**: 10 transcriptions
- **Paid**: Coming soon via Creem

## License

MIT © DenseMatrix
