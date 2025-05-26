import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { logger, CRASH_DIR } from './logger';

interface RetryOptions {
  retries: number;
  delayMs?: number;
}

export function initErrorTracking() {
  process.on('uncaughtException', err => {
    logger.error(`Uncaught: ${err.stack || err.message}`);
    dumpCrash(err);
  });
  process.on('unhandledRejection', reason => {
    logger.error(`UnhandledRejection: ${reason}`);
    dumpCrash(reason as Error);
  });
}

function dumpCrash(err: unknown) {
  if (!CRASH_DIR) {
    console.error(
      'CRASH_DIR is not available. Cannot dump crash report to file. Error details:',
      err
    );
    return;
  }
  const name = `crash-${Date.now()}.log`;
  if (!existsSync(CRASH_DIR)) mkdirSync(CRASH_DIR, { recursive: true });
  const path = join(CRASH_DIR, name);
  writeFileSync(path, String(err));
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  opts: RetryOptions
): Promise<T> {
  let attempts = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempts++;
      logger.error(`Attempt ${attempts} failed: ${err}`);
      if (attempts >= opts.retries) throw err;
      await new Promise(res => setTimeout(res, opts.delayMs || 500));
    }
  }
}
