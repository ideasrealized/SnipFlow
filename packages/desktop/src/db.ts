import DatabaseConstructor, { type Database as BetterSqlite3Database, type Statement as BetterSqlite3Statement } from 'better-sqlite3';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { randomUUID } from 'crypto';
import { logger } from './logger';
import { app } from 'electron'; // Added electron app import for userData path
import { fixChainTagsMigration } from './migration';

// Import all necessary types from types.ts
import type { 
    Settings, 
    EdgeHoverSettings, 
    OverlaySettings, 
    Chain, 
    ChainOption, 
    Snippet, 
    ClipboardEntry, 
    PinnedItem
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
    PinnedItem
} from './types';

let db: BetterSqlite3Database;

// Declare prepared statements at module level, uninitialized
let insertSnippetStmt: BetterSqlite3Statement;
let updateSnippetStmt: BetterSqlite3Statement;
let deleteSnippetStmt: BetterSqlite3Statement;
let getSnippetsStmt: BetterSqlite3Statement;
let getSnippetByIdStmt: BetterSqlite3Statement;
let insertChainStmt: BetterSqlite3Statement;
let updateChainStmt: BetterSqlite3Statement;
let deleteChainStmt: BetterSqlite3Statement;
let getChainsStmt: BetterSqlite3Statement;
let getChainByNameStmt: BetterSqlite3Statement;
let getChainByIdStmt: BetterSqlite3Statement;
let insertClipStmt: BetterSqlite3Statement;
let updateClipTimeStmt: BetterSqlite3Statement;
let getClipByContentStmt: BetterSqlite3Statement;
let getHistoryStmt: BetterSqlite3Statement;
let setPinnedStmt: BetterSqlite3Statement;
let deleteClipStmt: BetterSqlite3Statement;
let countUnpinnedStmt: BetterSqlite3Statement;
let oldestUnpinnedStmt: BetterSqlite3Statement;
let getSettingStmt: BetterSqlite3Statement;
let upsertSettingStmt: BetterSqlite3Statement;

// Chain fields for SELECT statements
const chainFields = 'id, name, description, options, tags, layoutData, createdAt, updatedAt, isPinned, isStarterChain';

