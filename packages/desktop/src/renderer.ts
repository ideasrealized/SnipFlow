interface SnippetApi {
  list(): Promise<{ id: number; content: string }[]>;
  create(content: string): Promise<any>;
  update(id: number, content: string): Promise<any>;
  remove(id: number): Promise<any>;
}

declare global {
  interface Window {
    api: SnippetApi;
  }
}

const form = document.getElementById('add-form') as HTMLFormElement;
const input = document.getElementById('content') as HTMLInputElement;
const list = document.getElementById('list') as HTMLUListElement;

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

form.addEventListener('submit', async e => {
  e.preventDefault();
  if (input.value) {
    await window.api.create(input.value);
    input.value = '';
    refresh();
  }
});

refresh();

export {};
