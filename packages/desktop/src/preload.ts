import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  list: () => ipcRenderer.invoke('list-snippets'),
  create: (content: string) => ipcRenderer.invoke('create-snippet', content),
  update: (id: number, content: string) => ipcRenderer.invoke('update-snippet', id, content),
  remove: (id: number) => ipcRenderer.invoke('delete-snippet', id)
});
