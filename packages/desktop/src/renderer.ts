import { logger } from './logger';
// import { randomUUID } from 'crypto'; // Commented out for browser compatibility
import type {
  Snippet,
  Chain,
  ChainOption,
  Settings,
  ClipboardEntry,
} from './types'; // Added ChainOption

// Chain execution logic - inlined to avoid module imports in browser
interface ChoiceOption {
  label: string;
  text: string;
  chainName?: string;
  action?: 'text' | 'chain' | 'both';
}

interface ChainNode {
  type: 'text' | 'choice' | 'input' | 'chain-link' | 'conditional';
  content: string;
  options?: ChoiceOption[];
  chainName?: string;
  condition?: string;
}

type ChoiceProvider = (
  question: string,
  options: ChoiceOption[]
) => Promise<string>;
type InputProvider = (prompt: string) => Promise<string>;

interface ParsedPlaceholder {
  placeholder: string;
  name: string;
}

function parseChainPlaceholder(text: string): ParsedPlaceholder | null {
  const regex = /\[Chain:([^\]]+)\]/;
  const match = regex.exec(text);
  if (!match) return null;
  return { placeholder: match[0], name: match[1]! };
}

async function executeChain(
  chain: any,
  loadChain: (name: string) => Promise<any>,
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

async function processTextWithChain(
  text: string,
  loadChain: (name: string) => Promise<any>,
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

// Debug logging
console.log('Renderer script starting...');
console.log('window.api available:', !!window.api);
console.log(
  'window.api methods:',
  window.api ? Object.keys(window.api) : 'API not available'
);

// Test API immediately
if (window.api) {
  console.log('Testing API...');
  window.api
    .list()
    .then(snippets => {
      console.log('Initial snippets:', snippets);
    })
    .catch(error => {
      console.error('API test failed:', error);
    });
}

const form = document.getElementById('add-form') as HTMLFormElement;
const input = document.getElementById('content') as HTMLInputElement;
const list = document.getElementById('list') as HTMLUListElement;
const chainForm = document.getElementById('chain-form') as HTMLFormElement;
const chainNameInput = document.getElementById(
  'chain-name'
) as HTMLInputElement;
const chainNodesDiv = document.getElementById('chain-nodes') as HTMLDivElement;
const addTextBtn = document.getElementById(
  'add-text-node'
) as HTMLButtonElement;
const addChoiceBtn = document.getElementById(
  'add-choice-node'
) as HTMLButtonElement;
const addInputBtn = document.getElementById(
  'add-input-node'
) as HTMLButtonElement;
const addChainLinkBtn = document.getElementById(
  'add-chain-link-node'
) as HTMLButtonElement;
const addConditionalBtn = document.getElementById(
  'add-conditional-node'
) as HTMLButtonElement;
const toggleAdvancedBtn = document.getElementById(
  'toggle-advanced-chain-controls'
) as HTMLButtonElement;
const chainList = document.getElementById('chain-list') as HTMLUListElement;
const clipboardList = document.getElementById(
  'clipboard-list'
) as HTMLUListElement;
const errorDiv = document.getElementById('error-log') as HTMLDivElement;
const exportBtn = document.getElementById(
  'export-diagnostics'
) as HTMLButtonElement;
const openNewChainManagerBtn = document.getElementById(
  'open-new-chain-manager-btn'
) as HTMLButtonElement;

// Debug DOM elements
console.log('DOM Elements found:');
console.log('form:', !!form);
console.log('input:', !!input);
console.log('addTextBtn:', !!addTextBtn);
console.log('addChoiceBtn:', !!addChoiceBtn);
console.log('addInputBtn:', !!addInputBtn);
console.log('addChainLinkBtn:', !!addChainLinkBtn);
console.log('addConditionalBtn:', !!addConditionalBtn);
console.log('toggleAdvancedBtn:', !!toggleAdvancedBtn);
console.log('chainNodesDiv:', !!chainNodesDiv);
console.log('clipboardList:', !!clipboardList);

async function refresh() {
  const snippets = await window.api.list();
  list.innerHTML = '';
  const emptyState = document.getElementById('snippets-empty');

  if (snippets.length === 0) {
    emptyState!.style.display = 'block';
  } else {
    emptyState!.style.display = 'none';
    snippets.forEach(sn => {
      const li = document.createElement('li');

      const content = document.createElement('div');
      content.className = 'item-content snippet-content';
      content.textContent = sn.content;

      // Single click = copy to clipboard
      content.addEventListener('click', async e => {
        if (e.detail === 1) {
          // Single click
          setTimeout(async () => {
            if (e.detail === 1) {
              // Still single click after delay
              await navigator.clipboard.writeText(sn.content);
              showFlash('Copied to clipboard!');
            }
          }, 250);
        }
      });

      // Double click = paste to active application
      content.addEventListener('dblclick', async () => {
        await window.api.insertSnippet(sn.content);
        showFlash('Pasted to active application!');
      });

      const actions = document.createElement('div');

      const edit = document.createElement('button');
      edit.textContent = 'Edit';
      edit.className = 'secondary';
      edit.addEventListener('click', async e => {
        e.stopPropagation();
        console.log('Edit button clicked for snippet:', sn.id, sn.content);
        const newContent = await showPrompt('Edit snippet', sn.content);
        console.log('User entered:', newContent);
        if (newContent !== null) {
          try {
            console.log('Calling update API...');
            await window.api.update(sn.id, newContent);
            console.log('Update successful, refreshing...');
            refresh();
          } catch (error) {
            console.error('Edit failed:', error);
            await showAlert(`Edit failed: ${error}`);
          }
        }
      });

      const del = document.createElement('button');
      del.textContent = 'Delete';
      del.className = 'danger';
      del.addEventListener('click', async e => {
        e.stopPropagation();
        if (await showConfirm('Delete this snippet?')) {
          await window.api.remove(sn.id);
          refresh();
        }
      });

      actions.appendChild(edit);
      actions.appendChild(del);
      li.appendChild(content);
      li.appendChild(actions);
      list.appendChild(li);
    });
  }
}

function createTextNodeElement(): HTMLElement {
  const div = document.createElement('div');
  div.className = 'chain-node';
  div.dataset.type = 'text';
  const input = document.createElement('textarea');
  input.placeholder =
    'Type your text here... Use [Chain:Name] to link to other chains!';
  input.style.cssText =
    'width: 100%; height: 60px; padding: 8px; font-family: inherit; resize: vertical;';

  const removeBtn = document.createElement('button');
  removeBtn.textContent = '×';
  removeBtn.className = 'danger';
  removeBtn.style.float = 'right';
  removeBtn.addEventListener('click', () => div.remove());

  div.appendChild(removeBtn);
  div.appendChild(input);
  return div;
}

let isAdvancedMode = false;

function createSimpleChoiceNodeElement(): HTMLElement {
  const div = document.createElement('div');
  div.className = 'chain-node';
  div.dataset.type = 'choice';

  const removeBtn = document.createElement('button');
  removeBtn.textContent = '×';
  removeBtn.className = 'danger';
  removeBtn.style.float = 'right';
  removeBtn.addEventListener('click', () => div.remove());

  const q = document.createElement('input');
  q.placeholder = 'What question do you want to ask?';
  q.type = 'text';

  const opts = document.createElement('div');
  opts.className = 'options';

  const add = document.createElement('button');
  add.textContent = '+ Add Choice';
  add.type = 'button';
  add.className = 'secondary';
  add.addEventListener('click', () => {
    const opt = document.createElement('div');
    opt.className = 'option';
    opt.style.cssText =
      'display: flex; gap: 10px; margin-bottom: 5px; align-items: center;';

    const label = document.createElement('input');
    label.placeholder = 'Choice (e.g., "Yes")';
    label.type = 'text';
    label.style.cssText = 'flex: 1;';

    const text = document.createElement('input');
    text.placeholder = 'What to output (e.g., "Great! Continuing...")';
    text.type = 'text';
    text.style.cssText = 'flex: 2;';

    const removeOpt = document.createElement('button');
    removeOpt.textContent = '×';
    removeOpt.className = 'danger';
    removeOpt.addEventListener('click', () => opt.remove());

    opt.appendChild(label);
    opt.appendChild(text);
    opt.appendChild(removeOpt);
    opts.appendChild(opt);
  });

  div.appendChild(removeBtn);
  div.appendChild(q);
  div.appendChild(opts);
  div.appendChild(add);
  return div;
}

function createChoiceNodeElement(): HTMLElement {
  const div = document.createElement('div');
  div.className = 'chain-node';
  div.dataset.type = 'choice';

  const removeBtn = document.createElement('button');
  removeBtn.textContent = '×';
  removeBtn.className = 'danger';
  removeBtn.style.float = 'right';
  removeBtn.addEventListener('click', () => div.remove());

  const q = document.createElement('input');
  q.placeholder = 'Question';
  q.type = 'text';

  const opts = document.createElement('div');
  opts.className = 'options';

  const add = document.createElement('button');
  add.textContent = 'Add Option';
  add.type = 'button';
  add.className = 'secondary';
  add.addEventListener('click', () => {
    const opt = document.createElement('div');
    opt.className = 'option';

    const label = document.createElement('input');
    label.placeholder = 'Choice Label';
    label.type = 'text';
    label.style.cssText = 'flex: 1; margin-right: 5px;';

    const actionSelect = document.createElement('select');
    actionSelect.style.cssText =
      'margin-right: 5px; background: #3a3a3a; color: #e0e0e0; border: 1px solid #555;';
    actionSelect.innerHTML = `
      <option value="text">Output Text</option>
      <option value="chain">Run Chain</option>
      <option value="both">Text + Chain</option>
    `;

    const text = document.createElement('input');
    text.placeholder = 'Text Output';
    text.type = 'text';
    text.style.cssText = 'flex: 1; margin-right: 5px;';

    const chainSelect = document.createElement('select');
    chainSelect.style.cssText =
      'margin-right: 5px; background: #3a3a3a; color: #e0e0e0; border: 1px solid #555; display: none;';
    chainSelect.innerHTML = '<option value="">Select Chain...</option>';

    // Load available chains
    window.api.listChains().then(chains => {
      chains.forEach((chain: any) => {
        const option = document.createElement('option');
        option.value = chain.name;
        option.textContent = chain.name;
        chainSelect.appendChild(option);
      });
    });

    const removeOpt = document.createElement('button');
    removeOpt.textContent = '×';
    removeOpt.className = 'danger';
    removeOpt.addEventListener('click', () => opt.remove());

    actionSelect.addEventListener('change', () => {
      const value = actionSelect.value;
      text.style.display =
        value === 'text' || value === 'both' ? 'block' : 'none';
      chainSelect.style.display =
        value === 'chain' || value === 'both' ? 'block' : 'none';
    });

    opt.appendChild(label);
    opt.appendChild(actionSelect);
    opt.appendChild(text);
    opt.appendChild(chainSelect);
    opt.appendChild(removeOpt);
    opts.appendChild(opt);
  });

  div.appendChild(removeBtn);
  div.appendChild(q);
  div.appendChild(opts);
  div.appendChild(add);
  return div;
}

function createInputNodeElement(): HTMLElement {
  const div = document.createElement('div');
  div.className = 'chain-node';
  div.dataset.type = 'input';

  const removeBtn = document.createElement('button');
  removeBtn.textContent = '×';
  removeBtn.className = 'danger';
  removeBtn.style.float = 'right';
  removeBtn.addEventListener('click', () => div.remove());

  const input = document.createElement('input');
  input.placeholder =
    'What do you want to ask the user? (e.g., "What\'s your name?")';
  input.type = 'text';

  div.appendChild(removeBtn);
  div.appendChild(input);
  return div;
}

function createChainLinkNodeElement(): HTMLElement {
  const div = document.createElement('div');
  div.className = 'chain-node';
  div.dataset.type = 'chain-link';

  const removeBtn = document.createElement('button');
  removeBtn.textContent = '×';
  removeBtn.className = 'danger';
  removeBtn.style.float = 'right';
  removeBtn.addEventListener('click', () => div.remove());

  const label = document.createElement('div');
  label.textContent = 'Execute Chain:';
  label.style.cssText = 'margin-bottom: 10px; font-weight: bold;';

  const chainSelect = document.createElement('select');
  chainSelect.style.cssText =
    'width: 100%; padding: 8px; background: #3a3a3a; color: #e0e0e0; border: 1px solid #555; border-radius: 4px;';
  chainSelect.innerHTML =
    '<option value="">Select Chain to Execute...</option>';

  // Load available chains
  window.api.listChains().then(chains => {
    chains.forEach((chain: any) => {
      const option = document.createElement('option');
      option.value = chain.name;
      option.textContent = `🔗 ${chain.name}`;
      chainSelect.appendChild(option);
    });
  });

  div.appendChild(removeBtn);
  div.appendChild(label);
  div.appendChild(chainSelect);
  return div;
}

function createConditionalNodeElement(): HTMLElement {
  const div = document.createElement('div');
  div.className = 'chain-node';
  div.dataset.type = 'conditional';

  const removeBtn = document.createElement('button');
  removeBtn.textContent = '×';
  removeBtn.className = 'danger';
  removeBtn.style.float = 'right';
  removeBtn.addEventListener('click', () => div.remove());

  const label = document.createElement('div');
  label.textContent = 'Conditional Logic:';
  label.style.cssText = 'margin-bottom: 10px; font-weight: bold;';

  const condition = document.createElement('input');
  condition.placeholder = 'Condition (e.g., {PreviousChoice} == "Yes")';
  condition.type = 'text';
  condition.style.cssText = 'width: 100%; margin-bottom: 10px;';

  const trueChain = document.createElement('select');
  trueChain.style.cssText =
    'width: 48%; margin-right: 4%; background: #3a3a3a; color: #e0e0e0; border: 1px solid #555;';
  trueChain.innerHTML = '<option value="">If True: Run Chain...</option>';

  const falseChain = document.createElement('select');
  falseChain.style.cssText =
    'width: 48%; background: #3a3a3a; color: #e0e0e0; border: 1px solid #555;';
  falseChain.innerHTML = '<option value="">If False: Run Chain...</option>';

  // Load available chains for both selects
  window.api.listChains().then(chains => {
    chains.forEach((chain: any) => {
      const trueOption = document.createElement('option');
      trueOption.value = chain.name;
      trueOption.textContent = `✅ ${chain.name}`;
      trueChain.appendChild(trueOption);

      const falseOption = document.createElement('option');
      falseOption.value = chain.name;
      falseOption.textContent = `❌ ${chain.name}`;
      falseChain.appendChild(falseOption);
    });
  });

  div.appendChild(removeBtn);
  div.appendChild(label);
  div.appendChild(condition);
  div.appendChild(trueChain);
  div.appendChild(falseChain);
  return div;
}

function showFlash(message: string) {
  const flash = document.createElement('div');
  flash.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4a90e2;
    color: white;
    padding: 10px 20px;
    border-radius: 4px;
    z-index: 1000;
    opacity: 0;
    transition: opacity 0.3s;
  `;
  flash.textContent = message;
  document.body.appendChild(flash);

  setTimeout(() => (flash.style.opacity = '1'), 10);
  setTimeout(() => {
    flash.style.opacity = '0';
    setTimeout(() => document.body.removeChild(flash), 300);
  }, 2000);
}

function showPrompt(
  title: string,
  defaultValue: string = ''
): Promise<string | null> {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    `;

    const dialog = document.createElement('div');
    dialog.style.cssText = `
      background: #2d2d2d;
      border: 1px solid #555;
      border-radius: 8px;
      padding: 20px;
      min-width: 500px;
      max-width: 800px;
      color: #e0e0e0;
    `;

    const titleEl = document.createElement('h3');
    titleEl.textContent = title;
    titleEl.style.cssText = 'margin: 0 0 15px; color: #4a90e2;';

    const input = document.createElement('textarea');
    input.value = defaultValue;
    input.style.cssText = `
      width: 100%;
      height: 120px;
      padding: 10px;
      border: 1px solid #555;
      border-radius: 4px;
      background: #3a3a3a;
      color: #e0e0e0;
      font-size: 14px;
      font-family: 'Courier New', monospace;
      margin-bottom: 15px;
      resize: vertical;
      line-height: 1.4;
    `;

    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText =
      'display: flex; gap: 10px; justify-content: flex-end;';

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.className = 'secondary';
    cancelBtn.onclick = () => {
      document.body.removeChild(overlay);
      resolve(null);
    };

    const okBtn = document.createElement('button');
    okBtn.textContent = 'OK';
    okBtn.onclick = () => {
      document.body.removeChild(overlay);
      resolve(input.value);
    };

    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && e.ctrlKey) {
        document.body.removeChild(overlay);
        resolve(input.value);
      } else if (e.key === 'Escape') {
        document.body.removeChild(overlay);
        resolve(null);
      }
    });

    buttonContainer.appendChild(cancelBtn);
    buttonContainer.appendChild(okBtn);
    dialog.appendChild(titleEl);
    dialog.appendChild(input);
    dialog.appendChild(buttonContainer);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    input.focus();
    input.select();
  });
}

