import type { SnippetApi, EventsApi } from './types';
import { processTextWithChain } from './services/chainService';

interface Snippet {
  id: number;
  content: string;
  pinned?: boolean;
}

interface Chain {
  id: number;
  name: string;
  description?: string;
}

declare global {
  interface Window {
    api: SnippetApi;
    tray?: { toggleOverlay(): Promise<void> };
    events?: EventsApi;
  }
}

const container = document.getElementById('container') as HTMLDivElement;
const pinnedGrid = document.getElementById('pinned-grid') as HTMLDivElement;
const snippetsGrid = document.getElementById('snippets-grid') as HTMLDivElement;
const chainsGrid = document.getElementById('chains-grid') as HTMLDivElement;
const historyGrid = document.getElementById('history-grid') as HTMLDivElement;
const chainRunner = document.getElementById('chain-runner') as HTMLDivElement;
const flash = document.getElementById('flash') as HTMLDivElement;

let snippets: Snippet[] = [];
let chains: Chain[] = [];
let clips: {
  id: string;
  content: string;
  timestamp: number;
  pinned: number;
}[] = [];
let currentTheme: 'light' | 'dark' = 'dark';

async function initSettings() {
  const s = await window.api.getSettings?.();
  if (s && s.theme === 'light') {
    document.body.classList.add('light');
    currentTheme = 'light';
  } else {
    document.body.classList.remove('light');
    currentTheme = 'dark';
  }
  
  // No status indicator needed in floating grid design
}

async function loadData() {
  try {
    snippets = await window.api.list();
    clips = await window.api.getClipboardHistory();
    
    // Try to load chains if the API exists
    try {
      chains = await window.api.listChains();
    } catch {
      chains = []; // API doesn't exist yet, use empty array
    }
    
    renderAll();
  } catch (error) {
    console.error('Failed to load data:', error);
  }
}

function renderAll(filter = '') {
  renderPinnedFavorites(filter);
  renderSnippets(filter);
  renderChains(filter);
  renderHistory(filter);
}

function createGridBox(title: string, preview: string, className = '', onClick: () => void) {
  const box = document.createElement('div');
  box.className = `grid-box ${className}`;
  
  const titleEl = document.createElement('div');
  titleEl.className = 'item-title';
  titleEl.textContent = title;
  
  const previewEl = document.createElement('div');
  previewEl.className = 'item-preview';
  previewEl.textContent = preview;
  
  box.appendChild(titleEl);
  box.appendChild(previewEl);
  box.addEventListener('click', onClick);
  
  return box;
}

function renderPinnedFavorites(filter = '') {
  const term = filter.toLowerCase();
  // Clear only the grid boxes, keep the header
  const boxes = pinnedGrid.querySelectorAll('.grid-box');
  boxes.forEach(box => box.remove());
  
  // Get pinned clips first
  const pinnedClips = clips.filter(c => c.pinned && c.content.toLowerCase().includes(term));
  
  pinnedClips.slice(0, 3).forEach(clip => {
    const title = clip.content.slice(0, 20) + (clip.content.length > 20 ? '...' : '');
    const preview = clip.content.slice(0, 40);
    const box = createGridBox(title, preview, 'pinned', () => handleClipSelect(clip.content));
    pinnedGrid.appendChild(box);
  });
  
  // Always show grid but might be empty
  pinnedGrid.style.display = 'grid';
  
  // Add empty state if no content
  if (pinnedClips.length === 0) {
    const emptyBox = createGridBox('No pinned items', 'Pin some clipboard items to see them here', '', () => {});
    emptyBox.style.opacity = '0.5';
    emptyBox.style.cursor = 'default';
    pinnedGrid.appendChild(emptyBox);
  }
}

function renderSnippets(filter = '') {
  const term = filter.toLowerCase();
  const boxes = snippetsGrid.querySelectorAll('.grid-box');
  boxes.forEach(box => box.remove());
  
  const filteredSnippets = snippets.filter(sn => sn.content.toLowerCase().includes(term));
  
  filteredSnippets.slice(0, 3).forEach(snippet => {
    const title = snippet.content.slice(0, 20) + (snippet.content.length > 20 ? '...' : '');
    const preview = snippet.content.slice(0, 40);
    const box = createGridBox(title, preview, '', () => handleSnippetSelect(snippet));
    snippetsGrid.appendChild(box);
  });
  
  snippetsGrid.style.display = 'grid';
  
  if (filteredSnippets.length === 0) {
    const emptyBox = createGridBox('No snippets yet', 'Add some snippets in the main window', '', () => {});
    emptyBox.style.opacity = '0.5';
    emptyBox.style.cursor = 'default';
    snippetsGrid.appendChild(emptyBox);
  }
}