// This function creates tables
function createTables() {
  if (!db) throw new Error("DB not initialized for createTables");
  db.exec(`
    CREATE TABLE IF NOT EXISTS snippets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      isPinned BOOLEAN DEFAULT 0 
    );
    CREATE TABLE IF NOT EXISTS chains (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      options TEXT, -- JSON string for options/nodes
      tags TEXT, -- JSON string for tags array
      layoutData TEXT, -- JSON for layout (e.g. mind map positions)
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      isPinned BOOLEAN DEFAULT 0
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
    const snippetsTableInfo = db.pragma('table_info(snippets)') as { name: string }[];
    const hasCreatedAt = snippetsTableInfo.some(col => col.name.toLowerCase() === 'createdat');
    if (!hasCreatedAt) {
      logger.info("[db.createTables] Migrating 'snippets' table: adding 'createdAt' column.");
      db.exec('ALTER TABLE snippets ADD COLUMN createdAt DATETIME'); // SQLite uses TEXT for DATETIME affinity
      db.exec("UPDATE snippets SET createdAt = datetime('now') WHERE createdAt IS NULL");
      logger.info("[db.createTables] Column 'createdAt' added and populated for existing rows in 'snippets' table.");
    }

    // Migration for snippets table: updatedAt column
    const hasUpdatedAt = snippetsTableInfo.some(col => col.name.toLowerCase() === 'updatedat');
    if (!hasUpdatedAt) {
      logger.info("[db.createTables] Migrating 'snippets' table: adding 'updatedAt' column.");
      db.exec('ALTER TABLE snippets ADD COLUMN updatedAt DATETIME'); // SQLite uses TEXT for DATETIME affinity
      db.exec("UPDATE snippets SET updatedAt = datetime('now') WHERE updatedAt IS NULL");
      logger.info("[db.createTables] Column 'updatedAt' added and populated for existing rows in 'snippets' table.");
    }

    // Migration for snippets table: isPinned column
    const hasIsPinned = snippetsTableInfo.some(col => col.name.toLowerCase() === 'ispinned');
    if (!hasIsPinned) {
      logger.info("[db.createTables] Migrating 'snippets' table: adding 'isPinned' column.");
      db.exec('ALTER TABLE snippets ADD COLUMN isPinned BOOLEAN DEFAULT 0');
      logger.info("[db.createTables] Column 'isPinned' added to 'snippets' table with default value 0.");
    }
  } catch (error) {
    logger.error("[db.createTables] Error during snippets table migration for 'createdAt', 'updatedAt', or 'isPinned':", error);
  }

  // Migration for autoExecute and lastExecuted on chains table
  try {
    const chainsTableInfo = db.pragma('table_info(chains)') as { name: string }[];
    
    // Migration for chains table: options column (TEXT for JSON)
    const hasOptions = chainsTableInfo.some(col => col.name.toLowerCase() === 'options');
    if (!hasOptions) {
      logger.info("[db.createTables] Migrating 'chains' table: adding 'options' column (TEXT for JSON).");
      db.exec('ALTER TABLE chains ADD COLUMN options TEXT;');
      logger.info("[db.createTables] Column 'options' added to 'chains' table.");

      const hasLegacyNodes = chainsTableInfo.some(col => col.name.toLowerCase() === 'nodes');
      if (hasLegacyNodes) {
        logger.info("[db.createTables] Legacy 'nodes' column found. Attempting to transfer its content to new 'options' column.");
        try {
          const transferStmt = db.prepare("UPDATE chains SET options = nodes WHERE options IS NULL AND nodes IS NOT NULL");
          const transferResult = transferStmt.run();
          logger.info(`[db.createTables] Data from legacy 'nodes' column transferred to 'options' column for ${transferResult.changes} rows where 'options' was NULL.`);
          
          // After transferring data, set default value for nodes column to handle new inserts
          logger.info("[db.createTables] Setting default value for legacy 'nodes' column to handle new inserts.");
          db.exec("UPDATE chains SET nodes = '[]' WHERE nodes IS NULL");
          logger.info("[db.createTables] Legacy 'nodes' column populated with default empty array for NULL values.");
        } catch (transferError) {
          logger.error("[db.createTables] Error transferring data from legacy 'nodes' to 'options' in 'chains' table:", transferError);
        }
      } else {
        logger.info("[db.createTables] 'options' column added. No legacy 'nodes' column found to transfer data from.");
      }
    }

    const hasAutoExecute = chainsTableInfo.some(col => col.name === 'autoExecute');
    if (!hasAutoExecute) {
      db.exec('ALTER TABLE chains ADD COLUMN autoExecute INTEGER DEFAULT 0');
      logger.info("[db.createTables] Column 'autoExecute' added to 'chains' table.");
    }
    const hasLastExecuted = chainsTableInfo.some(col => col.name === 'lastExecuted');
    if (!hasLastExecuted) {
      db.exec('ALTER TABLE chains ADD COLUMN lastExecuted INTEGER');
      logger.info("[db.createTables] Column 'lastExecuted' added to 'chains' table.");
    }
    const hasPinned = chainsTableInfo.some(col => col.name === 'pinned'); // This might be for the old 'pinned' column
    if (!hasPinned) {
      // Assuming this was for the old `pinned` column, let's be cautious.
      // If `isPinned` is the standard, this migration might need re-evaluation or be for legacy.
      // For now, keeping as is, but focusing on `updatedAt`.
      db.exec('ALTER TABLE chains ADD COLUMN pinned INTEGER DEFAULT 0');
      logger.info("[db.createTables] Column 'pinned' (potentially legacy) added to 'chains' table.");
    }

    // Migration for chains table: createdAt column
    const hasChainsCreatedAt = chainsTableInfo.some(col => col.name.toLowerCase() === 'createdat');
    if (!hasChainsCreatedAt) {
      logger.info("[db.createTables] Migrating 'chains' table: adding 'createdAt' column.");
      db.exec('ALTER TABLE chains ADD COLUMN createdAt DATETIME');
      logger.info("[db.createTables] Column 'createdAt' added to 'chains' table. Populating with current time for existing rows.");
      db.exec("UPDATE chains SET createdAt = datetime('now') WHERE createdAt IS NULL");
      logger.info("[db.createTables] Column 'createdAt' populated for existing rows in 'chains' table.");
    }

    // Migration for chains table: updatedAt column
    const hasChainsUpdatedAt = chainsTableInfo.some(col => col.name.toLowerCase() === 'updatedat');
    if (!hasChainsUpdatedAt) {
      logger.info("[db.createTables] Migrating 'chains' table: adding 'updatedAt' column.");
      db.exec('ALTER TABLE chains ADD COLUMN updatedAt DATETIME');
      db.exec("UPDATE chains SET updatedAt = datetime('now') WHERE updatedAt IS NULL");
      logger.info("[db.createTables] Column 'updatedAt' added and populated for existing rows in 'chains' table.");
    }

    // Migration for chains table: isPinned column (canonical)
    const hasChainsIsPinned = chainsTableInfo.some(col => col.name.toLowerCase() === 'ispinned');
    if (!hasChainsIsPinned) {
      logger.info("[db.createTables] Migrating 'chains' table: adding canonical 'isPinned' column.");
      db.exec('ALTER TABLE chains ADD COLUMN isPinned BOOLEAN DEFAULT 0');
      logger.info("[db.createTables] Column 'isPinned' added to 'chains' table with default value 0.");
      
      const hasLegacyPinned = chainsTableInfo.some(col => col.name.toLowerCase() === 'pinned');
      if (hasLegacyPinned) {
        logger.info("[db.createTables] Legacy 'pinned' column found on 'chains' table. Attempting to transfer data to 'isPinned'.");
        try {
          const stmt = db.prepare("UPDATE chains SET isPinned = 1 WHERE (isPinned = 0 OR isPinned IS NULL) AND pinned = 1");
          const transferResult = stmt.run();
          logger.info(`[db.createTables] Transfered data from legacy 'pinned' to 'isPinned' for ${transferResult.changes} rows in 'chains' table.`);
        } catch (transferError) {
          logger.error("[db.createTables] Error transferring data from legacy 'pinned' to 'isPinned' in 'chains' table:", transferError);
        }
      }
    }

    // Migration for chains table: isStarterChain column
    const hasIsStarterChain = chainsTableInfo.some(col => col.name.toLowerCase() === 'isstarterchain');
    if (!hasIsStarterChain) {
      logger.info("[db.createTables] Migrating 'chains' table: adding 'isStarterChain' column.");
      db.exec('ALTER TABLE chains ADD COLUMN isStarterChain BOOLEAN DEFAULT 0');
      logger.info("[db.createTables] Column 'isStarterChain' added to 'chains' table with default value 0.");
    }

  } catch (error) {
    logger.error("[db.createTables] Error during chains table migration for columns (options, autoExecute, lastExecuted, pinned, createdAt, updatedAt, isPinned):", error);
  }

  logger.info("[db.createTables] Database tables ensured/migrated successfully.");
}

// Renamed from initializeTestDatabase, added optional dbPath
export function initDb(dbPath: string = ':memory:') {
  if (db && db.open && dbPath !== ':memory:') { // Allow re-init for :memory: for tests if needed
    logger.warn('Database already initialized. Closing existing and re-initializing.');
    db.close();
  }
  if (db && db.open && dbPath === ':memory:' && db.name === ':memory:') {
    // Already connected to in-memory, probably fine for tests to reuse
    logger.info('Re-using existing in-memory database for test.');
    return;
  }

  logger.info(`Initializing database at: ${dbPath}`);
  db = new DatabaseConstructor(dbPath);

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
  
  // Run chain tags migration after database initialization
  try {
    const migrationResult = fixChainTagsMigration(db);
    if (migrationResult.success) {
      logger.info(`[DB] Chain tags migration completed successfully. Fixed ${migrationResult.fixedCount} chains.`);
    } else {
      logger.error('[DB] Chain tags migration failed.');
    }
  } catch (error) {
    logger.error('[DB] Error running chain tags migration:', error);
  }
}

function prepareStatements() {
  if (!db) throw new Error("DB not initialized for prepareStatements");
  logger.info('[db.prepareStatements] Preparing SQL statements...');
  
  getSnippetsStmt = db.prepare('SELECT id, content, createdAt, updatedAt, isPinned FROM snippets ORDER BY updatedAt DESC');
  getSnippetByIdStmt = db.prepare('SELECT id, content, createdAt, updatedAt, isPinned FROM snippets WHERE id = ?');
  insertSnippetStmt = db.prepare('INSERT INTO snippets (content) VALUES (?) RETURNING id, content, createdAt, updatedAt, isPinned');
  deleteSnippetStmt = db.prepare('DELETE FROM snippets WHERE id = ?');
  getChainsStmt = db.prepare(`SELECT ${chainFields} FROM chains ORDER BY name ASC`);
  getChainByNameStmt = db.prepare(`SELECT ${chainFields} FROM chains WHERE name = ?`);
  getChainByIdStmt = db.prepare(`SELECT ${chainFields} FROM chains WHERE id = ?`);
  insertChainStmt = db.prepare(
    `INSERT INTO chains (name, options, description, tags, layoutData, isPinned, isStarterChain, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now')) RETURNING ${chainFields}`
  );
  updateChainStmt = db.prepare(
    'UPDATE chains SET name = @name, description = @description, options = @options, tags = @tags, layoutData = @layoutData, isPinned = @isPinned, isStarterChain = @isStarterChain, autoExecute = @autoExecute, lastExecuted = @lastExecuted, updatedAt = datetime(\'now\') WHERE id = @id'
  );
  deleteChainStmt = db.prepare('DELETE FROM chains WHERE id = ?');
  insertClipStmt = db.prepare('INSERT INTO clipboard_history(id, content, timestamp) VALUES (?, ?, ?)');
  updateClipTimeStmt = db.prepare('UPDATE clipboard_history SET timestamp = ? WHERE id = ?');
  getClipByContentStmt = db.prepare('SELECT id, pinned FROM clipboard_history WHERE content = ?');
  getHistoryStmt = db.prepare('SELECT id, content, timestamp, pinned FROM clipboard_history ORDER BY pinned DESC, timestamp DESC');
  setPinnedStmt = db.prepare('UPDATE clipboard_history SET pinned = ? WHERE id = ?');
  deleteClipStmt = db.prepare('DELETE FROM clipboard_history WHERE id = ?');
  countUnpinnedStmt = db.prepare('SELECT COUNT(*) as c FROM clipboard_history WHERE pinned = 0');
  oldestUnpinnedStmt = db.prepare('SELECT id FROM clipboard_history WHERE pinned = 0 ORDER BY timestamp ASC LIMIT ?');
  getSettingStmt = db.prepare('SELECT value FROM settings WHERE key = ?');
  upsertSettingStmt = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
}

export function closeDb() {
  if (db && db.open) {
    db.close();
    logger.info('Database connection closed.');
  }
}

export function getSnippets(): Snippet[] {
  if (!db) throw new Error("DB not initialized for getSnippets");
  logger.info('[db.getSnippets] Fetching all snippets.');
  return getSnippetsStmt.all() as Snippet[];
}

export function getSnippetById(id: number): Snippet | undefined {
  if (!db) throw new Error("DB not initialized for getSnippetById");
  const stmt = db.prepare('SELECT id, content, createdAt, updatedAt, isPinned FROM snippets WHERE id = ?');
  const result = stmt.get(id) as Snippet | undefined;
  if (result) {
    result.isPinned = !!result.isPinned;
  }
  return result;
}

export function createSnippet(snippetData: Partial<Snippet>): Snippet {
  if (!db) throw new Error("DB not initialized for createSnippet");
  logger.info('[DB] Creating snippet:', snippetData.content?.substring(0, 20));
  
  const defaults = { content: '', isPinned: false };
  const finalSnippetData = { ...defaults, ...snippetData };

  const stmt = db.prepare(
    "INSERT INTO Snippets (content, isPinned, createdAt, updatedAt) VALUES (?, ?, datetime('now'), datetime('now'))"
  );
  const result = stmt.run(finalSnippetData.content, finalSnippetData.isPinned ? 1 : 0);
  
  const newSnippetId = result.lastInsertRowid as number;
  const newSnippet = getSnippetById(newSnippetId);
  if (!newSnippet) {
    logger.error(`[DB] Failed to retrieve newly created snippet with id: ${newSnippetId}`);
    throw new Error('Failed to create or retrieve snippet');
  }
  return newSnippet;
}

export function updateSnippet(id: number, data: { content?: string; isPinned?: boolean }): { success: boolean } {
  if (!db) throw new Error("DB not initialized for updateSnippet");
  logger.info(`[DB] Updating snippet ${id} with data:`, data);
  
  if (data.content === undefined && data.isPinned === undefined) {
    logger.warn('[DB] updateSnippet called with no data to update.');
    return { success: false };
  }

  const fieldsToUpdate: string[] = [];
  const params: (string | number | null)[] = [];

  if (data.content !== undefined) {
    fieldsToUpdate.push('content = ?');
    params.push(data.content);
  }
  if (data.isPinned !== undefined) {
    fieldsToUpdate.push('isPinned = ?');
    params.push(data.isPinned ? 1 : 0);
  }

  if (fieldsToUpdate.length === 0) {
    logger.warn('[DB] updateSnippet: No valid fields found for update after checks.');
    return { success: false };
  }

  fieldsToUpdate.push("updatedAt = datetime('now')");
  const query = `UPDATE Snippets SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
  params.push(id);

  try {
    const stmt = db.prepare(query);
    const result = stmt.run(...params);
    return { success: result.changes > 0 };
  } catch (error: any) {
    logger.error('[DB] Error updating snippet:', error.message);
    return { success: false };
  }
}

export function deleteSnippet(id: number): void {
  if (!db) throw new Error("DB not initialized for deleteSnippet");
  deleteSnippetStmt.run(id);
}

export function getChains(): Chain[] {
  if (!db) throw new Error("DB not initialized for getChains");
  logger.info('[db.getChains] Fetching all chains.');
  return (
    getChainsStmt.all().map((row: any) => {
      let parsedOptions: ChainOption[] = [];
      if (row.options) {
        try {
          parsedOptions = JSON.parse(row.options);
          if (!Array.isArray(parsedOptions) || !parsedOptions.every(opt => 
            typeof opt === 'object' && opt !== null && 
            'id' in opt && typeof opt.id === 'string' &&
            'title' in opt && typeof opt.title === 'string' &&
            'body' in opt && typeof opt.body === 'string' // Add more checks as per ChainOption structure
          )) {
            logger.warn(`[db.getChains] Chain ID ${row.id} ('${row.name}') has malformed 'options' structure after parsing. Defaulting to empty options. Parsed:`, parsedOptions);
            parsedOptions = [];
          }
        } catch (error) {
          logger.error(`[db.getChains] Failed to parse 'options' for chain ID ${row.id} ('${row.name}'). Options string: '${row.options}'. Error:`, error);
          parsedOptions = [];
        }
      } else {
        logger.warn(`[db.getChains] Chain ID ${row.id} ('${row.name}') has null or undefined 'options' field. Defaulting to empty options.`);
        parsedOptions = [];
      }

      let parsedTags: string[] = [];
      if (row.tags) {
        try {
          const tempTags = JSON.parse(row.tags);
          if (Array.isArray(tempTags) && tempTags.every(tag => typeof tag === 'string')) {
            parsedTags = tempTags;
          } else {
            logger.warn(`[db.getChains] Chain ID ${row.id} ('${row.name}') has malformed 'tags' structure after parsing. Defaulting to empty tags. Parsed:`, tempTags);
            // parsedTags remains []
          }
        } catch (error) {
          logger.error(`[db.getChains] Failed to parse 'tags' for chain ID ${row.id} ('${row.name}'). Tags string: '${row.tags}'. Error:`, error);
          // parsedTags remains []
        }
      }

      const chainResult: Chain = {
      id: row.id,
      name: row.name,
        description: row.description,
        options: parsedOptions,
        tags: parsedTags, // If parsedTags is already an empty array by default, this is fine.
        layoutData: row.layoutData,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        isPinned: !!row.isPinned, // Ensure boolean conversion
        isStarterChain: !!row.isStarterChain, // Ensure boolean conversion
        // autoExecute and lastExecuted are not in chainFields by default, add them if needed
      };
      
      // Conditionally add autoExecute and lastExecuted if they exist on the row object
      // This depends on whether they are included in the 'chainFields' used by getChainsStmt
      // The current chainFields ('id, name, description, options, tags, layoutData, createdAt, updatedAt, isPinned')
      // does NOT include autoExecute or lastExecuted. If these are needed, chainFields must be updated.
      // For now, we assume they are not part of the standard getChains() result unless chainFields is changed.
      if (row.hasOwnProperty('autoExecute')) {
        chainResult.autoExecute = !!row.autoExecute;
      }
      if (row.hasOwnProperty('lastExecuted')) {
        chainResult.lastExecuted = row.lastExecuted;
      }

      return chainResult;
    })
  );
}

export function getChainByName(name: string): Chain | undefined {
  if (!db) throw new Error("DB not initialized for getChainByName");
  logger.info(`[db.getChainByName] Fetching chain by name: ${name}`);
  const row = getChainByNameStmt.get(name) as any; // Row will include all fields from chainFields
    if (!row) return undefined;

  let parsedOptions: ChainOption[] = [];
  if (row.options) {
    try {
      parsedOptions = JSON.parse(row.options);
      if (!Array.isArray(parsedOptions) || !parsedOptions.every(opt => 
        typeof opt === 'object' && opt !== null && 
        'id' in opt && typeof opt.id === 'string' &&
        'title' in opt && typeof opt.title === 'string' &&
        'body' in opt && typeof opt.body === 'string'
      )) {
        logger.warn(`[db.getChainByName] Chain ID ${row.id} ('${row.name}') has malformed 'options' structure after parsing. Defaulting to empty options. Parsed:`, parsedOptions);
        parsedOptions = [];
      }
    } catch (error) {
      logger.error(`[db.getChainByName] Failed to parse 'options' for chain ID ${row.id} ('${row.name}'). Options string: '${row.options}'. Error:`, error);
      parsedOptions = [];
    }
  } else {
    logger.warn(`[db.getChainByName] Chain ID ${row.id} ('${row.name}') has null or undefined 'options' field. Defaulting to empty options.`);
    parsedOptions = [];
  }

  let parsedTags: string[] = [];
  if (row.tags) {
    try {
      const tempTags = JSON.parse(row.tags);
      if (Array.isArray(tempTags) && tempTags.every(tag => typeof tag === 'string')) {
        parsedTags = tempTags;
      } else if (tempTags !== null && tempTags !== undefined) {
        logger.warn(`[db.getChainByName] Chain ID ${row.id} ('${row.name}') has malformed 'tags' structure after parsing. Defaulting to empty tags. Parsed:`, tempTags);
      }
    } catch (error) {
      logger.error(`[db.getChainByName] Failed to parse 'tags' for chain ID ${row.id} ('${row.name}'). Tags string: '${row.tags}'. Error:`, error);
    }
  }

  const returnObj: Chain = {
    id: row.id,
    name: row.name,
    description: row.description,
    options: parsedOptions,
    tags: parsedTags,
    layoutData: row.layoutData,
    createdAt: row.createdAt, 
    updatedAt: row.updatedAt, 
    isPinned: !!row.isPinned,
    isStarterChain: !!row.isStarterChain,
  };

  return returnObj;
}

export function getChainById(id: number): Chain | undefined {
  if (!db) throw new Error("DB not initialized for getChainById");
  logger.info(`[db.getChainById] Fetching chain by ID: ${id}`);
  const row = getChainByIdStmt.get(id) as any;

  if (!row) {
    return undefined;
  }

  try {
    let parsedOptions: ChainOption[] = [];
    if (row.options) {
      parsedOptions = JSON.parse(row.options);
      if (!Array.isArray(parsedOptions) || !parsedOptions.every(opt =>
        typeof opt === 'object' && opt !== null &&
        'id' in opt && typeof opt.id === 'string' &&
        'title' in opt && typeof opt.title === 'string' &&
        'body' in opt && typeof opt.body === 'string'
      )) {
        logger.warn(`[db.getChainById] Chain ID ${row.id} ('${row.name}') has malformed 'options' structure after parsing. Defaulting to empty options. Parsed:`, parsedOptions);
        parsedOptions = [];
      }
    } else {
      logger.warn(`[db.getChainById] Chain ID ${row.id} ('${row.name}') has null or undefined 'options' field. Defaulting to empty options.`);
      parsedOptions = [];
    }

    let parsedTags: string[] = [];
    if (row.tags) {
      try {
        const tempTags = JSON.parse(row.tags);
        if (Array.isArray(tempTags) && tempTags.every(tag => typeof tag === 'string')) {
          parsedTags = tempTags;
        } else if (tempTags !== null && tempTags !== undefined) {
          logger.warn(`[db.getChainById] Chain ID ${row.id} ('${row.name}') has malformed 'tags' structure after parsing. Defaulting to empty tags. Parsed:`, tempTags);
        }
      } catch (error) {
        logger.error(`[db.getChainById] Failed to parse 'tags' for chain ID ${row.id} ('${row.name}'). Tags string: '${row.tags}'. Error:`, error);
      }
    }

    const chainResult: Chain = {
      id: row.id,
      name: row.name,
      description: row.description,
      options: parsedOptions,
      tags: parsedTags,
      layoutData: row.layoutData,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      isPinned: !!row.isPinned,
      isStarterChain: !!row.isStarterChain,
    };

    return chainResult;

  } catch (e) {
    logger.error(`[db.getChainById] Error parsing JSON or processing fields for chain ${id}:`, e);
    return undefined;
  }
}

export function createChain(chainData: Partial<Chain>): Chain | null {
  if (!db) throw new Error("DB not initialized for createChain");
  
  const defaults: Partial<Chain> = {
    name: `Chain_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    description: '',
    tags: [],
    options: [],
    layoutData: '{}',
    isPinned: false,
    isStarterChain: false
  };
  const finalChainData = { ...defaults, ...chainData };
  logger.info(`[DB] Attempting to create chain with effective name: ${finalChainData.name}`);

  if (!finalChainData.name) {
    logger.error('[DB] Chain name is required to create a chain.');
    return null;
  }

  try {
    // Check if legacy 'nodes' column exists and include it in the insert
    const chainsTableInfo = db.pragma('table_info(chains)') as { name: string }[];
    const hasLegacyNodes = chainsTableInfo.some(col => col.name.toLowerCase() === 'nodes');
    
    let insertQuery: string;
    let insertParams: any;
    
    if (hasLegacyNodes) {
      // Include nodes column for legacy database compatibility
      insertQuery = "INSERT INTO Chains (name, description, tags, options, nodes, layoutData, isPinned, isStarterChain, createdAt, updatedAt) VALUES (@name, @description, @tags, @options, @nodes, @layoutData, @isPinned, @isStarterChain, datetime('now'), datetime('now'))";
      insertParams = {
        name: finalChainData.name,
        description: finalChainData.description,
        tags: JSON.stringify(finalChainData.tags || []),
        options: JSON.stringify(finalChainData.options || []),
        nodes: JSON.stringify(finalChainData.options || []), // Use same data as options for legacy compatibility
        layoutData: typeof finalChainData.layoutData === 'string' ? finalChainData.layoutData : JSON.stringify(finalChainData.layoutData || {}),
        isPinned: finalChainData.isPinned ? 1 : 0,
        isStarterChain: finalChainData.isStarterChain ? 1 : 0,
      };
    } else {
      // Standard insert without legacy nodes column
      insertQuery = "INSERT INTO Chains (name, description, tags, options, layoutData, isPinned, isStarterChain, createdAt, updatedAt) VALUES (@name, @description, @tags, @options, @layoutData, @isPinned, @isStarterChain, datetime('now'), datetime('now'))";
      insertParams = {
        name: finalChainData.name,
        description: finalChainData.description,
        tags: JSON.stringify(finalChainData.tags || []),
        options: JSON.stringify(finalChainData.options || []),
        layoutData: typeof finalChainData.layoutData === 'string' ? finalChainData.layoutData : JSON.stringify(finalChainData.layoutData || {}),
        isPinned: finalChainData.isPinned ? 1 : 0,
        isStarterChain: finalChainData.isStarterChain ? 1 : 0,
      };
    }
    
    const stmt = db.prepare(insertQuery);
    const result = stmt.run(insertParams);
    const newChainId = result.lastInsertRowid as number;
    logger.info(`[DB] Chain created successfully with ID: ${newChainId}`);
    return getChainById(newChainId) || null;
  } catch (error: any) {
    logger.error(`[DB] Error creating chain '${finalChainData.name}':`, error.message);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      logger.warn(`[DB] A chain with name '${finalChainData.name}' already exists.`);
    }
    return null;
  }
}