function showConfirm(message: string): Promise<boolean> {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    `;

    const dialog = document.createElement('div');
    dialog.style.cssText = `
      background: #2d2d2d;
      border: 1px solid #555;
      border-radius: 8px;
      padding: 20px;
      min-width: 400px;
      color: #e0e0e0;
    `;

    const messageEl = document.createElement('p');
    messageEl.textContent = message;
    messageEl.style.cssText = 'margin: 0 0 15px; color: #e0e0e0;';

    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText =
      'display: flex; gap: 10px; justify-content: flex-end;';

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.className = 'secondary';
    cancelBtn.onclick = () => {
      document.body.removeChild(overlay);
      resolve(false);
    };

    const okBtn = document.createElement('button');
    okBtn.textContent = 'Delete';
    okBtn.className = 'danger';
    okBtn.onclick = () => {
      document.body.removeChild(overlay);
      resolve(true);
    };

    buttonContainer.appendChild(cancelBtn);
    buttonContainer.appendChild(okBtn);
    dialog.appendChild(messageEl);
    dialog.appendChild(buttonContainer);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    cancelBtn.focus();
  });
}

function showAlert(message: string): Promise<void> {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    `;

    const dialog = document.createElement('div');
    dialog.style.cssText = `
      background: #2d2d2d;
      border: 1px solid #555;
      border-radius: 8px;
      padding: 20px;
      min-width: 400px;
      color: #e0e0e0;
    `;

    const messageEl = document.createElement('p');
    messageEl.textContent = message;
    messageEl.style.cssText =
      'margin: 0 0 15px; color: #e0e0e0; white-space: pre-wrap;';

    const okBtn = document.createElement('button');
    okBtn.textContent = 'OK';
    okBtn.style.cssText = 'display: block; margin: 0 auto;';
    okBtn.onclick = () => {
      document.body.removeChild(overlay);
      resolve();
    };

    dialog.appendChild(messageEl);
    dialog.appendChild(okBtn);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    okBtn.focus();
  });
}

