# SnipFlow Advanced Agent Context Prompt

## About This Codebase

You are working with **SnipFlow**, an intelligent text productivity engine built as an Electron desktop application. This is a sophisticated, production-ready codebase with advanced features and complex architecture. Understanding the following context is crucial for effective development work.

## Technology Stack & Architecture

### Core Technologies
- **Runtime**: Electron (Node.js + Chromium) with TypeScript
- **Frontend**: Vanilla DOM manipulation (NO React/Vue/Angular)
- **Database**: SQLite with better-sqlite3 (local-first approach)
- **Build System**: TypeScript compiler + esbuild + electron-builder
- **Package Management**: pnpm workspaces (monorepo structure)

### Critical Architectural Decisions
1. **No Frontend Framework**: Uses vanilla TypeScript with direct DOM manipulation for performance
2. **Local-First**: All data stored locally in SQLite, no cloud dependencies
3. **Security-First**: Context isolation, disabled node integration, secure IPC
4. **Performance-Critical**: Sub-50ms response times, 60fps animations

## Project Structure Deep Dive

```
snipflow/
├── packages/desktop/src/
│   ├── main.ts                     # Electron main process (1532 lines)
│   │   ├── Edge hover detection system
│   │   ├── Window management (main + overlay)
│   │   ├── IPC handlers (20+ secure endpoints)
│   │   ├── Mouse tracking with performance optimizations
│   │   └── System tray integration
│   │
│   ├── overlay.ts                  # Overlay renderer (1511 lines)
│   │   ├── Floating grid interface
│   │   ├── Chain processing engine
│   │   ├── Context menu system
│   │   ├── Choice/input providers
│   │   └── Real-time content rendering
│   │
│   ├── db.ts                      # Database layer (850 lines)
│   │   ├── SQLite operations with better-sqlite3
│   │   ├── Transaction management
│   │   ├── Migration system
│   │   └── Data validation
│   │
│   ├── types.ts                   # TypeScript definitions (204 lines)
│   │   ├── Complete interface definitions
│   │   ├── IPC communication types
│   │   └── Database schema types
│   │
│   └── services/                  # Business logic modules
       └── chainService.ts         # Chain processing engine
```

## Core Features & Implementation Status

### ✅ PRODUCTION-READY FEATURES

#### 1. Edge Hover Overlay System
**Location**: `main.ts` lines 80-268, `overlay.ts` (complete file)

**Advanced Capabilities**:
- **6-zone edge detection**: top-left, top-right, bottom-left, bottom-right, left-center, right-center
- **State machine**: `hidden` → `showing` → `visible` → `hiding` → `hidden`
- **Performance optimizations**: 
  - Throttled input pending checks (100ms intervals)
  - Hide attempt scheduling flags to prevent spam
  - Mouse movement restoration for cursor position
- **Multi-monitor awareness**: Automatic positioning based on display workarea
- **Configurable trigger zones**: Size and delay customization

#### 2. Advanced Chain System with Recursive Linking
**Location**: `overlay.ts` `processPlaceholders()` function, `services/chainService.ts`

**Breakthrough Innovation**:
```typescript
// Chain references: [Chain:ChainName]
// User inputs: [?:prompt text]
// Multi-level nesting support (tested up to 4 levels deep)

// Example: Chain A → Chain B → Chain C → User Input → Final Result
"What [Chain:Machine]. awer [Chain:Hi]" 
→ Ice Maker option selected
→ "ICEMAKER [Chain:Your mom]"
→ User input "[?:The Truth Teller]" 
→ Final: "What ICEMAKER Who is the truth teller?. awer The Cake"
```

**Technical Implementation**:
- Recursive `processPlaceholders()` function
- Choice overlays for multi-option chains
- Async/await pattern with proper error handling
- Integration with existing `presentChoice()` and `presentInput()` functions

#### 3. Database Architecture
**Schema Design**:
```sql
-- Chains (primary feature)
CREATE TABLE chains (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  options TEXT,        -- JSON: ChainOption[]
  tags TEXT,           -- JSON: string[]
  layoutData TEXT,     -- JSON: future visualization data
  isPinned BOOLEAN DEFAULT 0,
  isStarterChain BOOLEAN DEFAULT 0,  -- NEW: overlay starter section
  autoExecute INTEGER DEFAULT 0,
  lastExecuted INTEGER,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Clipboard history
CREATE TABLE clipboard_history (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  pinned INTEGER DEFAULT 0
);

-- Settings persistence
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT
);
```

## Critical Code Patterns

### 1. IPC Communication Pattern
```typescript
// Main Process (main.ts)
ipcMain.handle('api-endpoint', async (event, ...args) => {
  try {
    const result = await businessLogic(...args);
    logger.info('[main.ts] Operation success:', result);
    return result;
  } catch (error) {
    logger.error('[main.ts] Operation failed:', error);
    throw error;
  }
});

// Renderer Process (overlay.ts, renderer.ts)
const result = await window.api.invoke('api-endpoint', param1, param2);
```

### 2. DOM Manipulation Pattern
```typescript
// Vanilla TypeScript approach (NO React)
const container = document.getElementById('container') as HTMLDivElement;
const gridBox = document.createElement('div');
gridBox.className = 'grid-box';
gridBox.addEventListener('click', () => handleClick());

// Dynamic content rendering
function renderChains(chains: Chain[]) {
  chainsGrid.innerHTML = ''; // Clear existing
  chains.forEach(chain => {
    const box = createGridBox(chain.name, chain.description, '', () => handleChainSelect(chain), chain);
    chainsGrid.appendChild(box);
  });
}
```

