import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Plus, GripVertical } from 'lucide-react';
import ChainOptionItem from './ChainOptionItem';
import type { ChainOption } from '../../types';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';

interface ChainOptionsEditorProps {
  initialOptions: ChainOption[];
  onOptionsChange: (options: ChainOption[]) => void;
}

const ChainOptionsEditor: React.FC<ChainOptionsEditorProps> = ({ initialOptions, onOptionsChange }) => {
  const [options, setOptions] = useState<ChainOption[]>(initialOptions);
  // const [draggingItemId, setDraggingItemId] = useState<string | null>(null); // For styling during drag

  const handleAddOption = () => {
    const newOption: ChainOption = {
      // id: randomUUID(), // Use global crypto for renderer
      id: globalThis.crypto.randomUUID(),
      title: 'New Option',
      body: 'Option body content'
    };
    const newOptions = [...options, newOption];
    setOptions(newOptions);
    onOptionsChange(newOptions);
  };

  const handleDeleteOption = (id: string) => {
    const newOptions = options.filter(opt => opt.id !== id);
    setOptions(newOptions);
    onOptionsChange(newOptions);
  };

  const handleOptionChange = (updatedOption: ChainOption) => {
    const newOptions = options.map(opt => (opt.id === updatedOption.id ? updatedOption : opt));
    setOptions(newOptions);
    onOptionsChange(newOptions);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newOptions = Array.from(options);
    const [reorderedItem] = newOptions.splice(result.source.index, 1);
    
    // Safeguard against undefined reorderedItem or item missing an ID
    if (!reorderedItem || typeof reorderedItem.id === 'undefined') {
      // Use console.error for renderer-side logging if window.api.logger is not readily available here
      console.error('[ChainOptionsEditor.onDragEnd] Attempted to reorder an invalid or ID-missing item. Drag operation cancelled.', {
        reorderedItem,
        sourceIndex: result.source.index,
        optionsState: options // Be cautious logging entire state if it can be very large
      });
      // It might be better to revert the splice or re-fetch, but for now, cancel to prevent corruption.
      return; 
    }

    newOptions.splice(result.destination.index, 0, reorderedItem);

    setOptions(newOptions);
    onOptionsChange(newOptions);
  };

  const styles: { [key: string]: React.CSSProperties } = {
    container: { 
      border: '1px solid rgba(255, 255, 255, 0.25)', 
      borderRadius: '12px', 
      padding: '20px', 
      background: 'rgba(20, 20, 20, 0.98)',
      backdropFilter: 'blur(24px) saturate(200%)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8), 0 2px 8px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
      position: 'relative',
      overflow: 'hidden'
    },
    list: { minHeight: '100px' }, // For better dnd experience with empty list
    addButton: { 
      marginBottom: '16px', 
      padding: '10px 20px', 
      background: 'linear-gradient(135deg, #4a90e2 0%, #357abd 100%)', 
      color: 'white', 
      border: 'none', 
      borderRadius: '8px',
      fontWeight: 600,
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)',
      boxShadow: '0 4px 12px rgba(74, 144, 226, 0.3)',
      position: 'relative',
      overflow: 'hidden'
    }
  };

  return (
    <div style={styles.container}>
      <button 
        onClick={handleAddOption} 
        style={styles.addButton}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(74, 144, 226, 0.4)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(74, 144, 226, 0.3)';
        }}
      >
        + Add Option
      </button>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="optionsList">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} style={styles.list}>
              {options.map((option, index) => {
                if (!option || typeof option.id === 'undefined') {
                  console.error('[ChainOptionsEditor] Rendering option without ID:', option, 'at index:', index);
                  // Potentially return a fallback UI or null to prevent crashing Draggable
                  // For now, dnd will crash, but we get the log.
                }
                return (
                  <Draggable key={option.id || `fallback-key-${index}`} draggableId={option.id || `fallback-draggable-${index}`} index={index}>
                    {(providedDraggable) => (
                      <div
                        ref={providedDraggable.innerRef}
                        {...providedDraggable.draggableProps}
                        {...providedDraggable.dragHandleProps}
                        style={{
                          userSelect: 'none',
                          padding: '16px',
                          margin: '0 0 12px 0',
                          background: 'rgba(20, 20, 20, 0.98)',
                          backdropFilter: 'blur(24px) saturate(200%)',
                          border: '1px solid rgba(255, 255, 255, 0.25)',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                          transition: 'all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)',
                          position: 'relative',
                          overflow: 'hidden',
                          ...providedDraggable.draggableProps.style,
                        }}
                      >
                        <ChainOptionItem 
                          option={option} 
                          onOptionChange={handleOptionChange} 
                          onDeleteOption={handleDeleteOption} 
                        />
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default ChainOptionsEditor; 