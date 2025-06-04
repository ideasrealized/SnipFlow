import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

export interface Settings {
  overlaySide: 'left' | 'right';
  theme: 'light' | 'dark';
  overlayX?: number;
  overlayY?: number;
  edgeHover: {
    enabled: boolean;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'left-center' | 'right-center';
    triggerSize: number; // pixels from edge
    delay: number; // ms delay before showing
  };
}

const DIR = join(homedir(), '.snipflow');
const FILE = join(DIR, 'settings.json');
let settings: Settings = { 
  overlaySide: 'left', 
  theme: 'dark',
  edgeHover: {
    enabled: true,
    position: 'left-center',
    triggerSize: 50,
    delay: 200
  }
};

export function loadSettings(): Settings {
  try {
    if (existsSync(FILE)) {
      const data = JSON.parse(readFileSync(FILE, 'utf-8')) as Partial<Settings>;
      settings = { ...settings, ...data } as Settings;
    }
  } catch {}
  return settings;
}

export function saveSettings(update: Partial<Settings>): Settings {
  settings = { ...settings, ...update };
  if (!existsSync(DIR)) mkdirSync(DIR, { recursive: true });
  writeFileSync(FILE, JSON.stringify(settings, null, 2));
  return settings;
}

export function getSettings(): Settings {
  return settings;
}
