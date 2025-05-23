import type { SnippetApi } from './types';

declare global {
  interface Window {
    api: SnippetApi;
  }
}

const form = document.getElementById('add-form') as HTMLFormElement;
const input = document.getElementById('content') as HTMLInputElement;
const list = document.getElementById('list') as HTMLUListElement;
const chainForm = document.getElementById('chain-form') as HTMLFormElement;
const chainNameInput = document.getElementById('chain-name') as HTMLInputElement;
const chainNodesDiv = document.getElementById('chain-nodes') as HTMLDivElement;
const addTextBtn = document.getElementById('add-text') as HTMLButtonElement;
const addChoiceBtn = document.getElementById('add-choice') as HTMLButtonElement;
const chainList = document.getElementById('chain-list') as HTMLUListElement;

async function refresh() {
  const snippets = await window.api.list();
  list.innerHTML = '';
  snippets.forEach(sn => {
    const li = document.createElement('li');
    li.textContent = sn.content;
    li.addEventListener('click', async () => {
      const newContent = prompt('Edit snippet', sn.content);
      if (newContent !== null) {
        await window.api.update(sn.id, newContent);
        refresh();
      }
    });
    const del = document.createElement('button');
    del.textContent = 'Delete';
    del.addEventListener('click', async e => {
      e.stopPropagation();
      await window.api.remove(sn.id);
      refresh();
    });
    li.appendChild(del);
    list.appendChild(li);
  });
}

function createTextNodeElement(): HTMLElement {
  const div = document.createElement('div');
  div.dataset.type = 'text';
  const input = document.createElement('input');
  input.placeholder = 'Text content';
  div.appendChild(input);
  return div;
}

function createChoiceNodeElement(): HTMLElement {
  const div = document.createElement('div');
  div.dataset.type = 'choice';
  const q = document.createElement('input');
  q.placeholder = 'Question';
  div.appendChild(q);
  const opts = document.createElement('div');
  opts.className = 'options';
  div.appendChild(opts);
  const add = document.createElement('button');
  add.textContent = 'Add Option';
  add.type = 'button';
  add.addEventListener('click', () => {
    const opt = document.createElement('div');
    opt.className = 'option';
    const label = document.createElement('input');
    label.placeholder = 'Label';
    const text = document.createElement('input');
    text.placeholder = 'Text';
    opt.appendChild(label);
    opt.appendChild(text);
    opts.appendChild(opt);
  });
  div.appendChild(add);
  return div;
}

async function refreshChains() {
  const chains = await window.api.listChains();
  chainList.innerHTML = '';
  chains.forEach((ch: any) => {
    const li = document.createElement('li');
    li.textContent = ch.name;
    const del = document.createElement('button');
    del.textContent = 'Delete';
    del.addEventListener('click', async () => {
      await window.api.deleteChain(ch.id);
      refreshChains();
    });
    li.appendChild(del);
    chainList.appendChild(li);
  });
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
        opts.push({ label: (label as HTMLInputElement).value, text: (text as HTMLInputElement).value });
      });
      nodes.push({ type: 'choice', content: question.value, options: opts });
    }
  });
  if (chainNameInput.value) {
    await window.api.createChain(chainNameInput.value, nodes);
    chainNameInput.value = '';
    chainNodesDiv.innerHTML = '';
    refreshChains();
  }
});

refreshChains();

refresh();

export {};
