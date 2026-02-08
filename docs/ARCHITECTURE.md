# VoiceMargin Architecture

## 系统概览

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  URL Input   │  │  Reader UI   │  │  Voice Recorder     │  │
│  │  + Extract   │  │  + Highlight │  │  + Margin Display   │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└───────────────────────────────┬─────────────────────────────────┘
                                │ REST API
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Backend (FastAPI)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  /extract    │  │  /transcribe │  │  /sync-notion        │  │
│  │  文章提取     │  │  语音转录     │  │  Notion 同步         │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  /tokens     │  │  /checkout   │  │  /webhook            │  │
│  │  Token 管理   │  │  Creem 支付  │  │  支付回调             │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└───────────────────────────────┬─────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
┌──────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ SQLite (Dev) │    │  OpenAI Whisper  │    │    Notion API    │
│ Postgres (Prod)│   │  (语音转录)       │    │   (笔记同步)      │
└──────────────┘    └──────────────────┘    └──────────────────┘
```

## 技术选型

| 层 | 技术 | 理由 |
|---|------|------|
| Frontend | Next.js 14 (App Router) | React 生态，SSR 支持好 |
| UI | Tailwind CSS + shadcn/ui | 快速开发，现代设计 |
| Backend | FastAPI | 异步，类型安全，Prometheus 集成 |
| 数据库 | SQLite (Dev) / PostgreSQL (Prod) | 开发快，生产稳定 |
| 语音转录 | OpenAI Whisper API | 精度高，支持多语言 |
| 文章提取 | newspaper3k + readability-lxml | 成熟稳定 |
| Notion 同步 | notion-client | 官方 SDK |

## 核心数据流

### 1. 阅读流程
```
用户粘贴 URL
    ↓
Frontend 发送 POST /api/extract
    ↓
Backend 用 newspaper3k 提取
    ↓
返回 {title, content, author, publish_date}
    ↓
Frontend 渲染为阅读界面
```

### 2. 语音边注流程
```
用户选中文字 → 快捷键触发
    ↓
开始录音 (Web Audio API)
    ↓
松手/点击停止
    ↓
录音 Blob → 发送到 POST /api/transcribe
    ↓
Backend 调用 Whisper API 转录
    ↓
返回 {text, confidence}
    ↓
Frontend 显示边注 + 保存到本地
```

### 3. Notion 同步流程
```
用户点击"同步到 Notion"
    ↓
收集所有边注 + 对应高亮
    ↓
POST /api/sync-notion
    ↓
Backend 创建 Notion Page
  - Title: 文章标题
  - Body: 高亮 + 边注列表
    ↓
返回 Notion Page URL
```

## 数据模型

### User Token (SQLite/Postgres)
```sql
CREATE TABLE device_tokens (
    device_id TEXT PRIMARY KEY,
    total_tokens INTEGER DEFAULT 0,
    used_tokens INTEGER DEFAULT 0,
    free_trial_used BOOLEAN DEFAULT FALSE,
    is_unlimited BOOLEAN DEFAULT FALSE,  -- Weihao 专用
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Article Session (Frontend Local Storage)
```typescript
interface ArticleSession {
  id: string;
  url: string;
  title: string;
  content: string;
  margins: Margin[];
  createdAt: Date;
}

interface Margin {
  id: string;
  highlightText: string;
  highlightStartOffset: number;
  highlightEndOffset: number;
  voiceNote: string;
  createdAt: Date;
}
```

## API 设计

| Endpoint | Method | 用途 | 消耗 Token |
|----------|--------|------|-----------|
| /api/extract | POST | 提取文章 | ❌ |
| /api/transcribe | POST | 语音转录 | ✅ 1 token |
| /api/sync-notion | POST | 同步到 Notion | ❌ |
| /api/tokens/{device_id} | GET | 查询 Token 状态 | ❌ |
| /api/checkout | POST | 创建支付 | ❌ |
| /api/webhook | POST | Creem 回调 | ❌ |
| /health | GET | 健康检查 | ❌ |

## 非功能需求

- **延迟**: 转录 < 3s (Whisper API 通常 1-2s)
- **可用性**: 99.9%
- **并发**: 支持 100 QPS
- **安全**: HTTPS, rate limiting, device fingerprint 防刷

## 监控

复用现有 Prometheus + Grafana：
- 请求延迟 histogram
- Token 消耗 counter
- 支付成功/失败 counter
- Whisper API 错误率