export function updateChain(id: number, data: Partial<Omit<Chain, 'id' | 'createdAt' | 'updatedAt'>>): { success: boolean; error?: string } {
  if (!db) throw new Error("DB not initialized for updateChain");
  logger.info(`[DB] Updating chain ${id} with data:`, data);

  if (Object.keys(data).length === 0) {
    logger.warn('[DB] updateChain called with no data to update.');
    return { success: false, error: 'No data provided for update.' };
  }

  const fields: string[] = [];
  const params: any[] = [];

  if (data.name !== undefined) { fields.push('name = ?'); params.push(data.name); }
  if (data.description !== undefined) { fields.push('description = ?'); params.push(data.description); }
  if (data.tags !== undefined) { fields.push('tags = ?'); params.push(JSON.stringify(data.tags)); }
  if (data.options !== undefined) { fields.push('options = ?'); params.push(JSON.stringify(data.options)); }
  if (data.layoutData !== undefined) { fields.push('layoutData = ?'); params.push(typeof data.layoutData === 'string' ? data.layoutData : JSON.stringify(data.layoutData)); }
  if (data.isPinned !== undefined) { fields.push('isPinned = ?'); params.push(data.isPinned ? 1 : 0); }
  if (data.autoExecute !== undefined) { fields.push('autoExecute = ?'); params.push(data.autoExecute ? 1 : 0); }
  if (data.lastExecuted !== undefined) { fields.push('lastExecuted = ?'); params.push(data.lastExecuted); }
  if (data.isStarterChain !== undefined) { fields.push('isStarterChain = ?'); params.push(data.isStarterChain ? 1 : 0); }

  if (fields.length === 0) {
    logger.warn('[DB] updateChain: No updatable fields provided in data object.');
    return { success: false, error: 'No updatable fields provided.' }; 
  }

  fields.push("updatedAt = datetime('now')"); 
  const query = `UPDATE Chains SET ${fields.join(', ')} WHERE id = ?`;
  params.push(id);

  try {
    const stmt = db.prepare(query);
    const result = stmt.run(...params);
    if (result.changes > 0) {
      logger.info(`[DB] Chain ${id} updated successfully.`);
      return { success: true };
    } else {
      const chainExists = getChainById(id);
      if (!chainExists) {
          logger.warn(`[DB] No chain found with ID ${id} to update.`);
          return { success: false, error: 'No chain found with the given ID.' };
      }
      logger.warn(`[DB] No changes made for chain ID ${id} during update (data might be the same).`);
      return { success: true, error: 'Data was the same as existing; no changes made.' }; 
    }
  } catch (error: any) {
    logger.error(`[DB] Error updating chain ${id}:`, error.message);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE' && data.name) {
        return { success: false, error: `A chain with name '${data.name}' already exists.` };
    }
    return { success: false, error: error.message };
  }
}

