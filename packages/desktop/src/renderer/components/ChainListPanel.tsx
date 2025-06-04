import React, { useEffect, useState, useCallback } from 'react';
// import { randomUUID } from 'crypto'; // Removed Node crypto import
import type { Chain, ChainOption } from '../../types'; // Ensure ChainOption is imported
// import { globalThis } from '../../utils/global'; // Removed this problematic import

interface ChainListPanelProps {
  onSelectChain: (id: number) => void;
  // currentSelectedId?: number | null; // Optional: to highlight selected item
}

// REMOVED: Augment window with ipcRenderer for TypeScript
// declare global {
//   interface Window {
//     api?: {
//       invoke: (channel: string, ...args: any[]) => Promise<any>;
//     };
//   }
// }

const ChainListPanel: React.FC<ChainListPanelProps> = ({ onSelectChain }) => {
  const [chains, setChains] = useState<Chain[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showNameInput, setShowNameInput] = useState<boolean>(false);
  const [newChainName, setNewChainName] = useState<string>('');

  const fetchChains = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Use specific API method from preload.ts, now typed globally
      const result = await window.api.listChains();
      setChains(result || []);
    } catch (err: any) {
      console.error('Error fetching chains:', err);
      setError(err.message || 'Failed to fetch chains');
      setChains([]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchChains();
  }, [fetchChains]);

  const handleInitiateCreateChain = () => {
    setNewChainName(''); // Reset name field
    setError(null); // Clear previous errors
    setShowNameInput(true);
  };

  const handleCancelCreateChain = () => {
    setShowNameInput(false);
    setNewChainName('');
    setError(null);
  };

  const handleConfirmCreateChain = async () => {
    const nameToCreate = newChainName.trim();
    if (!nameToCreate) {
      setError('Chain name cannot be empty.');
      return;
    }

    const defaultOption: ChainOption = {
      // id: globalThis.crypto.randomUUID(), // Using globalThis directly
      id: crypto.randomUUID(), // Modern browsers provide crypto on globalThis by default
      title: 'First Option',
      body: 'Edit this first option...',
    };
    setIsLoading(true);
    setError(null); // Clear previous errors before trying
    try {
      const defaultOptions: ChainOption[] = [defaultOption];
      const newChain = await window.api.createChain(
        nameToCreate,
        defaultOptions
      );
      if (newChain && newChain.id) {
        await fetchChains();
        onSelectChain(newChain.id);
        setShowNameInput(false); // Hide input on success
        setNewChainName(''); // Clear name
      } else {
        // This case might not be hit if createChain always throws or returns a valid chain
        throw new Error('Failed to create chain or receive new chain ID.');
      }
    } catch (err: any) {
      console.error('Error creating chain:', err);
      if (
        err.message &&
        err.message.toLowerCase().includes('unique constraint failed')
      ) {
        setError(
          `A chain with the name "${nameToCreate}" already exists. Please choose a different name.`
        );
      } else {
        setError(err.message || 'Failed to create chain');
      }
      // Keep input open for correction if error
    }
    setIsLoading(false);
  };

  const handleDeleteChain = async (id: number, name: string) => {
    // confirm() also might have issues in some Electron contexts, replace if problematic
    if (confirm(`Are you sure you want to delete the chain "${name}"?`)) {
      setIsLoading(true);
      try {
        await window.api.deleteChain(id);
        await fetchChains(); // Refresh list
      } catch (err: any) {
        console.error('Error deleting chain:', err);
        setError(err.message || 'Failed to delete chain');
      }
      setIsLoading(false);
    }
  };

  // Basic inline styles
  const styles = {
    button: { marginBottom: '10px', padding: '5px 10px' },
    list: { listStyle: 'none', padding: 0 },
    listItem: {
      padding: '8px',
      borderBottom: '1px solid #eee',
      cursor: 'pointer',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    listItemHover: { backgroundColor: '#f0f0f0' }, // Example hover
    deleteButton: {
      color: 'red',
      marginLeft: '10px',
      cursor: 'pointer',
      border: 'none',
      background: 'none',
    },
    error: { color: 'red' },
    loading: { fontStyle: 'italic' },
  };

  if (isLoading) return <p>Loading chains...</p>;
  // Error display will be handled below, next to relevant controls

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        gap: '10px',
      }}
    >
      <h3>SnipChains</h3>
      {error && !showNameInput && <p style={{ color: 'red' }}>{error}</p>}
      {/* Show general errors if not in name input mode */}

      {!showNameInput ? (
        <button
          onClick={handleInitiateCreateChain}
          style={{ padding: '8px', cursor: 'pointer' }}
          disabled={isLoading}
        >
          Create New Chain
        </button>
      ) : (
        <div
          style={{
            border: '1px solid #ccc',
            padding: '10px',
            borderRadius: '4px',
            background: '#f9f9f9',
          }}
        >
          <h4>Enter New Chain Name:</h4>
          <input
            type="text"
            value={newChainName}
            onChange={e => setNewChainName(e.target.value)}
            placeholder="My Awesome Chain"
            style={{
              padding: '6px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              width: 'calc(100% - 14px)',
              marginBottom: '8px',
            }}
            disabled={isLoading}
            autoFocus
          />
          {error && (
            <p style={{ color: 'red', fontSize: '0.9em', margin: '0 0 8px 0' }}>
              {error}
            </p>
          )}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleConfirmCreateChain}
              style={{
                padding: '8px',
                cursor: 'pointer',
                flexGrow: 1,
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
              }}
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Confirm'}
            </button>
            <button
              onClick={handleCancelCreateChain}
              style={{
                padding: '8px',
                cursor: 'pointer',
                flexGrow: 1,
                background: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
              }}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {chains.length === 0 && !isLoading && !showNameInput && (
        <p>No chains found. Click "Create New Chain" to start.</p>
      )}
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          overflowY: 'auto',
          flexGrow: 1,
        }}
      >
        {chains.map(chain => (
          <li
            key={chain.id}
            style={styles.listItem}
            onClick={() => onSelectChain(chain.id)}
            onMouseEnter={e =>
              (e.currentTarget.style.backgroundColor =
                styles.listItemHover.backgroundColor)
            }
            onMouseLeave={e =>
              (e.currentTarget.style.backgroundColor = 'transparent')
            }
          >
            <span>{chain.name}</span>
            <button
              style={styles.deleteButton}
              onClick={e => {
                e.stopPropagation(); // Prevent li onClick from firing
                handleDeleteChain(chain.id, chain.name);
              }}
              disabled={isLoading}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChainListPanel;
