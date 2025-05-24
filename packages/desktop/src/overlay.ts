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
const historyList = document.getElementById('history') as HTMLUListElement;
const chainRunner = document.getElementById('chain-runner') as HTMLDivElement;
const preview = document.getElementById('preview') as HTMLDivElement;
const flash = document.getElementById('flash') as HTMLDivElement;

let snippets: Snippet[] = [];
let clips: { id: string; content: string; timestamp: number; pinned: number }[] = [];
let filtered: Snippet[] = [];
let selectedIndex = -1;

async function initSettings() {
  const s = await window.api.getSettings?.();
  if (s && s.theme === 'light') {
    document.body.classList.add('light');
  } else {
    document.body.classList.remove('light');
  }
}

async function loadSnippets() {
  snippets = await window.api.list();
  render();
}

async function loadHistory() {
  clips = await window.api.getClipboardHistory();
  renderHistory();
}

function render(filter = '') {
  const term = filter.toLowerCase();
  results.innerHTML = '';
  filtered = snippets.filter(sn => sn.content.toLowerCase().includes(term));
  filtered.forEach((sn, idx) => {
    const li = document.createElement('li');
    li.textContent = sn.content;
    li.addEventListener('click', () => handleSelect(idx));
    li.addEventListener('mouseover', () => highlight(idx));
    results.appendChild(li);
  });
  selectedIndex = filtered.length ? 0 : -1;
  highlight(selectedIndex);

  renderHistory(filter);
}

function renderHistory(filter = '') {
  const term = filter.toLowerCase();
  historyList.innerHTML = '';
  clips
    .filter(c => c.content.toLowerCase().includes(term))
    .forEach(c => {
      const li = document.createElement('li');
      li.textContent = c.content;
      const pin = document.createElement('button');
      pin.textContent = c.pinned ? 'Unpin' : 'Pin';
      pin.addEventListener('click', async e => {
        e.stopPropagation();
        await window.api.pinClipboardItem(c.id, !c.pinned);
        await loadHistory();
      });
      li.appendChild(pin);
      li.addEventListener('click', () => handleClipSelect(c.content));
      historyList.appendChild(li);
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

function highlight(idx: number) {
  const items = Array.from(results.querySelectorAll('li'));
  items.forEach((li, i) => {
    li.classList.toggle('selected', i === idx);
  });
  selectedIndex = idx;
  if (filtered[idx]) {
    preview.textContent = filtered[idx].content;
  } else {
    preview.textContent = '';
  }
}

function showFlash() {
  flash.classList.add('show');
  setTimeout(() => flash.classList.remove('show'), 300);
}

async function handleSelect(idx: number) {
  const sn = filtered[idx];
  if (!sn) return;
  const final = await processSnippet(sn.content);
  await window.api.insertSnippet(final);
  showFlash();
  window.api.hideOverlay?.();
}

function handleClipSelect(text: string) {
  window.api.insertSnippet(text);
  showFlash();
  window.api.hideOverlay?.();
}

searchInput.addEventListener('input', () => {
  render(searchInput.value);
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    window.api.hideOverlay?.();
  } else if (e.key === 'ArrowDown') {
    if (selectedIndex < filtered.length - 1) highlight(selectedIndex + 1);
  } else if (e.key === 'ArrowUp') {
    if (selectedIndex > 0) highlight(selectedIndex - 1);
  } else if (e.key === 'Enter') {
    if (selectedIndex >= 0) void handleSelect(selectedIndex);
  }
});

window.addEventListener('focus', () => {
  searchInput.focus();
});

initSettings();
loadSnippets();
loadHistory();
container.classList.add('show');

export {};
