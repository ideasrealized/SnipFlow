import React, { useState, useEffect, useCallback } from 'react';
import type { Snippet } from '../../../types'; // Assuming types are correctly pathed
import Modal from '../Modal'; // Import the Modal component

const SnippetManagerView: React.FC = () => {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
  const [snippetToDelete, setSnippetToDelete] = useState<Snippet | null>(null);
  const [newSnippetContent, setNewSnippetContent] = useState('');
  const [editedContent, setEditedContent] = useState(''); // For edit modal input

  const fetchSnippets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedSnippets = await window.api.invoke('list-snippets');
      setSnippets(fetchedSnippets || []);
    } catch (err: any) {
      console.error('Error fetching snippets:', err);
      setError(`Failed to fetch snippets: ${err.message || 'Unknown error'}`);
      setSnippets([]); // Clear snippets on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSnippets();
  }, [fetchSnippets]);

  const handleCreateSnippet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSnippetContent.trim()) return;
    setError(null);
    try {
      await window.api.invoke('create-snippet', newSnippetContent);
      setNewSnippetContent('');
      fetchSnippets(); // Refresh the list
    } catch (err: any) {
      console.error('Error creating snippet:', err);
      setError(`Failed to create snippet: ${err.message || 'Unknown error'}`);
    }
  };

  const handleEditSnippet = (snippet: Snippet) => {
    setEditingSnippet(snippet);
    setEditedContent(snippet.content); // Pre-fill edit modal
  };

  const handleSaveEdit = async () => {
    if (!editingSnippet || !editedContent.trim()) return;
    setError(null);
    try {
      await window.api.invoke('update-snippet', editingSnippet.id, editedContent);
      setEditingSnippet(null);
      fetchSnippets();
    } catch (err: any) {
      console.error('Error updating snippet:', err);
      setError(`Failed to update snippet: ${err.message || 'Unknown error'}`);
    }
  };

  const handleDeleteSnippet = async () => {
    if (!snippetToDelete) return;
    setError(null);
    try {
      await window.api.invoke('delete-snippet', snippetToDelete.id);
      setSnippetToDelete(null);
      fetchSnippets();
    } catch (err: any) {
      console.error('Error deleting snippet:', err);
      setError(`Failed to delete snippet: ${err.message || 'Unknown error'}`);
    }
  };

  const handleCopySnippet = async (content: string) => {
    setError(null); // Clear previous errors
    try {
      await navigator.clipboard.writeText(content);
      console.info('Snippet copied to clipboard');
    } catch (err) {
      console.error('Failed to copy snippet:', err);
      setError('Failed to copy snippet to clipboard.');
    }
  };

  const handlePasteSnippet = async (content: string) => {
    setError(null); // Clear previous errors
    try {
      await window.api.invoke('insert-snippet', content);
      console.info('Snippet content insertion requested');
    } catch (err: any) {
      console.error('Failed to insert snippet:', err);
      setError(`Failed to insert snippet: ${err.message || 'Unknown error'}`);
    }
  };

  if (isLoading) return <div className="view-container">Loading snippets...</div>;
  if (error) return (
    <div className="view-container">
      <p className="empty-state-message">Error: {error}</p> 
      <button className="button button-primary" onClick={() => { setError(null); fetchSnippets();}}>
        Try Again
      </button>
    </div>
  );

  return (
    <div className="view-container">
      <h2>Snippet Manager</h2>
      <form onSubmit={handleCreateSnippet} className="form-group">
        <input
          type="text"
          value={newSnippetContent}
          onChange={(e) => setNewSnippetContent(e.target.value)}
          placeholder="Enter new snippet content"
        />
        <button type="submit" className="button button-primary">Create Snippet</button>
      </form>

      {snippets.length === 0 && !isLoading && (
        <p className="empty-state-message">No snippets yet. Add one above!</p>
      )}

      <ul className="item-list">
        {snippets.map((snippet) => (
          <li key={snippet.id} className="item-list-item">
            <span className="item-content">{snippet.content}</span>
            <div className="item-actions">
              <button className="button button-secondary" onClick={() => handleCopySnippet(snippet.content)}>Copy</button>
              <button className="button button-secondary" onClick={() => handlePasteSnippet(snippet.content)}>Paste</button>
              <button className="button button-secondary" onClick={() => handleEditSnippet(snippet)}>Edit</button>
              <button className="button button-danger" onClick={() => setSnippetToDelete(snippet)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>

      {editingSnippet && (
        <Modal
          isOpen={!!editingSnippet}
          onClose={() => setEditingSnippet(null)}
          title="Edit Snippet"
          confirmText="Save Changes"
          onConfirm={handleSaveEdit}
        >
          <textarea
             value={editedContent} 
             onChange={(e) => setEditedContent(e.target.value)}
             autoFocus
             placeholder="Edit snippet content"
          />
        </Modal>
      )}

      {snippetToDelete && (
        <Modal
          isOpen={!!snippetToDelete}
          onClose={() => setSnippetToDelete(null)}
          title="Confirm Deletion"
          confirmText="Delete"
          onConfirm={handleDeleteSnippet}
        >
          <p>Are you sure you want to delete this snippet?</p>
          <p><strong>{snippetToDelete.content}</strong></p>
        </Modal>
      )}
    </div>
  );
};

export default SnippetManagerView; 