export function deleteChain(id: number): void {
  if (!db) throw new Error("DB not initialized for deleteChain");
  deleteChainStmt.run(id);
}

export function addClipboardEntry(content: string): void {
  if (!db) throw new Error("DB not initialized for addClipboardEntry");
  const existingClip = getClipByContentStmt.get(content) as { id: string; pinned: number } | undefined;
  if (existingClip) {
    updateClipTimeStmt.run(Date.now(), existingClip.id);
    } else {
    const newId = randomUUID();
    insertClipStmt.run(newId, content, Date.now());
    trimHistory();
  }
}

function trimHistory() {
  if (!db) throw new Error("DB not initialized for trimHistory");
  const MAX_HISTORY_ITEMS = 100; // Example limit
  const countResult = countUnpinnedStmt.get() as { c: number };
  const unpinnedCount = countResult.c;

  if (unpinnedCount > MAX_HISTORY_ITEMS) {
    const toDeleteCount = unpinnedCount - MAX_HISTORY_ITEMS;
    const oldestItems = oldestUnpinnedStmt.all(toDeleteCount) as { id: string }[];
    db.transaction(() => {
      for (const item of oldestItems) {
        deleteClipStmt.run(item.id);
      }
    })();
    logger.info(`Trimmed ${toDeleteCount} items from clipboard history.`);
  }
}

