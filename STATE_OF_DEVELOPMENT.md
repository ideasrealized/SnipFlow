# SnipFlow - State of Development

## Project Overview

SnipFlow is an intelligent text productivity engine built as an Electron desktop application with TypeScript, featuring dynamic snippets, branching workflows (chains), and AI-powered automation. The application uses a local-first approach with SQLite database and provides edge-activated overlay interface for seamless text expansion.

## Architecture & Technology Stack

### Core Technologies
- **Frontend**: Electron + TypeScript + HTML/CSS (no React - vanilla DOM manipulation)
- **Backend**: Node.js with SQLite (better-sqlite3)
- **Database**: SQLite with transaction-based migrations
- **Build System**: TypeScript compiler + esbuild + electron-builder
- **Package Management**: pnpm workspaces

### Project Structure
```
snipflow/
├── packages/
│   ├── desktop/                    # Main Electron application
│   │   ├── src/
│   │   │   ├── main.ts            # Electron main process (1532 lines)
│   │   │   ├── overlay.ts         # Overlay system (1511 lines)
│   │   │   ├── renderer.ts        # Main window renderer (645 lines)
│   │   │   ├── db.ts              # SQLite database layer (850 lines)
│   │   │   ├── types.ts           # TypeScript definitions (204 lines)
│   │   │   ├── preload.ts         # IPC bridge
│   │   │   ├── services/           # Business logic
│   │   │   ├── test/              # Test utilities
│   │   │   └── assets/            # Static resources
│   │   ├── assets/                # Application assets
│   │   ├── dist/                  # Compiled output
│   │   └── snippets.db           # SQLite database
│   ├── core/                      # Planned Rust native modules
│   └── shared/                    # Cross-package utilities
├── docs/                          # Comprehensive documentation
├── logs/                          # Development and debugging logs
└── scripts/                       # Build and utility scripts
```

## Core Features - Current Implementation Status

### ✅ Fully Implemented & Tested

#### 1. **Edge Hover Overlay System**
- **Location**: `main.ts` (lines 80-268), `overlay.ts` (full file)
- **Capabilities**:
  - Mouse edge detection with configurable positions (6 zones)
  - Smooth show/hide animations with performance optimizations
  - Input protection with cursor restoration
  - Multi-monitor awareness
  - Customizable trigger zones and delays
- **Performance**: <50ms activation, 60fps animations
- **State Management**: Sophisticated state machine (hidden/showing/visible/hiding)

#### 2. **Chain System with Advanced Linking**
- **Location**: `overlay.ts` (processPlaceholders function), `services/chainService.ts`
- **Capabilities**:
  - `[Chain:ChainName]` syntax for recursive chain references
  - Multi-level nesting support (chains calling chains calling chains)
  - Choice overlays for multi-option chains
  - Dynamic user input placeholders `[?:prompt]`
  - Mixed content processing (static text + chain refs + user inputs)
- **Data Structure**: 
  ```typescript
  interface Chain {
    id: number;
    name: string;
    description?: string;
    options: ChainOption[];
    tags?: string[];
    layoutData?: string;
    isPinned?: boolean;
    isStarterChain?: boolean;
  }
  ```

#### 3. **Database Layer**
- **Location**: `db.ts` (850 lines)
- **Features**:
  - SQLite with better-sqlite3 (production-ready)
  - Transaction-based operations
  - Migration system
  - CRUD operations for snippets, chains, clipboard history
  - Settings persistence
  - Pinned items management

#### 4. **IPC Communication**
- **Location**: `main.ts` (setupIpcHandlers), `preload.ts`
- **Security**: Context isolation, disabled node integration
- **Handlers**: 20+ secure IPC handlers for all operations
- **Type Safety**: Full TypeScript coverage

#### 5. **Clipboard Management**
- **Features**: History tracking, pinning, deduplication
- **Storage**: SQLite with timestamp indexing
- **Integration**: Automatic paste functionality

#### 6. **Settings System**
- **Persistence**: SQLite key-value store
- **Categories**: Theme, edge hover, overlay positioning
- **Live Updates**: Real-time settings application

### 🔄 In Active Development

#### 1. **Overlay Context Menu System** 
- **Status**: Foundation implemented, expanding functionality
- **Current**: Right-click context menus for chains
- **Planned**: Edit, duplicate, delete, convert to starter chain
- **Location**: `overlay.ts` (showChainContextMenu function)

#### 2. **Performance Optimizations**
- **Completed**: Input protection throttling, hide attempt scheduling
- **Ongoing**: JavaScript execution optimization, memory management
- **Monitoring**: Comprehensive logging and performance tracking

## Development Environment & Build Process

