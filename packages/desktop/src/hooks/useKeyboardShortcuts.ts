import { useHotkeys } from 'react-hotkeys-hook';
import { useCallback } from 'react';

export interface KeyboardShortcutHandlers {
  // Navigation
  onToggleOverlay?: () => void;
  onOpenChainManager?: () => void;
  onFocusSearch?: () => void;
  onEscape?: () => void;
  
  // Chain Management
  onNewChain?: () => void;
  onDeleteChain?: () => void;
  onDuplicateChain?: () => void;
  onExportChain?: () => void;
  onImportChains?: () => void;
  
  // Chain Operations
  onSaveChain?: () => void;
  onTogglePin?: () => void;
  onExecuteChain?: () => void;
  
  // Navigation within chains
  onNextOption?: () => void;
  onPreviousOption?: () => void;
  onFirstOption?: () => void;
  onLastOption?: () => void;
  
  // Editing
  onUndo?: () => void;
  onRedo?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onCut?: () => void;
  onSelectAll?: () => void;
  
  // View
  onToggleSidebar?: () => void;
  onTogglePreview?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetZoom?: () => void;
  
  // Quick actions
  onQuickInsert?: () => void;
  onToggleTheme?: () => void;
  onOpenSettings?: () => void;
  onShowHelp?: () => void;
}

export const useKeyboardShortcuts = (handlers: KeyboardShortcutHandlers) => {
  // Global shortcuts
  useHotkeys('ctrl+shift+s', () => handlers.onToggleOverlay?.(), { 
    preventDefault: true,
    description: 'Toggle overlay'
  });
  
  useHotkeys('ctrl+shift+c', () => handlers.onOpenChainManager?.(), { 
    preventDefault: true,
    description: 'Open chain manager'
  });
  
  useHotkeys('ctrl+k', () => handlers.onFocusSearch?.(), { 
    preventDefault: true,
    description: 'Focus search'
  });
  
  useHotkeys('escape', () => handlers.onEscape?.(), { 
    preventDefault: false,
    description: 'Cancel/close'
  });
  
  // Chain management shortcuts
  useHotkeys('ctrl+n', () => handlers.onNewChain?.(), { 
    preventDefault: true,
    description: 'New chain'
  });
  
  useHotkeys('delete', () => handlers.onDeleteChain?.(), { 
    preventDefault: true,
    description: 'Delete selected chain'
  });
  
  useHotkeys('ctrl+d', () => handlers.onDuplicateChain?.(), { 
    preventDefault: true,
    description: 'Duplicate chain'
  });
  
  useHotkeys('ctrl+e', () => handlers.onExportChain?.(), { 
    preventDefault: true,
    description: 'Export chain'
  });
  
  useHotkeys('ctrl+i', () => handlers.onImportChains?.(), { 
    preventDefault: true,
    description: 'Import chains'
  });
  
  // Chain operations
  useHotkeys('ctrl+s', () => handlers.onSaveChain?.(), { 
    preventDefault: true,
    description: 'Save chain'
  });
  
  useHotkeys('ctrl+p', () => handlers.onTogglePin?.(), { 
    preventDefault: true,
    description: 'Toggle pin'
  });
  
  useHotkeys('ctrl+enter', () => handlers.onExecuteChain?.(), { 
    preventDefault: true,
    description: 'Execute chain'
  });
  
  // Navigation within chains
  useHotkeys('ctrl+down', () => handlers.onNextOption?.(), { 
    preventDefault: true,
    description: 'Next option'
  });
  
  useHotkeys('ctrl+up', () => handlers.onPreviousOption?.(), { 
    preventDefault: true,
    description: 'Previous option'
  });
  
  useHotkeys('ctrl+home', () => handlers.onFirstOption?.(), { 
    preventDefault: true,
    description: 'First option'
  });
  
  useHotkeys('ctrl+end', () => handlers.onLastOption?.(), { 
    preventDefault: true,
    description: 'Last option'
  });
  
  // Editing shortcuts
  useHotkeys('ctrl+z', () => handlers.onUndo?.(), { 
    preventDefault: true,
    description: 'Undo'
  });
  
  useHotkeys('ctrl+y', () => handlers.onRedo?.(), { 
    preventDefault: true,
    description: 'Redo'
  });
  
  useHotkeys('ctrl+c', () => handlers.onCopy?.(), { 
    preventDefault: false, // Allow default copy behavior
    description: 'Copy'
  });
  
  useHotkeys('ctrl+v', () => handlers.onPaste?.(), { 
    preventDefault: false, // Allow default paste behavior
    description: 'Paste'
  });
  
  useHotkeys('ctrl+x', () => handlers.onCut?.(), { 
    preventDefault: false, // Allow default cut behavior
    description: 'Cut'
  });
  
  useHotkeys('ctrl+a', () => handlers.onSelectAll?.(), { 
    preventDefault: false, // Allow default select all behavior
    description: 'Select all'
  });
  
  // View shortcuts
  useHotkeys('ctrl+b', () => handlers.onToggleSidebar?.(), { 
    preventDefault: true,
    description: 'Toggle sidebar'
  });
  
  useHotkeys('ctrl+shift+p', () => handlers.onTogglePreview?.(), { 
    preventDefault: true,
    description: 'Toggle preview'
  });
  
  useHotkeys('ctrl+plus', () => handlers.onZoomIn?.(), { 
    preventDefault: true,
    description: 'Zoom in'
  });
  
  useHotkeys('ctrl+minus', () => handlers.onZoomOut?.(), { 
    preventDefault: true,
    description: 'Zoom out'
  });
  
  useHotkeys('ctrl+0', () => handlers.onResetZoom?.(), { 
    preventDefault: true,
    description: 'Reset zoom'
  });
  
  // Quick actions
  useHotkeys('ctrl+space', () => handlers.onQuickInsert?.(), { 
    preventDefault: true,
    description: 'Quick insert'
  });
  
  useHotkeys('ctrl+shift+t', () => handlers.onToggleTheme?.(), { 
    preventDefault: true,
    description: 'Toggle theme'
  });
  
  useHotkeys('ctrl+comma', () => handlers.onOpenSettings?.(), { 
    preventDefault: true,
    description: 'Open settings'
  });
  
  useHotkeys('f1', () => handlers.onShowHelp?.(), { 
    preventDefault: true,
    description: 'Show help'
  });
};

