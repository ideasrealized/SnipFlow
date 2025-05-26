import type { SnippetApi, EventsApi, Chain, Snippet } from './types';
import { processTextWithChain } from './services/chainService';

// Type definition for the extended API including generic IPC handlers
interface ExtendedOverlayApi {
  send: (channel: string, ...args: any[]) => void;
  on: (channel: string, listener: (...args: any[]) => void) => (() => void) | undefined;
  invoke: (channel: string, ...args: any[]) => Promise<any>;
  getSettings: () => Promise<any>; // Assuming Settings type is complex
  getClipboardHistory: () => Promise<any[]>; // Assuming Clip type is complex
  listChains: () => Promise<Chain[]>;
  list: () => Promise<Snippet[]>; // For traditional snippets
  insertSnippet: (content: string) => Promise<void>;
  hideOverlay?: () => void; // Optional as it might be main->overlay only
  getChainByName: (name: string) => Promise<Chain | undefined>;
  // Add any other specific methods from your preload if they exist
}

// Cast window.api to the extended type
const api = window.api as unknown as ExtendedOverlayApi;

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
let currentTheme: 'light' | 'dark' | 'system' = 'dark';

// For now, let's assume a simple global logger object for overlay context
// This logger definition should ideally be at the top of the file or handled via preload.
const logger = {
    info: (...args: any[]) => console.log('[Overlay INFO]', ...args),
    warn: (...args: any[]) => console.warn('[Overlay WARN]', ...args),
    error: (...args: any[]) => console.error('[Overlay ERROR]', ...args),
    perf: (...args: any[]) => console.log('[Overlay PERF]', ...args), 
};

async function initSettings() {
  const s = await api.getSettings?.();
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
    clips = await api.getClipboardHistory();
    
    try {
      chains = await api.listChains(); // This should now include the 'pinned' status
      logger.info('[overlay.ts] Chains loaded:', chains ? chains.length : 0, 'chains. Pinned example:', chains?.find(c => c.pinned));
    } catch (e) { 
      logger.warn('[overlay.ts] Could not load chains:', e);
      chains = []; 
    }
    
    // Fetch traditional snippets if still used/needed by a grid
    try {
      // Ensure this API (window.api.list) is actually for non-chain, individual snippets
      // And that it doesn't conflict with listChains or return chain data incorrectly
      snippets = await api.list(); 
      logger.info('[overlay.ts] Traditional Snippets loaded:', snippets ? snippets.length : 0);
    } catch (e) {
      logger.warn('[overlay.ts] Could not load traditional snippets:', e);
      snippets = [];
    }

    renderAll();
  } catch (error) {
    logger.error('[overlay.ts] Failed to load data:', error);
  }
}

