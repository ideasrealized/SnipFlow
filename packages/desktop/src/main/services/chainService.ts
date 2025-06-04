import type { Chain, ChainOption } from '../../types';
import type { Database as BetterSqlite3Database } from 'better-sqlite3'; // Assuming this is the DB type needed
import { logger } from '../../logger'; // Corrected import path and named import

const CHAIN_LINK_REGEX = /\[Chain:([a-zA-Z0-9_\-\s]+?)\]/g;
const INPUT_PROMPT_REGEX = /\[\?:([a-zA-Z0-9_\-\s]+?)\]/g;

function resolveChain(chain: Chain, allChains: Chain[], db: BetterSqlite3Database): string {
  let resolvedBody = '';
  // Ensure chain.name is defined before using it
  const chainName = chain.name ? chain.name : 'Unnamed Chain';
  logger.info(`[ChainService] Resolving chain: ${chainName}`);

  if (chain.options && Array.isArray(chain.options)) {
    chain.options.forEach((option: ChainOption, index: number) => {
      let optionContent = option.body; // Use let to allow modification

      // Resolve nested chains
      const chainLinkMatches = optionContent.matchAll(CHAIN_LINK_REGEX);
      for (const match of chainLinkMatches) {
        const linkedChainName = match[1];
        const targetChain = allChains.find(c => c.name === linkedChainName);
        if (targetChain) {
          // Ensure targetChain.name is defined
          const targetChainDisplayName = targetChain.name ? targetChain.name : 'Unnamed Linked Chain';
          logger.info(`[ChainService] Found linked chain: ${targetChainDisplayName}`);
          // Prevent infinite recursion
          if (targetChain.id === chain.id) {
            logger.warn(`[ChainService] Chain ${chainName} links to itself. Skipping to prevent infinite loop.`);
            optionContent = optionContent.replace(match[0], `[Self-reference to ${chainName} skipped]`);
          } else {
            optionContent = optionContent.replace(match[0], resolveChain(targetChain, allChains, db));
          }
        } else {
          logger.warn(`[ChainService] Linked chain "${linkedChainName}" not found.`);
          optionContent = optionContent.replace(match[0], `[Chain "${linkedChainName}" not found]`);
        }
      }

      // Resolve input prompts (simple replacement for now)
      const inputPromptMatches = optionContent.matchAll(INPUT_PROMPT_REGEX);
      for (const match of inputPromptMatches) {
        const promptText = match[1];
        // Ensure promptText is defined
        const promptKey = promptText ? promptText.trim() : 'UntitledPrompt';
        // For now, we'll just indicate where an input is needed.
        // In a real scenario, you'd have a way to provide these inputs.
        optionContent = optionContent.replace(match[0], `{INPUT: ${promptKey}}`);
      }
      
      resolvedBody += optionContent + (index < chain.options.length - 1 ? '\n-----\n' : ''); // Separator for multiple options
    });
  } else {
    logger.warn(`[ChainService] Chain ${chainName} has no options or options are not in the correct format.`);
    // If chain.options is not valid, resolvedBody remains empty as initialized.
    // chain.body was a legacy field or misunderstanding; Chain type has options array.
    // resolvedBody = chain.body || ''; // INCORRECT: Chain has no .body property
  }

  return resolvedBody;
} 