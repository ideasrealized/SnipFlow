import React, { useState, useEffect } from 'react';
import type { Chain } from '../../types';

interface SearchFilters {
  query: string;
  showStarters: boolean;
  showPinned: boolean;
  showWithLinks: boolean;
  sortBy: 'name' | 'created' | 'updated' | 'options';
  sortOrder: 'asc' | 'desc';
}

interface ChainSearchPanelProps {
  chains: Chain[];
  onFilteredChainsChange: (filteredChains: Chain[]) => void;
  onFiltersChange: (filters: SearchFilters) => void;
}

const ChainSearchPanel: React.FC<ChainSearchPanelProps> = ({
  chains,
  onFilteredChainsChange,
  onFiltersChange
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    showStarters: false,
    showPinned: false,
    showWithLinks: false,
    sortBy: 'updated',
    sortOrder: 'desc'
  });

  const [activeTab, setActiveTab] = useState<'all' | 'starters' | 'pinned' | 'linked'>('all');

  // Calculate counts for filter tabs
  const counts = {
    all: chains.length,
    starters: chains.filter(c => c.isStarterChain).length,
    pinned: chains.filter(c => c.isPinned).length,
    linked: chains.filter(c => {
      const linkCount = c.options?.reduce((count, option) => {
        const matches = (option.body || '').match(/\[Chain:[^\]]+\]/g);
        return count + (matches?.length || 0);
      }, 0) || 0;
      return linkCount > 0;
    }).length
  };

  // Filter and sort chains
  useEffect(() => {
    let filtered = [...chains];

    // Text search
    if (filters.query.trim()) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(chain => 
        chain.name.toLowerCase().includes(query) ||
        (chain.description || '').toLowerCase().includes(query) ||
        chain.options?.some(option => 
          option.title.toLowerCase().includes(query) ||
          option.body.toLowerCase().includes(query)
        ) ||
        chain.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Tab-based filtering
    switch (activeTab) {
      case 'starters':
        filtered = filtered.filter(c => c.isStarterChain);
        break;
      case 'pinned':
        filtered = filtered.filter(c => c.isPinned);
        break;
      case 'linked':
        filtered = filtered.filter(c => {
          const linkCount = c.options?.reduce((count, option) => {
            const matches = (option.body || '').match(/\[Chain:[^\]]+\]/g);
            return count + (matches?.length || 0);
          }, 0) || 0;
          return linkCount > 0;
        });
        break;
    }

    // Additional filters
    if (filters.showStarters && activeTab === 'all') {
      filtered = filtered.filter(c => c.isStarterChain);
    }
    if (filters.showPinned && activeTab === 'all') {
      filtered = filtered.filter(c => c.isPinned);
    }
    if (filters.showWithLinks && activeTab === 'all') {
      filtered = filtered.filter(c => {
        const linkCount = c.options?.reduce((count, option) => {
          const matches = (option.body || '').match(/\[Chain:[^\]]+\]/g);
          return count + (matches?.length || 0);
        }, 0) || 0;
        return linkCount > 0;
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (filters.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'created':
          aValue = new Date(a.createdAt || '').getTime();
          bValue = new Date(b.createdAt || '').getTime();
          break;
        case 'updated':
          aValue = new Date(a.updatedAt || a.createdAt || '').getTime();
          bValue = new Date(b.updatedAt || b.createdAt || '').getTime();
          break;
        case 'options':
          aValue = a.options?.length || 0;
          bValue = b.options?.length || 0;
          break;
        default:
          return 0;
      }

      if (filters.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    onFilteredChainsChange(filtered);
    onFiltersChange(filters);
  }, [chains, filters, activeTab, onFilteredChainsChange, onFiltersChange]);

  const handleQueryChange = (query: string) => {
    setFilters(prev => ({ ...prev, query }));
  };

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
  };

  const handleSortChange = (sortBy: SearchFilters['sortBy']) => {
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'desc' ? 'asc' : 'desc'
    }));
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      showStarters: false,
      showPinned: false,
      showWithLinks: false,
      sortBy: 'updated',
      sortOrder: 'desc'
    });
    setActiveTab('all');
  };

  const containerStyles: React.CSSProperties = {
    background: '#111827',
    border: '1px solid #1F2937',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '16px',
  };

  const searchInputStyles: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    background: '#1F2937',
    border: '1px solid #374151',
    borderRadius: '8px',
    color: '#F9FAFB',
    fontSize: '14px',
    marginBottom: '16px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
  };

  const tabsContainerStyles: React.CSSProperties = {
    display: 'flex',
    gap: '4px',
    marginBottom: '16px',
    background: '#1F2937',
    padding: '4px',
    borderRadius: '8px',
  };

  const tabStyles = (isActive: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '8px 12px',
    background: isActive ? '#4F46E5' : 'transparent',
    color: isActive ? '#FFFFFF' : '#9CA3AF',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'center' as const,
  });

  const sortContainerStyles: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    marginBottom: '12px',
  };

  const sortButtonStyles = (isActive: boolean): React.CSSProperties => ({
    padding: '6px 12px',
    background: isActive ? '#374151' : 'transparent',
    color: isActive ? '#F9FAFB' : '#9CA3AF',
    border: '1px solid #374151',
    borderRadius: '6px',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  });

  const clearButtonStyles: React.CSSProperties = {
    padding: '6px 12px',
    background: '#EF4444',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  return (
    <div style={containerStyles}>
      {/* Search Input */}
      <input
        type="text"
        placeholder="Search chains by name, description, or content..."
        value={filters.query}
        onChange={(e) => handleQueryChange(e.target.value)}
        style={searchInputStyles}
        onFocus={(e) => e.target.style.borderColor = '#4F46E5'}
        onBlur={(e) => e.target.style.borderColor = '#374151'}
      />

      {/* Filter Tabs */}
      <div style={tabsContainerStyles}>
        <button
          style={tabStyles(activeTab === 'all')}
          onClick={() => handleTabChange('all')}
        >
          All ({counts.all})
        </button>
        <button
          style={tabStyles(activeTab === 'starters')}
          onClick={() => handleTabChange('starters')}
        >
          🚀 Starters ({counts.starters})
        </button>
        <button
          style={tabStyles(activeTab === 'pinned')}
          onClick={() => handleTabChange('pinned')}
        >
          📌 Pinned ({counts.pinned})
        </button>
        <button
          style={tabStyles(activeTab === 'linked')}
          onClick={() => handleTabChange('linked')}
        >
          🔗 Linked ({counts.linked})
        </button>
      </div>

      {/* Sort Options */}
      <div style={sortContainerStyles}>
        <span style={{ fontSize: '12px', color: '#9CA3AF', marginRight: '8px' }}>Sort by:</span>
        <button
          style={sortButtonStyles(filters.sortBy === 'name')}
          onClick={() => handleSortChange('name')}
        >
          Name {filters.sortBy === 'name' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        <button
          style={sortButtonStyles(filters.sortBy === 'updated')}
          onClick={() => handleSortChange('updated')}
        >
          Updated {filters.sortBy === 'updated' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        <button
          style={sortButtonStyles(filters.sortBy === 'options')}
          onClick={() => handleSortChange('options')}
        >
          Options {filters.sortBy === 'options' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        
        {(filters.query || activeTab !== 'all' || filters.showStarters || filters.showPinned || filters.showWithLinks) && (
          <button
            style={clearButtonStyles}
            onClick={clearFilters}
            title="Clear all filters"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
};

export default ChainSearchPanel; 