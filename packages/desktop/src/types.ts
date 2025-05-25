export interface SnippetApi {
  list(): Promise<{ id: number; content: string }[]>;
  create(content: string): Promise<any>;
  update(id: number, content: string): Promise<any>;
  remove(id: number): Promise<any>;
  listChains(): Promise<any[]>;
  createChain(name: string, nodes: unknown[]): Promise<any>;
  updateChain?(id: number, name: string, nodes: unknown[]): Promise<any>;
  deleteChain(id: number): Promise<any>;
  getChainByName(name: string): Promise<any>;
  getClipboardHistory(): Promise<
    { id: string; content: string; timestamp: number; pinned: number }[]
  >;
  pinClipboardItem(id: string, pinned: boolean): Promise<any>;
  getSettings(): Promise<any>;
  saveSettings(s: any): Promise<any>;
  insertSnippet(text: string): Promise<any>;
  hideOverlay(): void;
  getErrorLog(): Promise<string>;
  exportDiagnostics(): Promise<string>;
}

export interface TrayApi {
  toggleOverlay(): Promise<void>;
}
