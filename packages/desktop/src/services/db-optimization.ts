/**
 * SnipFlow Database Optimization Service
 * Implements caching, indexing, and performance optimizations
 */

import DatabaseConstructor, { Database as BetterSqlite3Database } from 'better-sqlite3';
import { logger } from '../logger';

export interface CacheConfig {
  maxSize: number;
  ttl: number; // Time to live in ms
  strategy: 'LRU' | 'LFU' | 'FIFO';
}

export interface QueryPerformance {
  query: string;
  executionTime: number;
  rowsAffected: number;
  cached: boolean;
}

export class DatabaseOptimizer {
  private db: BetterSqlite3Database;
  private cache: Map<string, CacheEntry> = new Map();
  private cacheConfig: CacheConfig;
  private queryStats: Map<string, QueryStats> = new Map();
  private batchQueue: Map<string, any[]> = new Map();
  private batchTimers: Map<string, NodeJS.Timeout> = new Map();
  
  constructor(db: BetterSqlite3Database, config?: Partial<CacheConfig>) {
    this.db = db;
    this.cacheConfig = {
      maxSize: 1000,
      ttl: 5 * 60 * 1000, // 5 minutes
      strategy: 'LRU',
      ...config
    };
    
    this.initializeOptimizations();
  }
  
  /**
   * Initialize database optimizations
   */
  private initializeOptimizations(): void {
    // Enable query planner optimizations
    this.db.pragma('optimize');
    
    // Set performance pragmas
    this.db.pragma('journal_mode = WAL'); // Write-Ahead Logging
    this.db.pragma('synchronous = NORMAL'); // Balance safety and speed
    this.db.pragma('cache_size = 10000'); // 10MB cache
    this.db.pragma('temp_store = MEMORY'); // Use memory for temp tables
    this.db.pragma('mmap_size = 30000000000'); // 30GB memory map
    
    // Create indexes
    this.createIndexes();
    
    // Start cache cleanup
    this.startCacheCleanup();
    
    logger.info('[DB Optimizer] Database optimizations initialized');
  }
  
  /**
   * Create performance indexes
   */
  private createIndexes(): void {
    const indexes = [
      // Snippets indexes
      'CREATE INDEX IF NOT EXISTS idx_snippets_updated ON snippets(updatedAt DESC)',
      'CREATE INDEX IF NOT EXISTS idx_snippets_pinned ON snippets(isPinned, updatedAt DESC)',
      
      // Chains indexes
      'CREATE INDEX IF NOT EXISTS idx_chains_name ON chains(name)',
      'CREATE INDEX IF NOT EXISTS idx_chains_starter ON chains(isStarterChain, name)',
      'CREATE INDEX IF NOT EXISTS idx_chains_pinned ON chains(isPinned, name)',
      'CREATE INDEX IF NOT EXISTS idx_chains_updated ON chains(updatedAt DESC)',
      
      // Clipboard history indexes
      'CREATE INDEX IF NOT EXISTS idx_clipboard_timestamp ON clipboard_history(timestamp DESC)',
      'CREATE INDEX IF NOT EXISTS idx_clipboard_pinned ON clipboard_history(pinned, timestamp DESC)',
      
      // Full-text search
      `CREATE VIRTUAL TABLE IF NOT EXISTS snippets_fts USING fts5(
        content, 
        content_rowid=id
      )`,
      
      `CREATE VIRTUAL TABLE IF NOT EXISTS chains_fts USING fts5(
        name, 
        description, 
        options,
        content_rowid=id
      )`
    ];
    
    const transaction = this.db.transaction(() => {
      for (const index of indexes) {
        try {
          this.db.exec(index);
        } catch (error) {
          logger.warn(`[DB Optimizer] Index creation failed: ${error}`);
        }
      }
    });
    
    transaction();
    logger.info('[DB Optimizer] Performance indexes created');
  }
  
  /**
   * Execute query with caching
   */
  executeWithCache<T>(
    key: string, 
    query: () => T,
    options?: { ttl?: number; force?: boolean }
  ): T {
    const startTime = performance.now();
    
    // Check cache
    if (!options?.force) {
      const cached = this.getFromCache(key);
      if (cached !== undefined) {
        this.recordQueryStats(key, performance.now() - startTime, true);
        return cached as T;
      }
    }
    
    // Execute query
    const result = query();
    
    // Cache result
    this.setCache(key, result, options?.ttl);
    
    // Record stats
    this.recordQueryStats(key, performance.now() - startTime, false);
    
    return result;
  }
  
