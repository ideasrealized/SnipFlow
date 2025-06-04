import React, { useState, useEffect } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from 'react-beautiful-dnd';
// import { randomUUID } from 'crypto'; // Removed Node crypto import
import ChainOptionItem from './ChainOptionItem'; // Ensured import path is correct
import type { ChainOption } from '../../types';
// import logger from '../../utils/logger'; // Cannot use main process logger directly

interface ChainOptionsEditorProps {
  initialOptions: ChainOption[];
  onOptionsChange: (options: ChainOption[]) => void;
}

const ChainOptionsEditor: React.FC<ChainOptionsEditorProps> = ({
  initialOptions,
  onOptionsChange,
}) => {
  const [options, setOptions] = useState<ChainOption[]>(initialOptions);
  // const [draggingItemId, setDraggingItemId] = useState<string | null>(null); // For styling during drag

  const handleAddOption = () => {
    const newOption: ChainOption = {
      // id: randomUUID(), // Use global crypto for renderer
      id: globalThis.crypto.randomUUID(),
      title: 'New Option',
      body: 'Option body content',
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
    const newOptions = options.map(opt =>
      opt.id === updatedOption.id ? updatedOption : opt
    );
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
      console.error(
        '[ChainOptionsEditor.onDragEnd] Attempted to reorder an invalid or ID-missing item. Drag operation cancelled.',
        {
          reorderedItem,
          sourceIndex: result.source.index,
          optionsState: options, // Be cautious logging entire state if it can be very large
        }
      );
      // It might be better to revert the splice or re-fetch, but for now, cancel to prevent corruption.
      return;
    }

    newOptions.splice(result.destination.index, 0, reorderedItem);

    setOptions(newOptions);
    onOptionsChange(newOptions);
  };

  const styles = {
    container: {
      border: '1px solid #444',
      borderRadius: '4px',
      padding: '10px',
      background: '#2d2d2d',
    },
    list: { minHeight: '100px' }, // For better dnd experience with empty list
    addButton: {
      marginBottom: '10px',
      padding: '6px 12px',
      background: '#4a90e2',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
    },
  };

  return (
    <div style={styles.container}>
      <button onClick={handleAddOption} style={styles.addButton}>
        + Add Option
      </button>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="optionsList">
          {provided => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              style={styles.list}
            >
              {options.map((option, index) => {
                if (!option || typeof option.id === 'undefined') {
                  console.error(
                    '[ChainOptionsEditor] Rendering option without ID:',
                    option,
                    'at index:',
                    index
                  );
                  // Potentially return a fallback UI or null to prevent crashing Draggable
                  // For now, dnd will crash, but we get the log.
                }
                return (
                  <Draggable
                    key={option.id || `fallback-key-${index}`}
                    draggableId={option.id || `fallback-draggable-${index}`}
                    index={index}
                  >
                    {providedDraggable => (
                      <div
                        ref={providedDraggable.innerRef}
                        {...providedDraggable.draggableProps}
                        {...providedDraggable.dragHandleProps}
                        style={{
                          userSelect: 'none',
                          padding: '8px',
                          margin: '0 0 8px 0',
                          backgroundColor: '#3a3a3a',
                          border: '1px solid #555',
                          borderRadius: '4px',
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