async function refreshClipboard() {
  const clips = await window.api.getClipboardHistory();
  clipboardList.innerHTML = '';
  const emptyState = document.getElementById('clipboard-empty');

  if (clips.length === 0) {
    emptyState!.style.display = 'block';
  } else {
    emptyState!.style.display = 'none';
    clips.forEach(clip => {
      const li = document.createElement('li');

      const content = document.createElement('div');
      content.className = 'item-content';
      content.textContent = clip.content;
      content.addEventListener('click', async () => {
        await navigator.clipboard.writeText(clip.content);
        showFlash('Copied to clipboard!');
      });
      content.addEventListener('dblclick', async () => {
        await window.api.insertSnippet(clip.content);
        showFlash('Pasted to active application!');
      });

      const actions = document.createElement('div');

      const pin = document.createElement('button');
      pin.textContent = clip.pinned ? 'Unpin' : 'Pin';
      pin.className = clip.pinned ? 'secondary' : '';
      pin.addEventListener('click', async e => {
        e.stopPropagation();
        await window.api.pinClipboardItem(clip.id, !clip.pinned);
        refreshClipboard();
      });

      const addSnippet = document.createElement('button');
      addSnippet.textContent = 'Add as Snippet';
      addSnippet.className = 'secondary';
      addSnippet.addEventListener('click', async e => {
        e.stopPropagation();
        try {
          await window.api.create(clip.content);
          showFlash('Added to snippets! ✂️');
          refresh(); // Refresh snippets list
        } catch (error) {
          console.error('Failed to create snippet:', error);
          await showAlert(
            'Failed to create snippet. Check console for details.'
          );
        }
      });

      const timestamp = document.createElement('span');
      timestamp.style.cssText =
        'color: #888; font-size: 11px; margin-left: 10px;';
      timestamp.textContent = new Date(clip.timestamp).toLocaleString();

      actions.appendChild(pin);
      actions.appendChild(addSnippet);
      actions.appendChild(timestamp);
      li.appendChild(content);
      li.appendChild(actions);
      clipboardList.appendChild(li);
    });
  }
}