  /**
   * Batch insert operations
   */
  batchInsert<T>(
    table: string,
    data: T[],
    columns: string[],
    options?: { chunkSize?: number; delay?: number }
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const chunkSize = options?.chunkSize || 100;
      const delay = options?.delay || 100;
      
      // Add to batch queue
      if (!this.batchQueue.has(table)) {
        this.batchQueue.set(table, []);
      }
      
      this.batchQueue.get(table)!.push(...data);
      
      // Clear existing timer
      if (this.batchTimers.has(table)) {
        clearTimeout(this.batchTimers.get(table)!);
      }
      
      // Set new timer
      const timer = setTimeout(() => {
        this.processBatch(table, columns, chunkSize)
          .then(() => resolve())
          .catch(reject);
      }, delay);
      
      this.batchTimers.set(table, timer);
    });
  }
  
  /**
   * Process batch queue
   */
  private async processBatch(
    table: string,
    columns: string[],
    chunkSize: number
  ): Promise<void> {
    const data = this.batchQueue.get(table) || [];
    if (data.length === 0) return;
    
    this.batchQueue.set(table, []);
    
    const placeholders = columns.map(() => '?').join(', ');
    const stmt = this.db.prepare(
      `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`
    );
    
    const transaction = this.db.transaction((chunks: any[][]) => {
      for (const chunk of chunks) {
        for (const row of chunk) {
          stmt.run(...columns.map(col => row[col]));
        }
      }
    });
    
    // Split into chunks
    const chunks = [];
    for (let i = 0; i < data.length; i += chunkSize) {
      chunks.push(data.slice(i, i + chunkSize));
    }
    
    try {
      transaction(chunks);
      logger.info(`[DB Optimizer] Batch inserted ${data.length} rows into ${table}`);
    } catch (error) {
      logger.error(`[DB Optimizer] Batch insert failed for ${table}:`, error);
      throw error;
    }
  }
  
  /**
   * Full-text search
   */
  async searchFullText(
    table: 'snippets' | 'chains',
    query: string,
    options?: { limit?: number; offset?: number }
  ): Promise<any[]> {
    const limit = options?.limit || 50;
    const offset = options?.offset || 0;
    
    const ftsTable = `${table}_fts`;
    const stmt = this.db.prepare(`
      SELECT ${table}.*
      FROM ${table}
      JOIN ${ftsTable} ON ${table}.id = ${ftsTable}.content_rowid
      WHERE ${ftsTable} MATCH ?
      ORDER BY rank
      LIMIT ? OFFSET ?
    `);
    
    return stmt.all(query, limit, offset);
  }
  
  /**
   * Analyze query performance
   */
  analyzeQuery(sql: string): QueryAnalysis {
    const stmt = this.db.prepare(`EXPLAIN QUERY PLAN ${sql}`);
    const plan = stmt.all();
    
    const analysis: QueryAnalysis = {
      query: sql,
      plan,
      suggestions: [],
      estimatedCost: 0
    };
    
    // Analyze plan for optimization opportunities
    for (const step of plan) {
      if (step && typeof step === 'object' && 'detail' in step && typeof step.detail === 'string') {
        if (step.detail.includes('SCAN TABLE')) {
          analysis.suggestions.push({
            type: 'index',
            message: `Consider adding index on ${step.detail}`,
            impact: 'high'
          });
          analysis.estimatedCost += 100;
        } else if (step.detail.includes('USING INDEX')) {
          analysis.estimatedCost += 10;
        }
      }
    }
    
    return analysis;
  }
  
  /**
   * Vacuum database
   */
  async vacuum(): Promise<void> {
    logger.info('[DB Optimizer] Starting database vacuum...');
    const startTime = performance.now();
    
    try {
      this.db.exec('VACUUM');
      const duration = performance.now() - startTime;
      logger.info(`[DB Optimizer] Vacuum completed in ${duration.toFixed(2)}ms`);
    } catch (error) {
      logger.error('[DB Optimizer] Vacuum failed:', error);
      throw error;
    }
  }
  
  /**
   * Get cache statistics
   */
  getCacheStats(): CacheStats {
    const stats: CacheStats = {
      size: this.cache.size,
      hits: 0,
      misses: 0,
      hitRate: 0,
      evictions: 0
    };
    
    for (const [, entry] of this.cache) {
      stats.hits += entry.hits;
    }
    
    for (const [, queryStats] of this.queryStats) {
      stats.hits += queryStats.cacheHits;
      stats.misses += queryStats.cacheMisses;
    }
    
    stats.hitRate = stats.hits / (stats.hits + stats.misses) || 0;
    
    return stats;
  }
  
  /**
   * Get query statistics
   */
  getQueryStats(): QueryStats[] {
    return Array.from(this.queryStats.values())
      .sort((a, b) => b.totalTime - a.totalTime)
      .slice(0, 20); // Top 20 slowest queries
  }
  
  /**
   * Clear cache
   */
  clearCache(pattern?: string): void {
    if (pattern) {
      const regex = new RegExp(pattern);
      for (const [key] of this.cache) {
        if (regex.test(key)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }
  
  /**
   * Get from cache
   */
  private getFromCache(key: string): any {
    const entry = this.cache.get(key);
    
    if (!entry) return undefined;
    
    // Check TTL
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return undefined;
    }
    
    // Update access for LRU
    entry.lastAccess = Date.now();
    entry.hits++;
    
    return entry.value;
  }
  
  /**
   * Set cache
   */
  private setCache(key: string, value: any, ttl?: number): void {
    // Check cache size
    if (this.cache.size >= this.cacheConfig.maxSize) {
      this.evictCache();
    }
    
    const entry: CacheEntry = {
      value,
      expiry: Date.now() + (ttl || this.cacheConfig.ttl),
      lastAccess: Date.now(),
      hits: 0
    };
    
    this.cache.set(key, entry);
  }
  
  /**
   * Evict cache based on strategy
   */
  private evictCache(): void {
    let keyToEvict: string | undefined;
    
    switch (this.cacheConfig.strategy) {
      case 'LRU':
        let oldestAccess = Infinity;
        for (const [key, entry] of this.cache) {
          if (entry.lastAccess < oldestAccess) {
            oldestAccess = entry.lastAccess;
            keyToEvict = key;
          }
        }
        break;
        
      case 'LFU':
        let leastHits = Infinity;
        for (const [key, entry] of this.cache) {
          if (entry.hits < leastHits) {
            leastHits = entry.hits;
            keyToEvict = key;
          }
        }
        break;
        
      case 'FIFO':
        keyToEvict = this.cache.keys().next().value;
        break;
    }
    
    if (keyToEvict) {
      this.cache.delete(keyToEvict);
    }
  }
  
  /**
   * Start cache cleanup timer
   */
  private startCacheCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache) {
        if (now > entry.expiry) {
          this.cache.delete(key);
        }
      }
    }, 60 * 1000); // Every minute
  }
  
  /**
   * Record query statistics
   */
  private recordQueryStats(query: string, executionTime: number, cached: boolean): void {
    if (!this.queryStats.has(query)) {
      this.queryStats.set(query, {
        query,
        count: 0,
        totalTime: 0,
        avgTime: 0,
        minTime: Infinity,
        maxTime: 0,
        cacheHits: 0,
        cacheMisses: 0
      });
    }
    
    const stats = this.queryStats.get(query)!;
    stats.count++;
    stats.totalTime += executionTime;
    stats.avgTime = stats.totalTime / stats.count;
    stats.minTime = Math.min(stats.minTime, executionTime);
    stats.maxTime = Math.max(stats.maxTime, executionTime);
    
    if (cached) {
      stats.cacheHits++;
    } else {
      stats.cacheMisses++;
    }
  }
}

// Type definitions
interface CacheEntry {
  value: any;
  expiry: number;
  lastAccess: number;
  hits: number;
}

interface QueryStats {
  query: string;
  count: number;
  totalTime: number;
  avgTime: number;
  minTime: number;
  maxTime: number;
  cacheHits: number;
  cacheMisses: number;
}

interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  hitRate: number;
  evictions: number;
}

interface QueryAnalysis {
  query: string;
  plan: any[];
  suggestions: Array<{
    type: string;
    message: string;
    impact: 'low' | 'medium' | 'high';
  }>;
  estimatedCost: number;
}

export function createDatabaseOptimizer(db: BetterSqlite3Database): DatabaseOptimizer {
  return new DatabaseOptimizer(db);
}
