# SnipFlow Project Development Guidelines

## Tech Stack Overview (July 2025 Best Practices)

### Core Technologies

1. **Electron 37.x**
   - Main process: Node.js environment
   - Renderer process: Chromium-based browser environment
   - IPC communication via contextBridge for security

2. **TypeScript 5.x**
   - Strict mode enabled
   - All new code must be properly typed
   - No implicit `any` types

3. **React 19.x**
   - Functional components only (no class components)
   - Hooks for state management and side effects
   - React.StrictMode enabled

4. **Tailwind CSS 4.x**
   - Primary styling solution
   - Use utility classes over inline styles
   - Custom components via @apply directive when needed

### Build Tools

- **esbuild**: Fast bundling for both main and renderer processes
- **PostCSS**: For Tailwind CSS processing
- **TypeScript Compiler**: For type checking (separate from bundling)

## Architecture Principles

### 1. Separation of Concerns

```
src/
├── main/           # Electron main process
├── renderer/       # React UI components
├── overlay/        # Overlay window (vanilla TS)
├── services/       # Shared business logic
├── types/          # TypeScript type definitions
└── styles/         # Global styles and Tailwind
```

### 2. Consistent Styling Approach

- **Primary**: Tailwind CSS utility classes
- **Secondary**: CSS modules for component-specific styles
- **Avoid**: Inline styles except for dynamic values
- **Theme**: Dark mode first, with light mode support

### 3. State Management

- **Local State**: useState for component-specific state
- **Shared State**: Context API for cross-component state
- **Global State**: Consider Zustand if complexity increases
- **Server State**: React Query for API data (if needed)

### 4. IPC Communication Pattern

```typescript
// Main process
ipcMain.handle('channel-name', async (event, ...args) => {
  // Handle request
  return result;
});

// Preload script
contextBridge.exposeInMainWorld('api', {
  methodName: (...args) => ipcRenderer.invoke('channel-name', ...args)
});

// Renderer process
const result = await window.api.methodName(...args);
```

## Coding Standards

### TypeScript

```typescript
// ✅ Good - Explicit types
interface ChainOption {
  id: string;
  title: string;
  body: string;
}

// ❌ Bad - Implicit any
const processChain = (chain) => { ... }

// ✅ Good - Proper typing
const processChain = (chain: Chain): ProcessedChain => { ... }
```

### React Components

```tsx
// ✅ Good - Typed functional component
interface SettingsViewProps {
  onSave: (settings: Settings) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onSave }) => {
  // Component logic
};

// ❌ Bad - Untyped component
function SettingsView(props) {
  // Component logic
}
```

### Styling with Tailwind

```tsx
// ✅ Good - Tailwind utilities
<div className="bg-gray-800 rounded-lg p-4 shadow-lg">

// ❌ Bad - Inline styles
<div style={{ backgroundColor: '#1f2937', borderRadius: '8px' }}>

// ✅ Good - Dynamic styles with Tailwind
<div className={`p-4 ${isActive ? 'bg-blue-500' : 'bg-gray-800'}`}>
```

## File Naming Conventions

- **Components**: PascalCase (e.g., `SettingsView.tsx`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)
- **Types**: PascalCase with `.types.ts` suffix
- **Tests**: Same name with `.test.ts` suffix
- **Styles**: kebab-case (e.g., `overlay-aesthetic.css`)

## Performance Guidelines

1. **Code Splitting**: Use dynamic imports for large components
2. **Memoization**: Use React.memo for expensive components
3. **Virtual Lists**: For lists with many items
4. **Debouncing**: For search and input handlers
5. **Web Workers**: For CPU-intensive operations

## Security Best Practices

1. **Context Isolation**: Always enabled in Electron
2. **Content Security Policy**: Strict CSP headers
3. **Input Validation**: Sanitize all user inputs
4. **No Remote Code**: Avoid eval() and remote script loading
5. **Secure IPC**: Validate all IPC messages

## Testing Strategy

1. **Unit Tests**: Jest for business logic
2. **Component Tests**: React Testing Library
3. **Integration Tests**: Playwright for E2E
4. **Type Checking**: tsc --noEmit in CI

## Version Control

1. **Commit Messages**: Conventional commits format
   - `feat:` New features
   - `fix:` Bug fixes
   - `refactor:` Code refactoring
   - `docs:` Documentation updates
   - `style:` Code style changes
   - `test:` Test updates

2. **Branch Strategy**:
   - `main`: Production-ready code
   - `develop`: Integration branch
   - `feature/*`: New features
   - `fix/*`: Bug fixes

## Dependency Management

1. **Regular Updates**: Check monthly for security updates
2. **Lock Files**: Always commit package-lock.json
3. **Peer Dependencies**: Ensure compatibility
4. **Minimal Dependencies**: Evaluate necessity before adding

## Development Workflow

1. **Local Development**:
   ```bash
   npm run dev  # Start Electron with hot reload
   ```

2. **Type Checking**:
   ```bash
   npm run type-check  # Run TypeScript compiler
   ```

3. **Building**:
   ```bash
   npm run build  # Build for development
   npm run package  # Build for distribution
   ```

## Future Considerations

1. **AI Integration**: Prepare for local LLM integration
2. **Plugin System**: Extensible architecture
3. **Cloud Sync**: Optional user data synchronization
4. **Mobile Companion**: React Native app consideration

## Resources

- [Electron Security Checklist](https://www.electronjs.org/docs/latest/tutorial/security)
- [React 19 Best Practices](https://react.dev/learn)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

Last Updated: July 2025
