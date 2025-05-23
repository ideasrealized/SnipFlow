import Database from 'better-sqlite3';
import { join } from 'path';
import { homedir } from 'os';
import { existsSync, mkdirSync } from 'fs';

// Use a persistent location in user's home directory
const SNIPFLOW_DIR = join(homedir(), '.snipflow');
if (!existsSync(SNIPFLOW_DIR)) {
  mkdirSync(SNIPFLOW_DIR, { recursive: true });
}
const DB_PATH = join(SNIPFLOW_DIR, 'snippets.db');

console.log('Database path:', DB_PATH); // Debug log

const db = new Database(DB_PATH);

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
  return getSnippetsStmt.all() as Snippet[];
}

export function createSnippet(content: string): void {
  insertSnippet.run(content);
}

export function updateSnippet(id: number, content: string): void {
  updateSnippetStmt.run(content, id);
}

export function deleteSnippet(id: number): void {
  deleteSnippetStmt.run(id);
}

export function getChains(): Chain[] {
  return getChainsStmt.all().map((row: any) => ({
    id: row.id,
    name: row.name,
    nodes: JSON.parse(row.nodes) as ChainNode[],
  }));
}

export function getChainByName(name: string): Chain | undefined {
  const row = getChainByNameStmt.get(name) as any;
  if (!row) return undefined;
  return { id: row.id, name: row.name, nodes: JSON.parse(row.nodes) };
}

export function createChain(name: string, nodes: ChainNode[]): void {
  insertChainStmt.run(name, JSON.stringify(nodes));
}

export function updateChain(
  id: number,
  name: string,
  nodes: ChainNode[]
): void {
  updateChainStmt.run(name, JSON.stringify(nodes), id);
}

export function deleteChain(id: number): void {
  deleteChainStmt.run(id);
}
