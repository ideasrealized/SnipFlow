import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  list: () => ipcRenderer.invoke('list-snippets'),
  create: (content: string) => ipcRenderer.invoke('create-snippet', content),
  update: (id: number, content: string) =>
    ipcRenderer.invoke('update-snippet', id, content),
  remove: (id: number) => ipcRenderer.invoke('delete-snippet', id),
  listChains: () => ipcRenderer.invoke('list-chains'),
  createChain: (name: string, nodes: unknown[]) =>
    ipcRenderer.invoke('create-chain', name, nodes),
  updateChain: (id: number, name: string, nodes: unknown[]) =>
    ipcRenderer.invoke('update-chain', id, name, nodes),
  deleteChain: (id: number) => ipcRenderer.invoke('delete-chain', id),
  getChainByName: (name: string) => ipcRenderer.invoke('get-chain-by-name', name),
  getClipboardHistory: () => ipcRenderer.invoke('get-clipboard-history'),
  pinClipboardItem: (id: string, pinned: boolean) =>
    ipcRenderer.invoke('pin-clipboard-item', id, pinned),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (s: any) => ipcRenderer.invoke('save-settings', s),
  insertSnippet: (text: string) => ipcRenderer.invoke('insert-snippet', text),
  hideOverlay: () => ipcRenderer.send('hide-overlay'),
  getErrorLog: () => ipcRenderer.invoke('get-error-log'),
  exportDiagnostics: () => ipcRenderer.invoke('export-diagnostics'),
});
