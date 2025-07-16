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
      if (promptInputType && !children) { // Only pass inputValue if it's an internal prompt and no children override
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
    overflowY: 'auto', // Allow scrolling on overlay
  };

  const modalContentStyle: React.CSSProperties = {
    backgroundColor: 'var(--background-color, #2a2a2a)',
    borderRadius: '12px',
    padding: 0,
    maxWidth: '90vw',
    maxHeight: '80vh',
    width: '500px',
    display: 'flex',
    flexDirection: 'column',
    margin: '20px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  };

  const modalBodyStyle: React.CSSProperties = {
    padding: '20px',
    flex: 1,
    overflow: 'auto',
    maxHeight: '60vh',
  };

  const modalHeaderStyle: React.CSSProperties = {
    padding: '20px 20px 0 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    paddingBottom: '15px',
    marginBottom: '0',
  };

  const modalFooterStyle: React.CSSProperties = {
    padding: '15px 20px 20px 20px',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    marginTop: '0',
  };

  const textareaStyle: React.CSSProperties = {
    width: '100%',
    minHeight: '200px',
    maxHeight: '400px',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: 'inherit',
    fontFamily: 'inherit',
    fontSize: '14px',
    resize: 'vertical',
  };

  // Input/Textarea will use global styles by default if not overridden by children

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <div style={modalHeaderStyle}>
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <div style={modalBodyStyle}>
          {children}
          {!children && promptInputType === 'text' && (
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              autoFocus
            />
          )}
          {!children && promptInputType === 'textarea' && (
            <textarea
              style={textareaStyle}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              autoFocus
            />
          )}
        </div>
        <div style={modalFooterStyle}>
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