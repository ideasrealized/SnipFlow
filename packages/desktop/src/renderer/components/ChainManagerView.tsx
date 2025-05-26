import React from 'react';
import ChainListPanel from './ChainListPanel';
import HybridChainEditorView from './HybridChainEditorView';

const ChainManagerView: React.FC = () => {
  const [selectedChainId, setSelectedChainId] = React.useState<number | null>(null);

  // Styles (inline for brevity, consider moving to CSS files/modules)
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'row' as 'row',
      height: '100vh', // Or parent height
      padding: '10px',
      boxSizing: 'border-box' as 'border-box',
      fontFamily: 'Arial, sans-serif', // Basic font
    },
    sidebar: {
      width: '300px',
      minWidth: '250px', // Prevent too much squishing
      borderRight: '1px solid #ccc',
      paddingRight: '10px',
      marginRight: '10px',
      overflowY: 'auto' as 'auto',
    },
    mainContent: {
      flexGrow: 1,
      overflowY: 'auto' as 'auto',
      paddingLeft: '10px',
    },
    placeholderText: {
      color: '#777',
      textAlign: 'center' as 'center',
      marginTop: '50px',
      fontSize: '1.1em'
    }
  };

  const handleChainSelected = (id: number) => {
    setSelectedChainId(id);
  };

  // Callback if a chain is deleted, to potentially clear selection
  // This can be passed down to ChainListPanel if needed, for it to call when a delete happens.
  // For now, if a selected chain is deleted, the HybridChainEditorView might show an error or "not found".

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <ChainListPanel onSelectChain={handleChainSelected} />
      </div>
      <div style={styles.mainContent}>
        {selectedChainId ? (
          <HybridChainEditorView chainId={selectedChainId} />
        ) : (
          <p style={styles.placeholderText}>Select a chain from the list to edit, or create a new one.</p>
        )}
      </div>
    </div>
  );
};

export default ChainManagerView; 