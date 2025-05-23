interface Snippet {
  id: number;
  content: string;
}

const container = document.getElementById('container') as HTMLDivElement;
const searchInput = document.getElementById('search') as HTMLInputElement;
const results = document.getElementById('results') as HTMLUListElement;

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
      li.addEventListener('click', () => {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(sn.content).then(() => {
            window.api.hideOverlay?.();
          });
        } else {
          window.api.hideOverlay?.();
        }
      });
      results.appendChild(li);
    });
}

searchInput.addEventListener('input', () => {
  render(searchInput.value);
});

loadSnippets();
container.classList.add('show');

export {};
