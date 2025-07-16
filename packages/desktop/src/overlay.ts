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
  getStarterChains: () => Promise<Chain[]>; // New method for starter chains
  list: () => Promise<Snippet[]>; // For traditional snippets
  insertSnippet: (content: string) => Promise<void>;
  hideOverlay?: () => void; // Optional as it might be main->overlay only
  getChainByName: (name: string) => Promise<Chain | undefined>;
  // Add any other specific methods from your preload if they exist
}

// Cast window.api to the extended type
const overlayApi = window.api as unknown as ExtendedOverlayApi;

const container = document.getElementById('container') as HTMLDivElement;
const starterGrid = document.getElementById('starter-grid') as HTMLDivElement;
const snippetsGrid = document.getElementById('snippets-grid') as HTMLDivElement;
const chainsGrid = document.getElementById('chains-grid') as HTMLDivElement;
const historyGrid = document.getElementById('history-grid') as HTMLDivElement;
const chainRunner = document.getElementById('chain-runner') as HTMLDivElement;
const flash = document.getElementById('flash') as HTMLDivElement;

let snippets: Snippet[] = [];
let chains: Chain[] = [];
let starterChains: Chain[] = [];
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
  console.log('[Overlay] Initializing settings...');
  const s = await overlayApi.getSettings?.();
  console.log('[Overlay] Settings loaded:', s);
  if (s && s.overlay) {
    // Apply overlay theme
    if (s.overlay.theme === 'light') {
      document.body.classList.add('light');
      currentTheme = 'light';
    } else {
      document.body.classList.remove('light');
      currentTheme = 'dark';
    }
    
    // Apply grid customization from overlay settings
    const layoutMode = s.overlay.layoutMode || 'grid';
    const gridCols = s.overlay.gridCols || 2;
    const gridRows = s.overlay.gridRows || 3;
    const nodeWidth = s.overlay.nodeWidth || 180;
    const nodeHeight = s.overlay.nodeHeight || 90;
    const nodeStyle = s.overlay.nodeStyle || 'rounded';
    const animationSpeed = s.overlay.animationSpeed || 'fast';

    // Apply layout mode
    document.body.setAttribute('data-layout', layoutMode);
    
    // Apply node style
    document.body.setAttribute('data-node-style', nodeStyle);
    
    // Update layout mode select if it exists
    const layoutModeSelect = document.getElementById('layout-mode-select') as HTMLSelectElement;
    if (layoutModeSelect) {
      layoutModeSelect.value = layoutMode;
    }
    
    // Show/hide grid settings based on layout mode
    const gridSettingsSection = document.getElementById('grid-settings');
    if (gridSettingsSection) {
      gridSettingsSection.style.display = (layoutMode === 'grid' || layoutMode === 'compact') ? 'block' : 'none';
    }

    document.documentElement.style.setProperty('--grid-cols', String(gridCols));
    document.documentElement.style.setProperty('--grid-rows', String(gridRows));
    document.documentElement.style.setProperty('--node-width', nodeWidth + 'px');
    document.documentElement.style.setProperty('--node-height', nodeHeight + 'px');
    document.documentElement.style.setProperty('--node-style', nodeStyle);
    document.documentElement.style.setProperty('--animation-speed', 
      animationSpeed === 'instant' ? '0s' : 
      animationSpeed === 'fast' ? '0.15s' : 
      animationSpeed === 'slow' ? '0.5s' : '0.3s'
    );
    
    // Apply performance settings
    if (s.overlay.preloadContent && container) {
      container.setAttribute('data-preload', 'true');
    }
  }
}

async function loadData() {
  try {
    clips = await overlayApi.getClipboardHistory();
    
    try {
      chains = await overlayApi.listChains(); // This should now include the 'pinned' status
      logger.info('[overlay.ts] Chains loaded:', chains ? chains.length : 0, 'chains. Pinned example:', chains?.find(c => c.isPinned));
    } catch (e) { 
      logger.warn('[overlay.ts] Could not load chains:', e);
      chains = []; 
    }

    try {
      starterChains = await overlayApi.getStarterChains(); // Load starter chains
      logger.info('[overlay.ts] Starter chains loaded:', starterChains ? starterChains.length : 0, 'starter chains');
    } catch (e) { 
      logger.warn('[overlay.ts] Could not load starter chains:', e);
      starterChains = []; 
    }
    
    // Fetch traditional snippets if still used/needed by a grid
    try {
      // Ensure this API (window.api.list) is actually for non-chain, individual snippets
      // And that it doesn't conflict with listChains or return chain data incorrectly
      snippets = await overlayApi.list();
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
  renderStarterChains(filter);
  renderSnippets(filter);
  renderChains(filter);
  renderHistory(filter);
}

function createGridBox(title: string, preview: string, className = '', onClick: () => void, chain?: Chain) {
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
  
  // Add chain link indicator if chain contains chain references
  if (chain) {
    let totalChainLinks = 0;
    chain.options?.forEach(option => {
      const chainMatches = (option.body || '').match(/\[Chain:[^\]]+\]/g);
      if (chainMatches) {
        totalChainLinks += chainMatches.length;
      }
    });
    
    if (totalChainLinks > 0) {
      const linkIndicator = document.createElement('div');
      linkIndicator.textContent = `🔗 ${totalChainLinks}`;
      linkIndicator.style.cssText = 'position: absolute; top: 4px; right: 4px; background: var(--accent); color: white; font-size: 9px; padding: 2px 4px; border-radius: 8px; font-weight: bold; z-index: 10;';
      box.style.position = 'relative';
      box.appendChild(linkIndicator);
    }
  }
  
  box.addEventListener('click', onClick);
  
  // Add right-click context menu for chains
  if (chain) {
    box.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      showChainContextMenu(e, chain);
    });
  }
  
  return box;
}

