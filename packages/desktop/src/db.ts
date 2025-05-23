import Database from 'better-sqlite3';
import { join } from 'path';

const DB_PATH = join(__dirname, '..', 'snippets.db');
const db = new Database(DB_PATH);

export interface Snippet {
  id: number;
  content: string;
}

export function init() {
  db.exec(`CREATE TABLE IF NOT EXISTS snippets (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    content TEXT NOT NULL
  )`);
}

// Initialize database first
init();

// Prepared statements for performance and security (after table creation)
const insertSnippet = db.prepare('INSERT INTO snippets(content) VALUES (?)');
const updateSnippetStmt = db.prepare('UPDATE snippets SET content = ? WHERE id = ?');
const deleteSnippetStmt = db.prepare('DELETE FROM snippets WHERE id = ?');
const getSnippetsStmt = db.prepare('SELECT id, content FROM snippets ORDER BY id');

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
