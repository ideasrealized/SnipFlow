import { strict as assert } from 'assert';
import { join } from 'path';
import { existsSync, unlinkSync } from 'fs';
import * as db from '../db';

const DB_PATH = join(__dirname, '..', 'snippets.db');

if (existsSync(DB_PATH)) {
  unlinkSync(DB_PATH);
}

db.init();

db.createSnippet('first');
let list = db.getSnippets();
assert.equal(list.length, 1);
const item = list[0]!;
assert.equal(item.content, 'first');

db.updateSnippet(item.id, 'second');
list = db.getSnippets();
assert.equal(list[0]!.content, 'second');

db.deleteSnippet(list[0]!.id);
list = db.getSnippets();
assert.equal(list.length, 0);

export {};