function renderStarterChains(filter = '') {
  const term = filter.toLowerCase();
  const grid = starterGrid;
  
  // Clear existing boxes and empty states more simply
  grid.querySelectorAll('.grid-box, .empty-state').forEach((box: any) => box.remove());

  const filteredStarters = starterChains.filter(c => 
    c.name.toLowerCase().includes(term) || (c.description && c.description.toLowerCase().includes(term))
  );

  logger.info('[overlay.ts] Rendering starter chains. Count:', filteredStarters.length);

  if (filteredStarters.length > 0) {
    filteredStarters.slice(0, 6).forEach(chain => { 
      const title = chain.name.slice(0, 25) + (chain.name.length > 25 ? '...' : '');
      
      // Debug logging for description display
      logger.info(`[DEBUG] Chain: ${chain.name}`);
      logger.info(`[DEBUG] Description: "${chain.description}"`);
      logger.info(`[DEBUG] First option title: "${chain.options && chain.options[0] ? chain.options[0].title : 'N/A'}"`);
      
      // Use chain description as preview text, with fallback to first option
      let previewText = chain.description || 'No description';
      if (!chain.description || chain.description.trim() === '') {
        // Fallback to first option if no description
        if (chain.options && chain.options.length > 0 && chain.options[0]) {
          if (chain.options[0].title) {
            previewText = chain.options[0].title;
          } else if (chain.options[0].body) {
            previewText = chain.options[0].body.substring(0,40) + (chain.options[0].body.length > 40 ? "..." : "");
          }
        }
      }
      
      logger.info(`[DEBUG] Preview text result: "${previewText}"`);
      logger.info(`[DEBUG] Chain isStarterChain: ${chain.isStarterChain}`);
      logger.info(`[DEBUG] Chain options count: ${chain.options ? chain.options.length : 0}`);
      
      // Truncate preview text if too long
      if (previewText.length > 50) {
        previewText = previewText.substring(0, 47) + '...';
      }
      
      logger.info(`[overlay.ts] Starter Chain Data - ID: ${chain.id}, Name: ${chain.name}, Title: '${title}', Preview: '${previewText}'`);
      
      const box = createGridBox(title, previewText, 'chain starter', () => handleChainSelect(chain), chain);
      logger.info('[overlay.ts] Created box for starter chain:', box ? 'Valid box' : 'Box creation FAILED');

      grid.appendChild(box);
    });
  }
  
  grid.style.display = 'grid'; 
  
  if (filteredStarters.length === 0) {
    const emptyBox = createGridBox('No Starter Chains', 'Mark chains as starters to see them here', 'empty-state', () => {});
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
  
  const nonPinnedChains = chains.filter(ch => !ch.isPinned && 
    (ch.name.toLowerCase().includes(term) || 
    (ch.description && ch.description.toLowerCase().includes(term)))
  );

  logger.info('[overlay.ts] Rendering non-pinned chains. Count:', nonPinnedChains.length);
  
  if (nonPinnedChains.length > 0) {
    nonPinnedChains.slice(0, 6).forEach(chain => { 
      const title = chain.name.slice(0, 20) + (chain.name.length > 20 ? '...' : '');
      
      // Use chain description as preview text, with fallback to first option
      let previewText = chain.description || 'No description';
      if (!chain.description || chain.description.trim() === '') {
        // Fallback to first option if no description
        if (chain.options && chain.options.length > 0 && chain.options[0]) {
          if (chain.options[0].title) {
            previewText = chain.options[0].title;
          } else if (chain.options[0].body) {
            previewText = chain.options[0].body.substring(0,40) + (chain.options[0].body.length > 40 ? "..." : "");
          }
        }
      }
      
      // Truncate preview text if too long
      if (previewText.length > 40) {
        previewText = previewText.substring(0, 37) + '...';
      }
      
      const box = createGridBox(title, previewText, 'chain', () => handleChainSelect(chain), chain);
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
    async name => (await overlayApi.getChainByName(name)) || undefined,
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
    // Set input pending flag to prevent overlay from closing
    isInputPending = true;
    (window as any).isInputPending = true;
    logger.info('[overlay.ts] Input pending - overlay close protection enabled');
    
    chainRunner.innerHTML = '';
    
    // Create prompt text
    const p = document.createElement('p');
    p.textContent = promptText;
    p.style.cssText = 'margin-bottom: 10px; color: var(--text); font-size: 14px;';
    
    // Create input field with styling
    const input = document.createElement('input');
    input.type = 'text';
    input.style.cssText = 'width: 100%; padding: 8px 12px; border: 1px solid var(--accent); border-radius: 4px; background: var(--bg); color: var(--text); font-size: 14px; margin-bottom: 10px; outline: none;';
    input.placeholder = 'Enter value...';
    
    // Create OK button
    const btn = document.createElement('button');
    btn.textContent = 'OK';
    btn.style.cssText = 'background: var(--accent); color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 14px;';
    
    // Function to submit the input
    const submitInput = () => {
      const value = input.value.trim();
      logger.info(`[overlay.ts] Input submitted: "${value}"`);
      
      // Clear input pending flag
      isInputPending = false;
      (window as any).isInputPending = false;
      logger.info('[overlay.ts] Input completed - overlay close protection disabled');
      
      resolve(value);
    };
    
    // Add event listeners
    btn.addEventListener('click', submitInput);
    
    // Enter key support
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        submitInput();
      }
    });
    
    // Append elements
    chainRunner.appendChild(p);
    chainRunner.appendChild(input);
    chainRunner.appendChild(btn);
    
    // Auto-focus the input field after a brief delay to ensure it's rendered
    setTimeout(() => {
      input.focus();
      logger.info('[overlay.ts] Input field auto-focused');
    }, 50);
  });
}

function showFlash() {
  flash.classList.add('show');
  setTimeout(() => flash.classList.remove('show'), 800);
}

function showSuccessMessage(message: string) {
  flash.textContent = message;
  flash.style.background = 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)';
  flash.classList.add('show');
  setTimeout(() => {
    flash.classList.remove('show');
    flash.textContent = 'Pasted!';
    flash.style.background = '';
  }, 2000);
}

function showErrorMessage(message: string) {
  flash.textContent = message;
  flash.style.background = 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)';
  flash.classList.add('show');
  setTimeout(() => {
    flash.classList.remove('show');
    flash.textContent = 'Pasted!';
    flash.style.background = '';
  }, 2000);
}

async function handleSnippetSelect(snippet: Snippet) {
  logger.info('[overlay.ts] handleSnippetSelect called for snippet ID (if available):', snippet.id);
  const final = await processSnippet(snippet.content);
  await overlayApi.insertSnippet(final);
  showFlash();
  overlayApi.hideOverlay?.();
}

// Global variable to track current chain being processed
let currentChain: Chain | null = null;

// Global variables to track interactive states (prevents overlay from closing)
let isInputPending: boolean = false;
let isInQuickEdit: boolean = false;
let isInContextMenu: boolean = false;

// Expose to window for main process access
(window as any).isInputPending = false;
(window as any).isInQuickEdit = false;
(window as any).isInContextMenu = false;

