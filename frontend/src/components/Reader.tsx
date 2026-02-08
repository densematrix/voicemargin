import { useState, useCallback } from 'react';
import { VoiceRecorder } from './VoiceRecorder';
import type { MarginNote } from '../api/articleApi';

interface ReaderProps {
  title: string;
  content: string;
  author: string | null;
  sourceUrl: string;
  margins: MarginNote[];
  onAddMargin: (margin: MarginNote) => void;
  onTranscribe: (blob: Blob, highlightText: string) => Promise<string>;
  isTranscribing: boolean;
}

export function Reader({
  title,
  content,
  author,
  sourceUrl,
  margins,
  onAddMargin,
  onTranscribe,
  isTranscribing,
}: ReaderProps) {
  const [selectedText, setSelectedText] = useState('');
  const [showRecorder, setShowRecorder] = useState(false);
  const [recorderPosition, setRecorderPosition] = useState({ x: 0, y: 0 });

  const handleTextSelect = useCallback(() => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    
    if (text && text.length > 0) {
      setSelectedText(text);
      
      // Position recorder near selection
      const range = selection?.getRangeAt(0);
      if (range) {
        const rect = range.getBoundingClientRect();
        setRecorderPosition({
          x: rect.left + rect.width / 2,
          y: rect.top - 50,
        });
        setShowRecorder(true);
      }
    } else {
      setShowRecorder(false);
      setSelectedText('');
    }
  }, []);

  const handleRecordingComplete = async (blob: Blob) => {
    if (!selectedText) return;
    
    try {
      const transcribedText = await onTranscribe(blob, selectedText);
      
      const margin: MarginNote = {
        highlight_text: selectedText,
        voice_note: transcribedText,
        created_at: new Date().toISOString(),
      };
      
      onAddMargin(margin);
      setShowRecorder(false);
      setSelectedText('');
      window.getSelection()?.removeAllRanges();
    } catch (error) {
      console.error('Failed to transcribe:', error);
      alert('Failed to transcribe audio. Please try again.');
    }
  };

  return (
    <div className="relative max-w-3xl mx-auto">
      {/* Article Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
        {author && <p className="text-gray-600">By {author}</p>}
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline"
        >
          View original →
        </a>
      </header>

      {/* Article Content */}
      <article
        className="prose prose-lg max-w-none"
        onMouseUp={handleTextSelect}
      >
        {content.split('\n\n').map((paragraph, i) => (
          <p key={i} className="mb-4 text-gray-800 leading-relaxed">
            {paragraph}
          </p>
        ))}
      </article>

      {/* Floating Voice Recorder */}
      {showRecorder && (
        <div
          className="fixed z-50 transform -translate-x-1/2"
          style={{
            left: recorderPosition.x,
            top: Math.max(10, recorderPosition.y),
          }}
        >
          <div className="bg-white rounded-lg shadow-lg p-2 border">
            <VoiceRecorder
              onRecordingComplete={handleRecordingComplete}
              isTranscribing={isTranscribing}
            />
          </div>
        </div>
      )}

      {/* Margin Notes Sidebar */}
      {margins.length > 0 && (
        <aside className="fixed right-4 top-24 w-72 max-h-[calc(100vh-120px)] overflow-y-auto bg-white rounded-lg shadow-lg border p-4">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            📝 Margin Notes ({margins.length})
          </h3>
          <div className="space-y-4">
            {margins.map((margin, i) => (
              <div key={i} className="border-l-4 border-yellow-400 pl-3 py-2">
                <blockquote className="text-sm text-gray-600 italic mb-2">
                  "{margin.highlight_text.slice(0, 100)}
                  {margin.highlight_text.length > 100 ? '...' : ''}"
                </blockquote>
                <p className="text-gray-800 text-sm">{margin.voice_note}</p>
              </div>
            ))}
          </div>
        </aside>
      )}
    </div>
  );
}
