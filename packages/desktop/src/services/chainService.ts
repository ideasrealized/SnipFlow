import { getChainByName } from '../db';
import { Chain } from '../types';

export async function processChain(
  initialText: string,
  getChain: (name: string) => Promise<Chain | undefined>,
  provideChoice: (prompt: string, choices: string[]) => Promise<string>,
  provideInput: (prompt: string, initialValue?: string) => Promise<string>,
  depth = 0
): Promise<string> {
  const MAX_DEPTH = 10;
  if (depth > MAX_DEPTH) {
    console.warn(`[chainService] Max depth reached`);
    return initialText;
  }

  // Match chain references like [Chain:ChainName] or [?:ChainName]
  const chainPattern = /\[(?:Chain:|!?:)([a-zA-Z0-9_\-\s]+?)\]/g;
  let processedText = initialText;

  let match;
  while ((match = chainPattern.exec(processedText)) !== null) {
    const innerChainName = match[1]!.trim();
    try {
      console.log(
        `[chainService] Processing chain reference: ${innerChainName}`
      );
      const replacement = await processChainReference(
        innerChainName,
        getChain,
        provideChoice,
        provideInput,
        depth + 1
      );
      processedText = processedText.replace(match[0], replacement);
    } catch (error) {
      console.error(
        `[chainService] Error processing chain ${innerChainName}:`,
        error
      );
      processedText = processedText.replace(match[0], `[ERROR: ${error}]`);
    }
    // Reset regex to start from beginning after replacement
    chainPattern.lastIndex = 0;
  }

  return processedText;
}

async function processChainReference(
  chainName: string,
  getChain: (name: string) => Promise<Chain | undefined>,
  provideChoice: (prompt: string, choices: string[]) => Promise<string>,
  provideInput: (prompt: string, initialValue?: string) => Promise<string>,
  depth: number
): Promise<string> {
  console.log(`[chainService] Fetching chain: ${chainName}`);
  const targetChain = await getChain(chainName);

  if (
    targetChain &&
    targetChain.options &&
    targetChain.options.length === 1
  ) {
    const firstOptionBody = targetChain.options[0]!.body;
    return await processChain(
      firstOptionBody,
      getChain,
      provideChoice,
      provideInput,
      depth + 1
    );
  } else if (
    targetChain &&
    targetChain.options &&
    targetChain.options.length > 0
  ) {
    const choices = targetChain.options.map((opt) => opt.title);
    const selectedTitle = await provideChoice(
      `Select option for chain "${chainName}":`,
      choices
    );

    const selectedOption = targetChain.options.find(
      (opt) => opt.title === selectedTitle
    );
    if (selectedOption) {
      return await processChain(
        selectedOption.body,
        getChain,
        provideChoice,
        provideInput,
        depth + 1
      );
    } else {
      console.warn(
        `Chain "${chainName}" not found or is empty. Substituting with input.`
      );
      const missingChainFallback = await provideInput(
        `Chain "${chainName}" not found. Enter value:`
      );
      return missingChainFallback;
    }
  } else {
    console.warn(
      `Chain "${chainName}" not found or is empty. Substituting with input.`
    );
    const missingChainFallback = await provideInput(
      `Chain "${chainName}" not found. Enter value:`
    );
    return missingChainFallback;
  }
}

// Main entry point for chain processing
export async function expandChainText(
  initialText: string,
  getChain: (name: string) => Promise<Chain | undefined>,
  provideChoice: (prompt: string, choices: string[]) => Promise<string>,
  provideInput: (prompt: string, initialValue?: string) => Promise<string>
): Promise<string> {
  return await processChain(
    initialText,
    getChain,
    provideChoice,
    provideInput,
    0
  );
}
