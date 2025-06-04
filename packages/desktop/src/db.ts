import Database from 'better-sqlite3';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { randomUUID } from 'crypto';
import { logger } from './logger';
import { app } from 'electron'; // Added electron app import for userData path

// Import all necessary types from types.ts
import type {
  Settings,
  EdgeHoverSettings,
  OverlaySettings,
  Chain,
  ChainOption,
  Snippet,
  ClipboardEntry,
} from './types';

// Re-export types for convenience if other modules import them via db.ts
export type {
  Settings,
  EdgeHoverSettings,
  OverlaySettings,
  Chain,
  ChainOption,
  Snippet,
  ClipboardEntry,
} from './types';

let db: Database.Database;

// Declare prepared statements at module level, uninitialized
let insertSnippetStmt: Database.Statement;
let updateSnippetStmt: Database.Statement;
let deleteSnippetStmt: Database.Statement;
let getSnippetsStmt: Database.Statement;
let getSnippetByIdStmt: Database.Statement;
let insertChainStmt: Database.Statement;
let updateChainStmt: Database.Statement;
let deleteChainStmt: Database.Statement;
let getChainsStmt: Database.Statement;
let getChainByNameStmt: Database.Statement;
let getChainByIdStmt: Database.Statement;
let insertClipStmt: Database.Statement;
let updateClipTimeStmt: Database.Statement;
let getClipByContentStmt: Database.Statement;
let getHistoryStmt: Database.Statement;
let setPinnedStmt: Database.Statement;
let deleteClipStmt: Database.Statement;
let countUnpinnedStmt: Database.Statement;
let oldestUnpinnedStmt: Database.Statement;
let getSettingStmt: Database.Statement;
let upsertSettingStmt: Database.Statement;

