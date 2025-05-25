import type { Chain } from '../db';

export interface ChoiceOption {
  label: string;
  text: string;
}

export interface ChainNode {
  type: 'text' | 'choice' | 'input';
  content: string;
  options?: ChoiceOption[];
}

export type ChoiceProvider = (
  question: string,
  options: ChoiceOption[]
) => Promise<string>;

export type InputProvider = (prompt: string) => Promise<string>;

export interface ParsedPlaceholder {
  placeholder: string;
  name: string;
}

export function parseChainPlaceholder(text: string): ParsedPlaceholder | null {
  const regex = /\[Chain:([^\]]+)\]/;
  const match = regex.exec(text);
  if (!match) return null;
  return { placeholder: match[0], name: match[1]! };
}

export async function executeChain(
  chain: Chain,
  loadChain: (name: string) => Promise<Chain | undefined>,
  choiceProvider: ChoiceProvider,
  inputProvider: InputProvider
): Promise<string> {
  let result = '';
  for (const node of chain.nodes) {
    if (node.type === 'text') {
      result += await processTextWithChain(
        node.content,
        loadChain,
        choiceProvider,
        inputProvider
      );
    } else if (node.type === 'choice') {
      const text = await choiceProvider(node.content, node.options || []);
      result += await processTextWithChain(
        text,
        loadChain,
        choiceProvider,
        inputProvider
      );
    } else if (node.type === 'input') {
      const val = await inputProvider(node.content);
      result += val;
    }
  }
  return result;
}

export async function processTextWithChain(
  text: string,
  loadChain: (name: string) => Promise<Chain | undefined>,
  choiceProvider: ChoiceProvider,
  inputProvider: InputProvider
): Promise<string> {
  let current = text;
  let parsed = parseChainPlaceholder(current);
  while (parsed) {
    const chain = await loadChain(parsed.name);
    const replacement = chain
      ? await executeChain(chain, loadChain, choiceProvider, inputProvider)
      : '';
    current = current.replace(parsed.placeholder, replacement);
    parsed = parseChainPlaceholder(current);
  }
  return current;
}
