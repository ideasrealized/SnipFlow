import React from 'react';
import type { Chain, ChainOption } from '../../types'; // Import ChainOption

interface ChainVisualizerMiniMapProps {
  currentChainOptions: ChainOption[];
  currentChainName: string;
  // Future: onClickOption?: (optionId: string) => void;
  // Future: onClickLinkedChain?: (chainName: string) => void;
}

// Basic regex to find chain links and input prompts in the body
// Using new RegExp for potentially stabler parsing by TypeScript
const CHAIN_LINK_REGEX = /\[Chain:([a-zA-Z0-9_\-\s]+?)\]/g;
const INPUT_PROMPT_REGEX = /\[\?:([a-zA-Z0-9_\-\s]+?)\]/g;

const ChainVisualizerMiniMap: React.FC<ChainVisualizerMiniMapProps> = ({ 
  currentChainOptions, 
  currentChainName 
}) => {

  // Simple layout logic (can be made more sophisticated)
  const nodeWidth = 150;
  const nodeHeight = 60; // Increased height for title and body summary
  const nodeVMargin = 40;
  const nodeHMargin = 20;
  const padding = 20;

  const elements: JSX.Element[] = [];
  let currentY = padding;

  // Root chain name display
  elements.push(
    <text 
      key="chain-title" 
      x={padding + nodeWidth / 2} 
      y={currentY + 20} 
      textAnchor="middle" 
      fill="#e0e0e0" 
      fontSize="16" 
      fontWeight="bold"
    >
      {currentChainName}
    </text>
  );
  currentY += 40;

  currentChainOptions.forEach((option, index) => {
    if (!option) { 
      // console.warn is not available here, and we should not add it without proper logger integration.
      // For now, just skip if option is unexpectedly null/undefined.
      // A more robust solution would be to filter out bad options upstream or log via a dedicated service.
      return; 
    }

    const x = padding;
    const y = currentY + index * (nodeHeight + nodeVMargin);

    const optionId = option?.id || `viz-fallback-${globalThis.crypto.randomUUID()}`;

    // Safeguard against undefined option or title
    const titleDisplay = option?.title ?? '[No Title]'; // Use nullish coalescing
    const bodyContent = option?.body ?? ''; // Use nullish coalescing

    // Option Node Box
    elements.push(
      <rect
        key={`rect-${optionId}`}
        x={x}
        y={y}
        width={nodeWidth}
        height={nodeHeight}
        fill="#3a3a3a"
        stroke="#5e9ed6" // Highlight color for options
        strokeWidth="2"
        rx="5"
      />
    );

    // Option Title
    elements.push(
      <text
        key={`title-${optionId}`}
        x={x + nodeWidth / 2}
        y={y + 20} // Position for title
        textAnchor="middle"
        fill="#ffffff"
        fontSize="12"
        fontWeight="bold"
      >
        {titleDisplay.length > 20 ? titleDisplay.substring(0, 18) + '...' : titleDisplay}
      </text>
    );
    
    // Summary of Body (first few words or type of content)
    let bodySummary = bodyContent.substring(0, 25) + (bodyContent.length > 25 ? '...' : '');
    if (INPUT_PROMPT_REGEX.test(bodyContent)) bodySummary = '[Input Prompt]';
    if (CHAIN_LINK_REGEX.test(bodyContent)) bodySummary = '[Links to Chain]';
    
    elements.push(
      <text
        key={`body-summary-${optionId}`}
        x={x + nodeWidth / 2}
        y={y + 40} // Position for body summary
        textAnchor="middle"
        fill="#bbbbbb"
        fontSize="10"
      >
        {bodySummary}
      </text>
    );

    // TODO: Draw lines to linked chains or input prompts if space/design allows
    // This would require more complex layout and parsing to position target nodes.
  });

  const svgHeight = currentY + currentChainOptions.length * (nodeHeight + nodeVMargin) + padding;
  const svgWidth = padding * 2 + nodeWidth + nodeHMargin * 2; // Adjust if drawing links

  return (
    <svg width="100%" height={svgHeight} style={{ minHeight: '200px' }}>
      <rect width="100%" height="100%" fill="#262626" />
      {elements}
    </svg>
  );
};

export default ChainVisualizerMiniMap; 