// This function creates tables
function createTables() {
  if (!db) throw new Error('DB not initialized for createTables');
  db.exec(`
    CREATE TABLE IF NOT EXISTS snippets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      createdAt INTEGER DEFAULT (strftime('%s', 'now')) -- This default is for new tables
    );
    CREATE TABLE IF NOT EXISTS chains (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      nodes TEXT, -- JSON array of ChainNode/ChainOption
      description TEXT,
      tags TEXT, -- JSON array of strings
      layoutData TEXT, -- JSON for visualizer layout
      autoExecute INTEGER DEFAULT 0, -- Boolean: 0 for false, 1 for true
      lastExecuted INTEGER -- Timestamp
      -- pinned INTEGER DEFAULT 0 -- Will be added via migration
    );
    CREATE TABLE IF NOT EXISTS clipboard_history (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      pinned INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  // Migration for snippets table: createdAt column
  try {
    const snippetsTableInfo = db.pragma('table_info(snippets)') as {
      name: string;
    }[];
    const hasCreatedAt = snippetsTableInfo.some(
      col => col.name.toLowerCase() === 'createdat'
    );
    if (!hasCreatedAt) {
      logger.info(
        "[db.createTables] Migrating 'snippets' table: adding 'createdAt' column."
      );
      db.exec('ALTER TABLE snippets ADD COLUMN createdAt INTEGER'); // Add column, default will be NULL
      // Now, update existing NULL createdAt values for already existing rows
      db.exec(
        "UPDATE snippets SET createdAt = strftime('%s', 'now') WHERE createdAt IS NULL"
      );
      logger.info(
        "[db.createTables] Column 'createdAt' added and populated for existing rows in 'snippets' table."
      );
    }
  } catch (error) {
    logger.error(
      "[db.createTables] Error during snippets table migration for 'createdAt':",
      error
    );
  }

  // Migration for autoExecute and lastExecuted on chains table
  try {
    const chainsTableInfo = db.pragma('table_info(chains)') as {
      name: string;
    }[];
    const hasAutoExecute = chainsTableInfo.some(
      col => col.name === 'autoExecute'
    );
    if (!hasAutoExecute) {
      db.exec('ALTER TABLE chains ADD COLUMN autoExecute INTEGER DEFAULT 0');
      logger.info(
        "[db.createTables] Column 'autoExecute' added to 'chains' table."
      );
    }
    const hasLastExecuted = chainsTableInfo.some(
      col => col.name === 'lastExecuted'
    );
    if (!hasLastExecuted) {
      db.exec('ALTER TABLE chains ADD COLUMN lastExecuted INTEGER');
      logger.info(
        "[db.createTables] Column 'lastExecuted' added to 'chains' table."
      );
    }
    const hasPinned = chainsTableInfo.some(col => col.name === 'pinned');
    if (!hasPinned) {
      db.exec('ALTER TABLE chains ADD COLUMN pinned INTEGER DEFAULT 0');
      logger.info("[db.createTables] Column 'pinned' added to 'chains' table.");
    }
  } catch (error) {
    logger.error(
      '[db.createTables] Error during chains table migration for new columns:',
      error
    );
  }

  logger.info(
    '[db.createTables] Database tables ensured/migrated successfully.'
  );
}

// Renamed from initializeTestDatabase, added optional dbPath
export function initDb(dbPath: string = ':memory:') {
  if (db && db.open && dbPath !== ':memory:') {
    // Allow re-init for :memory: for tests if needed
    logger.warn(
      'Database already initialized. Closing existing and re-initializing.'
    );
    db.close();
  }
  if (db && db.open && dbPath === ':memory:' && db.name === ':memory:') {
    // Already connected to in-memory, probably fine for tests to reuse
    logger.info('Re-using existing in-memory database for test.');
    return;
  }

  logger.info(`Initializing database at: ${dbPath}`);
  db = new Database(dbPath);

  createTables();
  prepareStatements(); // New function to hold all statement preps
  logger.info('Database initialized and statements prepared.');
}

// Renamed from initializeDatabase to avoid conflict
export function initProductionDb() {
  if (db && db.open) {
    logger.info('Production database already initialized.');
    return;
  }
  logger.info('Initializing production database...');
  const userDataPath = app.getPath('userData');
  const SNIPFLOW_DIR = join(userDataPath, '.snipflow');
  if (!existsSync(SNIPFLOW_DIR)) {
    mkdirSync(SNIPFLOW_DIR, { recursive: true });
  }
  const DB_PATH = join(SNIPFLOW_DIR, 'snippets.db');

  initDb(DB_PATH); // Call the main initDb with specific path
}

function prepareStatements() {
  if (!db) throw new Error('DB not initialized for prepareStatements');
  logger.info('[db.prepareStatements] Preparing SQL statements...');

  getSnippetsStmt = db.prepare(
    'SELECT id, content, createdAt FROM snippets ORDER BY createdAt DESC'
  );
  getSnippetByIdStmt = db.prepare(
    'SELECT id, content, createdAt FROM snippets WHERE id = ?'
  );
  insertSnippetStmt = db.prepare('INSERT INTO snippets (content) VALUES (?)');
  updateSnippetStmt = db.prepare(
    'UPDATE snippets SET content = ? WHERE id = ?'
  );
  deleteSnippetStmt = db.prepare('DELETE FROM snippets WHERE id = ?');

  const chainFields =
    'id, name, nodes, description, tags, layoutData, autoExecute, lastExecuted, pinned';
  getChainsStmt = db.prepare(
    `SELECT ${chainFields} FROM chains ORDER BY name ASC`
  );
  getChainByNameStmt = db.prepare(
    `SELECT ${chainFields} FROM chains WHERE name = ?`
  );
  getChainByIdStmt = db.prepare(
    `SELECT ${chainFields} FROM chains WHERE id = ?`
  );
  // Ensure the number of ? matches the columns, including pinned
  insertChainStmt = db.prepare(
    'INSERT INTO chains (name, nodes, description, tags, layoutData, autoExecute, lastExecuted, pinned) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );
  updateChainStmt = db.prepare(
    'UPDATE chains SET name = ?, nodes = ?, description = ?, tags = ?, layoutData = ?, autoExecute = ?, lastExecuted = ?, pinned = ? WHERE id = ?'
  );
  deleteChainStmt = db.prepare('DELETE FROM chains WHERE id = ?');
  insertClipStmt = db.prepare(
    'INSERT INTO clipboard_history(id, content, timestamp) VALUES (?, ?, ?)'
  );
  updateClipTimeStmt = db.prepare(
    'UPDATE clipboard_history SET timestamp = ? WHERE id = ?'
  );
  getClipByContentStmt = db.prepare(
    'SELECT id, pinned FROM clipboard_history WHERE content = ?'
  );
  getHistoryStmt = db.prepare(
    'SELECT id, content, timestamp, pinned FROM clipboard_history ORDER BY pinned DESC, timestamp DESC'
  );
  setPinnedStmt = db.prepare(
    'UPDATE clipboard_history SET pinned = ? WHERE id = ?'
  );
  deleteClipStmt = db.prepare('DELETE FROM clipboard_history WHERE id = ?');
  countUnpinnedStmt = db.prepare(
    'SELECT COUNT(*) as c FROM clipboard_history WHERE pinned = 0'
  );
  oldestUnpinnedStmt = db.prepare(
    'SELECT id FROM clipboard_history WHERE pinned = 0 ORDER BY timestamp ASC LIMIT ?'
  );
  getSettingStmt = db.prepare('SELECT value FROM settings WHERE key = ?');
  upsertSettingStmt = db.prepare(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
  );
}

export function closeDb() {
  if (db && db.open) {
    db.close();
    logger.info('Database connection closed.');
  }
}

export function getSnippets(): Snippet[] {
  if (!db) throw new Error('DB not initialized for getSnippets');
  return getSnippetsStmt.all() as Snippet[];
}

export function createSnippet(content: string): void {
  if (!db) throw new Error('DB not initialized for createSnippet');
  insertSnippetStmt.run(content);
}

export function updateSnippet(id: number, content: string): void {
  if (!db) throw new Error('DB not initialized for updateSnippet');
  updateSnippetStmt.run(content, id);
}

export function deleteSnippet(id: number): void {
  if (!db) throw new Error('DB not initialized for deleteSnippet');
  deleteSnippetStmt.run(id);
}

export function getChains(): Chain[] {
  if (!db) throw new Error('DB not initialized for getChains');
  return getChainsStmt.all().map((row: any) => {
    let parsedOptions: ChainOption[] = [];
    try {
      if (row.nodes) {
        parsedOptions = JSON.parse(row.nodes);
        // Basic validation
        if (
          !Array.isArray(parsedOptions) ||
          !parsedOptions.every(
            opt =>
              typeof opt === 'object' &&
              opt !== null &&
              'id' in opt &&
              'title' in opt &&
              'body' in opt
          )
        ) {
          logger.warn(
            `[db.getChains] Chain ID ${row.id} ('${row.name}') has malformed options structure after parsing. Defaulting to empty options. Parsed:`,
            parsedOptions
          );
          parsedOptions = [];
        }
      } else {
        logger.warn(
          `[db.getChains] Chain ID ${row.id} ('${row.name}') has null or undefined 'nodes' field. Defaulting to empty options.`
        );
        parsedOptions = [];
      }
    } catch (error) {
      logger.error(
        `[db.getChains] Failed to parse 'nodes' for chain ID ${row.id} ('${row.name}'). Nodes string: '${row.nodes}'. Error:`,
        error
      );
      parsedOptions = []; // Default to empty array on parsing error
    }
    return {
      id: row.id,
      name: row.name,
      nodes: row.nodes, // Keep raw nodes string
      options: parsedOptions,
      description: row.description,
      tags: row.tags ? JSON.parse(row.tags) : null, // Assuming tags also need try-catch if problematic
      layoutData: row.layoutData,
      autoExecute: !!row.autoExecute, // Convert 0/1 to boolean
      lastExecuted: row.lastExecuted,
      pinned: !!row.pinned,
    };
  });
}

export function getChainByName(name: string): Chain | undefined {
  if (!db) throw new Error('DB not initialized for getChainByName');
  const row = getChainByNameStmt.get(name) as any;
  if (!row) return undefined;

  let parsedOptions: ChainOption[] = [];
  try {
    if (row.nodes) {
      parsedOptions = JSON.parse(row.nodes);
      if (
        !Array.isArray(parsedOptions) ||
        !parsedOptions.every(
          opt =>
            typeof opt === 'object' &&
            opt !== null &&
            'id' in opt &&
            'title' in opt &&
            'body' in opt
        )
      ) {
        logger.warn(
          `[db.getChainByName] Chain ID ${row.id} ('${row.name}') has malformed options structure after parsing. Defaulting to empty options. Parsed:`,
          parsedOptions
        );
        parsedOptions = [];
      }
    } else {
      logger.warn(
        `[db.getChainByName] Chain ID ${row.id} ('${row.name}') has null or undefined 'nodes' field. Defaulting to empty options.`
      );
      parsedOptions = [];
    }
  } catch (error) {
    logger.error(
      `[db.getChainByName] Failed to parse 'nodes' for chain ID ${row.id} ('${row.name}'). Nodes string: '${row.nodes}'. Error:`,
      error
    );
    parsedOptions = [];
  }

  let parsedTags: string[] | null = null;
  try {
    if (row.tags) {
      parsedTags = JSON.parse(row.tags);
      if (
        !Array.isArray(parsedTags) ||
        !parsedTags.every(tag => typeof tag === 'string')
      ) {
        logger.warn(
          `[db.getChainByName] Chain ID ${row.id} ('${row.name}') has malformed tags structure after parsing. Defaulting to null. Parsed:`,
          parsedTags
        );
        parsedTags = null;
      }
    }
  } catch (error) {
    logger.error(
      `[db.getChainByName] Failed to parse 'tags' for chain ID ${row.id} ('${row.name}'). Tags string: '${row.tags}'. Error:`,
      error
    );
    parsedTags = null;
  }

  return {
    id: row.id,
    name: row.name,
    nodes: row.nodes, // Keep raw nodes string
    options: parsedOptions,
    description: row.description,
    tags: parsedTags,
    layoutData: row.layoutData,
    autoExecute: !!row.autoExecute, // Convert 0/1 to boolean
    lastExecuted: row.lastExecuted,
    pinned: !!row.pinned,
  };
}

export function getChainById(id: number): Chain | undefined {
  if (!db) throw new Error('DB not initialized for getChainById');
  const row = getChainByIdStmt.get(id) as any;
  if (!row) return undefined;

  let parsedOptions: ChainOption[] = [];
  try {
    if (row.nodes) {
      parsedOptions = JSON.parse(row.nodes);
      if (
        !Array.isArray(parsedOptions) ||
        !parsedOptions.every(
          opt =>
            typeof opt === 'object' &&
            opt !== null &&
            'id' in opt &&
            'title' in opt &&
            'body' in opt
        )
      ) {
        logger.warn(
          `[db.getChainById] Chain ID ${row.id} ('${row.name}') has malformed options structure after parsing. Defaulting to empty options. Parsed:`,
          parsedOptions
        );
        parsedOptions = [];
      }
    } else {
      logger.warn(
        `[db.getChainById] Chain ID ${row.id} ('${row.name}') has null or undefined 'nodes' field. Defaulting to empty options.`
      );
      parsedOptions = [];
    }
  } catch (error) {
    logger.error(
      `[db.getChainById] Failed to parse 'nodes' for chain ID ${row.id} ('${row.name}'). Nodes string: '${row.nodes}'. Error:`,
      error
    );
    parsedOptions = [];
  }

  let parsedTags: string[] | null = null;
  try {
    if (row.tags) {
      parsedTags = JSON.parse(row.tags);
      if (
        !Array.isArray(parsedTags) ||
        !parsedTags.every(tag => typeof tag === 'string')
      ) {
        logger.warn(
          `[db.getChainById] Chain ID ${row.id} ('${row.name}') has malformed tags structure after parsing. Defaulting to null. Parsed:`,
          parsedTags
        );
        parsedTags = null;
      }
    }
  } catch (error) {
    logger.error(
      `[db.getChainById] Failed to parse 'tags' for chain ID ${row.id} ('${row.name}'). Tags string: '${row.tags}'. Error:`,
      error
    );
    parsedTags = null;
  }

  return {
    id: row.id,
    name: row.name,
    nodes: row.nodes, // Keep raw nodes string
    options: parsedOptions,
    description: row.description,
    tags: parsedTags,
    layoutData: row.layoutData,
    autoExecute: !!row.autoExecute, // Convert 0/1 to boolean
    lastExecuted: row.lastExecuted,
    pinned: !!row.pinned,
  };
}

export function createChain(
  name: string,
  options: ChainOption[],
  description?: string | null,
  tags?: string[] | null,
  layoutData?: string | null,
  pinned?: boolean
): Chain {
  if (!db) throw new Error('DB not initialized for createChain');
  const nodesString = JSON.stringify(options || []);
  const tagsString = tags ? JSON.stringify(tags) : null;
  const autoExecuteValue = 0;
  const lastExecutedValue = null;
  const pinnedValue = pinned ? 1 : 0;

  logger.info(
    `[db.createChain] Attempting to create chain. Name: '${name}', ` +
      `Options: ${nodesString ? nodesString.substring(0, 100) + '...' : nodesString}, Desc: '${description}', ` +
      `Tags: ${tagsString}, Layout: '${layoutData}', ` +
      `AutoExec: ${autoExecuteValue}, LastExec: ${lastExecutedValue}, Pinned: ${pinnedValue}`
  );

  try {
    const result = insertChainStmt.run(
      name,
      nodesString,
      description,
      tagsString,
      layoutData,
      autoExecuteValue,
      lastExecutedValue,
      pinnedValue
    );
    const newChainId = result.lastInsertRowid as number;
    logger.info(
      `[db.createChain] Successfully created chain ID ${newChainId} with name '${name}'.`
    );
    // Fetch and return the newly created chain, now including all fields
    const newChain = getChainById(newChainId);
    if (!newChain) {
      // Should not happen if insert succeeded
      logger.error(
        `[db.createChain] Failed to retrieve newly created chain ID ${newChainId}.`
      );
      throw new Error(
        `Failed to retrieve newly created chain ID ${newChainId}`
      );
    }
    return newChain;
  } catch (error) {
    logger.error(
      `[db.createChain] Error executing insertChainStmt for name '${name}':`,
      error
    );
    throw error; // Re-throw to allow IPC handler to catch and respond
  }
}

export function updateChain(
  id: number,
  data: Partial<Omit<Chain, 'id'>>
): void {
  if (!db) throw new Error('DB not initialized for updateChain');
  logger.info(
    `[db.updateChain] Called for ID: ${id} with data:`,
    JSON.stringify(data, null, 2)
  );

  const existingChain = getChainByIdStmt.get(id) as any;
  if (!existingChain) {
    logger.error(
      `[db.updateChain] No existing chain found for ID: ${id}. Update aborted.`
    );
    throw new Error(`No chain found with ID ${id} to update.`);
  }

  logger.info(
    `[db.updateChain] Existing chain raw data for ID ${id}:`,
    JSON.stringify(existingChain, null, 2)
  );

  const name = data.name;
  const options = data.options;
  const description = data.description;
  const tags = data.tags;
  const layoutData = data.layoutData;
  const autoExecute = data.autoExecute;
  const lastExecuted = data.lastExecuted;
  const pinned = data.pinned;

  const nodesToStore =
    data.hasOwnProperty('options') && options !== undefined
      ? JSON.stringify(options)
      : existingChain.nodes;

  const tagsToStore = data.hasOwnProperty('tags')
    ? tags
      ? JSON.stringify(tags)
      : null
    : existingChain.tags;

  logger.info(`[db.updateChain] Processing update for ID ${id}:`);
  logger.info(
    `  > Received Name defined: ${data.hasOwnProperty('name')}, Value: ${name}`
  );
  logger.info(`  > Existing Raw Name: ${existingChain.name}`);
  logger.info(
    `  > Received Options defined: ${data.hasOwnProperty('options')}, Value: ${options ? JSON.stringify(options).substring(0, 50) + '...' : options}`
  );
  logger.info(
    `  > Existing Raw Nodes: ${existingChain.nodes ? existingChain.nodes.substring(0, 50) + '...' : existingChain.nodes}`
  );
  logger.info(
    `  > Nodes to Store: ${nodesToStore ? nodesToStore.substring(0, 50) + '...' : nodesToStore}`
  );
  logger.info(
    `  > Received Description defined: ${data.hasOwnProperty('description')}, Value: ${description}`
  );
  logger.info(`  > Existing Raw Description: ${existingChain.description}`);
  logger.info(
    `  > Received Tags defined: ${data.hasOwnProperty('tags')}, Value: ${tags ? JSON.stringify(tags) : tags}`
  );
  logger.info(`  > Existing Raw Tags: ${existingChain.tags}`);
  logger.info(`  > Tags to Store: ${tagsToStore}`);
  logger.info(
    `  > Received AutoExecute: ${autoExecute}, Existing: ${existingChain.autoExecute}`
  );
  logger.info(
    `  > Received LastExecuted: ${lastExecuted}, Existing: ${existingChain.lastExecuted}`
  );
  logger.info(
    `  > Received Pinned: ${pinned}, Existing: ${existingChain.pinned}`
  );

  const finalName = name ?? existingChain.name;
  const finalDescription = data.hasOwnProperty('description')
    ? description
    : existingChain.description;
  const finalLayoutData = data.hasOwnProperty('layoutData')
    ? layoutData
    : existingChain.layoutData;
  const finalAutoExecute =
    data.hasOwnProperty('autoExecute') && autoExecute !== undefined
      ? autoExecute
        ? 1
        : 0
      : existingChain.autoExecute;
  const finalLastExecuted = data.hasOwnProperty('lastExecuted')
    ? lastExecuted
    : existingChain.lastExecuted;
  const finalPinned =
    data.hasOwnProperty('pinned') && pinned !== undefined
      ? pinned
        ? 1
        : 0
      : existingChain.pinned;

  logger.info(
    `[db.updateChain] Executing update for ID ${id} with: `,
    `Name: '${finalName}', Nodes: '${nodesToStore ? nodesToStore.substring(0, 50) + '...' : nodesToStore}', Desc: '${finalDescription}', ` +
      `Tags: '${tagsToStore}', Layout: '${finalLayoutData}', AutoExec: ${finalAutoExecute}, LastExec: ${finalLastExecuted}, Pinned: ${finalPinned}`
  );

  try {
    updateChainStmt.run(
      finalName,
      nodesToStore,
      finalDescription,
      tagsToStore,
      finalLayoutData,
      finalAutoExecute,
      finalLastExecuted,
      finalPinned,
      id
    );
    logger.info(`[db.updateChain] Successfully updated chain ID ${id}.`);
  } catch (error) {
    logger.error(
      `[db.updateChain] Error executing updateChainStmt for ID ${id}:`,
      error
    );
    throw error; // Re-throw to allow IPC handler to catch and respond
  }
}

export function deleteChain(id: number): void {
  if (!db) throw new Error('DB not initialized for deleteChain');
  deleteChainStmt.run(id);
}

export function addClipboardEntry(content: string): void {
  if (!db) throw new Error('DB not initialized for addClipboardEntry');
  const existingClip = getClipByContentStmt.get(content) as
    | { id: string; pinned: number }
    | undefined;
  if (existingClip) {
    updateClipTimeStmt.run(Date.now(), existingClip.id);
  } else {
    const newId = randomUUID();
    insertClipStmt.run(newId, content, Date.now());
    trimHistory();
  }
}

function trimHistory() {
  if (!db) throw new Error('DB not initialized for trimHistory');
  const MAX_HISTORY_ITEMS = 100; // Example limit
  const countResult = countUnpinnedStmt.get() as { c: number };
  const unpinnedCount = countResult.c;

  if (unpinnedCount > MAX_HISTORY_ITEMS) {
    const toDeleteCount = unpinnedCount - MAX_HISTORY_ITEMS;
    const oldestItems = oldestUnpinnedStmt.all(toDeleteCount) as {
      id: string;
    }[];
    db.transaction(() => {
      for (const item of oldestItems) {
        deleteClipStmt.run(item.id);
      }
    })();
    logger.info(`Trimmed ${toDeleteCount} items from clipboard history.`);
  }
}

export function getClipboardHistory(limit?: number): ClipboardEntry[] {
  if (!db) throw new Error('DB not initialized for getClipboardHistory');
  const statement = getHistoryStmt; // Default statement without limit
  if (limit !== undefined && limit > 0) {
    return db
      .prepare(
        'SELECT id, content, timestamp, pinned FROM clipboard_history ORDER BY pinned DESC, timestamp DESC LIMIT ?'
      )
      .all(limit) as ClipboardEntry[];
  } else {
    return statement.all() as ClipboardEntry[];
  }
}

export function clearClipboardHistory(): void {
  if (!db) throw new Error('DB not initialized for clearClipboardHistory');
  db.exec('DELETE FROM clipboard_history WHERE pinned = 0');
}

export function pinClipboardItem(id: string, pinned: boolean): void {
  if (!db) throw new Error('DB not initialized for pinClipboardItem');
  setPinnedStmt.run(pinned ? 1 : 0, id);
}

const DEFAULT_EDGE_HOVER_SETTINGS: EdgeHoverSettings = {
  enabled: true,
  position: 'right-center',
  triggerSize: 20,
  delay: 200,
};

const DEFAULT_OVERLAY_SETTINGS: OverlaySettings = {
  theme: 'dark',
  opacity: 0.95,
  blur: 5,
  y: 50, // Default Y position (e.g. percentage or initial pixel value)
  side: 'right', // Default side
};

const DEFAULT_SETTINGS: Settings = {
  theme: 'dark', // This is main app theme
  autoPaste: false,
  autoFormat: false,
  maxHistory: 100,
  edgeHover: DEFAULT_EDGE_HOVER_SETTINGS,
  overlay: DEFAULT_OVERLAY_SETTINGS, // Contains y and side now
};

export function getSettings(): Settings {
  if (!db) throw new Error('DB not initialized for getSettings');
  const settings: Partial<Settings> = {};
  for (const key in DEFAULT_SETTINGS) {
    try {
      const row = getSettingStmt.get(key) as { value: string } | undefined;
      if (row) {
        (settings as any)[key] = JSON.parse(row.value);
      } else {
        // If not in DB, use default and potentially save it for next time
        (settings as any)[key] = (DEFAULT_SETTINGS as any)[key];
        upsertSettingStmt.run(
          key,
          JSON.stringify((DEFAULT_SETTINGS as any)[key])
        );
      }
    } catch (e) {
      logger.error(`Error parsing setting ${key}, using default:`, e);
      (settings as any)[key] = (DEFAULT_SETTINGS as any)[key];
    }
  }
  return settings as Settings;
}

export function updateSettings(newSettings: Partial<Settings>): void {
  if (!db) throw new Error('DB not initialized for updateSettings');
  for (const key in newSettings) {
    if (newSettings.hasOwnProperty(key)) {
      upsertSettingStmt.run(key, JSON.stringify((newSettings as any)[key]));
    }
  }
}