async function refreshChains() {
  const chains = await window.api.listChains();
  chainList.innerHTML = '';
  const emptyState = document.getElementById('chains-empty');

  if (chains.length === 0) {
    emptyState!.style.display = 'block';
  } else {
    emptyState!.style.display = 'none';
    chains.forEach((ch: any) => {
      const li = document.createElement('li');

      const content = document.createElement('div');
      content.className = 'item-content';
      content.textContent = ch.name;

      const actions = document.createElement('div');
      const run = document.createElement('button');
      run.textContent = 'Run';
      run.addEventListener('click', async () => {
        const chain = await window.api.getChainByName(ch.name);
        if (!chain) return;
        try {
          const output = await executeChain(
            chain,
            name => window.api.getChainByName(name),
            async (q, opts) => {
              const ans = await showPrompt(
                `${q}`,
                opts.map(o => o.label).join('/')
              );
              const found = opts.find(o => o.label === ans);
              return found ? found.text : '';
            },
            async promptText => {
              return (await showPrompt(promptText, '')) || '';
            }
          );
          await showAlert(`Chain Output:\n${output}`);
        } catch (error) {
          await showAlert(`Chain Error: ${error}`);
        }
      });

      const del = document.createElement('button');
      del.textContent = 'Delete';
      del.className = 'danger';
      del.addEventListener('click', async () => {
        if (await showConfirm(`Delete chain "${ch.name}"?`)) {
          await window.api.deleteChain(ch.id);
          refreshChains();
        }
      });

      actions.appendChild(run);
      actions.appendChild(del);
      li.appendChild(content);
      li.appendChild(actions);
      chainList.appendChild(li);
    });
  }
}

