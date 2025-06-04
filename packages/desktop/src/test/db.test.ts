import * as assert from 'assert';
import {
  initDb,
  createChain,
  getChains,
  getChainByName,
  getChainById,
  updateChain,
  deleteChain,
  closeDb,
  createSnippet,
  getSnippets,
  getSettings,
  updateSettings,
  addClipboardEntry,
  getClipboardHistory,
  clearClipboardHistory
} from '../db';
import type { Chain, ChainOption, Snippet, Settings, ClipboardEntry, EdgeHoverSettings, OverlaySettings } from '../types';
import { randomUUID } from 'crypto';

describe('Database Tests', () => {
  before(async () => {
    initDb(':memory:');
  });

  after(async () => {
    closeDb();
  });

  it('should create and retrieve a chain with options', async () => {
    const initialOptions: ChainOption[] = [
      { id: randomUUID(), title: 'Step 1', body: 'Hello' },
      { id: randomUUID(), title: 'Step 2 Choice', body: 'Choose A or B' }
    ];
    const newChainData: Partial<Chain> = {
      name: 'Test Chain 1',
      options: initialOptions,
      description: 'A test chain',
      tags: ['test'],
      isPinned: false
    };
    const newChain = await createChain(newChainData);
    assert.ok(newChain, 'Chain should be created');
    assert.strictEqual(newChain!.name, 'Test Chain 1');
    assert.strictEqual(newChain!.isPinned, false);
    assert.ok(newChain!.options, 'Chain should have options');
    assert.strictEqual(newChain!.options.length, 2);
    assert.strictEqual(newChain!.options[0]?.title, 'Step 1');

    const chains = await getChains();
    assert.ok(chains.length > 0, 'Should retrieve chains');
    const foundChain = chains.find((c: Chain) => c.id === newChain!.id);
    assert.ok(foundChain, 'Found the created chain');
    assert.strictEqual(foundChain?.options.length, 2);
    assert.strictEqual(foundChain?.options[1]?.body, 'Choose A or B');
  });

  it('should retrieve a chain by name', async () => {
    const options: ChainOption[] = [{ id: randomUUID(), title: 'Only Option', body: 'Some content' }];
    const chainByNameData: Partial<Chain> = {
      name: 'Test Chain ByName',
      options: options,
      description: 'Desc',
      isPinned: false
    };
    await createChain(chainByNameData);
    const chain = await getChainByName('Test Chain ByName');
    assert.ok(chain, 'Chain should be found by name');
    assert.strictEqual(chain?.name, 'Test Chain ByName');
    assert.strictEqual(chain?.options[0]?.title, 'Only Option');
  });

  it('should retrieve a chain by ID', async () => {
    const options: ChainOption[] = [{ id: randomUUID(), title: 'ID Option', body: 'Content for ID test' }];
    const chainForIdData: Partial<Chain> = {
      name: 'Test Chain ForID',
      options: options,
      description: 'Desc',
      isPinned: true
    };
    const newChain = await createChain(chainForIdData);
    assert.ok(newChain, 'Created chain for ID test should not be null');
    const chain = await getChainById(newChain!.id);
    assert.ok(chain, 'Chain should be found by ID');
    assert.strictEqual(chain?.id, newChain!.id);
    assert.strictEqual(chain?.isPinned, true);
    assert.strictEqual(chain?.options[0]?.body, 'Content for ID test');
  });

  it('should update a chain', async () => {
    const initialOptions: ChainOption[] = [{ id: randomUUID(), title: 'Initial', body: 'Initial Body' }];
    const chainToUpdateData: Partial<Chain> = {
      name: 'Chain to Update',
      options: initialOptions,
      description: 'Original Desc',
      isPinned: false
    };
    const chainToUpdate = await createChain(chainToUpdateData);
    assert.ok(chainToUpdate, 'Created chain for update test should not be null');
    
    const updatedOptions: ChainOption[] = [
      { id: chainToUpdate!.options[0]!.id, title: 'Updated Title', body: 'Updated Body' },
      { id: randomUUID(), title: 'New Option', body: 'Extra details' }
    ];
    await updateChain(chainToUpdate!.id, { name: 'Updated Chain Name', options: updatedOptions, description: 'Updated Desc', isPinned: true });
    
    const refetchedChain = await getChainById(chainToUpdate!.id);
    assert.ok(refetchedChain, 'Updated chain should be refetched');
    assert.strictEqual(refetchedChain?.name, 'Updated Chain Name');
    assert.strictEqual(refetchedChain?.options.length, 2);
    assert.strictEqual(refetchedChain?.options[0]?.title, 'Updated Title');
    assert.strictEqual(refetchedChain?.options[1]?.title, 'New Option');
    assert.strictEqual(refetchedChain?.options[0]?.body, 'Updated Body');
    assert.strictEqual(refetchedChain?.isPinned, true);
  });

  it('should delete a chain', async () => {
    const options: ChainOption[] = [{ id: randomUUID(), title: 'ToDelete', body: 'Delete me' }];
    const chainToDeleteData: Partial<Chain> = {
      name: 'Chain To Delete',
      options: options,
      description: 'Desc',
      isPinned: false
    };
    const chainToDelete = await createChain(chainToDeleteData);
    assert.ok(chainToDelete, 'Created chain for delete test should not be null');
    await deleteChain(chainToDelete!.id);
    const deletedChain = await getChainById(chainToDelete!.id);
    assert.strictEqual(deletedChain, undefined, 'Deleted chain should not be found');
  });

  it('should create and retrieve snippets', async () => {
    const snippet1Data: Partial<Snippet> = { content: 'test snippet content 1', isPinned: false };
    const snippet2Data: Partial<Snippet> = { content: 'another snippet 2', isPinned: true };
    await createSnippet(snippet1Data);
    await createSnippet(snippet2Data);

    const snippets = await getSnippets();
    assert.ok(snippets.length >= 2, 'Should find snippets');
    const snippet1 = snippets.find((s: Snippet) => s.content === 'test snippet content 1');
    assert.ok(snippet1, 'Found the first snippet');
    assert.strictEqual(snippet1?.isPinned, false, 'Snippet 1 should not be pinned');

    const snippet2 = snippets.find((s: Snippet) => s.content === 'another snippet 2');
    assert.ok(snippet2, 'Found the second snippet');
    assert.strictEqual(snippet2?.isPinned, true, 'Snippet 2 should be pinned');
  });

  it('should get and update settings', async () => {
    let settings = await getSettings();
    if (!settings) {
      console.warn('Initial settings not found, test might be partial. Assuming a default structure for update.');
      const defaultEdgeHover: EdgeHoverSettings = { enabled: false, position: 'right', triggerSize: 10, delay: 200 };
      const defaultOverlay: OverlaySettings = { theme: 'dark', opacity: 1, blur: 0 };
      settings = { theme: 'dark', autoPaste: false, autoFormat: false, maxHistory: 100, edgeHover: defaultEdgeHover, overlay: defaultOverlay };
    }
    assert.ok(settings, 'Should get initial settings or a default');
    
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    await updateSettings({ theme: newTheme });
    const updatedSettings = await getSettings();
    assert.ok(updatedSettings, 'Updated settings should be retrieved');
    assert.strictEqual(updatedSettings?.theme, newTheme, 'Theme should be updated');
  });

  it('should manage clipboard history', async () => {
    await addClipboardEntry('clip entry1');
    await addClipboardEntry('clip entry2');
    let history = await getClipboardHistory(5);
    assert.strictEqual(history.length, 2, 'Should have 2 entries with limit');
    assert.strictEqual(history[0]?.content, 'clip entry2', 'Entries should be in reverse chronological order');

    await addClipboardEntry('clip entry3');
    history = await getClipboardHistory();
    assert.ok(history.length >= 3, 'Should have at least 3 entries without limit');

    await clearClipboardHistory();
    history = await getClipboardHistory(5);
    assert.strictEqual(history.length, 0, 'History should be cleared (unpinned items)');
  });
});