### Current Workflow
```bash
# Development compilation
npx tsc                              # TypeScript compilation
node esbuild.renderer.js            # Bundle renderer assets
# Manual file copying (HTML, assets)
npx electron dist/main.js           # Launch application
```

### Database Management
- **File**: `snippets.db` (12KB production database)
- **Test Data**: Comprehensive test chains with nested references
- **Backup**: Archive system for safe file operations

### Debugging & Logging
- **System**: Custom logger with multiple levels
- **Location**: Console output + file logging
- **Features**: Performance tracking, error tracking, debug mode

## Code Style & Patterns

### TypeScript Implementation
- **Strict Mode**: Full type safety enabled
- **Interfaces**: Comprehensive type definitions
- **Error Handling**: Try-catch blocks with detailed logging
- **Async/Await**: Modern promise handling throughout

### DOM Manipulation Patterns
```typescript
// Vanilla DOM with TypeScript
const container = document.getElementById('container') as HTMLDivElement;
const box = document.createElement('div');
box.className = 'grid-box';
box.addEventListener('click', () => handleClick());
```

### IPC Communication Pattern
```typescript
// Main Process
ipcMain.handle('api-name', async (event, ...args) => {
  try {
    const result = await businessLogic(...args);
    return result;
  } catch (error) {
    logger.error('Operation failed:', error);
    throw error;
  }
});

// Renderer Process  
const result = await window.api.invoke('api-name', param1, param2);
```

### Database Operation Pattern
```typescript
// Transactional operations
const insertChain = db.prepare(`
  INSERT INTO chains (name, description, options, tags, isPinned, isStarterChain)
  VALUES (?, ?, ?, ?, ?, ?)
`);

try {
  const result = insertChain.run(name, description, JSON.stringify(options), 
                                JSON.stringify(tags), isPinned ? 1 : 0, isStarterChain ? 1 : 0);
  return { id: result.lastInsertRowid, ...chainData };
} catch (error) {
  logger.error('Database operation failed:', error);
  throw error;
}
```

## Testing & Quality Assurance

### Current Testing Approach
- **Manual Testing**: Comprehensive user scenario testing
- **Test Data**: Rich test chains with complex nesting scenarios
- **Logging**: Extensive debug logging for troubleshooting
- **Performance**: Real-time performance monitoring

### Proven Capabilities
- **Complex Chain Processing**: Multi-level recursive chain references
- **User Interaction**: Choice overlays, input prompts, clipboard integration
- **Cross-Application**: Text insertion into external applications
- **Performance**: Sub-50ms response times, smooth animations

## Current Focus Areas

### 1. **Overlay Enhancement (Primary)**
- **Goal**: Make overlay the primary user interface
- **Vision**: "Karen-friendly" UX for non-technical users
- **Phase 1**: Context menus (in progress)
- **Phase 2**: Inline editing capabilities
- **Phase 3**: Visual chain management
- **Phase 4**: Drag-and-drop, guided tutorials

### 2. **Data Integrity**
- **Issue**: Legacy chains missing `isStarterChain` fields
- **Solution**: Migration scripts and data validation
- **Prevention**: Comprehensive database schema validation

### 3. **User Experience Polish**
- **Areas**: Animation smoothing, visual feedback, error handling
- **Goal**: Seamless, delightful user experience
- **Metrics**: <50ms response, 9/10 satisfaction target

## Future Roadmap

### Phase 1: Stabilization (Current)
- Complete overlay context menu system
- Resolve all legacy data issues
- Performance optimization completion
- Comprehensive error handling

### Phase 2: Advanced Features
- AI-powered suggestions
- Pattern learning capabilities
- Advanced chain visualization
- Import/export system enhancement

### Phase 3: Platform Expansion
- Mobile application (React Native)
- Web extension version
- API platform for integrations
- Cloud sync capabilities (optional)

### Phase 4: Enterprise Features
- Team collaboration
- Analytics dashboard
- Admin controls
- Enterprise security features

## Development Philosophy

### Code Organization
- **Separation of Concerns**: Each file <500 lines preferred
- **Type Safety**: Comprehensive TypeScript coverage
- **Error Handling**: Graceful degradation with user feedback
- **Performance**: Profile before optimize, measure improvements

### User-Centric Design
- **Local-First**: All data remains on user's machine
- **Privacy**: No cloud dependency for core features
- **Accessibility**: Keyboard navigation, screen reader support
- **Cross-Platform**: Windows, macOS, Linux compatibility

### Quality Standards
- **Reliability**: Comprehensive error handling and recovery
- **Performance**: <50ms response times, 60fps animations
- **Security**: Context isolation, input validation, secure IPC
- **Maintainability**: Clear code structure, comprehensive documentation

This state of development document will be updated as features are completed and new development phases begin. 