async function handleChainSelect(chain: Chain) {
  logger.info('[overlay.ts] handleChainSelect called for chain:', chain.name, 'ID:', chain.id, 'isStarterChain:', chain.isStarterChain);
  
  // For starter chains, show their options instead of executing directly
  if (chain.isStarterChain) {
    logger.info(`[overlay.ts] Showing options for starter chain "${chain.name}"`);
    
    if (chain.options && chain.options.length > 0) {
      if (chain.options.length === 1 && chain.options[0]) {
        // If only one option, execute it directly
        logger.info(`[overlay.ts] Single option found, executing directly: "${chain.options[0].title}"`);
        await handleChainOptionSelect(chain, chain.options[0]);
      } else {
        // Multiple options - show them in the overlay
        logger.info(`[overlay.ts] Multiple options (${chain.options.length}) found, showing options overlay`);
        showChainOptionsOverlay(chain);
      }
    } else {
      // No options - fallback to chain name
      logger.warn(`[overlay.ts] Starter chain "${chain.name}" has no options. Using chain name as content.`);
      overlayApi.insertSnippet(chain.name);
      overlayApi.hideOverlay?.();
    }
  } else {
    // For regular chains, just copy the content directly too
    logger.info(`[overlay.ts] Regular chain "${chain.name}" - copying content directly`);
    
    let contentToExecute = '';
    
    if (chain.options && chain.options.length > 0 && chain.options[0] && typeof chain.options[0].body === 'string') {
      contentToExecute = chain.options[0].body;
    } else {
      contentToExecute = chain.name; 
    }

    try {
      overlayApi.insertSnippet(contentToExecute);
      overlayApi.hideOverlay?.();
    } catch (error) {
      logger.error(`[overlay.ts] Error processing chain "${chain.name}":`, error);
    }
  }
}

function showChainOptionsOverlay(chain: Chain) {
  logger.info(`[overlay.ts] Displaying options overlay for chain: ${chain.name}`);
  currentChain = chain;
  
  // Hide starter grid and show chain runner for options
  if (starterGrid) starterGrid.style.display = 'none';
  if (chainRunner) {
    chainRunner.style.display = 'block';
    chainRunner.innerHTML = ''; // Clear previous content
    
    // Add header
    const header = document.createElement('div');
    header.style.cssText = 'font-weight: bold; margin-bottom: 15px; color: var(--accent); font-size: 14px;';
    header.textContent = `${chain.name} Options:`;
    chainRunner.appendChild(header);
    
    // Add back button
    const backBtn = document.createElement('button');
    backBtn.textContent = '← Back to Starters';
    backBtn.style.cssText = 'background: var(--hover); color: var(--text); border: 1px solid var(--accent); padding: 6px 12px; border-radius: 4px; cursor: pointer; margin-bottom: 10px; font-size: 12px;';
    backBtn.addEventListener('click', () => {
      showStarterChainsView();
    });
    chainRunner.appendChild(backBtn);
    
    // Add options as buttons
    chain.options.forEach((option, index) => {
      const optionBtn = document.createElement('button');
      optionBtn.textContent = option.title || `Option ${index + 1}`;
      optionBtn.style.cssText = 'background: var(--accent); color: white; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer; margin: 5px; display: block; width: calc(100% - 10px); text-align: left; transition: background 0.2s;';
      
      // Add hover effect
      optionBtn.addEventListener('mouseenter', () => {
        optionBtn.style.background = '#357abd';
      });
      optionBtn.addEventListener('mouseleave', () => {
        optionBtn.style.background = 'var(--accent)';
      });
      
      optionBtn.addEventListener('click', () => {
        handleChainOptionSelect(chain, option);
      });
      
      chainRunner.appendChild(optionBtn);
    });
  }
}

function showStarterChainsView() {
  logger.info('[overlay.ts] Returning to starter chains view');
  currentChain = null;
  
  // Clear interactive flags
  isInQuickEdit = false;
  (window as any).isInQuickEdit = false;
  logger.info('[overlay.ts] Quick edit closed - overlay close protection disabled');
  
  // Hide chain runner and show starter grid
  if (chainRunner) chainRunner.style.display = 'none';
  if (starterGrid) starterGrid.style.display = 'grid';
}

function showChainContextMenu(event: MouseEvent, chain: Chain) {
  logger.info(`[overlay.ts] Showing context menu for chain: ${chain.name}`);
  
  // Set context menu flag to prevent overlay from closing
  isInContextMenu = true;
  (window as any).isInContextMenu = true;
  logger.info('[overlay.ts] Context menu opened - overlay close protection enabled');
  
  // Remove any existing context menu
  const existingMenu = document.getElementById('chain-context-menu');
  if (existingMenu) {
    existingMenu.remove();
  }
  
  // Create context menu
  const menu = document.createElement('div');
  menu.id = 'chain-context-menu';
  menu.style.cssText = `
    position: fixed;
    background: var(--bg);
    border: 1px solid var(--accent);
    border-radius: 8px;
    padding: 8px 0;
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    z-index: 2147483647;
    min-width: 180px;
    backdrop-filter: blur(12px);
  `;
  
  // Position menu at mouse location with boundary checking
  const menuWidth = 180; // min-width from CSS
  const menuHeight = 200; // estimated height for 5 items
  
  let x = event.clientX;
  let y = event.clientY;
  
  // Prevent menu from going off-screen to the right
  if (x + menuWidth > window.innerWidth) {
    x = window.innerWidth - menuWidth - 10;
  }
  
  // Prevent menu from going off-screen to the bottom
  if (y + menuHeight > window.innerHeight) {
    y = window.innerHeight - menuHeight - 10;
  }
  
  // Ensure menu doesn't go off-screen to the left or top
  x = Math.max(10, x);
  y = Math.max(10, y);
  
  menu.style.left = `${x}px`;
  menu.style.top = `${y}px`;
  
  // Create menu items
  const menuItems = [
    {
      label: '✏️ Quick Edit',
      action: () => showQuickEditOverlay(chain)
    },
    {
      label: '🔧 Edit in Manager',
      action: () => openChainManager(chain)
    },
    {
      label: '📋 Copy Chain Reference',
      action: () => copyChainReference(chain)
    },
    {
      label: '🔄 Duplicate Chain',
      action: () => duplicateChain(chain)
    },
    {
      label: chain.isStarterChain ? '⭐ Remove from Starters' : '🚀 Add to Starters',
      action: () => toggleStarterStatus(chain)
    }
  ];
  
  menuItems.forEach(item => {
    const menuItem = document.createElement('div');
    menuItem.textContent = item.label;
    menuItem.style.cssText = `
      padding: 8px 16px;
      cursor: pointer;
      transition: background 0.2s;
      font-size: 13px;
      color: var(--text);
    `;
    
    menuItem.addEventListener('mouseenter', () => {
      menuItem.style.background = 'var(--hover)';
    });
    
    menuItem.addEventListener('mouseleave', () => {
      menuItem.style.background = 'transparent';
    });
    
    menuItem.addEventListener('click', () => {
      item.action();
      menu.remove();
      // Clear context menu flag
      isInContextMenu = false;
      (window as any).isInContextMenu = false;
      logger.info('[overlay.ts] Context menu closed - overlay close protection disabled');
    });
    
    menu.appendChild(menuItem);
  });
  
  // Add to document
  document.body.appendChild(menu);
  
  // Remove menu when clicking elsewhere
  const removeMenu = (e: Event) => {
    if (!menu.contains(e.target as Node)) {
      menu.remove();
      document.removeEventListener('click', removeMenu);
      // Clear context menu flag
      isInContextMenu = false;
      (window as any).isInContextMenu = false;
      logger.info('[overlay.ts] Context menu closed - overlay close protection disabled');
    }
  };
  
  setTimeout(() => {
    document.addEventListener('click', removeMenu);
  }, 100);
}

