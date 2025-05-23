# 🤖 Codex Development Instructions

## Project Context

You're working on SnipFlow, an intelligent text productivity engine. Read VISION.md for the full concept. The goal is to make typing feel like art through beautiful interfaces and smart automation.

## Current State

- ✅ Basic Electron app with snippet CRUD
- ✅ Overlay system with mouse activation  
- ✅ SQLite storage
- 🔄 Implementing chain system (branching workflows)
- 📋 Next: Clipboard history, themes, animations

## Development Guidelines

### Code Style
- TypeScript for all new code
- Functional components with React hooks
- Descriptive variable names
- Comments for complex logic

### Architecture Patterns
- Services for business logic (keep out of components)
- IPC for all main/renderer communication
- Events for loose coupling
- SQLite for all persistent storage

### UI/UX Principles
- **Fluid**: Smooth animations (60fps)
- **Beautiful**: Gradients, subtle shadows, particle effects
- **Responsive**: <50ms reaction time
- **Intuitive**: Discoverable without documentation

### Testing Approach
- Unit tests for services
- Integration tests for IPC
- Manual testing for UI (no e2e in Codex)

## Common Tasks

### Adding a New Feature
1. Create service in `src/services/`
2. Add IPC handlers in `src/main/ipc.ts`
3. Expose through preload
4. Build UI in renderer
5. Add tests

### Working with Chains
Chains are the core innovation. They allow branching text workflows:
```
Start → Choice → Result
         ├→ Option A → Text A
         └→ Option B → Text B
```

### Database Migrations
When adding tables:
1. Add CREATE TABLE in db initialization
2. Handle migration for existing users
3. Update types in shared/

## Codex Environment Notes

- No internet after setup
- Limited to included dependencies
- Use console.log for debugging
- Focus on logic over perfect UI
- Test with `pnpm test` when possible

## Current Priorities

1. **Chain System**: Get basic chain building working
2. **Visual Polish**: Add animations to overlay
3. **Clipboard History**: Monitor and store clipboard
4. **Theme System**: Dark/light mode toggle
5. **Analytics**: Usage tracking (privacy-first)

## Key Files

- `packages/desktop/src/main.ts` - Entry point
- `packages/desktop/src/services/` - Business logic
- `packages/desktop/src/renderer/App.tsx` - Main UI
- `packages/desktop/src/overlay.ts` - Overlay window

## Performance Targets

- Overlay appears in <50ms
- Search results in <100ms  
- No UI freezing ever
- Memory usage <150MB

## Remember

This isn't just a utility - it's meant to make typing feel magical. Every feature should delight users and make their work feel more like art.

When in doubt, prioritize:
1. User experience over features
2. Performance over complexity
3. Beauty over boring
4. Local over cloud