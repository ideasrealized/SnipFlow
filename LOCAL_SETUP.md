# Local Development Setup

## Quick Start

1. Clone the repository
2. Run the setup script: `npm run setup` or `node scripts/setup.js`
3. Start development: `pnpm dev` or `npx pnpm dev`

## .npmrc Configuration

For local development, you need to create a `.npmrc` file with offline settings:

```ini
offline=true
prefer-offline=true
```

**Important**: This file is gitignored and should NOT be committed to the repository as it causes Codex to crash when processing tasks.

### Manual Setup (if setup script fails)

```bash
echo "offline=true" >> .npmrc
echo "prefer-offline=true" >> .npmrc
```

### Why This Approach?

- **Local Development**: Offline settings improve performance and reliability
- **Codex Compatibility**: Removing these from the committed repo prevents Codex crashes
- **Best of Both Worlds**: Local developers get offline benefits, Codex gets clean package resolution 