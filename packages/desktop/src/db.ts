import { execFileSync } from 'child_process';
import { join } from 'path';
import { existsSync } from 'fs';

const DB_PATH = join(__dirname, '..', 'snippets.db');

function run(sql: string): string {
  return execFileSync('sqlite3', [DB_PATH, '-separator', '|', sql], {
    encoding: 'utf8'
  }).trim();
}

export interface Snippet {
  id: number;
  content: string;
}

export function init() {
  run(
    'CREATE TABLE IF NOT EXISTS snippets (id INTEGER PRIMARY KEY AUTOINCREMENT, content TEXT NOT NULL);'
  );
}

export function getSnippets(): Snippet[] {
  const out = run('SELECT id, content FROM snippets ORDER BY id');
  if (!out) return [];
  return out.split('\n').map((line) => {
    const [idStr, ...rest] = line.split('|');
    const content = rest.join('|');
    return { id: Number(idStr), content };
  });
}

function esc(value: string): string {
  return value.replace(/'/g, "''");
}

export function createSnippet(content: string) {
  run(`INSERT INTO snippets(content) VALUES ('${esc(content)}');`);
}

export function updateSnippet(id: number, content: string) {
  run(`UPDATE snippets SET content='${esc(content)}' WHERE id=${id};`);
}

export function deleteSnippet(id: number) {
  run(`DELETE FROM snippets WHERE id=${id};`);
}

// Initialize database on module load
if (!existsSync(DB_PATH)) {
  init();
}
