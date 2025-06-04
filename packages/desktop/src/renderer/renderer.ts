import type { Chain, ChainOption, Snippet } from '../types';

const errorDiv = document.getElementById('error-message') as HTMLDivElement;

function displayError(message: string | Error | unknown) {
  if (errorDiv) {
    if (typeof message === 'string') {
      errorDiv.textContent = message;
    } else if (message instanceof Error) {
      errorDiv.textContent = message.message;
    } else {
      errorDiv.textContent = 'An unknown error occurred.'; // Default message for unknown types
    }
    errorDiv.style.display = 'block';
    console.error("Error displayed to user:", message);
  }
}

const newChainNameInput = document.getElementById('new-chain-name') as HTMLInputElement;
const createChainButton = document.getElementById('create-chain-button');

// if (createChainButton && newChainNameInput) { // This was causing issues in test env
createChainButton?.addEventListener('click', async () => {
  const name = newChainNameInput.value.trim();
  if (name) {
    try {
      const sampleChainPayload: Partial<Chain> = {
        name: name,
        description: "A sample chain created from legacy UI",
        tags: ["sample", "legacy"],
        options: [
          { id: window.crypto.randomUUID(), title: "Option 1", body: "This is the first option for " + name },
          { id: window.crypto.randomUUID(), title: "Option 2", body: "This is another option with a [?:User Input] prompt" }
        ],
        isPinned: false
      };

      // Ensure required fields for createChain are present
      if (!sampleChainPayload.name || !sampleChainPayload.options) {
        displayError("Chain name and options are required for sample creation.");
        return;
      }

      const createdChain = await window.api.createChain(
        sampleChainPayload.name,
        sampleChainPayload.options,
        sampleChainPayload.description,
        sampleChainPayload.tags,
        sampleChainPayload.layoutData, // Will be undefined, which is fine for optional param
        sampleChainPayload.isPinned
      );
      if (createdChain) {
        newChainNameInput.value = ''; // Clear input
        // ... existing code ...
      }
    } catch (error) {
      displayError(error);
    }
  }
}); 

const snippetsList = document.getElementById('snippets-list') as HTMLDivElement;

async function loadSnippets() {
  try {
    const snippets = await window.api.list(); // Assuming window.api.list() returns Snippet[]
    snippetsList.innerHTML = ''; // Clear existing
    if (snippets.length === 0) {
      snippetsList.innerHTML = '<p class="text-sm text-gray-400">No snippets yet.</p>';
      return;
    }
    snippets.forEach(sn => {
      const snippetItem = document.createElement('div');
      snippetItem.className = 'snippet-item p-2 border-b border-gray-700 flex justify-between items-center';
      
      const textSpan = document.createElement('span');
      textSpan.textContent = sn.content.length > 50 ? sn.content.substring(0, 47) + '...' : sn.content;
      textSpan.className = 'flex-grow cursor-pointer hover:text-blue-400';
      textSpan.title = sn.content; // Show full content on hover
      textSpan.addEventListener('click', async () => {
        const newContent = prompt('Edit snippet:', sn.content);
        if (newContent !== null && newContent !== sn.content) {
          try {
            // Ensure the call matches SnippetApi.update signature
            await window.api.update(sn.id, { content: newContent }); 
            loadSnippets(); // Refresh list
            displaySuccess('Snippet updated!'); // Assuming displaySuccess is defined
          } catch (editError) {
            displayError(editError); // Assuming displayError is defined
          }
        }
      });
      
      const controlsDiv = document.createElement('div');
      controlsDiv.className = 'snippet-controls flex items-center';

      const pinButton = document.createElement('button');
      pinButton.innerHTML = sn.isPinned ? '❤️' : '🤍'; // Use isPinned
      pinButton.className = 'pin-btn p-1 hover:bg-gray-700 rounded';
      pinButton.title = sn.isPinned ? 'Unpin Snippet' : 'Pin Snippet';
      pinButton.addEventListener('click', async (e) => {
        e.stopPropagation(); // Prevent click on textSpan
        try {
          await window.api.toggleSnippetPin(sn.id, !sn.isPinned);
          loadSnippets(); // Refresh list
          displaySuccess(sn.isPinned ? 'Snippet unpinned!' : 'Snippet pinned!');
        } catch (pinError) {
          displayError(pinError);
        }
      });

      const deleteButton = document.createElement('button');
      deleteButton.textContent = '🗑️';
      deleteButton.className = 'delete-btn p-1 hover:bg-gray-700 rounded ml-2';
      deleteButton.title = 'Delete Snippet';
      deleteButton.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this snippet?')) {
          try {
            await window.api.remove(sn.id);
            loadSnippets(); // Refresh list
            displaySuccess('Snippet deleted!');
          } catch (deleteError) {
            displayError(deleteError);
          }
        }
      });

      controlsDiv.appendChild(pinButton);
      controlsDiv.appendChild(deleteButton);
      snippetItem.appendChild(textSpan);
      snippetItem.appendChild(controlsDiv);
      snippetsList.appendChild(snippetItem);
    });
  } catch (error) {
    console.error('Failed to load snippets:', error);
    // displayError('Failed to load snippets.'); // Optional: display error in UI
    snippetsList.innerHTML = '<p class="text-red-500">Error loading snippets.</p>';
  }
}

function displaySuccess(message: string) {
  // Placeholder - implement actual success message display
  console.log("SUCCESS:", message);
  const successDiv = document.getElementById('success-message'); // Assuming an element for success messages
  if (successDiv) {
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    setTimeout(() => { successDiv.style.display = 'none'; }, 3000);
  }
}

// Initial loads
// loadChains(); // Assuming this function exists and is needed
loadSnippets(); 