function showQuickEditOverlay(chain: Chain) {
  logger.info(`[overlay.ts] Opening quick edit for chain: ${chain.name}`);
  
  // Set quick edit flag to prevent overlay from closing
  isInQuickEdit = true;
  (window as any).isInQuickEdit = true;
  logger.info('[overlay.ts] Quick edit opened - overlay close protection enabled');
  
  // Hide starter grid and show chain runner for editing
  if (starterGrid) starterGrid.style.display = 'none';
  if (chainRunner) {
    chainRunner.style.display = 'block';
    chainRunner.innerHTML = '';
    
    // Create quick edit interface
    const header = document.createElement('div');
    header.style.cssText = 'font-weight: bold; margin-bottom: 15px; color: var(--accent); font-size: 14px;';
    header.textContent = `Quick Edit: ${chain.name}`;
    chainRunner.appendChild(header);
    
    // Back button
    const backBtn = document.createElement('button');
    backBtn.textContent = '← Back to Starters';
    backBtn.style.cssText = 'background: var(--hover); color: var(--text); border: 1px solid var(--accent); padding: 6px 12px; border-radius: 4px; cursor: pointer; margin-bottom: 15px; font-size: 12px;';
    backBtn.addEventListener('click', showStarterChainsView);
    chainRunner.appendChild(backBtn);
    
    // Chain name input
    const nameLabel = document.createElement('label');
    nameLabel.textContent = 'Chain Name:';
    nameLabel.style.cssText = 'display: block; margin-bottom: 5px; font-size: 12px; color: var(--text);';
    chainRunner.appendChild(nameLabel);
    
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = chain.name;
    nameInput.style.cssText = 'width: 100%; padding: 8px; border: 1px solid var(--accent); border-radius: 4px; background: var(--bg); color: var(--text); margin-bottom: 15px;';
    chainRunner.appendChild(nameInput);
    
    // Description input
    const descLabel = document.createElement('label');
    descLabel.textContent = 'Description:';
    descLabel.style.cssText = 'display: block; margin-bottom: 5px; font-size: 12px; color: var(--text);';
    chainRunner.appendChild(descLabel);
    
    const descInput = document.createElement('textarea');
    descInput.value = chain.description || '';
    descInput.style.cssText = 'width: 100%; padding: 8px; border: 1px solid var(--accent); border-radius: 4px; background: var(--bg); color: var(--text); margin-bottom: 15px; min-height: 60px; resize: vertical;';
    chainRunner.appendChild(descInput);
    
    // Options section
    const optionsLabel = document.createElement('div');
    optionsLabel.textContent = 'Options:';
    optionsLabel.style.cssText = 'font-weight: bold; margin-bottom: 10px; font-size: 12px; color: var(--text);';
    chainRunner.appendChild(optionsLabel);
    
    // Options container
    const optionsContainer = document.createElement('div');
    optionsContainer.style.cssText = 'margin-bottom: 15px;';
    chainRunner.appendChild(optionsContainer);
    
    // Render existing options
    chain.options.forEach((option, index) => {
      createOptionEditor(optionsContainer, option, index);
    });
    
    // Add new option button
    const addOptionBtn = document.createElement('button');
    addOptionBtn.textContent = '+ Add Option';
    addOptionBtn.style.cssText = 'background: var(--hover); color: var(--text); border: 1px solid var(--accent); padding: 8px 12px; border-radius: 4px; cursor: pointer; margin-bottom: 15px; font-size: 12px;';
    addOptionBtn.addEventListener('click', () => {
      const newOption = { id: `new-${Date.now()}`, title: '', body: '' };
      createOptionEditor(optionsContainer, newOption, optionsContainer.children.length);
      // Re-append the add button at the end
      optionsContainer.appendChild(addOptionBtn);
    });
    optionsContainer.appendChild(addOptionBtn);
    
    // Save button
    const saveBtn = document.createElement('button');
    saveBtn.textContent = '💾 Save Changes';
    saveBtn.style.cssText = 'background: var(--accent); color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; margin-right: 10px; font-size: 13px;';
    saveBtn.addEventListener('click', () => {
      saveQuickEditChanges(chain, nameInput, descInput, optionsContainer);
    });
    chainRunner.appendChild(saveBtn);
    
    // Cancel button
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = '❌ Cancel';
    cancelBtn.style.cssText = 'background: var(--hover); color: var(--text); border: 1px solid var(--accent); padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 13px;';
    cancelBtn.addEventListener('click', showStarterChainsView);
    chainRunner.appendChild(cancelBtn);
  }
}

function openChainManager(chain: Chain) {
  logger.info(`[overlay.ts] Opening chain manager for chain: ${chain.name}`);
  // TODO: Implement IPC call to open chain manager with specific chain
  overlayApi.send('open-chain-manager', { chainId: chain.id });
  overlayApi.hideOverlay?.();
}

function copyChainReference(chain: Chain) {
  logger.info(`[overlay.ts] Copying chain reference for: ${chain.name}`);
  const reference = `[Chain:${chain.name}]`;
  overlayApi.insertSnippet(reference);
  showFlash();
}

function duplicateChain(chain: Chain) {
  logger.info(`[overlay.ts] Duplicating chain: ${chain.name}`);
  // TODO: Implement chain duplication
  showFlash();
}

function toggleStarterStatus(chain: Chain) {
  logger.info(`[overlay.ts] Toggling starter status for chain: ${chain.name}`);
  // TODO: Implement starter status toggle
  showFlash();
}

