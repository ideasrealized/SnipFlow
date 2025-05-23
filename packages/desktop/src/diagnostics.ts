import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { execSync } from 'child_process';
import { BASE_DIR } from './logger';

const DIAG_DIR = join(BASE_DIR, 'diagnostics');

export function exportDiagnostics(): string {
  if (!existsSync(DIAG_DIR)) mkdirSync(DIAG_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const archive = join(DIAG_DIR, `diag-${stamp}.tar.gz`);
  const files = ['error.log*', 'performance.log*', 'crash-reports'];
  const cmd = `tar czf ${archive} -C ${BASE_DIR} ${files.join(' ')}`;
  execSync(cmd);
  return archive;
}
