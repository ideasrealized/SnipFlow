import { randomUUID } from 'crypto';

export interface Snippet {
  id: number;
  content: string;
  createdAt?: string; // Or Date
  updatedAt?: string; // Or Date
  isPinned?: boolean;
}

export interface GenericApi {
  send: (channel: string, ...args: any[]) => void;
  on: (channel: string, listener: (...args: any[]) => void) => (() => void) | undefined;
  invoke: (channel: string, ...args: any[]) => Promise<any>;
}

export interface SnippetApi {
  list: () => Promise<Snippet[]>;
  create: (content: string) => Promise<Snippet>;
  update: (id: number, data: { content?: string, isPinned?: boolean }) => Promise<{success: boolean}>;
  remove: (id: number) => Promise<void>;
  listChains: () => Promise<Chain[]>;
  createChain: (
    name: string, 
    options: ChainOption[], 
    description?: string | null, 
    tags?: string[] | undefined, 
    layoutData?: string | null, 
    isPinned?: boolean
  ) => Promise<Chain | null>;
  updateChain: (id: number, data: Partial<Omit<Chain, 'id' | 'options' | 'tags'> & { options?: ChainOption[], tags?: string[], isPinned?: boolean }>) => Promise<{success: boolean; error?: string}>;
  deleteChain: (id: number) => Promise<{success: boolean, error?: string}>;
  getChainByName: (name: string) => Promise<Chain | null>;
  getChainById: (id: number) => Promise<Chain | null>;
  toggleSnippetPin: (id: number, isPinned: boolean) => Promise<{success: boolean; error?: string}>;
  toggleChainPin: (id: number, isPinned: boolean) => Promise<{success: boolean; error?: string}>;
  getPinnedItems: () => Promise<PinnedItem[]>;
  getStarterChains: () => Promise<Chain[]>;
  getClipboardHistory: () => Promise<ClipboardEntry[]>;
  pinClipboardItem: (id: string, pinned: boolean) => Promise<void>;
  getSettings: () => Promise<Settings>;
  saveSettings: (settings: Partial<Settings>) => Promise<Settings>;
  insertSnippet: (text: string) => Promise<void>;
  hideOverlay?: () => void;
  getErrorLog: () => Promise<string[]>;
  exportDiagnostics: () => Promise<string>;
  openChainManager: () => void;
  exportChain: (chainId: number, options?: ExportOptions) => Promise<string>;
  exportChains: (chainIds: number[], options?: ExportOptions) => Promise<string>;
  importChainsFromFile: (filePath: string, options?: ImportOptions) => Promise<ImportResult>;
  importChainsWithDialog: () => Promise<ImportResult>;
  previewImport: (filePath: string) => Promise<ImportPreview>;
}

export type WindowApi = GenericApi & SnippetApi;

export interface TrayApi {
  toggleOverlay: () => Promise<void>;
}

export interface EventsApi {
  onOverlayShow: (callback: () => void) => void;
  onOverlayHide: (callback: () => void) => void;
  notifyOverlayHidden: () => void;
  onThemeChanged: (callback: (event: any, theme: 'light' | 'dark' | 'system') => void) => void;
}

export interface ChainOption {
  id: string;
  title: string;
  body: string;
}

export interface Chain {
  id: number;
  name: string;
  description?: string;
  options: ChainOption[]; 
  tags?: string[];
  layoutData?: string; 
  createdAt?: string;
  updatedAt?: string;
  isPinned?: boolean;
  autoExecute?: boolean;
  lastExecuted?: number;
  isStarterChain?: boolean; // New field for Starter Chains overlay
}

export interface ClipboardEntry {
  id: string;
  content: string;
  timestamp: number;
  pinned: number;
}

export interface EdgeHoverSettings {
  enabled: boolean;
  position: string;
  triggerSize: number;
  delay: number;
}

export interface OverlaySettings {
  theme: 'light' | 'dark' | 'system';
  opacity: number;
  blur: number;
  y?: number;
  side?: 'left' | 'right';
  // Grid customization
  gridCols?: number;
  gridRows?: number;
  nodeWidth?: number;
  nodeHeight?: number;
  nodeStyle?: 'square' | 'rounded' | 'circle' | 'hexagon';
  // Performance settings
  animationSpeed?: 'instant' | 'fast' | 'normal' | 'slow';
  preloadContent?: boolean;
}

export interface Settings {
  theme: 'light' | 'dark' | 'system';
  autoPaste: boolean;
  autoFormat: boolean;
  maxHistory: number;
  edgeHover: EdgeHoverSettings;
  overlay: OverlaySettings;
  // Advanced mode settings
  advancedMode?: AdvancedModeSettings;
}

export interface AdvancedModeSettings {
  enabled: boolean;
  codingMode: boolean;
  syntaxHighlighting: boolean;
  codeSnippetHeaders: boolean;
  templateEngine: 'basic' | 'advanced';
  performanceMode: 'balanced' | 'speed' | 'quality';
}

export interface Choice {
  id: string;
  title: string;
  body?: string;
  icon?: string;
}

export interface ChoiceProvider {
  presentChoice: (choices: Choice[]) => Promise<string | null>;
}

export interface InputProvider {
  presentInput: (prompt: string, initialValue?: string) => Promise<string | null>;
}

// New Type for Pinned Items in Overlay
export interface PinnedItem {
  id: number;
  type: 'snippet' | 'chain';
  name: string; // Chain name or snippet content (or a preview)
  content?: string; // Full content if snippet, undefined for chain
  isPinned: boolean; // Should always be true for items in this list
}

declare global {
  interface Window {
    api: WindowApi;
    events: EventsApi;
    tray: TrayApi;
  }
}

// NEW: Export/Import interfaces
export interface ExportOptions {
  includeMetadata?: boolean;
  anonymize?: boolean;
  format?: 'snip' | 'json';
}

export interface ImportOptions {
  conflictResolution?: 'skip' | 'rename' | 'replace';
  selectedChains?: string[];
}

export interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: string[];
  chains: Chain[];
  canceled?: boolean;
}

export interface ImportPreview {
  chains: ExportedChain[];
  totalChains: number;
  conflicts: string[];
  fileSize: number;
}

export interface SnipFileFormat {
  version: string;
  exportDate: string;
  exportedBy?: string;
  chains: ExportedChain[];
  metadata: {
    totalChains: number;
    categories: string[];
    tags: string[];
  };
}

export interface ExportedChain {
  name: string;
  description?: string;
  options: ChainOption[];
  tags?: string[];
  isStarterChain?: boolean;
  metadata: {
    originalId?: number;
    createdAt?: string;
    updatedAt?: string;
  };
}