### 3. Database Operation Pattern
```typescript
// Prepared statements for performance
const insertChain = db.prepare(`
  INSERT INTO chains (name, description, options, tags, isPinned, isStarterChain)
  VALUES (?, ?, ?, ?, ?, ?)
`);

try {
  const result = insertChain.run(
    name, 
    description, 
    JSON.stringify(options),
    JSON.stringify(tags),
    isPinned ? 1 : 0,
    isStarterChain ? 1 : 0
  );
  return { id: result.lastInsertRowid, ...chainData };
} catch (error) {
  logger.error('[db.ts] Insert failed:', error);
  throw error;
}
```

### 4. Chain Processing Pattern
```typescript
// Recursive placeholder processing
async function processPlaceholders(content: string): Promise<string> {
  // Process [Chain:ChainName] references
  const chainRegex = /\[Chain:([^\]]+)\]/g;
  let match;
  let result = content;
  
  while ((match = chainRegex.exec(content)) !== null) {
    const chainName = match[1];
    const chain = await api.getChainByName(chainName);
    
    if (chain) {
      if (chain.options.length > 1) {
        // Show choice overlay
        const selection = await presentChoice(question, choices);
        result = result.replace(match[0], selection);
      } else {
        // Single option - direct replacement
        const processedContent = await processPlaceholders(chain.options[0].body);
        result = result.replace(match[0], processedContent);
      }
    }
  }
  
  // Process [?:prompt] user inputs
  const inputRegex = /\[\\?:([^\]]+)\]/g;
  // ... similar processing pattern
  
  return result;
}
```

## Development Environment

### Build Process
```bash
# Current manual build workflow (no automated scripts)
npx tsc                              # TypeScript compilation
node esbuild.renderer.js            # Bundle renderer assets  
# Manual file copying for HTML/CSS assets
npx electron dist/main.js           # Launch application
```

### Debug Environment
- **Logging**: Custom logger with performance tracking
- **Database**: `snippets.db` (12KB with test data)
- **Test Data**: Complex nested chain references for testing
- **Performance Monitoring**: Sub-50ms response time tracking

### Critical Files by Priority
1. `main.ts` - Core Electron process, IPC handlers, window management
2. `overlay.ts` - User interface, chain processing, DOM rendering  
3. `db.ts` - Database operations, data persistence
4. `types.ts` - TypeScript definitions, interfaces
5. `preload.ts` - Secure IPC bridge

## Current Development Focus

### Phase 1: Overlay Enhancement (Active)
**Goal**: Transform overlay into primary user interface for "Karen-friendly" UX

**In Progress**:
- Context menu system for chains (right-click functionality)
- Quick edit capabilities
- Chain management from overlay

**Planned**:
- Inline editing with live preview
- Visual chain creation tools
- Drag-and-drop functionality
- Guided tutorials for non-technical users

### Known Issues & Technical Debt
1. **Legacy Data**: Some chains missing `isStarterChain` field (requires migration)
2. **Performance**: Occasional terminal spam during mouse tracking (optimized but monitoring)
3. **UX Polish**: Animation smoothing, error feedback improvements needed

### Performance Requirements
- **Overlay activation**: <50ms from edge hover to visible
- **Chain processing**: <100ms for complex recursive chains
- **Database operations**: <10ms for typical queries
- **Memory usage**: <100MB total application footprint

## Development Philosophy & Standards

### Code Quality Standards
1. **File Size Limit**: Prefer <500 lines per file, refactor when approaching limit
2. **Type Safety**: 100% TypeScript coverage, no `any` types
3. **Error Handling**: Comprehensive try-catch with detailed logging
4. **Performance**: Profile before optimize, measure improvements
5. **Security**: Validate all inputs, secure IPC, context isolation

### User Experience Principles
1. **Local-First**: All data remains on user's machine
2. **Privacy**: No cloud dependencies for core features  
3. **Performance**: Instant response feel (<50ms perceived latency)
4. **Reliability**: Graceful degradation, never lose user data
5. **Accessibility**: Support keyboard navigation, screen readers

### Architecture Patterns
1. **Separation of Concerns**: Clear boundaries between UI, business logic, data
2. **Event-Driven**: IPC communication, DOM events, async patterns
3. **Immutable Data**: Database as source of truth, UI reflects state
4. **Error Boundaries**: Isolated error handling, graceful recovery
5. **Progressive Enhancement**: Core functionality always available

## Working With This Codebase

### When Making Changes
1. **Review existing patterns** before implementing new functionality
2. **Use TypeScript interfaces** defined in `types.ts`
3. **Follow IPC security model** - validate inputs, handle errors
4. **Test with complex chains** - use existing test data for validation
5. **Monitor performance** - overlay must remain responsive
6. **Update documentation** as features are implemented

### Key Development Commands
```bash
# Check TypeScript compilation
npx tsc --noEmit

# Build and test
npx tsc && node esbuild.renderer.js && npx electron dist/main.js

# Database operations
node -e "require('./dist/test-data-setup.js').setupTestData()"
```

This codebase represents a sophisticated desktop application with production-ready features, advanced TypeScript architecture, and performance-optimized implementations. The chain system with recursive linking is a breakthrough innovation in text productivity tools.
