import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import type { Settings, PinnedItem } from './types';

const genericApi = {
  send: (channel: string, ...args: any[]) => ipcRenderer.send(channel, ...args),
  on: (channel: string, listener: (...args: any[]) => void) => {
    const wrappedListener = (event: Electron.IpcRendererEvent, ...args: any[]) => listener(...args);
    ipcRenderer.on(channel, wrappedListener);
    // Return a cleanup function to remove the listener
    return () => {
      ipcRenderer.removeListener(channel, wrappedListener);
    };
  },
  invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
};

contextBridge.exposeInMainWorld('api', {
  // Generic methods first for clarity
  send: genericApi.send,
  on: genericApi.on,
  invoke: genericApi.invoke,

  // Specific, strongly-typed methods (existing)
  list: () => ipcRenderer.invoke('list-snippets'),
  create: (content: string) => ipcRenderer.invoke('create-snippet', content),
  update: (id: number, content: string) =>
    ipcRenderer.invoke('update-snippet', id, content),
  remove: (id: number) => ipcRenderer.invoke('delete-snippet', id),
  listChains: () => ipcRenderer.invoke('list-chains'),
  createChain: (name: string, nodes: any[], description?: string) => ipcRenderer.invoke('create-chain', name, nodes, description),
  getChainByName: (name: string) => ipcRenderer.invoke('get-chain-by-name', name),
  getChainById: (id: number) => ipcRenderer.invoke('get-chain-by-id', id),
  updateChain: (id: number, data: any) => ipcRenderer.invoke('update-chain', id, data),
  deleteChain: (id: number) => ipcRenderer.invoke('delete-chain', id),
  getClipboardHistory: () => ipcRenderer.invoke('get-clipboard-history'),
  pinClipboardItem: (id: string, pinned: boolean) => ipcRenderer.invoke('pin-clipboard-item', id, pinned),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: Partial<Settings>) => ipcRenderer.invoke('save-settings', settings),
  insertSnippet: (content: string) => ipcRenderer.send('insert-snippet', content),
  getErrorLog: () => ipcRenderer.invoke('get-error-log'),
  exportDiagnostics: () => ipcRenderer.invoke('export-diagnostics'),

  // Overlay specific
  registerOverlayPinnedItemsProvider: (provider: () => Promise<PinnedItem[]>) => {
    console.warn('registerOverlayPinnedItemsProvider from preload is complex and might not work as expected if called from other windows.');
  },
  sendToOverlay: (channel: string, ...args: any[]) => ipcRenderer.send(channel, ...args),
  onOverlayEvent: (channel: string, listener: (...args: any[]) => void) => {
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.removeListener(channel, listener);
  },
  hideOverlay: () => ipcRenderer.send('hide-overlay-signal'),

  // Function to open the new Chain Manager window
  openChainManager: () => ipcRenderer.send('open-chain-manager'),
});

// Deprecate or remove window.events if all functionality is moved to window.api
// For now, commenting out to ensure overlay.ts uses the new window.api methods.
/*
contextBridge.exposeInMainWorld('events', {
  onOverlayShow: (cb: () => void) => ipcRenderer.on('overlay:show', (event, ...args) => cb(...args)),
  onOverlayHide: (cb: () => void) => ipcRenderer.on('overlay:hide', (event, ...args) => cb(...args)),
  notifyOverlayHidden: () => ipcRenderer.send('overlay:hidden'), 
  onThemeChanged: (cb: (_: unknown, theme: 'light' | 'dark') => void) =>
    ipcRenderer.on('theme:changed', (event, ...args) => cb(undefined, ...args as ['light' | 'dark'])),
});
*/

contextBridge.exposeInMainWorld('tray', {
  toggleOverlay: () => ipcRenderer.invoke('tray:toggleOverlay'),
});