export function getClipboardHistory(limit?: number): ClipboardEntry[] {
  if (!db) throw new Error("DB not initialized for getClipboardHistory");
  let statement = getHistoryStmt; // Default statement without limit
  if (limit !== undefined && limit > 0) {
    return db.prepare(
      'SELECT id, content, timestamp, pinned FROM clipboard_history ORDER BY pinned DESC, timestamp DESC LIMIT ?'
    ).all(limit) as ClipboardEntry[];
  } else {
    return statement.all() as ClipboardEntry[];
  }
}

export function clearClipboardHistory(): void {
  if (!db) throw new Error("DB not initialized for clearClipboardHistory");
  db.exec('DELETE FROM clipboard_history WHERE pinned = 0');
}

export function pinClipboardItem(id: string, pinned: boolean): void {
  if (!db) throw new Error("DB not initialized for pinClipboardItem");
  setPinnedStmt.run(pinned ? 1 : 0, id);
}

const DEFAULT_EDGE_HOVER_SETTINGS: EdgeHoverSettings = {
  enabled: true,
  position: 'left-center', // Changed to left-center to match overlay position
  triggerSize: 20,
  delay: 200,
};

const DEFAULT_OVERLAY_SETTINGS: OverlaySettings = {
  theme: 'dark',
  opacity: 0.95,
  blur: 5,
  y: 50, // Default Y position (e.g. percentage or initial pixel value)
  side: 'left', // Default side - changed to left for Starter Chains
  // Grid customization defaults
  gridCols: 2,
  gridRows: 3,
  nodeWidth: 180,
  nodeHeight: 90,
  nodeStyle: 'rounded',
  // Performance settings
  animationSpeed: 'fast',
  preloadContent: true
};

