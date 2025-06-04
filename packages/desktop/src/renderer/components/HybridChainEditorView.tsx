import React, { useEffect, useState, useCallback } from 'react';
import type { Chain, ChainOption } from '../../types'; // Import ChainOption
// import ChainNodeListEditor from './ChainNodeListEditor'; // To be replaced
import ChainOptionsEditor from './ChainOptionsEditor'; // New component
import ChainVisualizerMiniMap from './ChainVisualizerMiniMap';

interface HybridChainEditorViewProps {
  chainId: number;
}

// Assuming window.api is typed via global declaration in another file (e.g., ChainListPanel.tsx or a central types file)

const HybridChainEditorView: React.FC<HybridChainEditorViewProps> = ({
  chainId,
}) => {
  const [chain, setChain] = useState<Chain | null>(null);
  const [chainName, setChainName] = useState<string>('');
  const [chainDescription, setChainDescription] = useState<string>('');
  // const [chainTags, setChainTags] = useState<string[]>([]); // For later tag editing
  const [options, setOptions] = useState<ChainOption[]>([]); // Changed from nodes
  const [isPinned, setIsPinned] = useState<boolean>(false); // << NEW STATE for pinned status
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const fetchChainDetails = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      // Use the new getChainById method
      const fetchedChain = await window.api.getChainById(id);

      if (fetchedChain) {
        setChain(fetchedChain);
        setChainName(fetchedChain.name);
        setChainDescription(fetchedChain.description || '');
        setOptions(fetchedChain.options || []); // Changed from fetchedChain.nodes
        setIsPinned(fetchedChain.pinned || false); // << SET isPinned from fetched chain
        // setChainTags(fetchedChain.tags || []);
      } else {
        throw new Error(`Chain with ID ${id} not found.`);
      }
    } catch (err: any) {
      console.error(`Error fetching chain ${id}:`, err);
      setError(err.message || 'Failed to fetch chain details');
      setChain(null);
      setOptions([]); // Clear options on error
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (chainId) {
      fetchChainDetails(chainId);
    }
  }, [chainId, fetchChainDetails]);

  const handleSaveChanges = async () => {
    if (!chain) {
      setError('No chain loaded to save.');
      return;
    }
    if (!chainName.trim()) {
      setError('Chain name cannot be empty.');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      // Log arguments before sending via IPC (NEW ORDER)
      const updateData: Partial<Omit<Chain, 'id'>> = {
        name: chainName.trim(),
        options: options,
        description: chainDescription.trim(),
        pinned: isPinned,
      };

      if (chain.tags) {
        updateData.tags = chain.tags;
      }
      if (chain.layoutData) {
        updateData.layoutData = chain.layoutData;
      }

      console.log(
        `[HybridChainEditorView] About to call window.api.updateChain with:`
      );
      console.log(`  ID: ${chain.id} (type: ${typeof chain.id})`);
      console.log(`  Data:`, JSON.parse(JSON.stringify(updateData)));

      // Construct the updated chain data with the new options structure
      await window.api.updateChain(
        chain.id, // ID is FIRST
        updateData
      );
      // alert('Chain saved successfully!'); // REMOVED: This can disrupt focus
      // Optionally, provide a gentler feedback mechanism here, like a temporary status message
      console.log('[HybridChainEditorView] Chain saved successfully via API.'); // For now, just log

      // Optionally re-fetch to confirm, or rely on local state being source of truth post-save
      // fetchChainDetails(chain.id);
    } catch (err: any) {
      console.error('Error saving chain:', err);
      setError(err.message || 'Failed to save chain');
    }
    setIsSaving(false);
  };

  // Callback for ChainOptionsEditor to update options state
  const handleOptionsChange = (newOptions: ChainOption[]) => {
    setOptions(newOptions);
  };

  // Inline styles for layout
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      height: '100%',
      gap: '10px',
    },
    metadataForm: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px',
      paddingBottom: '10px',
      borderBottom: '1px solid #ccc',
    },
    editorAndMinimap: {
      display: 'flex',
      flexGrow: 1,
      gap: '10px',
      overflow: 'hidden' /* Prevent outer scroll */,
    },
    optionEditorContainer: {
      flexGrow: 3,
      /* border: '1px solid #eee', */ padding: '0px',
      overflowY: 'auto' as const,
    },
    miniMapContainer: {
      flexGrow: 1,
      border: '1px solid #eee',
      padding: '10px',
      overflowY: 'auto' as const,
      background: '#f9f9f9',
    },
    label: { fontWeight: 'bold', marginBottom: '4px' },
    input: { padding: '6px', border: '1px solid #ccc', borderRadius: '4px' },
    textarea: {
      padding: '6px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      minHeight: '60px',
    }, // Style for textarea
    button: { padding: '8px 15px', cursor: 'pointer' },
    error: { color: 'red' },
    loading: { fontStyle: 'italic' },
  };

  if (isLoading) return <p style={styles.loading}>Loading chain details...</p>;
  if (error && !chain) return <p style={styles.error}>Error: {error}</p>; // Show error if chain couldn't be loaded
  if (!chain) return <p>Select a chain to view its details.</p>; // Should not happen if chainId is provided and loading finishes

  return (
    <div style={styles.container}>
      <div style={styles.metadataForm}>
        <h3>
          Edit Chain: {chain.name} (ID: {chain.id})
        </h3>
        <div>
          <label htmlFor="chainName" style={styles.label}>
            Name:
          </label>
          <input
            type="text"
            id="chainName"
            style={styles.input}
            value={chainName}
            onChange={e => setChainName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="chainDescription" style={styles.label}>
            Description:
          </label>
          <textarea
            id="chainDescription"
            style={styles.textarea}
            value={chainDescription}
            onChange={e => setChainDescription(e.target.value)}
          />
        </div>
        <div>
          <label
            htmlFor="chainPinned"
            style={{ ...styles.label, display: 'flex', alignItems: 'center' }}
          >
            <input
              type="checkbox"
              id="chainPinned"
              style={{ marginRight: '8px' }}
              checked={isPinned}
              onChange={e => setIsPinned(e.target.checked)}
            />
            Pinned
          </label>
        </div>
        {/* Tag editor will go here later */}
        <button
          onClick={handleSaveChanges}
          style={styles.button}
          disabled={isSaving || isLoading}
        >
          {isSaving ? 'Saving...' : 'Save Chain'}
        </button>
        {error && <p style={styles.error}>Error during save: {error}</p>}{' '}
        {/* Show save-specific errors here */}
      </div>

      <div style={styles.editorAndMinimap}>
        <div style={styles.optionEditorContainer}>
          {/* <h4>Nodes</h4> // Title can be part of ChainNodeListEditor itself or removed for cleaner UI */}
          <ChainOptionsEditor
            key={chain?.id || 'no-chain-selected'}
            initialOptions={options}
            onOptionsChange={handleOptionsChange}
          />
          {/* <pre>{JSON.stringify(nodes, null, 2)}</pre> */}
        </div>
        <div style={styles.miniMapContainer}>
          {/* <h4>Mini-Map (Visualizer)</h4> // Title can be part of the component itself */}
          <ChainVisualizerMiniMap
            currentChainOptions={options}
            currentChainName={chainName}
          />
          {/* <p>(ChainVisualizerMiniMap Placeholder)</p> */}
        </div>
      </div>
    </div>
  );
};

export default HybridChainEditorView;
