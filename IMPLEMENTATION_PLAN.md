# SnipFlow Implementation Plan - Path to Executable

## Quick Start (Next 72 Hours)

### Day 1: Core Fixes & Build Setup
**Goal**: Get a working executable that can be shared

1. **Morning (4 hours)**
   - [ ] Update package.json with build configuration
   - [ ] Create placeholder icons (can be refined later)
   - [ ] Fix the most critical bugs preventing normal operation
   - [ ] Test core functionality end-to-end

2. **Afternoon (4 hours)**
   - [ ] Set up electron-builder properly in package.json
   - [ ] Create first Windows executable
   - [ ] Test installation on clean Windows machine
   - [ ] Document any installation issues

### Day 2: Cross-Platform & Stability
**Goal**: Ensure app works reliably across platforms

1. **Morning (4 hours)**
   - [ ] Set up GitHub Actions for automated builds
   - [ ] Configure macOS build (if Mac available)
   - [ ] Configure Linux AppImage build
   - [ ] Test all executables

2. **Afternoon (4 hours)**
   - [ ] Implement crash reporting (Sentry or similar)
   - [ ] Add proper error boundaries in React
   - [ ] Fix UI consistency issues
   - [ ] Add loading states for all async operations

### Day 3: Polish & Alpha Release
**Goal**: Create first shareable alpha version

1. **Morning (4 hours)**
   - [ ] Create simple onboarding flow
   - [ ] Add in-app update checker
   - [ ] Write quick start guide
   - [ ] Set up feedback collection

2. **Afternoon (4 hours)**
   - [ ] Create GitHub release with all platforms
   - [ ] Set up download page
   - [ ] Send to 5-10 early testers
   - [ ] Monitor feedback channels

## Executable Creation Commands

### Build for Current Platform
```bash
cd packages/desktop
pnpm run package
```

### Build for All Platforms
```bash
cd packages/desktop
# Windows (on Windows)
pnpm run package:win

# macOS (on macOS)
pnpm run package:mac

# Linux (on any platform)
pnpm run package:linux
```

### Create Release
```bash
# After building, files will be in dist/
# Upload to GitHub releases or your distribution platform
```

## Modified package.json Scripts

Add these to `packages/desktop/package.json`:

```json
{
  "scripts": {
    "package": "pnpm run build && electron-builder",
    "package:win": "pnpm run build && electron-builder --win",
    "package:mac": "pnpm run build && electron-builder --mac",
    "package:linux": "pnpm run build && electron-builder --linux",
    "package:all": "pnpm run build && electron-builder -mwl",
    "dist": "electron-builder",
    "postinstall": "electron-builder install-app-deps"
  },
  "build": {
    "extends": "./electron-builder.yml"
  }
}
```

## Icon Requirements

Create these files in `packages/desktop/build/`:

1. **Windows**: `icon.ico` (256x256)
2. **macOS**: `icon.icns` (512x512)
3. **Linux**: `icon.png` (512x512)

Use a tool like https://www.electronforge.io/asset-pipeline to generate from a single source.

## Quick Icon Creation
```bash
# Install icon generator
npm install -g electron-icon-maker

# Generate from a 1024x1024 PNG
electron-icon-maker --input=icon.png --output=./build
```

## Alpha Distribution Checklist

### Before First Release
- [ ] App starts without errors
- [ ] Basic CRUD operations work
- [ ] No console errors in production build
- [ ] Installer completes successfully
- [ ] App launches after installation
- [ ] Basic documentation exists

### Nice to Have (Can Wait)
- [ ] Code signing (expensive, not needed for alpha)
- [ ] Auto-updates (can add in beta)
- [ ] Perfect UI (iterate based on feedback)
- [ ] All features (focus on core functionality)

## Testing Executable

### Windows
1. Run installer
2. Check Start Menu entry
3. Check Desktop shortcut
4. Verify uninstaller works

### macOS
1. Open DMG
2. Drag to Applications
3. Verify Gatekeeper warning (unsigned)
4. Check dock integration

### Linux
1. Make AppImage executable: `chmod +x SnipFlow.AppImage`
2. Run: `./SnipFlow.AppImage`
3. Check desktop integration

## Common Issues & Solutions

### Issue: Native modules not working
```bash
cd packages/desktop
pnpm run rebuild
# or
npx electron-rebuild -w better-sqlite3
```

### Issue: Build fails with module errors
```bash
# Clear everything and rebuild
cd packages/desktop
rm -rf node_modules dist
pnpm install
pnpm run build
pnpm run package
```

### Issue: Icons not showing
- Ensure icons are in `build/` directory
- Check electron-builder.yml paths
- Verify icon formats are correct

## Distribution Strategy

### Week 1: Friends & Family Alpha
- 10-20 testers
- Direct download links
- Email/Discord for feedback
- Daily updates

### Week 2-3: Private Beta
- 50-100 testers
- GitHub releases page
- In-app feedback form
- Update every 2-3 days

### Week 4+: Public Beta
- Open GitHub releases
- Website with download buttons
- Auto-update system
- Community forum

## Success Metrics for Alpha

- [ ] 10+ successful installations
- [ ] 5+ hours usage without crashes
- [ ] 3+ positive feedback responses
- [ ] 10+ bugs discovered and logged
- [ ] 1+ feature request from users

## Next Steps After Executable

1. **Immediate** (Week 1)
   - Monitor crash reports
   - Fix critical bugs
   - Improve first-run experience

2. **Short-term** (Week 2-4)
   - Add auto-updater
   - Implement telemetry
   - Polish UI based on feedback

3. **Medium-term** (Month 2-3)
   - Add premium features
   - Set up payment system
   - Launch marketing site

Remember: **Ship early, ship often**. It's better to have a basic working executable in users' hands than a perfect app that never ships.
