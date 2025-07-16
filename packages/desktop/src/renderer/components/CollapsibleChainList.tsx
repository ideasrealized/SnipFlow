import React, { useState } from 'react';
import type { Chain } from '../../types';
import ChainCard from './ChainCard';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CollapsibleChainListProps {
  title: string;
  chains: Chain[];
  selectedChainId?: number | null | undefined;
  onSelectChain: (id: number) => void;
  onDeleteChain: (id: number) => void;
  onToggleStarter: (id: number, current: boolean) => void;
  onTogglePin: (id: number, current: boolean) => void;
  onExportChain: (id: number) => void;
  icon?: string;
  defaultExpanded?: boolean;
}

const CollapsibleChainList: React.FC<CollapsibleChainListProps> = ({
  title,
  chains,
  selectedChainId,
  onSelectChain,
  onDeleteChain,
  onToggleStarter,
  onTogglePin,
  onExportChain,
  icon = '📁',
  defaultExpanded = true
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const headerStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginBottom: isExpanded ? '8px' : '0',
  };

  const titleStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#F9FAFB',
  };

  const countBadgeStyles: React.CSSProperties = {
    background: '#374151',
    color: '#D1D5DB',
    fontSize: '11px',
    padding: '2px 6px',
    borderRadius: '10px',
    marginLeft: '8px',
  };

  const contentStyles: React.CSSProperties = {
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    maxHeight: isExpanded ? '2000px' : '0',
    opacity: isExpanded ? 1 : 0,
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      <div
        style={headerStyles}
        onClick={() => setIsExpanded(!isExpanded)}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
        }}
      >
        <div style={titleStyles}>
          <span>{icon}</span>
          <span>{title}</span>
          <span style={countBadgeStyles}>{chains.length}</span>
        </div>
        {isExpanded ? (
          <ChevronUp size={16} color="#9CA3AF" />
        ) : (
          <ChevronDown size={16} color="#9CA3AF" />
        )}
      </div>
      
      <div style={contentStyles}>
        {chains.length === 0 ? (
          <div style={{
            padding: '20px',
            textAlign: 'center',
            color: '#64748B',
            fontSize: '13px',
          }}>
            No chains in this category
          </div>
        ) : (
          chains.map((chain) => (
            <ChainCard
              key={chain.id}
              chain={chain}
              isSelected={selectedChainId === chain.id}
              onSelect={onSelectChain}
              onDelete={onDeleteChain}
              onToggleStarter={onToggleStarter}
              onTogglePin={onTogglePin}
              onExport={onExportChain}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default CollapsibleChainList;
