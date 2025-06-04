import { randomUUID } from 'crypto';

export interface Snippet {
  id: number;
  content: string;
}

export interface GenericApi {
  send: (channel: string, ...args: any[]) => void;
  on: (
    channel: string,
    listener: (...args: any[]) => void
  ) => (() => void) | undefined;
  invoke: (channel: string, ...args: any[]) => Promise<any>;
}

export interface SnippetApi {
  list: () => Promise<Snippet[]>;
  create: (content: string) => Promise<{ id: number; content: string }>;
  update: (id: number, content: string) => Promise<void>;
  remove: (id: number) => Promise<void>;
  listChains: () => Promise<Chain[]>;
  createChain: (
    name: string,
    options: ChainOption[],
    description?: string | null,
    tags?: string[] | null,
    layoutData?: string | null,
    pinned?: boolean
  ) => Promise<Chain | null>;
  updateChain: (
    id: number,
    data: Partial<Omit<Chain, 'id'>>
  ) => Promise<{ success: boolean; error?: string }>;
  deleteChain: (id: number) => Promise<void>;
  getChainByName: (name: string) => Promise<Chain | null>;
  getChainById: (id: number) => Promise<Chain | null>;
  getClipboardHistory: () => Promise<ClipboardEntry[]>;
  pinClipboardItem: (id: string, pinned: boolean) => Promise<void>;
  getSettings: () => Promise<Settings>;
  saveSettings: (settings: Partial<Settings>) => Promise<Settings>;
  insertSnippet: (text: string) => Promise<void>;
  hideOverlay?: () => void;
  getErrorLog: () => Promise<string[]>;
  exportDiagnostics: () => Promise<string>;
  openChainManager: () => void;
}

export type WindowApi = GenericApi & SnippetApi;

export interface TrayApi {
  toggleOverlay: () => Promise<void>;
}

export interface EventsApi {
  onOverlayShow: (callback: () => void) => void;
  onOverlayHide: (callback: () => void) => void;
  notifyOverlayHidden: () => void;
  onThemeChanged: (
    callback: (event: any, theme: 'light' | 'dark' | 'system') => void
  ) => void;
}

export interface ChainOption {
  id: string;
  title: string;
  body: string;
}

export interface Chain {
  id: number;
  name: string;
  options: ChainOption[];
  nodes: string;
  description?: string | null;
  tags?: string[] | null;
  layoutData?: string | null;
  autoExecute?: boolean;
  lastExecuted?: number | null;
  pinned?: boolean;
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
}

export interface Settings {
  theme: 'light' | 'dark' | 'system';
  autoPaste: boolean;
  autoFormat: boolean;
  maxHistory: number;
  edgeHover: EdgeHoverSettings;
  overlay: OverlaySettings;
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
  presentInput: (
    prompt: string,
    initialValue?: string
  ) => Promise<string | null>;
}

// Placeholder type for items that can be pinned to the overlay
export interface PinnedItem {
  id: string | number; // Can be snippet ID (number) or clipboard ID (string)
  type: 'snippet' | 'clipboard' | 'chain'; // To distinguish the source
  content: string; // The text content to display/paste
  name?: string; // Optional name, e.g., for snippets or chains
}

declare global {
  interface Window {
    api: WindowApi;
    events: EventsApi;
    tray: TrayApi;
  }
}