const DEFAULT_SETTINGS: Settings = {
  theme: 'dark', // This is main app theme
  autoPaste: false,
  autoFormat: false,
  maxHistory: 100,
  edgeHover: DEFAULT_EDGE_HOVER_SETTINGS,
  overlay: DEFAULT_OVERLAY_SETTINGS, // Contains y and side now
  advancedMode: {
    enabled: false,
    codingMode: false,
    syntaxHighlighting: false,
    codeSnippetHeaders: false,
    templateEngine: 'basic',
    performanceMode: 'balanced'
  }
};

export function getSettings(): Settings {
  if (!db) throw new Error("DB not initialized for getSettings");
  const settings: Partial<Settings> = {};
  for (const key in DEFAULT_SETTINGS) {
    try {
      const row = getSettingStmt.get(key) as { value: string } | undefined;
      if (row) {
        (settings as any)[key] = JSON.parse(row.value);
      } else {
        // If not in DB, use default and potentially save it for next time
        (settings as any)[key] = (DEFAULT_SETTINGS as any)[key];
        upsertSettingStmt.run(key, JSON.stringify((DEFAULT_SETTINGS as any)[key]));
      }
    } catch (e) {
      logger.error(`Error parsing setting ${key}, using default:`, e);
      (settings as any)[key] = (DEFAULT_SETTINGS as any)[key];
    }
  }
  return settings as Settings;
}

