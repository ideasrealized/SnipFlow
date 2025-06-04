import { logger } from './logger';

// Database migration utility to fix malformed chain tags
export function fixChainTagsMigration(db: any): { success: boolean; fixedCount: number } {
  try {
    logger.info('[MIGRATION] Starting chain tags migration...');
    
    // Begin transaction for safety
    const transaction = db.transaction(() => {
      // Get all chains with their current tags
      const chains = db.prepare('SELECT id, name, tags FROM chains').all();
      logger.info(`[MIGRATION] Found ${chains.length} chains to process`);
      
      let fixedCount = 0;
      const updateStmt = db.prepare('UPDATE chains SET tags = ? WHERE id = ?');
      
      for (const chain of chains) {
        let needsUpdate = false;
        let fixedTags: string[] = [];
        
        if (chain.tags) {
          try {
            const parsedTags = JSON.parse(chain.tags);
            
            // Check if it's a valid array of strings
            if (Array.isArray(parsedTags) && parsedTags.every((tag: any) => typeof tag === 'string')) {
              // Tags are valid, no update needed
              continue;
            } else {
              logger.warn(`[MIGRATION] Chain ID ${chain.id} ('${chain.name}') has malformed tags structure:`, parsedTags);
              // Reset to empty array
              fixedTags = [];
              needsUpdate = true;
            }
          } catch (error) {
            logger.warn(`[MIGRATION] Chain ID ${chain.id} ('${chain.name}') has unparseable tags: '${chain.tags}'`);
            // Reset to empty array
            fixedTags = [];
            needsUpdate = true;
          }
        } else if (chain.tags === null || chain.tags === undefined) {
          // Set empty array for null/undefined tags
          fixedTags = [];
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          const tagsJson = JSON.stringify(fixedTags);
          updateStmt.run(tagsJson, chain.id);
          logger.info(`[MIGRATION] Fixed tags for chain ID ${chain.id} ('${chain.name}') -> ${tagsJson}`);
          fixedCount++;
        }
      }
      
      logger.info(`[MIGRATION] Fixed ${fixedCount} chains with malformed tags`);
      return fixedCount;
    });
    
    // Execute transaction
    const result = transaction();
    
    logger.info(`[MIGRATION] SUCCESS: Migration completed. Fixed ${result} chains.`);
    return { success: true, fixedCount: result };
    
  } catch (error: any) {
    logger.error(`[MIGRATION] ERROR: ${error.message}`);
    return { success: false, fixedCount: 0 };
  }
} 