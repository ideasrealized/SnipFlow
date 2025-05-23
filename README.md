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

This will be a monorepo workspace managed with pnpm:

```
snipflow/
├── packages/
│   ├── desktop/     # Electron desktop application (planned)
│   ├── core/        # Rust native modules (planned)
│   └── shared/      # Shared types and utilities (planned)
├── package.json     # Workspace configuration (to be added)
└── README.md
```

## Getting Started

### Prerequisites

⚠️ **Development Environment Setup Required**

Before proceeding with development, you need:

- Node.js (v20.x LTS or higher) - **Not yet installed**
- pnpm (v8.0.0 or higher) - **To be installed after Node.js**

### Next Steps

1. Install Node.js from [nodejs.org](https://nodejs.org/)
2. Install pnpm: `npm install -g pnpm`
3. Initialize workspace: `pnpm init`
4. Add package.json workspace configuration

### Development

Development commands will be added once the Node.js environment is set up.

## Development Status

🚧 **Early Development Phase** - Basic repository structure initialized.

**Current Status:**
- ✅ Git repository initialized
- ✅ Basic project structure created
- ⏳ Node.js environment setup required
- ⏳ Workspace configuration pending

See [snipflow-dev-setup.md](./snipflow-dev-setup.md) for detailed development roadmap and setup instructions.

## Contributing

Contributions are welcome! Please read our contributing guidelines (coming soon) before submitting PRs.

## License

MIT License - see LICENSE file for details.

## Support

For questions and support, please open an issue on GitHub. 