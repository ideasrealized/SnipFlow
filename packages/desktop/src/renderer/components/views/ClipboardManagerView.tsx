import React, { useState, useEffect, useCallback } from 'react';
import type { ClipboardEntry } from '../../../types'; // Assuming types are correctly pathed

// Basic styling - consider moving to a CSS file or using a styling library
const viewStyle: React.CSSProperties = {
  padding: '20px',
  fontFamily: 'Arial, sans-serif',
};
const listStyle: React.CSSProperties = { listStyleType: 'none', padding: 0 };
const listItemStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px',
  border: '1px solid #ddd',
  marginBottom: '10px',
  borderRadius: '4px',
};
const itemContentStyle: React.CSSProperties = {
  flexGrow: 1,
  marginRight: '10px',
};
const itemTimestampStyle: React.CSSProperties = {
  fontSize: '0.8em',
  color: '#666',
  marginRight: '10px',
};
const actionsStyle: React.CSSProperties = { display: 'flex', gap: '5px' };
const buttonStyle: React.CSSProperties = {
  padding: '6px 12px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};
const primaryButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  backgroundColor: '#4a90e2',
  color: 'white',
};
const secondaryButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  backgroundColor: '#6c757d',
  color: 'white',
};

const ClipboardManagerView: React.FC = () => {
  const [clipboardHistory, setClipboardHistory] = useState<ClipboardEntry[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClipboardHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const history = await window.api.invoke('get-clipboard-history');
      setClipboardHistory(history || []);
    } catch (err: any) {
      console.error('Error fetching clipboard history:', err);
      setError(
        `Failed to fetch clipboard history: ${err.message || 'Unknown error'}`
      );
      setClipboardHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClipboardHistory();
  }, [fetchClipboardHistory]);

  const handleCopy = async (content: string) => {
    setError(null);
    try {
      await navigator.clipboard.writeText(content);
      console.info('Copied to clipboard');
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      setError('Failed to copy to clipboard.');
    }
  };

  const handlePaste = async (content: string) => {
    setError(null);
    try {
      await window.api.invoke('insert-snippet', content);
      console.info('Insert snippet requested');
    } catch (err: any) {
      console.error('Failed to insert snippet:', err);
      setError(`Failed to insert snippet: ${err.message || 'Unknown error'}`);
    }
  };

  const handlePinToggle = async (item: ClipboardEntry) => {
    setError(null);
    try {
      await window.api.invoke('pin-clipboard-item', item.id, !item.pinned);
      fetchClipboardHistory(); // Refresh the list to show updated pin state
    } catch (err: any) {
      console.error('Error toggling pin state:', err);
      setError(`Failed to toggle pin state: ${err.message || 'Unknown error'}`);
    }
  };

  const handleAddAsSnippet = async (content: string) => {
    setError(null);
    try {
      await window.api.invoke('create-snippet', content);
      console.info('Snippet created from clipboard item');
      // Optionally, could notify SnippetManagerView to refresh if both views are active
      // For now, SnippetManagerView refreshes itself on its own interactions
    } catch (err: any) {
      console.error('Error creating snippet from clipboard item:', err);
      setError(`Failed to create snippet: ${err.message || 'Unknown error'}`);
    }
  };

  if (isLoading) {
    return <div className="view-container">Loading clipboard history...</div>;
  }

  if (error) {
    return (
      <div className="view-container">
        <p className="empty-state-message">Error: {error}</p>
        <button
          className="button button-primary"
          onClick={() => {
            setError(null);
            fetchClipboardHistory();
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="view-container">
      <h2>Clipboard Manager</h2>
      {clipboardHistory.length === 0 && !isLoading && (
        <p className="empty-state-message">Clipboard history is empty.</p>
      )}
      <ul className="item-list">
        {clipboardHistory.map(item => (
          <li key={item.id} className="item-list-item">
            <span className="item-content">{item.content}</span>
            <span className="item-timestamp">
              {new Date(item.timestamp).toLocaleString()}
            </span>
            <div className="item-actions">
              <button
                className="button button-secondary"
                onClick={() => handleCopy(item.content)}
              >
                Copy
              </button>
              <button
                className="button button-secondary"
                onClick={() => handlePaste(item.content)}
              >
                Paste
              </button>
              <button
                className={`button ${item.pinned ? 'button-primary' : 'button-secondary'}`}
                onClick={() => handlePinToggle(item)}
              >
                {item.pinned ? 'Unpin' : 'Pin'}
              </button>
              <button
                className="button button-secondary"
                onClick={() => handleAddAsSnippet(item.content)}
              >
                Add as Snippet
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClipboardManagerView;