async function saveQuickEditChanges(
  chain: Chain, 
  nameInput: HTMLInputElement, 
  descInput: HTMLTextAreaElement, 
  optionsContainer: HTMLDivElement
) {
  logger.info(`[overlay.ts] Saving quick edit changes for chain: ${chain.name}`);
  
  try {
    // Collect updated data
    const updatedName = nameInput.value.trim();
    const updatedDescription = descInput.value.trim();
    
    // Collect updated options
    const optionDivs = optionsContainer.querySelectorAll('div[style*="border: 1px solid"]');
    const updatedOptions: any[] = [];
    
    optionDivs.forEach((optionDiv, index) => {
      const titleInput = optionDiv.querySelector('input') as HTMLInputElement;
      const bodyTextarea = optionDiv.querySelector('textarea') as HTMLTextAreaElement;
      
      if (titleInput && bodyTextarea) {
        const originalOption = chain.options[index];
        updatedOptions.push({
          id: originalOption?.id || `new-${Date.now()}-${index}`,
          title: titleInput.value.trim() || `Option ${index + 1}`,
          body: bodyTextarea.value.trim()
        });
      }
    });
    
    // Validate required fields
    if (!updatedName) {
      showErrorMessage('Chain name is required');
      return;
    }
    
    if (updatedOptions.length === 0) {
      showErrorMessage('At least one option is required');
      return;
    }
    
    // Show confirmation dialog
    const confirmed = await showConfirmDialog(
      `Save changes to "${updatedName}"?`,
      'This will permanently update the chain in the database.'
    );
    
    if (!confirmed) {
      logger.info('[overlay.ts] Quick edit save cancelled by user');
      return;
    }
    
    // Prepare update data
    const updateData = {
      name: updatedName,
      description: updatedDescription,
      options: updatedOptions
    };
    
    logger.info(`[overlay.ts] Updating chain ${chain.id} with data:`, updateData);
    
    // Call API to update chain
    const result = await overlayApi.invoke('update-chain', chain.id, updateData);
    
    if (result.success) {
      logger.info(`[overlay.ts] Chain ${chain.id} updated successfully`);
      showSuccessMessage('Chain saved successfully!');
      
      // Refresh data and return to starters view
      await loadData();
      showStarterChainsView();
    } else {
      logger.error(`[overlay.ts] Failed to update chain ${chain.id}:`, result.error);
      showErrorMessage(`Failed to save: ${result.error}`);
    }
    
  } catch (error) {
    logger.error('[overlay.ts] Error saving quick edit changes:', error);
    showErrorMessage('An error occurred while saving');
  }
}

