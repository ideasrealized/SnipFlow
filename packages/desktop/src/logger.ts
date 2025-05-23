import { existsSync, mkdirSync, renameSync, statSync, appendFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const BASE_DIR = join(homedir(), '.snipflow');
const CRASH_DIR = join(BASE_DIR, 'crash-reports');

if (!existsSync(BASE_DIR)) {
  mkdirSync(BASE_DIR, { recursive: true });
}
if (!existsSync(CRASH_DIR)) {
  mkdirSync(CRASH_DIR, { recursive: true });
}

const ERROR_LOG = join(BASE_DIR, 'error.log');
const PERF_LOG = join(BASE_DIR, 'performance.log');
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 7;

function rotate(file: string) {
  try {
    if (!existsSync(file)) return;
    const stats = statSync(file);
    const date = new Date(stats.mtime);
    const needsRotate = stats.size > MAX_SIZE ||
      date.toDateString() !== new Date().toDateString();
    if (!needsRotate) return;
    // shift old logs
    for (let i = MAX_FILES - 1; i >= 0; i--) {
      const src = i === 0 ? file : `${file}.${i}`;
      const dest = `${file}.${i + 1}`;
      if (existsSync(src)) {
        if (i + 1 > MAX_FILES) {
          // remove oldest
          try { renameSync(src, dest); } catch {}
          continue;
        }
        renameSync(src, dest);
      }
    }
  } catch (err) {
    console.error('Failed to rotate logs', err);
  }
}

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

function write(file: string, level: LogLevel, message: string) {
  const time = new Date().toISOString();
  const line = `[${time}] [${level}] ${message}\n`;
  appendFileSync(file, line);
}

export const logger = {
  debug(message: string) {
    rotate(ERROR_LOG);
    write(ERROR_LOG, 'DEBUG', message);
    console.debug(message);
  },
  info(message: string) {
    rotate(ERROR_LOG);
    write(ERROR_LOG, 'INFO', message);
    console.info(message);
  },
  warn(message: string) {
    rotate(ERROR_LOG);
    write(ERROR_LOG, 'WARN', message);
    console.warn(message);
  },
  error(message: string) {
    rotate(ERROR_LOG);
    write(ERROR_LOG, 'ERROR', message);
    console.error(message);
  },
  perf(message: string) {
    rotate(PERF_LOG);
    write(PERF_LOG, 'INFO', message);
  },
  getErrorLog(): string {
    try {
      return existsSync(ERROR_LOG) ? String(require('fs').readFileSync(ERROR_LOG)) : '';
    } catch {
      return '';
    }
  },
};

export { CRASH_DIR, BASE_DIR };
