import { clipboard } from 'electron';
import * as db from '../db';
import { logger } from '../logger';

let last = '';
let interval: NodeJS.Timeout | null = null;

export function startClipboardMonitor() {
  if (interval) return;
  logger.info('[clipboard] Starting clipboard monitor');
  interval = setInterval(() => {
    try {
      const text = clipboard.readText();
      if (text && text !== last) {
        logger.info(`[clipboard] New clipboard text detected: ${text.substring(0, 50)}...`);
        db.addClipboardEntry(text);
        last = text;
      }
    } catch (err) {
      logger.error(`clipboard monitor error: ${err}`);
    }
  }, 1000);
}

export function stopClipboardMonitor() {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
}
