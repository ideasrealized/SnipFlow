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

### 3. **Snippet Engine**
```typescript
interface Snippet {
  id: string;
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  usage_count: number;
  chain_links?: string[];
}
```

### 4. **Chain System** (In Development)
```typescript
interface Chain {
  id: string;
  name: string;
  nodes: ChainNode[];
  execution_mode: 'instant' | 'flow' | 'interactive';
}

interface ChainNode {
  type: 'text' | 'choice' | 'input' | 'variable';
  content: string;
  next?: string | string[];
}
```

### 5. **Database Schema**
```sql
-- Snippets table
CREATE TABLE snippets (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  usage_count INTEGER DEFAULT 0,
  created_at DATETIME,
  updated_at DATETIME
);

-- Chains table (planned)
CREATE TABLE chains (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  nodes JSON NOT NULL,
  usage_count INTEGER DEFAULT 0
);

-- Clipboard history (planned)
CREATE TABLE clipboard_history (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  type TEXT,
  timestamp DATETIME,
  pinned BOOLEAN DEFAULT 0
);
```

## IPC Communication

### Secure Channel Design
```typescript
// Main process exposes limited API
ipcMain.handle('snippet:create', async (_, snippet) => {
  return await snippetService.create(snippet);
});

// Renderer uses through preload
const api = {
  createSnippet: (snippet) => ipcRenderer.invoke('snippet:create', snippet)
};
```

## Performance Considerations

1. **Instant Response**: <50ms for overlay appearance
2. **Smooth Animation**: 60fps for all transitions
3. **Memory Efficient**: Lazy load UI components
4. **Native Speed**: Rust modules for heavy computation

## Security Model

1. **Context Isolation**: Enabled in all renderer processes
2. **Node Integration**: Disabled in renderers
3. **Content Security Policy**: Strict CSP headers
4. **Input Validation**: All user inputs sanitized
5. **Local First**: No cloud dependency for core features

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