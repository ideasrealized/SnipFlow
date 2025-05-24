import { strict as assert } from 'assert';
import { join } from 'path';
import { existsSync, unlinkSync } from 'fs';
import * as db from '../db';

const DB_PATH = join(__dirname, '..', 'snippets.db');
if (existsSync(DB_PATH)) unlinkSync(DB_PATH);

db.init();

db.addClipboardEntry('one');
db.addClipboardEntry('one'); // duplicate should not add new
let history = db.getClipboardHistory();
assert.equal(history.length, 1);
assert.equal(history[0]!.content, 'one');

// add multiple items
for (let i = 0; i < 25; i++) {
  db.addClipboardEntry(`item${i}`);
}

history = db.getClipboardHistory();
const pinnedCount = history.filter(h => h.pinned).length;
assert(history.length - pinnedCount <= 20);

db.pinClipboardItem(history[0]!.id, true);
assert.equal(db.getClipboardHistory()[0]!.pinned, 1);

export {};
