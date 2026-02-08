"""
Prometheus Metrics for VoiceMargin
"""
from prometheus_client import Counter, Histogram
import os

TOOL_SLUG = os.getenv("TOOL_SLUG", "voicemargin")

# Payment metrics
PAYMENT_COUNTER = Counter(
    'creem_payment_total',
    'Total payment attempts',
    ['tool', 'status']
)

WEBHOOK_COUNTER = Counter(
    'creem_webhook_total',
    'Total webhook events received',
    ['tool', 'event']
)

# Transcription metrics
TRANSCRIPTION_COUNTER = Counter(
    'transcription_total',
    'Total transcription requests',
    ['tool', 'status']
)

TOKEN_CONSUMED = Counter(
    'token_consumed_total',
    'Total tokens consumed',
    ['tool']
)

TRANSCRIPTION_LATENCY = Histogram(
    'transcription_latency_seconds',
    'Transcription request latency',
    ['tool'],
    buckets=[0.5, 1.0, 2.0, 3.0, 5.0, 10.0, 15.0, 30.0]
)

ARTICLE_EXTRACT_COUNTER = Counter(
    'article_extract_total',
    'Total article extraction requests',
    ['tool', 'status']
)


def record_payment(status: str):
    PAYMENT_COUNTER.labels(tool=TOOL_SLUG, status=status).inc()


def record_webhook(event: str):
    WEBHOOK_COUNTER.labels(tool=TOOL_SLUG, event=event).inc()


def record_transcription(status: str):
    TRANSCRIPTION_COUNTER.labels(tool=TOOL_SLUG, status=status).inc()


def record_token_consumed():
    TOKEN_CONSUMED.labels(tool=TOOL_SLUG).inc()


def record_article_extract(status: str):
    ARTICLE_EXTRACT_COUNTER.labels(tool=TOOL_SLUG, status=status).inc()


def transcription_timer():
    return TRANSCRIPTION_LATENCY.labels(tool=TOOL_SLUG).time()