export function updateSettings(newSettings: Partial<Settings>): void {
  if (!db) throw new Error("DB not initialized for updateSettings");
  for (const key in newSettings) {
    if (newSettings.hasOwnProperty(key)) {
      upsertSettingStmt.run(key, JSON.stringify((newSettings as any)[key]));
    }
  }
}

export function getPinnedItems(): PinnedItem[] {
  if (!db) throw new Error("DB not initialized for getPinnedItems");
  logger.info('[DB] Fetching pinned items');
  const snippetStmt = db.prepare("SELECT id, content, 'snippet' as type, isPinned FROM Snippets WHERE isPinned = 1");
  const chainStmt = db.prepare("SELECT id, name, 'chain' as type, isPinned FROM Chains WHERE isPinned = 1");
  
  const pinnedSnippetsRaw = snippetStmt.all() as any[];
  const pinnedChainsRaw = chainStmt.all() as any[];

  const pinnedSnippets: PinnedItem[] = pinnedSnippetsRaw.map(s => ({
    id: s.id,
    type: 'snippet',
    name: s.content.substring(0, 50) + (s.content.length > 50 ? '...' : ''),
    content: s.content,
    isPinned: !!s.isPinned
  }));

  const pinnedChains: PinnedItem[] = pinnedChainsRaw.map(c => ({
    id: c.id,
    type: 'chain',
    name: c.name,
    isPinned: !!c.isPinned
  }));

  return [...pinnedSnippets, ...pinnedChains];
}