form.addEventListener('submit', async e => {
  console.log('Form submit event fired!');
  e.preventDefault();
  if (input.value) {
    console.log('Creating snippet:', input.value);
    try {
      await window.api.create(input.value);
      console.log('Snippet created successfully');
      input.value = '';
      refresh();
    } catch (error) {
      console.error('Failed to create snippet:', error);
    }
  } else {
    console.log('No input value');
  }
});

addTextBtn.addEventListener('click', () => {
  console.log('Add Text Node button clicked!');
  const node = createTextNodeElement();
  console.log('Created text node:', node);
  chainNodesDiv.appendChild(node);
  console.log('Text node added to chainNodesDiv');
});

addChoiceBtn.addEventListener('click', () => {
  console.log('Add Choice Node button clicked!');
  const node = isAdvancedMode
    ? createChoiceNodeElement()
    : createSimpleChoiceNodeElement();
  console.log('Created choice node:', node);
  chainNodesDiv.appendChild(node);
  console.log('Choice node added to chainNodesDiv');
});

addInputBtn.addEventListener('click', () => {
  console.log('Add Input Node button clicked!');
  const node = createInputNodeElement();
  console.log('Created input node:', node);
  chainNodesDiv.appendChild(node);
  console.log('Input node added to chainNodesDiv');
});

