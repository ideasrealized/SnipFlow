import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
// import { homedir } from 'os'; // homedir is not directly used here, comes via BASE_DIR
import { execSync } from 'child_process';
import { BASE_DIR } from './logger';

// Removed top-level const DIAG_DIR as it depends on BASE_DIR which can be null at module load.

export function exportDiagnostics(): string {
  if (!BASE_DIR) {
    throw new Error(
      'Unable to export diagnostics: Base directory is not configured. This suggests an issue with logger initialization in a Node.js environment.'
    );
  }
  // Define DIAG_DIR here, now that BASE_DIR is confirmed to be a string.
  const DIAG_DIR = join(BASE_DIR, 'diagnostics');

  if (!existsSync(DIAG_DIR)) mkdirSync(DIAG_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const archive = join(DIAG_DIR, `diag-${stamp}.tar.gz`);
  const files = ['error.log*', 'performance.log*', 'crash-reports'];
  const cmd = `tar czf ${archive} -C ${BASE_DIR} ${files.join(' ')}`;
  execSync(cmd);
  return archive;
}
