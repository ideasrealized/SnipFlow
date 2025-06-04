# 🏗️ SnipFlow Technical Architecture

## Overview

SnipFlow is built as a desktop application using Electron with a monorepo structure, designed for future expansion to mobile and web platforms.

## Core Technologies

- **Frontend**: Electron + React + TypeScript
- **Backend**: Node.js with Rust native modules (performance-critical)
- **Database**: SQLite (local) with migration support
- **IPC**: Secure message passing between processes
- **Build**: electron-builder, TypeScript, pnpm workspaces

## Project Structure

```
snipflow/
├── packages/
│   ├── desktop/          # Electron desktop application
│   │   ├── src/
│   │   │   ├── main/     # Main process (window, IPC, system)
│   │   │   ├── renderer/ # React UI application
│   │   │   ├── shared/   # Shared types and utilities
│   │   │   └── services/ # Business logic
│   ├── core/            # Rust native modules (future)
│   └── shared/          # Cross-package utilities
├── docs/                # Documentation
└── scripts/             # Build and utility scripts
```

## Key Components

### 1. **Main Process** (`main.ts`)
- Window management (main + overlay)
- Global hotkey registration
- IPC communication hub
- Native system integration

### 2. **Overlay System**
- Frameless, always-on-top window
- Edge activation (mouse hover)
- Smooth animations
- Multi-monitor aware

### 3. **Snippet Engine** (Current Implementation)
```typescript
interface Snippet {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
}
```

### 4. **Chain System** (Implemented)
```typescript
interface Chain {
  id: number;
  name: string;
  description?: string;
  options: ChainOption[];
  tags: string[];
  layoutData?: string;
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
  autoExecute?: boolean;
  lastExecuted?: number;
}

interface ChainOption {
  id: string;
  title: string;
  body: string;
  type?: 'text' | 'choice' | 'input' | 'variable';
}
```

### 5. **Clipboard Management** (Implemented)
```typescript
interface ClipboardEntry {
  id: string;
  content: string;
  timestamp: number;
  pinned: number;
}
```

### 5. **Database Schema** (Current Implementation)
```sql
-- Snippets table
CREATE TABLE snippets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  isPinned BOOLEAN DEFAULT 0
);

-- Chains table (implemented)
CREATE TABLE chains (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  options TEXT, -- JSON string for chain nodes/options
  tags TEXT, -- JSON string for tags array
  layoutData TEXT, -- JSON for layout (e.g. mind map positions)
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  isPinned BOOLEAN DEFAULT 0,
  autoExecute INTEGER DEFAULT 0,
  lastExecuted INTEGER
);

-- Clipboard history (implemented)
CREATE TABLE clipboard_history (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  pinned INTEGER DEFAULT 0
);

-- Settings table (implemented)
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT
);
```

## IPC Communication (Current Implementation)

### Secure Channel Design
```typescript
// Main process exposes limited API (20+ handlers implemented)
ipcMain.handle('get-snippets', async () => {
  return getSnippets();
});

ipcMain.handle('create-snippet', async (_, snippetData) => {
  return createSnippet(snippetData);
});

ipcMain.handle('get-chains', async () => {
  return getChains();
});

ipcMain.handle('get-clipboard-history', async (_, limit) => {
  return getClipboardHistory(limit);
});

// Renderer uses through preload (contextBridge)
const api = {
  getSnippets: () => ipcRenderer.invoke('get-snippets'),
  createSnippet: (snippet) => ipcRenderer.invoke('create-snippet', snippet),
  getChains: () => ipcRenderer.invoke('get-chains'),
  getClipboardHistory: (limit) => ipcRenderer.invoke('get-clipboard-history', limit)
};
```

## Performance Considerations

1. **Instant Response**: <50ms for overlay appearance
2. **Smooth Animation**: 60fps for all transitions
3. **Memory Efficient**: Lazy load UI components
4. **Native Speed**: Rust modules for heavy computation

## Security Model (Current Implementation)

1. **Context Isolation**: Enabled in all renderer processes
2. **Node Integration**: Disabled in renderers
3. **Content Security Policy**: Implemented with strict CSP headers
   - `default-src 'self'`
   - `script-src 'self' 'unsafe-inline'`
   - `style-src 'self' 'unsafe-inline'`
   - `img-src 'self' data:`
   - `font-src 'self'`
4. **Input Validation**: All user inputs sanitized
5. **Local First**: No cloud dependency for core features
6. **Database Security**: SQLite with transaction-based migrations
7. **IPC Security**: Secure message passing with type validation

## Future Architecture

### Mobile (React Native)
- Share core business logic
- Native performance for gestures
- Sync through encrypted cloud

### Web Extension
- Lightweight overlay
- WebAssembly for performance
- Browser-native storage

### API Platform
- RESTful API for integrations
- Webhook support
- OAuth2 authentication

## Development Principles

1. **Modularity**: Features as independent modules
2. **Testability**: Unit tests for all business logic
3. **Type Safety**: Full TypeScript coverage
4. **Performance**: Profile before optimizing
5. **User First**: Features driven by user needs

## Build and Deployment

### Development
```bash
pnpm dev         # Start in development mode
pnpm test        # Run test suite
pnpm lint        # Code quality checks
```

### Production
```bash
pnpm build       # Build for current platform
pnpm package     # Create distributables
```

### Release Process
1. Version bump
2. Changelog update
3. Build all platforms
4. Code signing
5. Auto-update deployment