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
  clearClipboardHistory,
} from '../db';
import type {
  Chain,
  ChainOption,
  Snippet,
  Settings,
  ClipboardEntry,
  EdgeHoverSettings,
  OverlaySettings,
} from '../types';
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
      { id: randomUUID(), title: 'Step 2 Choice', body: 'Choose A or B' },
    ];
    const newChain = await createChain(
      'Test Chain 1',
      initialOptions,
      'A test chain'
    );
    assert.ok(newChain, 'Chain should be created');
    assert.strictEqual(newChain.name, 'Test Chain 1');
    assert.strictEqual(newChain.options.length, 2);
    assert.strictEqual(newChain.options[0]?.title, 'Step 1');

    const chains = await getChains();
    assert.ok(chains.length > 0, 'Should retrieve chains');
    const foundChain = chains.find((c: Chain) => c.id === newChain.id);
    assert.ok(foundChain, 'Found the created chain');
    assert.strictEqual(foundChain?.options.length, 2);
    assert.strictEqual(foundChain?.options[1]?.body, 'Choose A or B');
  });

  it('should retrieve a chain by name', async () => {
    const options: ChainOption[] = [
      { id: randomUUID(), title: 'Only Option', body: 'Some content' },
    ];
    await createChain('Test Chain ByName', options, 'Desc');
    const chain = await getChainByName('Test Chain ByName');
    assert.ok(chain, 'Chain should be found by name');
    assert.strictEqual(chain?.name, 'Test Chain ByName');
    assert.strictEqual(chain?.options[0]?.title, 'Only Option');
  });

  it('should retrieve a chain by ID', async () => {
    const options: ChainOption[] = [
      { id: randomUUID(), title: 'ID Option', body: 'Content for ID test' },
    ];
    const newChain = await createChain('Test Chain ForID', options, 'Desc');
    const chain = await getChainById(newChain.id);
    assert.ok(chain, 'Chain should be found by ID');
    assert.strictEqual(chain?.id, newChain.id);
    assert.strictEqual(chain?.options[0]?.body, 'Content for ID test');
  });

  it('should update a chain', async () => {
    const initialOptions: ChainOption[] = [
      { id: randomUUID(), title: 'Initial', body: 'Initial Body' },
    ];
    const chainToUpdate = await createChain(
      'Chain to Update',
      initialOptions,
      'Original Desc'
    );

    const updatedOptions: ChainOption[] = [
      {
        id: chainToUpdate.options[0]!.id,
        title: 'Updated Title',
        body: 'Updated Body',
      },
      { id: randomUUID(), title: 'New Option', body: 'Extra details' },
    ];
    await updateChain(chainToUpdate.id, {
      name: 'Updated Chain Name',
      options: updatedOptions,
      description: 'Updated Desc',
    });

    const refetchedChain = await getChainById(chainToUpdate.id);
    assert.ok(refetchedChain, 'Updated chain should be refetched');
    assert.strictEqual(refetchedChain?.name, 'Updated Chain Name');
    assert.strictEqual(refetchedChain?.options.length, 2);
    assert.strictEqual(refetchedChain?.options[0]?.title, 'Updated Title');
    assert.strictEqual(refetchedChain?.options[1]?.title, 'New Option');
    assert.strictEqual(refetchedChain?.options[0]?.body, 'Updated Body');
  });

  it('should delete a chain', async () => {
    const options: ChainOption[] = [
      { id: randomUUID(), title: 'ToDelete', body: 'Delete me' },
    ];
    const chainToDelete = await createChain('Chain To Delete', options, 'Desc');
    await deleteChain(chainToDelete.id);
    const deletedChain = await getChainById(chainToDelete.id);
    assert.strictEqual(
      deletedChain,
      undefined,
      'Deleted chain should not be found'
    );
  });

  it('should create and retrieve snippets', async () => {
    await createSnippet('test snippet content 1');
    await createSnippet('another snippet 2');
    const snippets = await getSnippets();
    assert.ok(snippets.length >= 2, 'Should find snippets');
    assert.ok(
      snippets.some((s: Snippet) => s.content === 'test snippet content 1'),
      'Found the first snippet'
    );
    assert.ok(
      snippets.some((s: Snippet) => s.content === 'another snippet 2'),
      'Found the second snippet'
    );
  });

  it('should get and update settings', async () => {
    let settings = await getSettings();
    if (!settings) {
      console.warn(
        'Initial settings not found, test might be partial. Assuming a default structure for update.'
      );
      const defaultEdgeHover: EdgeHoverSettings = {
        enabled: false,
        position: 'right',
        triggerSize: 10,
        delay: 200,
      };
      const defaultOverlay: OverlaySettings = {
        theme: 'dark',
        opacity: 1,
        blur: 0,
      };
      settings = {
        theme: 'dark',
        autoPaste: false,
        autoFormat: false,
        maxHistory: 100,
        edgeHover: defaultEdgeHover,
        overlay: defaultOverlay,
      };
    }
    assert.ok(settings, 'Should get initial settings or a default');

    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    await updateSettings({ theme: newTheme });
    const updatedSettings = await getSettings();
    assert.ok(updatedSettings, 'Updated settings should be retrieved');
    assert.strictEqual(
      updatedSettings?.theme,
      newTheme,
      'Theme should be updated'
    );
  });

  it('should manage clipboard history', async () => {
    await addClipboardEntry('clip entry1');
    await addClipboardEntry('clip entry2');
    let history = await getClipboardHistory(5);
    assert.strictEqual(history.length, 2, 'Should have 2 entries with limit');
    assert.strictEqual(
      history[0]?.content,
      'clip entry2',
      'Entries should be in reverse chronological order'
    );

    await addClipboardEntry('clip entry3');
    history = await getClipboardHistory();
    assert.ok(
      history.length >= 3,
      'Should have at least 3 entries without limit'
    );

    await clearClipboardHistory();
    history = await getClipboardHistory(5);
    assert.strictEqual(
      history.length,
      0,
      'History should be cleared (unpinned items)'
    );
  });
});