addChainLinkBtn.addEventListener('click', () => {
  console.log('Add Chain Link button clicked!');
  const node = createChainLinkNodeElement();
  console.log('Created chain link node:', node);
  chainNodesDiv.appendChild(node);
  console.log('Chain link node added to chainNodesDiv');
});

addConditionalBtn.addEventListener('click', () => {
  console.log('Add Conditional button clicked!');
  const node = createConditionalNodeElement();
  console.log('Created conditional node:', node);
  chainNodesDiv.appendChild(node);
  console.log('Conditional node added to chainNodesDiv');
});

toggleAdvancedBtn.addEventListener('click', () => {
  isAdvancedMode = !isAdvancedMode;
  const advancedControls = document.querySelector(
    '.advanced-controls'
  ) as HTMLElement;

  if (isAdvancedMode) {
    advancedControls.style.display = 'block';
    toggleAdvancedBtn.textContent = '🔧 Simple Mode';
    toggleAdvancedBtn.style.backgroundColor = '#e74c3c';
    showFlash('Advanced Mode: ON - Power user features unlocked! 🚀');
  } else {
    advancedControls.style.display = 'none';
    toggleAdvancedBtn.textContent = '🔧 Advanced Mode';
    toggleAdvancedBtn.style.backgroundColor = '#666';
    showFlash('Simple Mode: ON - Clean and easy interface! ✨');
  }
});

