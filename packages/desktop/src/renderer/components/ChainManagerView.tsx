import React from 'react';
import ChainListPanel from './ChainListPanel';
import HybridChainEditorView from './HybridChainEditorView';

const ChainManagerView: React.FC = () => {
  const [selectedChainId, setSelectedChainId] = React.useState<number | null>(null);

  const handleChainSelected = (id: number) => {
    // Handle clear selection signal
    if (id === -1) {
      setSelectedChainId(null);
    } else {
      setSelectedChainId(id);
    }
  };

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    height: '100vh',
    background: '#020617',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    color: '#F8FAFC',
  };

  const sidebarStyles: React.CSSProperties = {
    width: '400px',
    minWidth: '350px',
    maxWidth: '500px',
    borderRight: '1px solid #1E293B',
    padding: '16px',
    overflowY: 'auto',
    background: '#0F172A',
  };

  const mainContentStyles: React.CSSProperties = {
    flexGrow: 1,
    overflowY: 'auto',
    padding: '16px',
    background: '#020617',
  };

  const placeholderStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#64748B',
    textAlign: 'center',
  };

  const placeholderIconStyles: React.CSSProperties = {
    fontSize: '64px',
    marginBottom: '16px',
    opacity: 0.5,
  };

  const placeholderTitleStyles: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#94A3B8',
  };

  const placeholderTextStyles: React.CSSProperties = {
    fontSize: '16px',
    lineHeight: '1.5',
    maxWidth: '400px',
  };

  return (
    <div style={containerStyles}>
      <div style={sidebarStyles}>
        <ChainListPanel 
          onSelectChain={handleChainSelected} 
          selectedChainId={selectedChainId}
        />
      </div>
      <div style={mainContentStyles}>
        {selectedChainId ? (
          <HybridChainEditorView chainId={selectedChainId} />
        ) : (
          <div style={placeholderStyles}>
            <div style={placeholderIconStyles}>🔗</div>
            <h2 style={placeholderTitleStyles}>Welcome to Chain Manager</h2>
            <p style={placeholderTextStyles}>
              Select a chain from the sidebar to start editing, or create a new chain to get started. 
              Chain Manager provides powerful tools for creating and managing your SnipChain workflows.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChainManagerView; 