import React, { useState } from 'react';
import type { Chain } from '../../types';

interface ChainCardProps {
  chain: Chain;
  isSelected: boolean;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
  onToggleStarter: (id: number, current: boolean) => void;
  onTogglePin: (id: number, current: boolean) => void;
  onExport: (id: number) => void;
}

const ChainCard: React.FC<ChainCardProps> = ({ 
  chain, 
  isSelected, 
  onSelect, 
  onDelete, 
  onToggleStarter,
  onTogglePin,
  onExport
}) => {
  const [showActions, setShowActions] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Calculate chain metadata
  const optionCount = chain.options?.length || 0;
  const tagCount = chain.tags?.length || 0;
  const chainLinkCount = chain.options?.reduce((count, option) => {
    const matches = (option.body || '').match(/\[Chain:[^\]]+\]/g);
    return count + (matches?.length || 0);
  }, 0) || 0;

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(chain.id);
  };
  
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Open chain editor on double-click
    onSelect(chain.id);
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const cardStyles: React.CSSProperties = {
    background: isSelected 
      ? 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)'
      : isHovered 
      ? '#1F2937' 
      : '#111827',
    border: isSelected 
      ? '2px solid #4F46E5' 
      : isHovered 
      ? '1px solid #374151' 
      : '1px solid #1F2937',
    borderRadius: '12px',
    padding: '16px',
    margin: '8px 0',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    position: 'relative' as const,
    boxShadow: isSelected 
      ? '0 10px 25px -5px rgba(79, 70, 229, 0.3)' 
      : isHovered 
      ? '0 4px 12px -2px rgba(0, 0, 0, 0.3)' 
      : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
    color: isSelected ? '#FFFFFF' : '#F9FAFB',
  };

  const headerStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  };

  const titleSectionStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
  };

  const titleStyles: React.CSSProperties = {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    color: isSelected ? '#FFFFFF' : '#F9FAFB',
    lineHeight: '1.4',
  };

  const optionCountStyles: React.CSSProperties = {
    fontSize: '12px',
    color: isSelected ? 'rgba(255, 255, 255, 0.8)' : '#9CA3AF',
    background: isSelected ? 'rgba(255, 255, 255, 0.2)' : '#374151',
    padding: '2px 8px',
    borderRadius: '12px',
    fontWeight: '500',
  };

  const descriptionStyles: React.CSSProperties = {
    fontSize: '14px',
    color: isSelected ? 'rgba(255, 255, 255, 0.9)' : '#D1D5DB',
    lineHeight: '1.4',
    marginBottom: '12px',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
  };

  const metadataStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '12px',
    color: isSelected ? 'rgba(255, 255, 255, 0.7)' : '#9CA3AF',
  };

  const badgeContainerStyles: React.CSSProperties = {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
  };

  const starterBadgeStyles: React.CSSProperties = {
    background: '#F59E0B',
    color: '#FFFFFF',
    fontSize: '10px',
    fontWeight: '700',
    padding: '2px 6px',
    borderRadius: '6px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  };

  const actionButtonStyles: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: isSelected ? 'rgba(255, 255, 255, 0.8)' : '#9CA3AF',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    fontSize: '14px',
    transition: 'all 0.2s ease',
  };

  return (
    <div
      style={cardStyles}
      onClick={handleCardClick}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowActions(false);
      }}
      onMouseOver={() => setShowActions(true)}
    >
      {/* Header */}
      <div style={headerStyles}>
        <div style={titleSectionStyles}>
          {chain.isStarterChain && (
            <span style={{ fontSize: '16px' }}>🚀</span>
          )}
          <h4 style={titleStyles}>{chain.name}</h4>
          <span style={optionCountStyles}>
            {optionCount} option{optionCount !== 1 ? 's' : ''}
          </span>
        </div>
        
        {(showActions || isSelected) && (
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              style={actionButtonStyles}
              onClick={(e) => handleActionClick(e, () => onTogglePin(chain.id, chain.isPinned || false))}
              title={chain.isPinned ? 'Unpin chain' : 'Pin chain'}
            >
              {chain.isPinned ? '📌' : '📍'}
            </button>
            <button
              style={actionButtonStyles}
              onClick={(e) => handleActionClick(e, () => onToggleStarter(chain.id, chain.isStarterChain || false))}
              title={chain.isStarterChain ? 'Remove from starters' : 'Add to starters'}
            >
              {chain.isStarterChain ? '⭐' : '☆'}
            </button>
            <button
              style={actionButtonStyles}
              onClick={(e) => handleActionClick(e, () => onExport(chain.id))}
              title="Export chain as .snip file"
            >
              📤
            </button>
            <button
              style={{...actionButtonStyles, color: '#EF4444'}}
              onClick={(e) => handleActionClick(e, () => onDelete(chain.id))}
              title="Delete chain"
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      {/* Description */}
      <p style={descriptionStyles}>
        {chain.description || 'No description provided'}
      </p>

      {/* Footer Metadata */}
      <div style={metadataStyles}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {tagCount > 0 && (
            <span>🏷️ {tagCount} tag{tagCount !== 1 ? 's' : ''}</span>
          )}
          {chainLinkCount > 0 && (
            <span>🔗 {chainLinkCount} link{chainLinkCount !== 1 ? 's' : ''}</span>
          )}
          <span>Updated {formatRelativeTime(chain.updatedAt || chain.createdAt || '')}</span>
        </div>
        
        <div style={badgeContainerStyles}>
          {chain.isPinned && (
            <span style={{ fontSize: '12px' }}>📌</span>
          )}
          {chain.isStarterChain && (
            <span style={starterBadgeStyles}>STARTER</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChainCard; 