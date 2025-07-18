import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { ClipboardEntry } from '../../../types';

// Icon components
const ClipboardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

const PinIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
);

const CopyIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const PasteIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const SnippetIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const ClipboardManagerView: React.FC = () => {
  const [clipboardHistory, setClipboardHistory] = useState<ClipboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClipboardHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const history = await window.api.invoke('get-clipboard-history') as ClipboardEntry[];
      setClipboardHistory(history || []);
    } catch (err) {
      console.error('Error fetching clipboard history:', err);
      setError(`Failed to fetch clipboard history: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setClipboardHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClipboardHistory();
  }, [fetchClipboardHistory]);

  const handleCopy = useCallback(async (content: string) => {
    setError(null);
    try {
      await navigator.clipboard.writeText(content);
      console.info('Copied to clipboard');
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      setError('Failed to copy to clipboard.');
    }
  }, []);

  const handlePaste = useCallback(async (content: string) => {
    setError(null);
    try {
      await window.api.invoke('insert-snippet', content);
      console.info('Insert snippet requested');
    } catch (err) {
      console.error('Failed to insert snippet:', err);
      setError(`Failed to insert snippet: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, []);

  const handlePinToggle = useCallback(async (item: ClipboardEntry) => {
    setError(null);
    try {
      await window.api.invoke('pin-clipboard-item', item.id, !item.pinned);
      fetchClipboardHistory(); // Refresh the list to show updated pin state
    } catch (err) {
      console.error('Error toggling pin state:', err);
      setError(`Failed to toggle pin state: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [fetchClipboardHistory]);

  const handleAddAsSnippet = useCallback(async (content: string) => {
    setError(null);
    try {
      await window.api.invoke('create-snippet', content);
      console.info('Snippet created from clipboard item');
      // Optionally, could notify SnippetManagerView to refresh if both views are active
      // For now, SnippetManagerView refreshes itself on its own interactions
    } catch (err) {
      console.error('Error creating snippet from clipboard item:', err);
      setError(`Failed to create snippet: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center" style={{ backgroundColor: '#0f0f0f' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p style={{ color: '#888' }}>Loading clipboard history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center" style={{ backgroundColor: '#0f0f0f' }}>
        <div className="text-center">
          <p className="text-red-400 mb-4">Error: {error}</p>
          <button 
            onClick={() => { setError(null); fetchClipboardHistory(); }}
            style={{
              padding: '8px 16px',
              backgroundColor: '#4a90e2',
              border: 'none',
              borderRadius: '6px',
              color: '#fff',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '0 auto'
            }}
          >
            <RefreshIcon />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const pinnedItems = useMemo(() => clipboardHistory.filter(item => item.pinned), [clipboardHistory]);
  const recentItems = useMemo(() => clipboardHistory.filter(item => !item.pinned), [clipboardHistory]);

  const renderClipboardItem = (item: ClipboardEntry) => (
    <div 
      key={item.id} 
      style={{
        backgroundColor: '#1a1a1a',
        border: '1px solid #333',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '12px'
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div 
            className="text-sm text-gray-300 mb-2 break-words"
            style={{
              fontFamily: 'monospace',
              maxHeight: '60px',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {item.content.length > 100 ? `${item.content.substring(0, 100)}...` : item.content}
          </div>
          <div className="text-xs text-gray-500">
            {new Date(item.timestamp).toLocaleString()}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleCopy(item.content)}
            title="Copy to clipboard"
            style={{
              padding: '6px',
              backgroundColor: '#333',
              border: '1px solid #444',
              borderRadius: '4px',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#444'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#333'}
          >
            <CopyIcon />
          </button>
          <button 
            onClick={() => handlePaste(item.content)}
            title="Paste/Insert"
            style={{
              padding: '6px',
              backgroundColor: '#333',
              border: '1px solid #444',
              borderRadius: '4px',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#444'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#333'}
          >
            <PasteIcon />
          </button>
          <button 
            onClick={() => handlePinToggle(item)}
            title={item.pinned ? 'Unpin' : 'Pin'}
            style={{
              padding: '6px',
              backgroundColor: item.pinned ? '#4a90e2' : '#333',
              border: '1px solid #444',
              borderRadius: '4px',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = item.pinned ? '#5a9bf2' : '#444';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = item.pinned ? '#4a90e2' : '#333';
            }}
          >
            <PinIcon />
          </button>
          <button 
            onClick={() => handleAddAsSnippet(item.content)}
            title="Add as Snippet"
            style={{
              padding: '6px',
              backgroundColor: '#333',
              border: '1px solid #444',
              borderRadius: '4px',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#444'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#333'}
          >
            <SnippetIcon />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: '#0f0f0f', color: '#fff' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#1a1a1a', borderBottom: '1px solid #333', padding: '16px 24px' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ClipboardIcon />
            <h1 className="text-2xl font-bold">Clipboard Manager</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">
              {clipboardHistory.length} items
            </span>
            <button 
              onClick={fetchClipboardHistory}
              style={{
                padding: '8px 12px',
                backgroundColor: '#333',
                border: '1px solid #444',
                borderRadius: '6px',
                color: '#fff',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#444'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#333'}
            >
              <RefreshIcon />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto" style={{ padding: '24px' }}>
        {clipboardHistory.length === 0 && !isLoading && (
          <div className="text-center mt-20">
            <ClipboardIcon />
            <p className="text-gray-400 mt-4">No clipboard history available.</p>
            <p className="text-sm text-gray-500 mt-2">Copy some text to start building your clipboard history.</p>
          </div>
        )}
        
        {pinnedItems.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <PinIcon />
              <h2 className="text-lg font-semibold">Pinned Items</h2>
              <span className="text-sm text-gray-400">({pinnedItems.length})</span>
            </div>
            {pinnedItems.map(renderClipboardItem)}
          </div>
        )}
        
        {recentItems.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-lg font-semibold">Recent Items</h2>
              <span className="text-sm text-gray-400">({recentItems.length})</span>
            </div>
            {recentItems.map(renderClipboardItem)}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClipboardManagerView; 