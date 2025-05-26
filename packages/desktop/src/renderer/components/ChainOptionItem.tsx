import React from 'react';
import type { ChainOption } from '../../types';

interface ChainOptionItemProps {
  option: ChainOption;
  onOptionChange: (updatedOption: ChainOption) => void;
  onDeleteOption: (id: string) => void;
}

const ChainOptionItem: React.FC<ChainOptionItemProps> = ({ option, onOptionChange, onDeleteOption }) => {
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onOptionChange({ ...option, title: e.target.value });
  };

  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onOptionChange({ ...option, body: e.target.value });
  };

  const styles = {
    container: { 
      padding: '10px', 
      border: '1px solid #555', 
      borderRadius: '4px', 
      marginBottom: '10px', 
      background: '#333' // Slightly different from editor background for visual separation
    },
    input: { 
      width: 'calc(100% - 22px)', // Adjust for padding/border
      padding: '8px', 
      marginBottom: '8px', 
      borderRadius: '3px', 
      border: '1px solid #666',
      background: '#2a2a2a',
      color: '#e0e0e0'
    },
    textarea: {
      width: 'calc(100% - 22px)', // Adjust for padding/border
      padding: '8px', 
      marginBottom: '8px', 
      borderRadius: '3px', 
      border: '1px solid #666',
      background: '#2a2a2a',
      color: '#e0e0e0',
      minHeight: '80px',
      resize: 'vertical' as 'vertical' // Explicitly type resize property
    },
    deleteButton: {
      padding: '5px 10px',
      background: '#c0392b',
      color: 'white',
      border: 'none',
      borderRadius: '3px',
      cursor: 'pointer',
      float: 'right' as 'right' // Explicitly type float property
    }
  };

  return (
    <div style={styles.container}>
      <button onClick={() => onDeleteOption(option.id)} style={styles.deleteButton}>Delete</button>
      <input 
        type="text" 
        placeholder="Option Title" 
        value={option.title} 
        onChange={handleTitleChange} 
        style={styles.input}
      />
      <textarea 
        placeholder="Option Body (text, [Chain:LinkToChainName], [?:InputPrompt])" 
        value={option.body} 
        onChange={handleBodyChange} 
        style={styles.textarea}
      />
    </div>
  );
};

export default ChainOptionItem; 