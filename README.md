# SnipFlow

**Intelligent text productivity engine that revolutionizes how people work with repetitive text through dynamic snippets and AI-powered automation.**

## Overview

SnipFlow goes beyond traditional text expanders by introducing "chains" - branching text workflows that adapt to different scenarios, presenting users with contextual options and custom inputs at insertion time. Think of it as having a smart assistant that not only remembers your common text patterns but understands when and how to use them based on your current context.

## Key Features

- **Dynamic Chains**: Branching text workflows that adapt to different scenarios
- **AI-Powered Automation**: Context-aware text generation and optimization
- **Cross-Platform Desktop App**: Works across all your programs
- **Local-First Privacy**: Local storage with optional AI features
- **Edge-Activated Overlays**: Lightning-fast access with customizable hotkeys
- **Clipboard Monitoring**: Intelligent tracking and suggestions
- **Predictive Text**: AI-driven context suggestions

## Project Structure

This is a monorepo workspace managed with pnpm:

```
snipflow/
├── packages/
│   ├── desktop/     # Electron desktop application
│   │   ├── src/
│   │   │   ├── main/      # Electron main process
│   │   │   ├── renderer/  # React frontend
│   │   │   └── preload/   # Preload scripts
│   │   └── package.json
│   ├── core/        # Rust native modules
│   │   ├── src/
│   │   └── package.json
│   └── shared/      # Shared types and utilities
│       ├── src/
│       │   ├── types/
│       │   └── utils/
│       └── package.json
├── scripts/         # Development scripts
├── package.json     # Workspace configuration
├── pnpm-workspace.yaml
├── tsconfig.json
├── .eslintrc.cjs
└── README.md
```

## Getting Started

### Prerequisites

✅ **Development Environment Ready**

- Node.js v22.16.0 ✅
- pnpm v10.11.0 ✅

### Installation

```bash
# Clone the repository
git clone https://github.com/ideasrealized/SnipFlow.git
cd SnipFlow

# Install dependencies
pnpm install

# Run setup script (optional - verifies environment)
pnpm setup
```

### Development Commands

```bash
# Start the Electron desktop app
pnpm start:desktop

# Start development mode for desktop app
pnpm dev:desktop

# Build the desktop app
pnpm build:desktop

# Start development servers for all packages
pnpm dev

# Build all packages
pnpm build

# Run type checking
pnpm type-check

# Run linting
pnpm lint

# Format code
pnpm format

# Clean build artifacts
pnpm clean
```

### Package-Specific Development

```bash
# Work on desktop app
cd packages/desktop
pnpm dev          # Compile and start Electron app
pnpm start        # Same as dev
pnpm build        # Compile TypeScript only
pnpm package      # Build and package with electron-builder

# Work on shared utilities
cd packages/shared
pnpm dev

# Work on core modules
cd packages/core
pnpm build
```

## Features Currently Available

🚀 **Electron Desktop App (Functional)**
- ✅ Basic snippet management (CRUD operations)
- ✅ SQLite database with better-sqlite3
- ✅ Global hotkey support (Ctrl+Shift+S)
- ✅ IPC communication between main and renderer
- ✅ TypeScript compilation and development workflow
- ✅ Window management and system tray integration

## Development Status

🎉 **Electron App Ready for Development** - Fully functional foundation!

**Current Status:**
- ✅ Git repository initialized
- ✅ Node.js v22.16.0 installed
- ✅ pnpm v10.11.0 installed
- ✅ Monorepo structure created
- ✅ TypeScript configuration
- ✅ ESLint and Prettier setup
- ✅ Package dependencies installed
- ✅ Development scripts configured
- ✅ **Electron app functional with better-sqlite3**
- ✅ **SQLite database operations working**
- ✅ **Global hotkeys and IPC communication**
- 🔄 Ready for advanced features and UI development
- 🔄 Ready for Rust native modules
- 🔄 Ready for shared utilities expansion

See [snipflow-dev-setup.md](./snipflow-dev-setup.md) for detailed development roadmap and setup instructions.

## Contributing

Contributions are welcome! Please read our contributing guidelines (coming soon) before submitting PRs.

## License

MIT License - see LICENSE file for details.

## Support

For questions and support, please open an issue on GitHub. 