function renderAll(filter = '') {
  renderPinnedItems(filter);
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

function renderPinnedItems(filter = '') {
  const term = filter.toLowerCase();
  const grid = pinnedGrid;
  
  // Clear existing boxes and empty states more simply
  grid.querySelectorAll('.grid-box, .empty-state').forEach(box => box.remove());

  const pinnedChains = chains.filter(c => c.pinned && 
    (c.name.toLowerCase().includes(term) || (c.description && c.description.toLowerCase().includes(term)))
  );

  logger.info('[overlay.ts] Rendering pinned chains. Count:', pinnedChains.length);

  if (pinnedChains.length > 0) {
    pinnedChains.slice(0, 6).forEach(chain => { 
      const title = chain.name.slice(0, 25) + (chain.name.length > 25 ? '...' : '');
      let previewText = chain.description || 'No description';
      if (chain.options && chain.options.length > 0 && chain.options[0]) {
        if (chain.options[0].title) {
          previewText = chain.options[0].title;
        } else if (chain.options[0].body) {
          previewText = chain.options[0].body.substring(0,40) + (chain.options[0].body.length > 40 ? "..." : "");
        }
      }
      logger.info(`[overlay.ts] Pinned Item Data - ID: ${chain.id}, Name: ${chain.name}, Title: '${title}', Preview: '${previewText}'`);
      
      const box = createGridBox(title, previewText, 'chain pinned', () => handleChainSelect(chain));
      logger.info('[overlay.ts] Created box for pinned item:', box ? 'Valid box' : 'Box creation FAILED');

      if (box) { // Apply debug styles if box is valid
        box.style.border = '2px dashed lime';
        box.style.backgroundColor = 'rgba(0,255,0,0.2)';
        box.style.minHeight = '50px';
        box.style.color = 'white'; // Ensure text is visible against potentially dark lime
        const itemTitleEl = box.querySelector('.item-title') as HTMLElement;
        if(itemTitleEl) itemTitleEl.style.color = 'white';
        const itemPreviewEl = box.querySelector('.item-preview') as HTMLElement;
        if(itemPreviewEl) itemPreviewEl.style.color = 'lightgrey';
      }

      grid.appendChild(box);
    });
  }
  
  grid.style.display = 'grid'; 
  
  if (pinnedChains.length === 0) {
    const emptyBox = createGridBox('No Pinned Items', 'Pin chains to see them here', 'empty-state', () => {});
    emptyBox.style.opacity = '0.7';
    emptyBox.style.cursor = 'default';
    grid.appendChild(emptyBox);
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
  const grid = chainsGrid;
  
  // Clear existing boxes and empty states more simply
  grid.querySelectorAll('.grid-box, .empty-state').forEach(box => box.remove());
  
  const nonPinnedChains = chains.filter(ch => !ch.pinned && 
    (ch.name.toLowerCase().includes(term) || 
    (ch.description && ch.description.toLowerCase().includes(term)))
  );

  logger.info('[overlay.ts] Rendering non-pinned chains. Count:', nonPinnedChains.length);
  
  if (nonPinnedChains.length > 0) {
    nonPinnedChains.slice(0, 6).forEach(chain => { 
      const title = chain.name.slice(0, 20) + (chain.name.length > 20 ? '...' : '');
      let previewText = chain.description || 'No description';
      if (chain.options && chain.options.length > 0 && chain.options[0]) {
        if (chain.options[0].title) {
          previewText = chain.options[0].title;
        } else if (chain.options[0].body) {
          previewText = chain.options[0].body.substring(0,40) + (chain.options[0].body.length > 40 ? "..." : "");
        }
      }
      const box = createGridBox(title, previewText, 'chain', () => handleChainSelect(chain));
      grid.appendChild(box);
    });
  }

  grid.style.display = 'grid';

  if (nonPinnedChains.length === 0) {
    const emptyBox = createGridBox('No other chains', 'Create more chains or pin existing ones.', 'empty-state', () => {});
    emptyBox.style.opacity = '0.7';
    emptyBox.style.cursor = 'default';
    grid.appendChild(emptyBox);
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
    async name => (await api.getChainByName(name)) || undefined,
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
  logger.info('[overlay.ts] handleSnippetSelect called for snippet ID (if available):', snippet.id);
  const final = await processSnippet(snippet.content);
  await api.insertSnippet(final);
  showFlash();
  api.hideOverlay?.();
}

async function handleChainSelect(chain: Chain) {
  logger.info('[overlay.ts] handleChainSelect called for chain:', chain.name, 'ID:', chain.id, 'Pinned:', chain.pinned);
  let contentToExecute = '';
  
  if (chain.options && chain.options.length > 0 && chain.options[0] && typeof chain.options[0].body === 'string') {
    contentToExecute = chain.options[0].body;
    logger.info(`[overlay.ts] Executing first option of chain "${chain.name}". Body (first 100 chars):`, contentToExecute.substring(0, 100));
  } else {
    // Fallback: if chain has no options or first option has no body or is not a string.
    // This behavior might need refinement. For now, just insert the chain name as a link.
    // This would allow chainService to try and resolve it again if it's a direct link like [Chain:MyChainName]
    contentToExecute = `[Chain:${chain.name}]`; 
    logger.warn(`[overlay.ts] Chain "${chain.name}" (ID: ${chain.id}) has no executable options or first option body is invalid. Defaulting to insert its link: ${contentToExecute}`);
    // As an alternative, we could show an error or do nothing.
    // For now, we proceed to processSnippet which might handle the [Chain:Name] string.
  }

  try {
    // processSnippet uses processTextWithChain from chainService, which handles [Chain:] links and [?:] prompts
    const finalOutput = await processSnippet(contentToExecute); 
    logger.info(`[overlay.ts] Chain "${chain.name}" processed. Output (first 100 chars):`, finalOutput.substring(0,100));
    await api.insertSnippet(finalOutput);
    showFlash();
  } catch (error) {
    logger.error(`[overlay.ts] Error processing or inserting chain "${chain.name}" (ID: ${chain.id}):`, error);
    // TODO: Optionally display error to user in overlay or via flash message
  } finally {
    // Ensure overlay hides even if there was an error during processing/insertion
    api.hideOverlay?.(); 
  }
}

function handleClipSelect(text: string) {
  api.insertSnippet(text);
  showFlash();
  api.hideOverlay?.();
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    api.hideOverlay?.();
  }
});

function showFloatingGrids(position: string) {
  logger.info('[overlay.ts] showFloatingGrids called with position:', position);
  if (!container) {
    logger.error('[overlay.ts] Main overlay container not found!');
    return;
  }

  // --- Debug Simplification START ---
  container.style.transition = 'opacity 0.2s ease-in-out, transform 0.2s ease-in-out';
  container.style.position = 'fixed';
  container.style.width = '400px'; // Fixed width for now
  container.style.height = '500px'; // Fixed height for now
  container.style.left = '50%';
  container.style.top = '50%';
  container.style.transform = 'translate(-50%, -50%)';
  container.style.backgroundColor = 'rgba(50, 50, 70, 0.95)'; // Dark, semi-transparent
  container.style.border = '2px solid cyan';
  container.style.padding = '10px';
  container.style.borderRadius = '8px';
  container.style.display = 'flex'; // Use flex to manage inner grids
  container.style.flexDirection = 'column';
  container.style.zIndex = '2147483647'; // Max z-index
  container.style.opacity = '1';
  // --- Debug Simplification END ---

  // Hide all grids initially, then show the primary one (pinnedGrid)
  const allGrids = [pinnedGrid, snippetsGrid, chainsGrid, historyGrid, chainRunner];
  allGrids.forEach(grid => {
    if (grid) grid.style.display = 'none';
  });

  if (pinnedGrid) {
    logger.info('[overlay.ts] Making pinnedGrid visible.');
    pinnedGrid.style.display = 'grid'; // Or 'block' if more appropriate for its content flow
    pinnedGrid.style.flex = '1'; // Allow it to take available space if container is flex
  } else {
    logger.warn('[overlay.ts] pinnedGrid element not found.');
  }
  
  // Original logic for positioning and showing specific grids can be restored later
  /*
  const display = window.screen; // This might not be available or correct, Electron screen API is via main
  const workArea = { x:0, y:0, width: window.innerWidth, height: window.innerHeight }; // Placeholder

  const overlayWidth = container.offsetWidth || 400;
  const overlayHeight = container.offsetHeight || 500;
  let x = 0;
  let y = workArea.y + workArea.height * 0.1; // Default to 10% from top

  // Determine position based on edge argument
  switch (position) {
    case 'left-center':
      x = workArea.x;
      break;
    case 'right-center':
      x = workArea.x + workArea.width - overlayWidth;
      break;
    case 'top-left': x = workArea.x; y = workArea.y; break;
    case 'top-right': x = workArea.x + workArea.width - overlayWidth; y = workArea.y; break;
    case 'bottom-left': x = workArea.x; y = workArea.y + workArea.height - overlayHeight; break;
    case 'bottom-right': x = workArea.x + workArea.width - overlayWidth; y = workArea.y + workArea.height - overlayHeight; break;
    default:
      x = workArea.x + workArea.width - overlayWidth; // Default to right
      break;
  }

  // Clamp to screen
  x = Math.max(workArea.x, Math.min(x, workArea.x + workArea.width - overlayWidth));
  y = Math.max(workArea.y, Math.min(y, workArea.y + workArea.height - overlayHeight));

  container.style.left = `${x}px`;
  container.style.top = `${y}px`;
  container.style.opacity = '1';
  container.style.transform = 'translateY(0)';
  container.style.display = 'block';

  // For now, only show pinned items grid when overlay appears
  if (pinnedGrid) pinnedGrid.style.display = 'grid';
  if (snippetsGrid) snippetsGrid.style.display = 'none';
  if (chainsGrid) chainsGrid.style.display = 'none';
  if (historyGrid) historyGrid.style.display = 'none';
  if (chainRunner) chainRunner.style.display = 'none';
  */

  logger.info('[overlay.ts] Overlay should now be visible and styled for debug.');
  // window.electronAPI?.send('overlay:shown'); // Removed: Use contextBridge API if needed
}

function hideFloatingGrids() {
  const grids = container.querySelectorAll('.floating-grid');
  grids.forEach(grid => {
    grid.classList.remove('show');
  });
}

initSettings();
loadData();

// BEGINNING OF NEW/MODIFIED IPC HANDLING
if (api && typeof api.on === 'function' && typeof api.send === 'function') {
    logger.info('[overlay.ts] Setting up IPC listeners via api (formerly window.api)');

    // Listener for when main process tells overlay to HIDE its content
    api.on('overlay:hide', () => {
        logger.info('[overlay.ts] ✅ RECEIVED overlay:hide command from main.');
        
        // Hide the main overlay container
        if (container) {
            container.style.opacity = '0'; // Example: fade out
            // container.style.transform = 'translateY(-20px)'; // Example: slide up
            // After animation, or directly if no animation:
            setTimeout(() => { // Simulate animation duration before truly "hiding"
                if (container) container.style.display = 'none';
                logger.info('[overlay.ts] Overlay content (e.g., #container) visually hidden.');
                
                // CRITICAL: Send acknowledgment back to the main process
                logger.info('[overlay.ts] ✅ SENDING overlay:hidden-ack to main.');
                api.send('overlay:hidden-ack'); 
            }, 150); // Adjust timeout to match any CSS animation/transition
        } else {
            logger.warn('[overlay.ts] Could not find #container to hide. Sending ack immediately.');
            // Still send ack even if container isn't found, so main isn't stuck
            logger.info('[overlay.ts] ✅ SENDING overlay:hidden-ack to main (container not found).');
            api.send('overlay:hidden-ack');
        }
    });

    // Listener for when main process tells overlay to SHOW its content
    // (This replaces the older window.events?.onOverlayShow)
    api.on('overlay:show', (data: any) => { 
        logger.info(`[overlay.ts] Received overlay:show from main with data:`, data);
        if (container) {
            // Ensure container is ready to be shown before populating
            container.style.display = 'flex'; // Or 'block' depending on your layout needs from showFloatingGrids
            container.style.opacity = '0'; // Start transparent for fade-in if desired
            // requestAnimationFrame helps ensure display style is applied before starting animation/population
            requestAnimationFrame(() => {
                showFloatingGrids(data?.position); // This function should handle final opacity/transform for show
            });
        } else {
            logger.error('[overlay.ts] Main overlay #container not found for show! Cannot display overlay.');
        }
    });

    // Listener for theme changes from main process
    // (This replaces the older window.events?.onThemeChanged)
    api.on('settings:changed', (newSettings: any) => {
        logger.info('[overlay.ts] Received settings:changed from main.');
        if (newSettings && newSettings.theme !== currentTheme) {
            if (newSettings.theme === 'light') {
                document.body.classList.add('light');
            } else {
                document.body.classList.remove('light');
            }
            currentTheme = newSettings.theme;
            logger.info(`[overlay.ts] Theme changed to: ${currentTheme}`);
        }
    });

} else {
    logger.error('[overlay.ts] CRITICAL: api (window.api) or api.on/send is not defined. Check preload script and context isolation setup.');
}
// END OF NEW/MODIFIED IPC HANDLING

export {};
