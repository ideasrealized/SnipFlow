import type { SnippetApi } from './types';

interface Snippet {
  id: number;
  content: string;
}

declare global {
  interface Window {
    api: SnippetApi;
  }
}

const container = document.getElementById('container') as HTMLDivElement;
const searchInput = document.getElementById('search') as HTMLInputElement;
const results = document.getElementById('results') as HTMLUListElement;
const chainRunner = document.getElementById('chain-runner') as HTMLDivElement;

let snippets: Snippet[] = [];

async function loadSnippets() {
  snippets = await window.api.list();
  render();
}

function render(filter = '') {
  const term = filter.toLowerCase();
  results.innerHTML = '';
  snippets
    .filter(sn => sn.content.toLowerCase().includes(term))
    .forEach(sn => {
      const li = document.createElement('li');
      li.textContent = sn.content;
      li.addEventListener('click', async () => {
        const final = await processSnippet(sn.content);
        if (navigator.clipboard) {
          navigator.clipboard.writeText(final).then(() => {
            window.api.hideOverlay?.();
          });
        } else {
          window.api.hideOverlay?.();
        }
      });
      results.appendChild(li);
    });
}

async function processSnippet(content: string): Promise<string> {
  const chainRegex = /\[Chain:([^\]]+)\]/;
  const match = chainRegex.exec(content);
  if (!match) {
    return content;
  }
  const chainName = match[1]!;
  const chainOutput = await runChain(chainName);
  return content.replace(match[0], chainOutput);
}

async function runChain(name: string): Promise<string> {
  const chain = await window.api.getChainByName(name);
  if (!chain) return '';

  searchInput.style.display = 'none';
  results.style.display = 'none';
  chainRunner.style.display = 'block';

  let result = '';
  for (const node of chain.nodes) {
    if (node.type === 'text') {
      result += node.content;
    } else if (node.type === 'choice') {
      result += await presentChoice(node.content, node.options || []);
    }
  }

  chainRunner.style.display = 'none';
  searchInput.style.display = '';
  results.style.display = '';
  return result;
}

function presentChoice(
  question: string,
  options: { label: string; text: string }[]
): Promise<string> {
  return new Promise(resolve => {
    chainRunner.innerHTML = '';
    const q = document.createElement('p');
    q.textContent = question;
    chainRunner.appendChild(q);
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.textContent = opt.label;
      btn.addEventListener('click', () => resolve(opt.text));
      chainRunner.appendChild(btn);
    });
  });
}

searchInput.addEventListener('input', () => {
  render(searchInput.value);
});

loadSnippets();
container.classList.add('show');

export {};
