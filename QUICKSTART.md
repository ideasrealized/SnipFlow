# SnipFlow Quick Start Guide

## For Developers

### Prerequisites
- Node.js v20+ 
- pnpm v8+
- Git

### Setup Development Environment
```bash
# Clone the repository
git clone https://github.com/ideasrealized/SnipFlow.git
cd SnipFlow

# Install dependencies
pnpm install

# Build and run the desktop app
cd packages/desktop
pnpm dev
```

### Create Your First Executable
```bash
# In packages/desktop directory
pnpm run package

# The executable will be in ../../dist/
# - Windows: SnipFlow Setup 0.1.0.exe
# - macOS: SnipFlow-0.1.0.dmg
# - Linux: SnipFlow-0.1.0.AppImage
```

## For Alpha Testers

### Installation

#### Windows
1. Download `SnipFlow Setup 0.1.0.exe`
2. Double-click to install
3. If Windows Defender warns about unknown publisher, click "More info" → "Run anyway"
4. Follow the installer prompts
5. Launch SnipFlow from Start Menu or Desktop

#### macOS
1. Download `SnipFlow-0.1.0.dmg`
2. Double-click to mount
3. Drag SnipFlow to Applications folder
4. First launch: Right-click → Open (to bypass Gatekeeper)
5. Add to Dock for easy access

#### Linux
1. Download `SnipFlow-0.1.0.AppImage`
2. Make executable: `chmod +x SnipFlow-0.1.0.AppImage`
3. Double-click or run `./SnipFlow-0.1.0.AppImage`

### First Use

1. **Create Your First Snippet**
   - Click "Add New Snippet"
   - Type your text (e.g., "Thanks for reaching out!")
   - Press Enter or click "Add Snippet"

2. **Use a Snippet**
   - Click on any snippet to copy it
   - Or hover over screen edge to show overlay
   - Click snippet in overlay to insert

3. **Create a Chain (Advanced)**
   - Click "Open New Chain Manager"
   - Name your chain (e.g., "Email Response")
   - Add text nodes with placeholders
   - Save and use from overlay

### Keyboard Shortcuts
- `Ctrl+Shift+S` - Show/hide main window
- `Esc` - Close overlay
- `Click` - Copy snippet
- `Double-click` - Copy and paste snippet

### Known Issues (Alpha)
- App may take 3-5 seconds to start first time
- Overlay might not appear on some multi-monitor setups
- Some animations may be choppy
- No auto-update yet (check GitHub for new versions)

### Reporting Issues

Please report bugs with:
1. What you were trying to do
2. What happened instead
3. Your OS and version
4. Screenshots if possible

Report at: https://github.com/ideasrealized/SnipFlow/issues

### Providing Feedback

We'd love to hear:
- What features you use most
- What's confusing or hard to use
- What features you'd like to see
- Any crashes or errors

Email: feedback@snipflow.app (coming soon)
Discord: [Join our community](#) (coming soon)

## Features to Try

### Basic
- [ ] Create 5+ snippets
- [ ] Use edge hover to access snippets
- [ ] Copy/paste from clipboard history
- [ ] Switch between dark/light theme

### Advanced
- [ ] Create a chain with multiple options
- [ ] Use placeholders ([?]) in chains
- [ ] Import/export snippets (coming soon)
- [ ] Set custom hotkeys (coming soon)

## Troubleshooting

### App Won't Start
```bash
# Windows
Check Event Viewer for errors
Try running as Administrator

# macOS
Open Console.app and check for SnipFlow errors
Try from Terminal: /Applications/SnipFlow.app/Contents/MacOS/SnipFlow

# Linux
Run from terminal to see errors: ./SnipFlow-0.1.0.AppImage
Check ~/.config/SnipFlow/logs/
```

### Database Errors
- Location: `%APPDATA%/SnipFlow` (Windows) or `~/.config/SnipFlow` (Mac/Linux)
- Delete `snipflow.db` to reset (loses all data!)

### Overlay Not Working
- Check if other apps are in fullscreen mode
- Try restarting SnipFlow
- Ensure accessibility permissions granted (macOS)

## Development Status

Current version: **0.1.0-alpha**

✅ Working:
- Basic snippet management
- Clipboard monitoring
- Edge-activated overlay
- Chain system basics
- Cross-platform support

🚧 In Progress:
- Auto-updates
- Cloud sync
- AI features
- Advanced chains
- Better UI/UX

## Thank You!

Thanks for being an early tester! Your feedback shapes SnipFlow's future. We're building this for you, so every suggestion matters.

**Remember**: This is alpha software. Save your work often and expect some rough edges. But also expect rapid improvements - we're pushing updates weekly!

Happy Snipping! 🚀
