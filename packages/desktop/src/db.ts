import Database from 'better-sqlite3';
import { join } from 'path';
import { homedir } from 'os';
import { existsSync, mkdirSync } from 'fs';
import { randomUUID } from 'crypto';
import { logger } from './logger';

// Use a persistent location in user's home directory
const SNIPFLOW_DIR = join(homedir(), '.snipflow');
if (!existsSync(SNIPFLOW_DIR)) {
  mkdirSync(SNIPFLOW_DIR, { recursive: true });
}
const DB_PATH = join(SNIPFLOW_DIR, 'snippets.db');

console.log('Database path:', DB_PATH); // Debug log

const db = new Database(DB_PATH);

function measure<T>(label: string, fn: () => T): T {
  const start = Date.now();
  const result = fn();
  const end = Date.now();
  logger.perf(`${label}: ${end - start}ms`);
  return result;
}

export interface Snippet {
  id: number;
  content: string;
}

export interface ChainNodeChoiceOption {
  label: string;
  text: string;
}

export interface ChainNode {
  type: 'text' | 'choice';
  content: string;
  options?: ChainNodeChoiceOption[];
}

export interface Chain {
  id: number;
  name: string;
  nodes: ChainNode[];
}

export function init() {
  db.exec(`CREATE TABLE IF NOT EXISTS snippets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL
  )`);
  db.exec(`CREATE TABLE IF NOT EXISTS chains (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    nodes TEXT NOT NULL
  )`);
}

// Initialize database first
init();

// Prepared statements for performance and security (after table creation)
const insertSnippet = db.prepare('INSERT INTO snippets(content) VALUES (?)');
const updateSnippetStmt = db.prepare('UPDATE snippets SET content = ? WHERE id = ?');
const deleteSnippetStmt = db.prepare('DELETE FROM snippets WHERE id = ?');
const getSnippetsStmt = db.prepare('SELECT id, content FROM snippets ORDER BY id');

const insertChainStmt = db.prepare(
  'INSERT INTO chains(name, nodes) VALUES (?, ?)'
);
const updateChainStmt = db.prepare(
  'UPDATE chains SET name = ?, nodes = ? WHERE id = ?'
);
const deleteChainStmt = db.prepare('DELETE FROM chains WHERE id = ?');
const getChainsStmt = db.prepare('SELECT id, name, nodes FROM chains ORDER BY id');
const getChainByNameStmt = db.prepare(
  'SELECT id, name, nodes FROM chains WHERE name = ?'
);

export function getSnippets(): Snippet[] {
  return measure('db.getSnippets', () => getSnippetsStmt.all() as Snippet[]);
}

export function createSnippet(content: string): void {
  measure('db.createSnippet', () => insertSnippet.run(content));
}

export function updateSnippet(id: number, content: string): void {
  measure('db.updateSnippet', () => updateSnippetStmt.run(content, id));
}

export function deleteSnippet(id: number): void {
  measure('db.deleteSnippet', () => deleteSnippetStmt.run(id));
}

export function getChains(): Chain[] {
  return measure('db.getChains', () =>
    getChainsStmt.all().map((row: any) => ({
      id: row.id,
      name: row.name,
      nodes: JSON.parse(row.nodes) as ChainNode[],
    }))
  );
}

export function getChainByName(name: string): Chain | undefined {
  return measure('db.getChainByName', () => {
    const row = getChainByNameStmt.get(name) as any;
    if (!row) return undefined;
    return { id: row.id, name: row.name, nodes: JSON.parse(row.nodes) };
  });
}

export function createChain(name: string, nodes: ChainNode[]): void {
  measure('db.createChain', () => insertChainStmt.run(name, JSON.stringify(nodes)));
}

export function updateChain(
  id: number,
  name: string,
  nodes: ChainNode[]
): void {
  measure('db.updateChain', () =>
    updateChainStmt.run(name, JSON.stringify(nodes), id)
  );
}

export function deleteChain(id: number): void {
  measure('db.deleteChain', () => deleteChainStmt.run(id));
}

export interface ClipboardEntry {
  id: string;
  content: string;
  timestamp: number;
  pinned: number;
}

// Clipboard history table
const initClipboard = () => {
  db.exec(`CREATE TABLE IF NOT EXISTS clipboard_history (
    id TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    timestamp INTEGER,
    pinned INTEGER DEFAULT 0
  )`);
};
initClipboard();

const insertClipStmt = db.prepare(
  'INSERT INTO clipboard_history(id, content, timestamp) VALUES (?, ?, ?)'
);
const updateClipTimeStmt = db.prepare(
  'UPDATE clipboard_history SET timestamp = ? WHERE id = ?'
);
const getClipByContentStmt = db.prepare(
  'SELECT id, pinned FROM clipboard_history WHERE content = ?'
);
const getHistoryStmt = db.prepare(
  'SELECT id, content, timestamp, pinned FROM clipboard_history ORDER BY pinned DESC, timestamp DESC'
);
const setPinnedStmt = db.prepare('UPDATE clipboard_history SET pinned = ? WHERE id = ?');
const deleteClipStmt = db.prepare('DELETE FROM clipboard_history WHERE id = ?');
const countUnpinnedStmt = db.prepare('SELECT COUNT(*) as c FROM clipboard_history WHERE pinned = 0');
const oldestUnpinnedStmt = db.prepare(
  'SELECT id FROM clipboard_history WHERE pinned = 0 ORDER BY timestamp ASC LIMIT ?'
);


export function addClipboardEntry(content: string): void {
  measure('db.addClipboardEntry', () => {
    const existing = getClipByContentStmt.get(content) as any;
    const now = Date.now();
    if (existing) {
      updateClipTimeStmt.run(now, existing.id);
    } else {
      insertClipStmt.run(randomUUID(), content, now);
    }
    trimHistory();
  });
}

function trimHistory() {
  const row = countUnpinnedStmt.get() as any;
  let excess = row.c - 20;
  if (excess > 0) {
    const olds = oldestUnpinnedStmt.all(excess) as any[];
    olds.forEach(o => deleteClipStmt.run(o.id));
  }
}

export function getClipboardHistory(): ClipboardEntry[] {
  return measure('db.getClipboardHistory', () => getHistoryStmt.all() as ClipboardEntry[]);
}

export function pinClipboardItem(id: string, pinned: boolean): void {
  measure('db.pinClipboardItem', () => setPinnedStmt.run(pinned ? 1 : 0, id));
}
