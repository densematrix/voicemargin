import { useState, useCallback, useEffect } from 'react';
import { UrlInput } from './components/UrlInput';
import { Reader } from './components/Reader';
import {
  extractArticle,
  transcribeAudio,
  syncToNotion,
  getTokenStatus,
} from './api/articleApi';
import type { Article, MarginNote, TokenStatus } from './api/articleApi';
import { getDeviceId } from './api/fingerprint';

function App() {
  const [article, setArticle] = useState<Article | null>(null);
  const [margins, setMargins] = useState<MarginNote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [tokenStatus, setTokenStatus] = useState<TokenStatus | null>(null);
  const [deviceId, setDeviceId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Initialize device ID
  useEffect(() => {
    getDeviceId().then(setDeviceId);
  }, []);

  // Fetch token status
  useEffect(() => {
    if (deviceId) {
      getTokenStatus(deviceId)
        .then(setTokenStatus)
        .catch(console.error);
    }
  }, [deviceId]);

  const handleExtractArticle = useCallback(async (url: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await extractArticle(url);
      setArticle(result);
      setMargins([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract article');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleTranscribe = useCallback(async (blob: Blob, _highlightText: string): Promise<string> => {
    setIsTranscribing(true);
    
    try {
      const result = await transcribeAudio(blob, deviceId);
      
      // Update token status
      if (result.tokens_remaining >= 0) {
        setTokenStatus((prev) => prev ? {
          ...prev,
          remaining_tokens: result.tokens_remaining,
        } : null);
      }
      
      return result.text;
    } finally {
      setIsTranscribing(false);
    }
  }, [deviceId]);

  const handleAddMargin = useCallback((margin: MarginNote) => {
    setMargins((prev) => [...prev, margin]);
  }, []);

  const handleSyncToNotion = useCallback(async () => {
    if (!article || margins.length === 0) return;
    
    setIsSyncing(true);
    setError(null);
    
    try {
      const result = await syncToNotion(
        deviceId,
        article.title,
        article.source_url,
        margins
      );
      
      if (result.notion_url) {
        window.open(result.notion_url, '_blank');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setIsSyncing(false);
    }
  }, [article, margins, deviceId]);

  const handleBack = useCallback(() => {
    setArticle(null);
    setMargins([]);
    setError(null);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {article && (
              <button
                onClick={handleBack}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back
              </button>
            )}
            <h1 className="text-xl font-bold text-gray-900">📖 VoiceMargin</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Token Status */}
            {tokenStatus && (
              <span className="text-sm text-gray-600">
                {tokenStatus.is_unlimited ? (
                  '✨ Unlimited'
                ) : (
                  `${tokenStatus.remaining_tokens} uses left`
                )}
              </span>
            )}
            
            {/* Sync Button */}
            {article && margins.length > 0 && (
              <button
                onClick={handleSyncToNotion}
                disabled={isSyncing}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
              >
                {isSyncing ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Syncing...
                  </>
                ) : (
                  <>📤 Sync to Notion</>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {!article ? (
          /* Landing / URL Input */
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Read. Speak. Remember.
              </h2>
              <p className="text-xl text-gray-600 max-w-xl">
                Capture your thoughts while reading. Select text, record your voice,
                and sync your margin notes to Notion.
              </p>
            </div>
            
            <UrlInput onSubmit={handleExtractArticle} isLoading={isLoading} />
            
            <div className="text-sm text-gray-500">
              Paste any article URL to get started
            </div>
          </div>
        ) : (
          /* Reader View */
          <Reader
            title={article.title}
            content={article.content}
            author={article.author}
            sourceUrl={article.source_url}
            margins={margins}
            onAddMargin={handleAddMargin}
            onTranscribe={handleTranscribe}
            isTranscribing={isTranscribing}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          Built by DenseMatrix • Powered by Whisper AI
        </div>
      </footer>
    </div>
  );
}

export default App;