function showConfirmDialog(title: string, message: string): Promise<boolean> {
  return new Promise(resolve => {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2147483647;
    `;
    
    // Create dialog
    const dialog = document.createElement('div');
    dialog.style.cssText = `
      background: var(--bg);
      border: 1px solid var(--accent);
      border-radius: 12px;
      padding: 24px;
      max-width: 400px;
      box-shadow: 0 12px 32px rgba(0,0,0,0.5);
    `;
    
    // Title
    const titleEl = document.createElement('h3');
    titleEl.textContent = title;
    titleEl.style.cssText = 'margin: 0 0 12px 0; color: var(--accent); font-size: 16px;';
    
    // Message
    const messageEl = document.createElement('p');
    messageEl.textContent = message;
    messageEl.style.cssText = 'margin: 0 0 20px 0; color: var(--text); font-size: 14px; line-height: 1.4;';
    
    // Buttons container
    const buttonsDiv = document.createElement('div');
    buttonsDiv.style.cssText = 'display: flex; gap: 12px; justify-content: flex-end;';
    
    // Cancel button
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.cssText = 'background: var(--hover); color: var(--text); border: 1px solid var(--accent); padding: 8px 16px; border-radius: 6px; cursor: pointer;';
    cancelBtn.addEventListener('click', () => {
      modal.remove();
      resolve(false);
    });
    
    // Confirm button
    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = 'Save';
    confirmBtn.style.cssText = 'background: var(--accent); color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;';
    confirmBtn.addEventListener('click', () => {
      modal.remove();
      resolve(true);
    });
    
    buttonsDiv.appendChild(cancelBtn);
    buttonsDiv.appendChild(confirmBtn);
    
    dialog.appendChild(titleEl);
    dialog.appendChild(messageEl);
    dialog.appendChild(buttonsDiv);
    modal.appendChild(dialog);
    
    document.body.appendChild(modal);
    
    // Auto-focus confirm button
    setTimeout(() => confirmBtn.focus(), 50);
  });
}


async function showChainSelector(textarea: HTMLTextAreaElement) {
  logger.info('[overlay.ts] Opening chain selector');
  
  try {
    // Get all available chains
    const allChains = await overlayApi.listChains();
    
    if (!allChains || allChains.length === 0) {
      showErrorMessage('No chains available to link');
      return;
    }
    
    // Create modal overlay
    const modal = document.createElement('div');
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 2147483648; display: flex; align-items: center; justify-content: center;';
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.style.cssText = 'background: var(--bg); border: 2px solid var(--accent); border-radius: 8px; padding: 20px; max-width: 400px; max-height: 500px; overflow-y: auto; box-shadow: 0 4px 20px rgba(0,0,0,0.5);';
    
    // Modal header
    const header = document.createElement('h3');
    header.textContent = 'Select Chain to Link';
    header.style.cssText = 'margin: 0 0 15px 0; color: var(--accent); font-size: 16px;';
    modalContent.appendChild(header);
    
    // Search input
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search chains...';
    searchInput.style.cssText = 'width: 100%; padding: 8px; border: 1px solid var(--accent); border-radius: 4px; background: var(--bg); color: var(--text); margin-bottom: 15px; font-size: 12px;';
    modalContent.appendChild(searchInput);
    
    // Chains list container
    const chainsList = document.createElement('div');
    chainsList.style.cssText = 'max-height: 300px; overflow-y: auto; margin-bottom: 15px;';
    modalContent.appendChild(chainsList);
    
    // Function to render chains
    const renderChains = (filter = '') => {
      chainsList.innerHTML = '';
      const filteredChains = allChains.filter(chain => 
        chain.name.toLowerCase().includes(filter.toLowerCase()) ||
        (chain.description && chain.description.toLowerCase().includes(filter.toLowerCase()))
      );
      
      if (filteredChains.length === 0) {
        const noResults = document.createElement('div');
        noResults.textContent = 'No chains found';
        noResults.style.cssText = 'color: var(--text); font-style: italic; text-align: center; padding: 20px;';
        chainsList.appendChild(noResults);
        return;
      }
      
      filteredChains.forEach(chain => {
        const chainItem = document.createElement('div');
        chainItem.style.cssText = 'border: 1px solid var(--hover); border-radius: 4px; padding: 10px; margin-bottom: 8px; cursor: pointer; background: rgba(255,255,255,0.05); transition: background 0.2s;';
        
        const chainName = document.createElement('div');
        chainName.textContent = chain.name;
        chainName.style.cssText = 'font-weight: bold; color: var(--text); margin-bottom: 4px;';
        
        const chainDesc = document.createElement('div');
        chainDesc.textContent = chain.description || 'No description';
        chainDesc.style.cssText = 'font-size: 11px; color: var(--text); opacity: 0.7;';
        
        const chainOptions = document.createElement('div');
        chainOptions.textContent = `${chain.options?.length || 0} option${(chain.options?.length || 0) !== 1 ? 's' : ''}`;
        chainOptions.style.cssText = 'font-size: 10px; color: var(--accent); margin-top: 4px;';
        
        chainItem.appendChild(chainName);
        chainItem.appendChild(chainDesc);
        chainItem.appendChild(chainOptions);
        
        // Hover effect
        chainItem.addEventListener('mouseenter', () => {
          chainItem.style.background = 'rgba(255,255,255,0.1)';
        });
        chainItem.addEventListener('mouseleave', () => {
          chainItem.style.background = 'rgba(255,255,255,0.05)';
        });
        
        // Click to select
        chainItem.addEventListener('click', () => {
          insertChainReference(textarea, chain.name);
          document.body.removeChild(modal);
        });
        
        chainsList.appendChild(chainItem);
      });
    };
    
    // Search functionality
    searchInput.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      renderChains(target.value);
    });
    
    // Initial render
    renderChains();
    
    // Cancel button
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.cssText = 'background: var(--hover); color: var(--text); border: 1px solid var(--accent); padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 12px;';
    cancelBtn.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    modalContent.appendChild(cancelBtn);
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Focus search input
    searchInput.focus();
    
    // Close on escape
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        document.body.removeChild(modal);
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
    
  } catch (error) {
    logger.error('[overlay.ts] Error showing chain selector:', error);
    showErrorMessage('Error loading chains');
  }
}

function insertChainReference(textarea: HTMLTextAreaElement, chainName: string) {
  logger.info(`[overlay.ts] Inserting chain reference: ${chainName}`);
  
  const cursorPos = textarea.selectionStart;
  const textBefore = textarea.value.substring(0, cursorPos);
  const textAfter = textarea.value.substring(textarea.selectionEnd);
  const chainReference = `[Chain:${chainName}]`;
  
  textarea.value = textBefore + chainReference + textAfter;
  
  // Set cursor position after the inserted reference
  const newCursorPos = cursorPos + chainReference.length;
  textarea.setSelectionRange(newCursorPos, newCursorPos);
  textarea.focus();
  
  // Trigger change event to update any listeners
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
  
  showSuccessMessage(`Linked to chain: ${chainName}`);
}

function createOptionEditor(container: HTMLDivElement, option: any, index: number) {
  const optionDiv = document.createElement('div');
  optionDiv.style.cssText = 'border: 1px solid var(--hover); border-radius: 4px; padding: 10px; margin-bottom: 10px; background: rgba(255,255,255,0.05); position: relative;';
  
  // Remove button
  const removeBtn = document.createElement('button');
  removeBtn.textContent = '×';
  removeBtn.style.cssText = 'position: absolute; top: 5px; right: 5px; background: #e74c3c; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; font-size: 12px; line-height: 1;';
  removeBtn.addEventListener('click', () => {
    optionDiv.remove();
  });
  
  // Option title input
  const optionTitle = document.createElement('input');
  optionTitle.type = 'text';
  optionTitle.value = option.title;
  optionTitle.placeholder = 'Option title...';
  optionTitle.style.cssText = 'width: calc(100% - 30px); padding: 6px; border: 1px solid var(--accent); border-radius: 4px; background: var(--bg); color: var(--text); margin-bottom: 8px; font-size: 12px;';
  
  // Option body textarea
  const optionBody = document.createElement('textarea');
  optionBody.value = option.body || '';
  optionBody.placeholder = 'Option content...';
  optionBody.style.cssText = 'width: calc(100% - 80px); padding: 6px; border: 1px solid var(--accent); border-radius: 4px; background: var(--bg); color: var(--text); min-height: 40px; resize: vertical; font-size: 12px; margin-bottom: 8px;';
  
  // Chain link button
  const chainLinkBtn = document.createElement('button');
  chainLinkBtn.textContent = '🔗 Link Chain';
  chainLinkBtn.style.cssText = 'width: 75px; height: 40px; background: var(--hover); color: var(--text); border: 1px solid var(--accent); border-radius: 4px; cursor: pointer; font-size: 10px; margin-left: 5px; vertical-align: top;';
  chainLinkBtn.addEventListener('click', () => {
    showChainSelector(optionBody);
  });
  
  // Container for textarea and button
  const bodyContainer = document.createElement('div');
  bodyContainer.style.cssText = 'display: flex; align-items: flex-start; gap: 5px;';
  bodyContainer.appendChild(optionBody);
  bodyContainer.appendChild(chainLinkBtn);
  
  // Chain link indicator (show if option contains chain references)
  const chainIndicator = document.createElement('div');
  const chainCount = (option.body || '').match(/\[Chain:[^\]]+\]/g)?.length || 0;
  if (chainCount > 0) {
    chainIndicator.textContent = `🔗 ${chainCount} chain link${chainCount > 1 ? 's' : ''}`;
    chainIndicator.style.cssText = 'font-size: 10px; color: var(--accent); margin-bottom: 5px; font-style: italic;';
  }
  
  optionDiv.appendChild(removeBtn);
  optionDiv.appendChild(optionTitle);
  if (chainCount > 0) {
    optionDiv.appendChild(chainIndicator);
  }
  optionDiv.appendChild(bodyContainer);
  
  // Insert before the add button if it exists, otherwise append
  const addButton = container.querySelector('button[style*="Add Option"]');
  if (addButton) {
    container.insertBefore(optionDiv, addButton);
      } else {
    container.appendChild(optionDiv);
  }
}

async function handleChainOptionSelect(chain: Chain, option: any) {
  logger.info(`[overlay.ts] Option selected: "${option.title}" from chain "${chain.name}"`);
  
  try {
    let contentToProcess = option.body || option.title || 'No content';
    
    // Check for placeholders that need processing
    if (contentToProcess.includes('[?:') || contentToProcess.includes('[Chain:')) {
      logger.info(`[overlay.ts] Content contains placeholders, processing: "${contentToProcess.substring(0, 100)}..."`);
      
      // Process [?:FieldName] placeholders
      contentToProcess = await processPlaceholders(contentToProcess);
      
      // TODO: Process [Chain:ChainName] references in future implementation
    }
    
    logger.info(`[overlay.ts] Final content to copy: "${contentToProcess}"`);
    
    // Copy to clipboard
    overlayApi.insertSnippet(contentToProcess);
    
    // Hide overlay after execution
    overlayApi.hideOverlay?.();
    
    } catch (error) {
      logger.error(`[overlay.ts] Error processing chain option:`, error);
      showErrorMessage('Error processing option!');
    }
}

async function processPlaceholders(content: string): Promise<string> {
  logger.info(`[overlay.ts] Processing placeholders in content: "${content.substring(0, 100)}..."`);
  
  let processedContent = content;
  
  // Process [Chain:ChainName] references first
  const chainRegex = /\[Chain:([^\]]+)\]/g;
  const chainMatches = [...content.matchAll(chainRegex)];
  
  for (const match of chainMatches) {
    const fullMatch = match[0]; // e.g., "[Chain:Signature]"
    const chainName = match[1] || 'UnknownChain'; // e.g., "Signature"
    
    logger.info(`[overlay.ts] Found chain reference: ${fullMatch} (chain: ${chainName})`);
    
    try {
      // Get the referenced chain
      const referencedChain = await overlayApi.getChainByName(chainName);
      
      if (referencedChain) {
        logger.info(`[overlay.ts] Found referenced chain: ${referencedChain.name}`);
        
        // Process the referenced chain
        let chainContent: string = chainName; // Default fallback
        
        if (referencedChain.options && referencedChain.options.length > 0) {
          if (referencedChain.options.length === 1) {
            // Single option - use directly
            const option = referencedChain.options[0];
            if (option) {
              chainContent = option.body || option.title || chainName;
              logger.info(`[overlay.ts] Using single option from chain "${chainName}"`);
            } else {
              chainContent = chainName;
            }
          } else {
            // Multiple options - show choice overlay
            logger.info(`[overlay.ts] Chain "${chainName}" has multiple options, showing choice overlay`);
            const choices = referencedChain.options.map(opt => ({
              label: opt.title,
              text: opt.body || opt.title
            }));
            
            chainContent = await presentChoice(
              `Select option from "${chainName}":`,
              choices
            );
            logger.info(`[overlay.ts] User selected option from chain "${chainName}"`);
          }
        } else {
          logger.warn(`[overlay.ts] Chain "${chainName}" has no options, using chain name`);
        }
        
        // Recursively process the chain content for nested placeholders
        if (chainContent.trim() !== '') {
          chainContent = await processPlaceholders(chainContent);
        }
        
        // Replace the chain reference with the processed content
        processedContent = processedContent.replace(fullMatch, chainContent);
        logger.info(`[overlay.ts] Replaced ${fullMatch} with processed chain content`);
        
      } else {
        logger.warn(`[overlay.ts] Chain "${chainName}" not found, leaving reference as-is`);
      }
    } catch (error) {
      logger.error(`[overlay.ts] Error processing chain reference ${fullMatch}:`, error);
    }
  }
  
  // Process [?:FieldName] placeholders after chain references
  const placeholderRegex = /\[?\?:([^\]]+)\]/g;
  const matches = [...processedContent.matchAll(placeholderRegex)];
  
  for (const match of matches) {
    const fullMatch = match[0]; // e.g., "[?:Customer]"
    const fieldName = match[1]; // e.g., "Customer"
    
    logger.info(`[overlay.ts] Found placeholder: ${fullMatch} (field: ${fieldName})`);
    
    // Prompt user for input
    const userInput = await presentInput(`Enter ${fieldName}:`);
    
    if (userInput) {
      processedContent = processedContent.replace(fullMatch, userInput);
      logger.info(`[overlay.ts] Replaced ${fullMatch} with "${userInput}"`);
    } else {
      logger.warn(`[overlay.ts] No input provided for ${fullMatch}, leaving as-is`);
    }
  }
  
  return processedContent;
}

function handleClipSelect(text: string) {
  overlayApi.insertSnippet(text);
  showFlash();
  overlayApi.hideOverlay?.();
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    // If input is pending, clear it and go back to starters
    if (isInputPending) {
      logger.info('[overlay.ts] Escape pressed during input - clearing input protection');
      isInputPending = false;
      (window as any).isInputPending = false;
      showStarterChainsView();
    }
    // If we're in chain options view, go back to starters
    else if (currentChain && chainRunner && chainRunner.style.display !== 'none') {
      showStarterChainsView();
    } else {
      // Otherwise hide the overlay
      overlayApi.hideOverlay?.();
    }
  }
});

function showFloatingGrids(position: string) {
  logger.info('[overlay.ts] showFloatingGrids called with position:', position);
  if (!container) {
    logger.error('[overlay.ts] Main overlay container not found!');
    return;
  }

  // Set up container styling
  container.style.transition = 'opacity 0.2s ease-in-out, transform 0.2s ease-in-out';
  container.style.position = 'relative';
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.maxHeight = '100vh';
  container.style.backgroundColor = 'transparent';
  container.style.border = 'none';
  container.style.padding = '0';
  container.style.borderRadius = '0';
  container.style.boxShadow = 'none';
  container.style.backdropFilter = 'none';
  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.justifyContent = 'center';
  container.style.zIndex = '1000';
  container.style.opacity = '1';
  container.style.overflow = 'hidden';

  // Position based on edge trigger (positioning is handled by main process, but we can adjust if needed)
  // The main process already positions the window, so we just need to show content
  
  // Show starter chains by default, hide other grids
  const allGrids = [snippetsGrid, chainsGrid, historyGrid];
  allGrids.forEach(grid => {
    if (grid) grid.style.display = 'none';
  });
  
  // Hide chain runner initially (will be shown when needed for options)
  if (chainRunner) chainRunner.style.display = 'none';
  
  if (starterGrid) {
    logger.info('[overlay.ts] Making starterGrid visible.');
    starterGrid.style.display = 'grid';
    } else {
    logger.warn('[overlay.ts] starterGrid element not found.');
  }

  logger.info('[overlay.ts] Overlay showing ONLY starter chains (no other content).');
}

function hideFloatingGrids() {
  const grids = container.querySelectorAll('.floating-grid');
  grids.forEach(grid => {
    grid.classList.remove('show');
  });
}

// Setup customization controls
function setupCustomizationControls() {
  const edgeToggle = document.getElementById('edge-toggle');
  const panel = document.getElementById('settings-panel');
  const closeBtn = document.getElementById('close-settings');
  const applyBtn = document.getElementById('apply-settings');
  const themeToggleBtn = document.getElementById('theme-toggle');
  
  // Layout mode
  const layoutModeSelect = document.getElementById('layout-mode-select') as HTMLSelectElement;
  const gridSettingsSection = document.getElementById('grid-settings');
  
  // Grid sliders
  const colsSlider = document.getElementById('grid-cols-slider') as HTMLInputElement;
  const rowsSlider = document.getElementById('grid-rows-slider') as HTMLInputElement;
  const widthSlider = document.getElementById('node-width-slider') as HTMLInputElement;
  const heightSlider = document.getElementById('node-height-slider') as HTMLInputElement;
  const styleSelect = document.getElementById('node-style-select') as HTMLSelectElement;
  
  // Value displays
  const colsValue = document.getElementById('cols-value');
  const rowsValue = document.getElementById('rows-value');
  const widthValue = document.getElementById('width-value');
  const heightValue = document.getElementById('height-value');
  
  if (!edgeToggle || !panel || !applyBtn) return;
  
  // Toggle panel visibility with edge toggle
  edgeToggle.addEventListener('click', () => {
    const isVisible = panel.style.display !== 'none';
    panel.style.display = isVisible ? 'none' : 'block';
  });
  
  // Close button
  closeBtn?.addEventListener('click', () => {
    panel.style.display = 'none';
  });
  
  // Theme toggle button
  themeToggleBtn?.addEventListener('click', async () => {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.classList.toggle('light', newTheme === 'light');
    currentTheme = newTheme;
    
    try {
      await overlayApi.invoke('save-settings', { overlay: { theme: newTheme } });
    } catch (error) {
      logger.error('[overlay.ts] Error saving theme:', error);
    }
  });
  
  // Update value displays
  colsSlider?.addEventListener('input', () => {
    if (colsValue) colsValue.textContent = colsSlider.value;
  });
  
  rowsSlider?.addEventListener('input', () => {
    if (rowsValue) rowsValue.textContent = rowsSlider.value;
  });
  
  widthSlider?.addEventListener('input', () => {
    if (widthValue) widthValue.textContent = widthSlider.value;
  });
  
  heightSlider?.addEventListener('input', () => {
    if (heightValue) heightValue.textContent = heightSlider.value;
  });
  
  // Layout mode change handler
  layoutModeSelect?.addEventListener('change', () => {
    const selectedMode = layoutModeSelect.value;
    if (gridSettingsSection) {
      // Hide grid settings for non-grid layouts
      gridSettingsSection.style.display = (selectedMode === 'grid' || selectedMode === 'compact') ? 'block' : 'none';
    }
  });
  
  // Apply settings
  applyBtn.addEventListener('click', async () => {
    const newSettings = {
      overlay: {
        layoutMode: layoutModeSelect.value,
        gridCols: parseInt(colsSlider.value),
        gridRows: parseInt(rowsSlider.value),
        nodeWidth: parseInt(widthSlider.value),
        nodeHeight: parseInt(heightSlider.value),
        nodeStyle: styleSelect.value as any
      }
    };
    
    // Apply immediately
    document.body.setAttribute('data-layout', layoutModeSelect.value);
    document.documentElement.style.setProperty('--grid-cols', colsSlider.value);
    document.documentElement.style.setProperty('--grid-rows', rowsSlider.value);
    document.documentElement.style.setProperty('--node-width', widthSlider.value + 'px');
    document.documentElement.style.setProperty('--node-height', heightSlider.value + 'px');
    document.body.setAttribute('data-node-style', styleSelect.value);
    
    // Save settings
    try {
      await overlayApi.invoke('save-settings', newSettings);
      showSuccessMessage('Settings saved!');
      panel.style.display = 'none';
    } catch (error) {
      logger.error('[overlay.ts] Error saving settings:', error);
      showErrorMessage('Failed to save settings');
    }
  });
}

initSettings();
loadData();
setupCustomizationControls();

// BEGINNING OF NEW/MODIFIED IPC HANDLING
if (overlayApi && typeof overlayApi.on === 'function' && typeof overlayApi.send === 'function') {
    logger.info('[overlay.ts] Setting up IPC listeners via overlayApi (formerly window.api)');

    // Listener for when main process tells overlay to HIDE its content
    overlayApi.on('overlay:hide', () => {
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
                overlayApi.send('overlay:hidden-ack'); 
            }, 150); // Adjust timeout to match any CSS animation/transition
        } else {
            logger.warn('[overlay.ts] Could not find #container to hide. Sending ack immediately.');
            // Still send ack even if container isn't found, so main isn't stuck
            logger.info('[overlay.ts] ✅ SENDING overlay:hidden-ack to main (container not found).');
            overlayApi.send('overlay:hidden-ack');
        }
    });

    // Listener for when main process tells overlay to SHOW its content
    // (This replaces the older window.events?.onOverlayShow)
    overlayApi.on('overlay:show', (data: any) => {
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

    // Listener for settings changes from main process
    overlayApi.on('settings:changed', (newSettings: any) => {
        logger.info('[overlay.ts] Received settings:changed from main:', newSettings);
        
        // Apply theme changes
        if (newSettings && newSettings.theme !== currentTheme) {
            if (newSettings.theme === 'light') {
                document.body.classList.add('light');
            } else {
                document.body.classList.remove('light');
            }
            currentTheme = newSettings.theme;
            logger.info(`[overlay.ts] Theme changed to: ${currentTheme}`);
        }
        
        // Apply overlay settings if they exist
        if (newSettings && newSettings.overlay) {
            const overlaySettings = newSettings.overlay;
            
            // Apply overlay theme (follows global theme)
            if (overlaySettings.theme === 'light') {
                document.body.classList.add('light');
            } else {
                document.body.classList.remove('light');
            }
            
            // Apply grid customization
            if (overlaySettings.gridCols !== undefined) {
                document.documentElement.style.setProperty('--grid-cols', String(overlaySettings.gridCols));
            }
            if (overlaySettings.gridRows !== undefined) {
                document.documentElement.style.setProperty('--grid-rows', String(overlaySettings.gridRows));
            }
            if (overlaySettings.nodeWidth !== undefined) {
                document.documentElement.style.setProperty('--node-width', overlaySettings.nodeWidth + 'px');
            }
            if (overlaySettings.nodeHeight !== undefined) {
                document.documentElement.style.setProperty('--node-height', overlaySettings.nodeHeight + 'px');
            }
            if (overlaySettings.nodeStyle !== undefined) {
                document.documentElement.style.setProperty('--node-style', overlaySettings.nodeStyle);
                document.body.setAttribute('data-node-style', overlaySettings.nodeStyle);
            }
            if (overlaySettings.animationSpeed !== undefined) {
                const speedValue = overlaySettings.animationSpeed === 'instant' ? '0s' : 
                    overlaySettings.animationSpeed === 'fast' ? '0.15s' : 
                    overlaySettings.animationSpeed === 'slow' ? '0.5s' : '0.3s';
                document.documentElement.style.setProperty('--animation-speed', speedValue);
            }
            
            // Apply opacity and blur if supported
            if (overlaySettings.opacity !== undefined) {
                document.documentElement.style.setProperty('--overlay-opacity', String(overlaySettings.opacity));
            }
            if (overlaySettings.blur !== undefined) {
                document.documentElement.style.setProperty('--overlay-blur', overlaySettings.blur + 'px');
            }
            
            // Apply preload content setting
            if (overlaySettings.preloadContent !== undefined && container) {
                if (overlaySettings.preloadContent) {
                    container.setAttribute('data-preload', 'true');
                } else {
                    container.removeAttribute('data-preload');
                }
            }
            
            logger.info('[overlay.ts] Applied overlay settings:', overlaySettings);
        }
    });

    // Listener for chain updates (real-time refresh)
    overlayApi.on('chains:updated', () => {
        logger.info('[overlay.ts] Received chains:updated from main. Refreshing data...');
        loadData(); // Refresh all data including starter chains
    });

    // Listener for snippet insertion feedback
    overlayApi.on('snippet-inserted', (result: { success: boolean; error?: string }) => {
        logger.info('[overlay.ts] Received snippet-inserted feedback:', result);
        if (result.success) {
            logger.info('[overlay.ts] ✅ Snippet successfully copied to clipboard!');
            showFlash(); // Show success flash
        } else {
            logger.error('[overlay.ts] ❌ Snippet insertion failed:', result.error);
            showErrorMessage('Copy failed!');
        }
    });

} else {
    logger.error('[overlay.ts] CRITICAL: overlayApi (window.api) or overlayApi.on/send is not defined. Check preload script and context isolation setup.');
}
// END OF NEW/MODIFIED IPC HANDLING

export {};
