import type { SnippetApi } from './types';
import { executeChain } from './services/chainService';

declare global {
  interface Window {
    api: SnippetApi;
    tray?: { toggleOverlay(): Promise<void> };
  }
}

// Debug logging
console.log('Renderer script starting...');
console.log('window.api available:', !!window.api);

const form = document.getElementById('add-form') as HTMLFormElement;
const input = document.getElementById('content') as HTMLInputElement;
const list = document.getElementById('list') as HTMLUListElement;
const chainForm = document.getElementById('chain-form') as HTMLFormElement;
const chainNameInput = document.getElementById(
  'chain-name'
) as HTMLInputElement;
const chainNodesDiv = document.getElementById('chain-nodes') as HTMLDivElement;
const addTextBtn = document.getElementById('add-text') as HTMLButtonElement;
const addChoiceBtn = document.getElementById('add-choice') as HTMLButtonElement;
const addInputBtn = document.getElementById('add-input') as HTMLButtonElement;
const chainList = document.getElementById('chain-list') as HTMLUListElement;
const errorDiv = document.getElementById('error-log') as HTMLDivElement;
const exportBtn = document.getElementById(
  'export-diagnostics'
) as HTMLButtonElement;

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
      content.className = 'item-content';
      content.textContent = sn.content;
      content.addEventListener('click', async () => {
        const newContent = prompt('Edit snippet', sn.content);
        if (newContent !== null) {
          await window.api.update(sn.id, newContent);
          refresh();
        }
      });
      
      const actions = document.createElement('div');
      const del = document.createElement('button');
      del.textContent = 'Delete';
      del.className = 'danger';
      del.addEventListener('click', async e => {
        e.stopPropagation();
        if (confirm('Delete this snippet?')) {
          await window.api.remove(sn.id);
          refresh();
        }
      });
      
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
  const input = document.createElement('input');
  input.placeholder = 'Text content';
  input.type = 'text';
  
  const removeBtn = document.createElement('button');
  removeBtn.textContent = '×';
  removeBtn.className = 'danger';
  removeBtn.style.float = 'right';
  removeBtn.addEventListener('click', () => div.remove());
  
  div.appendChild(removeBtn);
  div.appendChild(input);
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
    label.placeholder = 'Label';
    label.type = 'text';
    const text = document.createElement('input');
    text.placeholder = 'Text';
    text.type = 'text';
    
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
  input.placeholder = 'Prompt text';
  input.type = 'text';
  
  div.appendChild(removeBtn);
  div.appendChild(input);
  return div;
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
              const ans = prompt(`${q}\n${opts.map(o => o.label).join('/')}`);
              const found = opts.find(o => o.label === ans);
              return found ? found.text : '';
            },
            async promptText => {
              return prompt(promptText) || '';
            }
          );
          alert(`Chain Output:\n${output}`);
        } catch (error) {
          alert(`Chain Error: ${error}`);
        }
      });
      
      const del = document.createElement('button');
      del.textContent = 'Delete';
      del.className = 'danger';
      del.addEventListener('click', async () => {
        if (confirm(`Delete chain "${ch.name}"?`)) {
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
  e.preventDefault();
  if (input.value) {
    await window.api.create(input.value);
    input.value = '';
    refresh();
  }
});

addTextBtn.addEventListener('click', () => {
  chainNodesDiv.appendChild(createTextNodeElement());
});

addChoiceBtn.addEventListener('click', () => {
  chainNodesDiv.appendChild(createChoiceNodeElement());
});

addInputBtn.addEventListener('click', () => {
  chainNodesDiv.appendChild(createInputNodeElement());
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
  alert('Failed to load chains. Check console for details.');
});

refresh().catch(error => {
  console.error('Failed to load snippets:', error);
  alert('Failed to load snippets. Check console for details.');
});

async function loadErrors() {
  const log = await window.api.getErrorLog();
  if (errorDiv) {
    errorDiv.textContent = log;
  }
}

loadErrors();

exportBtn?.addEventListener('click', async () => {
  const path = await window.api.exportDiagnostics();
  alert(`Diagnostics exported to ${path}`);
});

export {};
