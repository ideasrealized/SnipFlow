import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  icon?: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  count?: number;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon,
  children,
  defaultExpanded = true,
  count
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div style={{
      marginBottom: '16px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '8px',
      background: 'rgba(255, 255, 255, 0.02)',
      overflow: 'hidden'
    }}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '100%',
          padding: '12px 16px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: 'none',
          borderBottom: isExpanded ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
          color: '#ffffff',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {icon && <span style={{ fontSize: '16px' }}>{icon}</span>}
          <span>{title}</span>
          {count !== undefined && (
            <span style={{
              fontSize: '12px',
              padding: '2px 8px',
              background: 'rgba(74, 144, 226, 0.2)',
              color: '#4a90e2',
              borderRadius: '12px',
              fontWeight: '500'
            }}>
              {count}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronDown size={16} style={{ transition: 'transform 0.2s' }} />
        ) : (
          <ChevronRight size={16} style={{ transition: 'transform 0.2s' }} />
        )}
      </button>
      
      <div style={{
        maxHeight: isExpanded ? '5000px' : '0',
        overflow: 'hidden',
        transition: 'max-height 0.3s ease-in-out',
        opacity: isExpanded ? 1 : 0
      }}>
        <div style={{ padding: '16px' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default CollapsibleSection;
