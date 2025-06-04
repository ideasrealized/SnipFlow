import { strict as assert } from 'assert';
// import { join } from 'path'; // No longer needed for DB_PATH
// import { existsSync, unlinkSync } from 'fs'; // No longer needed for DB_PATH
import * as db from '../db';

// const DB_PATH = join(__dirname, '..', 'snippets.db'); // Removed
// if (existsSync(DB_PATH)) unlinkSync(DB_PATH); // Removed

describe('Clipboard History Tests', () => {
  before(() => {
    db.initDb(':memory:'); // Use in-memory DB for tests
  });

  after(() => {
    db.closeDb();
  });

  beforeEach(() => {
    // Clear history before each test (only unpinned items)
    db.clearClipboardHistory();
    // Add some pinned items to ensure they are not cleared by default clearClipboardHistory
    const pinnedId = 'pinned-test-id';
    db.addClipboardEntry('pinned content'); // addClip uses random ID
    // How to get the ID to pin? For now, assume addClip returns it or we can fetch it.
    // Let's assume we need a way to get the last inserted ID or fetch by content to pin.
    // Or, add a test-specific pin function if main logic is too complex for test setup.
    // For now, this part of test for pinned items might be tricky without more direct ways to pin.
  });

  it('should add and retrieve clipboard entries', () => {
    db.addClipboardEntry('test content 1');
    db.addClipboardEntry('test content 2');
    const history = db.getClipboardHistory(5);
    assert.strictEqual(history.length, 2);
    assert.strictEqual(history[0]?.content, 'test content 2'); // Assuming newest first
  });

  it('should respect the limit in getClipboardHistory', () => {
    db.addClipboardEntry('entry A');
    db.addClipboardEntry('entry B');
    db.addClipboardEntry('entry C');
    const history = db.getClipboardHistory(2);
    assert.strictEqual(history.length, 2);
    assert.strictEqual(history[0]?.content, 'entry C');
  });

  it('should clear unpinned clipboard history', () => {
    db.addClipboardEntry('unpinned1');
    // To test pinned items aren't cleared, we need a way to pin an item reliably by ID.
    // This requires addClipboardEntry to return ID or a getByContent to return ID.
    // For now, this test only confirms unpinned are cleared.
    db.clearClipboardHistory();
    const history = db.getClipboardHistory(5);
    assert.strictEqual(
      history.length,
      0,
      'Unpinned history should be empty after clear'
    );
  });

  // More tests could be added for pinning/unpinning if db provides suitable methods
  // e.g., it('should correctly pin and unpin items', () => { ... });
  // it('pinned items should not be cleared by clearClipboardHistory', () => { ... });
});

export {};
