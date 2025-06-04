import React, { useState, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children?: React.ReactNode; // For displaying confirmation messages
  confirmText?: string;
  cancelText?: string;
  onConfirm?: (inputValue?: string) => void; // Pass input value for prompts
  promptInputType?: 'text' | 'textarea';
  promptInputInitialValue?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  promptInputType,
  promptInputInitialValue = '',
}) => {
  const [inputValue, setInputValue] = useState(promptInputInitialValue);

  useEffect(() => {
    if (isOpen) {
      setInputValue(promptInputInitialValue);
    }
  }, [isOpen, promptInputInitialValue]);

  if (!isOpen) {
    return null;
  }

  const handleConfirm = () => {
    if (onConfirm) {
      if (promptInputType && !children) {
        // Only pass inputValue if it's an internal prompt and no children override
        onConfirm(inputValue);
      } else {
        onConfirm(); // For confirmation modals or when children handle input
      }
    }
  };

  // Most inline styles will be replaced by CSS classes or remain if highly specific
  // Specific styles for positioning and overlay effect remain inline.
  const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.65)', // Slightly darker overlay
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  };

  // Input/Textarea will use global styles by default if not overridden by children

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          {children}
          {!children && promptInputType === 'text' && (
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              autoFocus
            />
          )}
          {!children && promptInputType === 'textarea' && (
            <textarea
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              autoFocus
            />
          )}
        </div>
        <div className="modal-footer">
          <button className="button button-secondary" onClick={onClose}>
            {cancelText}
          </button>
          {onConfirm && (
            <button className="button button-primary" onClick={handleConfirm}>
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
