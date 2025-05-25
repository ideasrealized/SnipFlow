import type { Chain } from '../db';

export interface ChoiceOption {
  label: string;
  text: string;
}

export interface ChainNode {
  type: 'text' | 'choice';
  content: string;
  options?: ChoiceOption[];
}

export type ChoiceProvider = (
  question: string,
  options: ChoiceOption[]
) => Promise<string>;

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
  choiceProvider: ChoiceProvider
): Promise<string> {
  let result = '';
  for (const node of chain.nodes) {
    if (node.type === 'text') {
      result += node.content;
    } else if (node.type === 'choice') {
      const text = await choiceProvider(node.content, node.options || []);
      result += text;
    }
  }
  return result;
}

export async function processTextWithChain(
  text: string,
  loadChain: (name: string) => Promise<Chain | undefined>,
  choiceProvider: ChoiceProvider
): Promise<string> {
  const parsed = parseChainPlaceholder(text);
  if (!parsed) return text;
  const chain = await loadChain(parsed.name);
  if (!chain) return text.replace(parsed.placeholder, '');
  const chainOut = await executeChain(chain, choiceProvider);
  return text.replace(parsed.placeholder, chainOut);
}