export const keyboardShortcuts = {
  // Global
  toggleOverlay: 'Ctrl+Shift+S',
  openChainManager: 'Ctrl+Shift+C',
  focusSearch: 'Ctrl+K',
  escape: 'Escape',
  
  // Chain Management
  newChain: 'Ctrl+N',
  deleteChain: 'Delete',
  duplicateChain: 'Ctrl+D',
  exportChain: 'Ctrl+E',
  importChains: 'Ctrl+I',
  
  // Chain Operations
  saveChain: 'Ctrl+S',
  togglePin: 'Ctrl+P',
  executeChain: 'Ctrl+Enter',
  
  // Navigation
  nextOption: 'Ctrl+↓',
  previousOption: 'Ctrl+↑',
  firstOption: 'Ctrl+Home',
  lastOption: 'Ctrl+End',
  
  // Editing
  undo: 'Ctrl+Z',
  redo: 'Ctrl+Y',
  copy: 'Ctrl+C',
  paste: 'Ctrl+V',
  cut: 'Ctrl+X',
  selectAll: 'Ctrl+A',
  
  // View
  toggleSidebar: 'Ctrl+B',
  togglePreview: 'Ctrl+Shift+P',
  zoomIn: 'Ctrl++',
  zoomOut: 'Ctrl+-',
  resetZoom: 'Ctrl+0',
  
  // Quick Actions
  quickInsert: 'Ctrl+Space',
  toggleTheme: 'Ctrl+Shift+T',
  openSettings: 'Ctrl+,',
  showHelp: 'F1'
};

export type KeyboardShortcut = keyof typeof keyboardShortcuts;