function renderChains(filter = '') {
  const term = filter.toLowerCase();
  const boxes = chainsGrid.querySelectorAll('.grid-box');
  boxes.forEach(box => box.remove());
  
  const filteredChains = chains.filter(ch => 
    ch.name.toLowerCase().includes(term) || 
    (ch.description && ch.description.toLowerCase().includes(term))
  );
  
  filteredChains.slice(0, 3).forEach(chain => {
    const title = chain.name.slice(0, 20);
    const preview = (chain.description || 'Workflow').slice(0, 40);
    const box = createGridBox(title, preview, 'chain', () => handleChainSelect(chain));
    chainsGrid.appendChild(box);
  });
  
  chainsGrid.style.display = 'grid';
  
  if (filteredChains.length === 0) {
    const emptyBox = createGridBox('No chains yet', 'Create automation chains in the main window', 'chain', () => {});
    emptyBox.style.opacity = '0.5';
    emptyBox.style.cursor = 'default';
    chainsGrid.appendChild(emptyBox);
  }
}

function renderHistory(filter = '') {
  const term = filter.toLowerCase();
  const boxes = historyGrid.querySelectorAll('.grid-box');
  boxes.forEach(box => box.remove());
  
  const filteredClips = clips
    .filter(c => !c.pinned && c.content.toLowerCase().includes(term))
    .slice(0, 3);
  
  filteredClips.forEach(clip => {
    const title = clip.content.slice(0, 20) + (clip.content.length > 20 ? '...' : '');
    const preview = new Date(clip.timestamp).toLocaleTimeString();
    const box = createGridBox(title, preview, '', () => handleClipSelect(clip.content));
    historyGrid.appendChild(box);
  });
  
  historyGrid.style.display = 'grid';
  
  if (filteredClips.length === 0) {
    const emptyBox = createGridBox('No recent items', 'Copy some text to see clipboard history', '', () => {});
    emptyBox.style.opacity = '0.5';
    emptyBox.style.cursor = 'default';
    historyGrid.appendChild(emptyBox);
  }
}

async function processSnippet(content: string): Promise<string> {
  // Hide all floating grids and show chain runner
  const grids = container.querySelectorAll('.floating-grid');
  grids.forEach(grid => (grid as HTMLElement).style.display = 'none');
  chainRunner.style.display = 'block';

  const final = await processTextWithChain(
    content,
    name => window.api.getChainByName(name),
    presentChoice,
    presentInput
  );

  // Restore the grids
  chainRunner.style.display = 'none';
  grids.forEach(grid => (grid as HTMLElement).style.display = 'grid');
  return final;
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

function presentInput(promptText: string): Promise<string> {
  return new Promise(resolve => {
    chainRunner.innerHTML = '';
    const p = document.createElement('p');
    p.textContent = promptText;
    const input = document.createElement('input');
    const btn = document.createElement('button');
    btn.textContent = 'OK';
    btn.addEventListener('click', () => resolve(input.value));
    chainRunner.appendChild(p);
    chainRunner.appendChild(input);
    chainRunner.appendChild(btn);
  });
}

function showFlash() {
  flash.classList.add('show');
  setTimeout(() => flash.classList.remove('show'), 800);
}

async function handleSnippetSelect(snippet: Snippet) {
  const final = await processSnippet(snippet.content);
  await window.api.insertSnippet(final);
  showFlash();
  window.api.hideOverlay?.();
}

async function handleChainSelect(chain: Chain) {
  // For now, just show the chain name - later we'll implement chain execution
  await window.api.insertSnippet(`[Chain: ${chain.name}]`);
  showFlash();
  window.api.hideOverlay?.();
}

function handleClipSelect(text: string) {
  window.api.insertSnippet(text);
  showFlash();
  window.api.hideOverlay?.();
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    window.api.hideOverlay?.();
  }
});

function showFloatingGrids(position: string) {
  const grids = container.querySelectorAll('.floating-grid') as NodeListOf<HTMLElement>;
  
  console.log('Showing floating grids, position:', position, 'found grids:', grids.length);
  
  // Position grids based on trigger position
  grids.forEach((grid, index) => {
    console.log('Processing grid', index, grid.id);
    
    // Reset positioning
    grid.style.display = 'grid';
    
    if (position.includes('right')) {
      grid.classList.add('right-side');
      grid.style.right = '20px';
      grid.style.left = 'auto';
    } else {
      grid.classList.remove('right-side');
      grid.style.left = '20px';
      grid.style.right = 'auto';
    }
    
    // Center positioning for center triggers
    if (position.includes('center')) {
      if (position.includes('right')) {
        grid.style.right = '20px';
      } else {
        grid.style.left = '20px';
      }
      // Adjust vertical positioning for center triggers
      const baseTop = 50 + (index * 120);
      grid.style.top = `${baseTop}px`;
    }
    
    // Stagger the animation
    setTimeout(() => {
      console.log('Adding show class to grid', index);
      grid.classList.add('show');
    }, index * 150);
  });
}

function hideFloatingGrids() {
  const grids = container.querySelectorAll('.floating-grid');
  grids.forEach(grid => {
    grid.classList.remove('show');
  });
}

window.events?.onOverlayShow(async () => {
  const settings = await window.api.getSettings();
  showFloatingGrids(settings.edgeHover.position);
});

window.events?.onOverlayHide(() => {
  hideFloatingGrids();
  setTimeout(() => window.events?.notifyOverlayHidden(), 400);
});

window.events?.onThemeChanged((_, theme) => {
  document.body.classList.toggle('light', theme === 'light');
  currentTheme = theme;
});

initSettings();
loadData();

export {};