openNewChainManagerBtn?.addEventListener('click', () => {
  if (window.api && typeof window.api.openChainManager === 'function') {
    window.api.openChainManager();
  } else {
    console.error(
      'window.api.openChainManager is not available. Check preload.ts and main.ts IPC setup.'
    );
    showAlert(
      'Error: Could not open Chain Manager. Functionality not available.'
    );
  }
});

chainForm.addEventListener('submit', async e => {
  e.preventDefault();
  const nodes: any[] = [];
  chainNodesDiv.querySelectorAll<HTMLElement>('div[data-type]').forEach(el => {
    const type = el.dataset.type;
    if (type === 'text') {
      const input = el.querySelector('input') as HTMLInputElement;
      nodes.push({ type: 'text', content: input.value });
    } else if (type === 'choice') {
      const question = el.querySelector('input') as HTMLInputElement;
      const optsEls = el.querySelectorAll('.option');
      const opts: any[] = [];
      optsEls.forEach(op => {
        const [label, text] = op.querySelectorAll('input');
        opts.push({
          label: (label as HTMLInputElement).value,
          text: (text as HTMLInputElement).value,
        });
      });
      nodes.push({ type: 'choice', content: question.value, options: opts });
    } else if (type === 'input') {
      const inputEl = el.querySelector('input') as HTMLInputElement;
      nodes.push({ type: 'input', content: inputEl.value });
    }
  });
  if (chainNameInput.value) {
    await window.api.createChain(chainNameInput.value, nodes);
    chainNameInput.value = '';
    chainNodesDiv.innerHTML = '';
    refreshChains();
  }
});

refreshChains().catch(error => {
  console.error('Failed to load chains:', error);
  showAlert('Failed to load chains. Check console for details.');
});

refresh().catch(error => {
  console.error('Failed to load snippets:', error);
  showAlert('Failed to load snippets. Check console for details.');
});

refreshClipboard().catch(error => {
  console.error('Failed to load clipboard history:', error);
  showAlert('Failed to load clipboard history. Check console for details.');
});

async function loadErrorLog() {
  logger.info('Loading error log...');
  if (!errorDiv) return;
  try {
    const log = await window.api.getErrorLog();
    errorDiv.textContent = Array.isArray(log)
      ? log.join('\n')
      : log || 'No errors logged.';
    if (log && log.length > 0) {
      errorDiv.scrollTop = errorDiv.scrollHeight;
    }
  } catch (e: unknown) {
    let message = 'Unknown error while loading error log.';
    if (e instanceof Error) {
      message = e.message;
    }
    logger.error('Failed to load error log:', message);
    errorDiv.textContent = 'Failed to load error log: ' + message;
  }
}

loadErrorLog();

exportBtn?.addEventListener('click', async () => {
  try {
    const path = await window.api.exportDiagnostics();
    await showAlert(`Diagnostics exported to ${path}`);
  } catch (error) {
    console.error('Failed to export diagnostics:', error);
    showAlert('Failed to export diagnostics. Check console for details.');
  }
});

// Settings functionality
const edgePositionSelect = document.getElementById(
  'edge-position'
) as HTMLSelectElement;
const triggerSizeSlider = document.getElementById(
  'trigger-size'
) as HTMLInputElement;
const triggerSizeValue = document.getElementById(
  'trigger-size-value'
) as HTMLSpanElement;
const hoverDelaySlider = document.getElementById(
  'hover-delay'
) as HTMLInputElement;
const hoverDelayValue = document.getElementById(
  'hover-delay-value'
) as HTMLSpanElement;
const edgeHoverEnabled = document.getElementById(
  'edge-hover-enabled'
) as HTMLInputElement;
const saveSettingsBtn = document.getElementById(
  'save-settings'
) as HTMLButtonElement;
const testOverlayBtn = document.getElementById(
  'test-overlay'
) as HTMLButtonElement;
const toggleThemeBtn = document.getElementById(
  'toggle-theme'
) as HTMLButtonElement;

