/**
 * VoiceMargin API client
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export interface Article {
  title: string;
  content: string;
  author: string | null;
  publish_date: string | null;
  source_url: string;
  word_count: number;
}

export interface TranscribeResult {
  text: string;
  language: string | null;
  duration_seconds: number | null;
  tokens_remaining: number;
}

export interface MarginNote {
  highlight_text: string;
  voice_note: string;
  highlight_start?: number;
  highlight_end?: number;
  created_at?: string;
}

export interface SyncResult {
  success: boolean;
  notion_url: string | null;
  message: string;
}

export interface TokenStatus {
  device_id: string;
  total_tokens: number;
  used_tokens: number;
  remaining_tokens: number;
  free_trial_used: boolean;
  is_unlimited: boolean;
}

/**
 * Extract article content from URL
 */
export async function extractArticle(url: string): Promise<Article> {
  const response = await fetch(`${API_BASE}/extract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to extract article');
  }
  
  return response.json();
}

/**
 * Transcribe audio to text
 */
export async function transcribeAudio(
  audioBlob: Blob,
  deviceId: string,
  filename = 'audio.webm'
): Promise<TranscribeResult> {
  const formData = new FormData();
  formData.append('audio', audioBlob, filename);
  formData.append('device_id', deviceId);
  
  const response = await fetch(`${API_BASE}/transcribe`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Transcription failed');
  }
  
  return response.json();
}

/**
 * Sync margin notes to Notion
 */
export async function syncToNotion(
  deviceId: string,
  articleTitle: string,
  articleUrl: string,
  margins: MarginNote[]
): Promise<SyncResult> {
  const response = await fetch(`${API_BASE}/sync-notion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      device_id: deviceId,
      article_title: articleTitle,
      article_url: articleUrl,
      margins,
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Sync failed');
  }
  
  return response.json();
}

/**
 * Get token status
 */
export async function getTokenStatus(deviceId: string): Promise<TokenStatus> {
  const response = await fetch(`${API_BASE}/tokens/${deviceId}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to get token status');
  }
  
  return response.json();
}