export function getStarterChains(): Chain[] {
  if (!db) throw new Error("DB not initialized for getStarterChains");
  logger.info('[DB] Fetching starter chains');
  const stmt = db.prepare(`SELECT ${chainFields} FROM chains WHERE isStarterChain = 1 ORDER BY name ASC`);
  
  return stmt.all().map((row: any) => {
    let parsedOptions: ChainOption[] = [];
    if (row.options) {
      try {
        parsedOptions = JSON.parse(row.options);
        if (!Array.isArray(parsedOptions) || !parsedOptions.every(opt => 
          typeof opt === 'object' && opt !== null && 
          'id' in opt && typeof opt.id === 'string' &&
          'title' in opt && typeof opt.title === 'string' &&
          'body' in opt && typeof opt.body === 'string'
        )) {
          logger.warn(`[db.getStarterChains] Chain ID ${row.id} ('${row.name}') has malformed 'options' structure. Defaulting to empty options.`);
          parsedOptions = [];
        }
      } catch (error) {
        logger.error(`[db.getStarterChains] Failed to parse 'options' for chain ID ${row.id} ('${row.name}'):`, error);
        parsedOptions = [];
      }
    }

    let parsedTags: string[] = [];
    if (row.tags) {
      try {
        const tempTags = JSON.parse(row.tags);
        if (Array.isArray(tempTags) && tempTags.every(tag => typeof tag === 'string')) {
          parsedTags = tempTags;
        }
      } catch (error) {
        logger.error(`[db.getStarterChains] Failed to parse 'tags' for chain ID ${row.id} ('${row.name}'):`, error);
      }
    }

    return {
      id: row.id,
      name: row.name,
      description: row.description,
      options: parsedOptions,
      tags: parsedTags,
      layoutData: row.layoutData,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      isPinned: !!row.isPinned,
      isStarterChain: !!row.isStarterChain,
    };
  });
}
