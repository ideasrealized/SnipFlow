import { getChainByName as fetchChainByName } from '../db';
import type { Chain, ChainOption } from '../types';

export interface ChoiceOption {
  label: string;
  text: string;
}

export interface ChainNode {
  type: 'text' | 'choice' | 'input';
  content: string;
  options?: ChoiceOption[];
}

export type GetChainFn = (name: string) => Promise<Chain | undefined>;

export type ChoiceProvider = (
  question: string,
  options: { label: string; text: string }[]
) => Promise<string>;

export type InputProvider = (promptText: string) => Promise<string>;

export interface ParsedPlaceholder {
  placeholder: string;
  name: string;
}

const CHAIN_REGEX = /\[Chain:([a-zA-Z0-9_\-\s]+?)\]/g;
const INPUT_REGEX = /\[\\?:([a-zA-Z0-9_\-\s]+?)\]/g;

async function processSingleSegment(
  segment: string,
  getChain: GetChainFn,
  provideChoice: ChoiceProvider,
  provideInput: InputProvider,
  depth: number = 0
): Promise<string> {
  if (depth > 10) {
    console.warn('Max chain recursion depth reached.');
    return `[Max recursion depth reached for segment: ${segment}]`;
  }

  let processedSegment = segment;
  let match;

  while ((match = CHAIN_REGEX.exec(processedSegment)) !== null) {
    const chainName = match[1];
    if (chainName === undefined) {
      console.warn('Chain name undefined in regex match, skipping.');
      CHAIN_REGEX.lastIndex = 0;
      continue;
    }
    const targetChain = await getChain(chainName);

    if (targetChain && targetChain.options && targetChain.options.length === 1) {
      const firstOptionBody = targetChain.options[0]!.body;
      const expandedSubChain = await processSingleSegment(firstOptionBody, getChain, provideChoice, provideInput, depth + 1);
      processedSegment = processedSegment.replace(match[0], expandedSubChain);
    } else if (targetChain && targetChain.options && targetChain.options.length > 0) {
      let replacementText = '';
      const choices = targetChain.options.map(opt => ({
        label: opt.title,
        text: opt.body
      }));
      const chosenBody = await provideChoice(`Select option for chain "${chainName}":`, choices);
      replacementText = await processSingleSegment(
        chosenBody,
        getChain,
        provideChoice,
        provideInput,
        depth + 1
      );
      processedSegment = processedSegment.replace(match[0], replacementText);
    } else {
      console.warn(`Chain "${chainName}" not found or is empty. Substituting with input.`);
      const missingChainFallback = await provideInput(`Chain "${chainName}" not found. Enter value:`);
      processedSegment = processedSegment.replace(match[0], missingChainFallback);
    }
    CHAIN_REGEX.lastIndex = 0;
  }

  while ((match = INPUT_REGEX.exec(processedSegment)) !== null) {
    const promptText = match[1];
    if (promptText === undefined) {
      console.warn('Prompt text undefined in regex match, skipping.');
      INPUT_REGEX.lastIndex = 0;
      continue;
    }
    const userInput = await provideInput(promptText);
    processedSegment = processedSegment.replace(match[0], userInput);
    INPUT_REGEX.lastIndex = 0;
  }

  return processedSegment;
}

export async function processTextWithChain(
  initialText: string,
  getChain: GetChainFn,
  provideChoice: ChoiceProvider,
  provideInput: InputProvider
): Promise<string> {
  if (!initialText) return '';
  return processSingleSegment(initialText, getChain, provideChoice, provideInput, 0);
}