async function loadSettings() {
  console.log('Loading settings...');
  try {
    const settings = await window.api.getSettings();

    if (edgePositionSelect) {
      edgePositionSelect.value = settings.edgeHover.position;
    }

    if (triggerSizeSlider && triggerSizeValue) {
      triggerSizeSlider.value = settings.edgeHover.triggerSize.toString();
      triggerSizeValue.textContent = `${settings.edgeHover.triggerSize}px`;
    }

    if (hoverDelaySlider && hoverDelayValue) {
      hoverDelaySlider.value = settings.edgeHover.delay.toString();
      hoverDelayValue.textContent = `${settings.edgeHover.delay}ms`;
    }

    if (edgeHoverEnabled) {
      edgeHoverEnabled.checked = settings.edgeHover.enabled;
    }

    // Apply theme
    if (settings.theme === 'light') {
      document.body.classList.add('light');
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
}

// Update slider value displays
triggerSizeSlider?.addEventListener('input', () => {
  if (triggerSizeValue) {
    triggerSizeValue.textContent = `${triggerSizeSlider.value}px`;
  }
});

hoverDelaySlider?.addEventListener('input', () => {
  if (hoverDelayValue) {
    hoverDelayValue.textContent = `${hoverDelaySlider.value}ms`;
  }
});

// Save settings
saveSettingsBtn?.addEventListener('click', async () => {
  try {
    const settings = {
      edgeHover: {
        enabled: edgeHoverEnabled?.checked || false,
        position: edgePositionSelect?.value || 'right-center',
        triggerSize: parseInt(triggerSizeSlider?.value || '50'),
        delay: parseInt(hoverDelaySlider?.value || '200'),
      },
    };

    await window.api.saveSettings(settings);
    showFlash('Settings saved! 💾');
  } catch (error) {
    console.error('Failed to save settings:', error);
    await showAlert('Failed to save settings. Check console for details.');
  }
});

// Test overlay
testOverlayBtn?.addEventListener('click', () => {
  showFlash('Move your mouse to the configured edge position to test! 🧪');
});

// Toggle theme
toggleThemeBtn?.addEventListener('click', async () => {
  try {
    const currentSettings = await window.api.getSettings();
    const newTheme = currentSettings.theme === 'light' ? 'dark' : 'light';

    await window.api.saveSettings({ theme: newTheme });
    document.body.classList.toggle('light', newTheme === 'light');

    showFlash(`Switched to ${newTheme} theme! 🎨`);
  } catch (error) {
    console.error('Failed to toggle theme:', error);
  }
});

// Handle settings navigation from tray
window.api.on('navigate-to-settings', () => {
  // Find settings section and scroll to it
  const settingsHeaders = Array.from(document.querySelectorAll('h1')).find(h =>
    h.textContent?.includes('Settings')
  );
  if (settingsHeaders) {
    settingsHeaders.scrollIntoView({ behavior: 'smooth', block: 'start' });
    showFlash('📍 Settings section opened!');
  }
});

// Add sample snippets for testing if none exist
async function addSampleContent() {
  try {
    // Check if data already exists to prevent duplication
    const existingSnippets = await window.api.list();
    const existingChains = await window.api.listChains();

    if (existingSnippets.length === 0 && existingChains.length === 0) {
      await window.api.create('Hello from SnipFlow! This is a sample snippet.');
      await window.api.create(
        'Another snippet: use {{input}} for placeholders.'
      );

      await window.api.createChain(
        'Sample Chain',
        [
          {
            id: window.crypto.randomUUID(),
            title: 'Welcome',
            body: 'Hello from SnipFlow! This is the first option.',
          },
          {
            id: window.crypto.randomUUID(),
            title: 'User Input',
            body: 'Your name is [?:What is your name?].',
          },
          {
            id: window.crypto.randomUUID(),
            title: 'Next Step',
            body: 'Consider creating another chain called [Chain:FollowUp].',
          },
        ],
        'A simple chain to demonstrate functionality.'
      );

      await window.api.createChain(
        'FollowUp',
        [
          {
            id: window.crypto.randomUUID(),
            title: 'Follow Up Greeting',
            body: 'Nice to meet you after the first chain!',
          },
        ],
        'A follow-up chain.'
      );

      logger.info('[renderer.ts] Added sample content.');
      refresh();
      refreshChains();
    } else {
      logger.info(
        '[renderer.ts] Sample content already exists or some data present, not adding samples.'
      );
    }
  } catch (error) {
    logger.error('[renderer.ts] Failed to add sample content:', error);
    showAlert('Could not add sample content. Check console for details.');
  }
}

// Load settings on startup
loadSettings();

// Add sample content if needed
addSampleContent();

// JavaScript successfully loaded - debug elements removed

// No exports needed in browser environment
