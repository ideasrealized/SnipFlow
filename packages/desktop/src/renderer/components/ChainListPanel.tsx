import React, { useEffect, useState, useCallback } from 'react';
import type { Chain, ChainOption } from '../../types';
import ChainCard from './ChainCard';

interface ChainListPanelProps {
  onSelectChain: (id: number) => void;
  selectedChainId?: number | null;
}

const ChainListPanel: React.FC<ChainListPanelProps> = ({ onSelectChain, selectedChainId }) => {
  const [chains, setChains] = useState<Chain[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadChains = async () => {
    try {
      setIsLoading(true);
      const allChains = await window.api.listChains();
      setChains(allChains);
    } catch (error) {
      console.error('Failed to load chains:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadChains();
  }, []);

  const handleCreateChain = async () => {
    try {
      const newChain = await window.api.createChain(
        'New Chain',
        [
          {
            id: crypto.randomUUID(),
            title: 'Default Option',
            body: 'This is a default option. Edit it to customize your chain.'
          }
        ],
        'A new chain ready for customization',
        [],
        null,
        false
      );
      
      if (newChain) {
        await loadChains();
        onSelectChain(newChain.id);
      }
    } catch (error) {
      console.error('Failed to create chain:', error);
    }
  };

  const handleDeleteChain = async (id: number) => {
    const chain = chains.find(c => c.id === id);
    if (!chain) return;
    
    if (confirm(`Are you sure you want to delete the chain "${chain.name}"?`)) {
      setIsLoading(true);
      try {
        const result = await window.api.deleteChain(id);
        if (result.success) {
          await loadChains();
          if (selectedChainId === id) {
            onSelectChain(-1);
          }
        } else {
          setError(result.error || 'Failed to delete chain');
        }
      } catch (err: any) {
        console.error('Error deleting chain:', err);
        setError(err.message || 'Failed to delete chain');
      }
      setIsLoading(false);
    }
  };

  const handleToggleStarter = async (id: number, currentIsStarter: boolean) => {
    setIsLoading(true);
    try {
      const result = await window.api.updateChain(id, { isStarterChain: !currentIsStarter });
      if (result.success) {
        await loadChains();
      } else {
        setError(result.error || 'Failed to update starter status');
      }
    } catch (err: any) {
      console.error('Error toggling starter status:', err);
      setError(err.message || 'Failed to update starter status');
    }
    setIsLoading(false);
  };

  const handleTogglePin = async (id: number, currentIsPinned: boolean) => {
    setIsLoading(true);
    try {
      const result = await window.api.toggleChainPin(id, !currentIsPinned);
      if (result.success) {
        await loadChains();
      } else {
        setError(result.error || 'Failed to update pin status');
      }
    } catch (err: any) {
      console.error('Error toggling pin status:', err);
      setError(err.message || 'Failed to update pin status');
    }
    setIsLoading(false);
  };

  const handleExportAll = async () => {
    if (chains.length === 0) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const chainIds = chains.map(chain => chain.id);
      const exportPath = await window.api.exportChains(chainIds, {
        format: 'snip',
        includeMetadata: true
      });
      
      if (exportPath) {
        // Show success message or notification
        console.log('Chains exported successfully to:', exportPath);
      }
    } catch (err: any) {
      console.error('Error exporting chains:', err);
      setError(err.message || 'Failed to export chains');
    }
    setIsLoading(false);
  };

  const handleExportChain = async (chainId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const exportPath = await window.api.exportChain(chainId, {
        format: 'snip',
        includeMetadata: true
      });
      
      if (exportPath) {
        // Show success message or notification
        console.log('Chain exported successfully to:', exportPath);
      }
    } catch (err: any) {
      console.error('Error exporting chain:', err);
      setError(err.message || 'Failed to export chain');
    }
    setIsLoading(false);
  };

  const handleImport = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const importResult = await window.api.importChainsWithDialog();

      if (importResult.success) {
        console.log(`Successfully imported ${importResult.imported} chains`);
        if (importResult.skipped > 0) {
          console.log(`Skipped ${importResult.skipped} chains due to conflicts`);
        }
        
        // Reload chains to show imported ones
        await loadChains();
      } else if (!importResult.canceled) {
        setError('Failed to import chains: ' + (importResult.errors?.join(', ') || 'Unknown error'));
      }
      // If canceled, do nothing (no error message)
    } catch (err: any) {
      console.error('Error importing chains:', err);
      setError(err.message || 'Failed to import chains');
    }
    setIsLoading(false);
  };

  // Filter chains based on search query
  const filteredChains = chains.filter(chain =>
    chain.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (chain.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: '#0F172A',
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid #1E293B',
  };

  const headerStyles: React.CSSProperties = {
    marginBottom: '16px',
  };

  const titleStyles: React.CSSProperties = {
    margin: '0 0 16px 0',
    fontSize: '20px',
    fontWeight: '700',
    color: '#F8FAFC',
  };

  const searchInputStyles: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    background: '#1E293B',
    border: '1px solid #334155',
    borderRadius: '8px',
    color: '#F8FAFC',
    fontSize: '14px',
    marginBottom: '12px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
  };

  const createButtonStyles: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
    border: 'none',
    borderRadius: '8px',
    color: '#FFFFFF',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginBottom: '16px',
  };

  const exportButtonStyles: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
    border: 'none',
    borderRadius: '8px',
    color: '#FFFFFF',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginBottom: '16px',
  };

  const chainsContainerStyles: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto' as const,
    paddingRight: '4px',
  };

  const emptyStateStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '200px',
    color: '#64748B',
    textAlign: 'center' as const,
    padding: '20px',
  };

  const emptyIconStyles: React.CSSProperties = {
    fontSize: '48px',
    marginBottom: '16px',
    opacity: 0.5,
  };

  const errorStyles: React.CSSProperties = {
    color: '#EF4444',
    fontSize: '14px',
    marginBottom: '16px',
    padding: '12px 16px',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '8px',
  };

  const loadingStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
    color: '#64748B',
    fontSize: '14px',
  };

  return (
    <div style={containerStyles}>
      <div style={headerStyles}>
        <h2 style={titleStyles}>Chains</h2>
        
        <input
          type="text"
          placeholder="Search chains..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={searchInputStyles}
        />
        
        <button
          onClick={handleCreateChain}
          disabled={isLoading}
          style={{
            ...createButtonStyles,
            opacity: isLoading ? 0.6 : 1,
            cursor: isLoading ? 'not-allowed' : 'pointer',
          }}
          onMouseOver={(e) => {
            if (!isLoading) {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 8px 25px -5px rgba(79, 70, 229, 0.4)';
            }
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {isLoading ? 'Creating...' : '+ Create New Chain'}
        </button>
        
        <button
          onClick={handleExportAll}
          disabled={isLoading || chains.length === 0}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
            border: 'none',
            borderRadius: '8px',
            color: '#FFFFFF',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            marginBottom: '16px',
            opacity: (isLoading || chains.length === 0) ? 0.6 : 1,
          }}
          onMouseOver={(e) => {
            if (!isLoading && chains.length > 0) {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 8px 25px -5px rgba(34, 197, 94, 0.4)';
            }
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          📤 Export All Chains (.snip)
        </button>
      </div>
      
      {error && (
        <div style={errorStyles}>{error}</div>
      )}

      <div style={chainsContainerStyles}>
        {isLoading && chains.length === 0 ? (
          <div style={loadingStyles}>
            Loading chains...
          </div>
        ) : filteredChains.length === 0 ? (
          <div style={emptyStateStyles}>
            <div style={emptyIconStyles}>🔗</div>
            <p>
              {searchQuery ? 'No chains match your search.' : 'No chains yet. Create your first chain to get started!'}
            </p>
          </div>
        ) : (
          filteredChains.map((chain) => (
            <ChainCard
              key={chain.id}
              chain={chain}
              isSelected={selectedChainId === chain.id}
              onSelect={onSelectChain}
              onDelete={handleDeleteChain}
              onToggleStarter={handleToggleStarter}
              onTogglePin={handleTogglePin}
              onExport={handleExportChain}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ChainListPanel;