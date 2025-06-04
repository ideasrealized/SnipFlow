import { Console } from 'console'; // Keep console for all environments

// Attempt to load Node.js modules
let fs: any = null;
let path: any = null;
let os: any = null;
let hasNodeFileAccess = false;

try {
  fs = require('fs');
  path = require('path');
  os = require('os');
  hasNodeFileAccess = true;
} catch (e) {
  // Node.js modules are not available
  console.warn(
    'Node.js file system modules (fs, path, os) not available. Logging to console only.'
  );
}

let BASE_DIR: string | null = null;
let CRASH_DIR: string | null = null;
let ERROR_LOG: string | null = null;
let PERF_LOG: string | null = null;

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 7;

if (hasNodeFileAccess && fs && path && os) {
  BASE_DIR = path.join(os.homedir(), '.snipflow');
  CRASH_DIR = path.join(BASE_DIR, 'crash-reports');

  if (!fs.existsSync(BASE_DIR)) {
    fs.mkdirSync(BASE_DIR, { recursive: true });
  }
  if (!fs.existsSync(CRASH_DIR)) {
    fs.mkdirSync(CRASH_DIR, { recursive: true });
  }

  ERROR_LOG = path.join(BASE_DIR, 'error.log');
  PERF_LOG = path.join(BASE_DIR, 'performance.log');
}

function rotate(file: string | null) {
  if (!hasNodeFileAccess || !file || !fs || !path || !os) return;
  try {
    if (!fs.existsSync(file)) return;
    const stats = fs.statSync(file);
    const date = new Date(stats.mtime);
    const needsRotate =
      stats.size > MAX_SIZE ||
      date.toDateString() !== new Date().toDateString();
    if (!needsRotate) return;
    // shift old logs
    for (let i = MAX_FILES - 1; i >= 0; i--) {
      const src = i === 0 ? file : `${file}.${i}`;
      const dest = `${file}.${i + 1}`;
      if (fs.existsSync(src)) {
        if (i + 1 > MAX_FILES) {
          // remove oldest
          try {
            // fs.unlinkSync(dest); // Should be unlinkSync(src) if dest would overwrite or handle error
            // To prevent error if dest already exists (e.g. from previous incomplete rotation)
            // we try to remove it first, or let renameSync overwrite if it can.
            // For simplicity, we'll assume renameSync can overwrite or we accept the potential error.
            // A more robust solution would be to fs.unlinkSync(dest) if it exists.
            // However, the original code was trying to rename src to dest (e.g. error.log.7 to error.log.8)
            // and then deleting error.log.8 (which was just created from error.log.7)
            // The intent seems to be to remove the oldest log file if it exceeds MAX_FILES.
            // A simpler logic for removing the oldest if it exceeds MAX_FILES:
            const oldestFile = `${file}.${MAX_FILES + 1}`;
            if (fs.existsSync(oldestFile)) {
              fs.unlinkSync(oldestFile);
            }
          } catch (e) {
            // console.error('Error removing oldest log file during rotation:', dest, e);
          }
          // The original code had a potential bug here, trying to rename to a file that should be deleted
          // renameSync(src, dest); // This would be file.MAX_FILES -> file.MAX_FILES+1
          // The loop structure ensures that file.MAX_FILES would have been file.(MAX_FILES-1) in the previous iteration
          // So, if i+1 > MAX_FILES, it means we are at src = file.MAX_FILES. We should delete this.
          fs.unlinkSync(src);
          continue;
        }
        fs.renameSync(src, dest);
      }
    }
  } catch (err) {
    console.error('Failed to rotate logs', err);
  }
}

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

function write(file: string | null, level: LogLevel, ...args: any[]) {
  const time = new Date().toISOString();
  const message = args
    .map(arg => {
      if (typeof arg === 'object' && arg !== null) {
        try {
          return JSON.stringify(arg);
        } catch (e) {
          return '[Unserializable Object]';
        }
      }
      return String(arg);
    })
    .join(' ');
  const line = `[${time}] [${level}] ${message}\\n`;
  if (hasNodeFileAccess && file && fs) {
    fs.appendFileSync(file, line);
  }
}

export const logger = {
  debug(...args: any[]) {
    if (hasNodeFileAccess && ERROR_LOG) rotate(ERROR_LOG);
    write(ERROR_LOG, 'DEBUG', ...args);
    console.debug(...args);
  },
  info(...args: any[]) {
    if (hasNodeFileAccess && ERROR_LOG) rotate(ERROR_LOG);
    write(ERROR_LOG, 'INFO', ...args);
    console.info(...args);
  },
  warn(...args: any[]) {
    if (hasNodeFileAccess && ERROR_LOG) rotate(ERROR_LOG);
    write(ERROR_LOG, 'WARN', ...args);
    console.warn(...args);
  },
  error(...args: any[]) {
    if (hasNodeFileAccess && ERROR_LOG) rotate(ERROR_LOG);
    write(ERROR_LOG, 'ERROR', ...args);
    console.error(...args);
  },
  perf(...args: any[]) {
    if (hasNodeFileAccess && PERF_LOG) rotate(PERF_LOG);
    write(PERF_LOG, 'INFO', ...args);
  },
  getErrorLog(): string[] {
    if (!hasNodeFileAccess || !ERROR_LOG || !fs) {
      return ['Log file access not available in this context.'];
    }
    try {
      return fs.existsSync(ERROR_LOG)
        ? String(fs.readFileSync(ERROR_LOG)).split('\\n')
        : [];
    } catch (e) {
      console.error('Failed to get error log:', e);
      return ['Failed to read error log file.'];
    }
  },
};

export { CRASH_DIR, BASE_DIR };
