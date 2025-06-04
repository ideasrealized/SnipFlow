# Windows Node.js Development Environment Setup Guide

## 🎯 GOAL: Peak Performance Development Workstation

This guide will set up your Windows machine for optimal Node.js, npm, pnpm, and Electron development.

## 📋 PHASE 1: Core Node.js Installation

### 1.1 Install Node.js via Node Version Manager (NVM)
**Why NVM?** Allows switching between Node.js versions easily.

```powershell
# Install NVM for Windows
# Download from: https://github.com/coreybutler/nvm-windows/releases
# Run nvm-setup.exe as Administrator

# After installation, restart PowerShell and verify:
nvm version

# Install latest LTS Node.js
nvm install lts
nvm use lts

# Verify installation
node --version
npm --version
```

### 1.2 Alternative: Direct Node.js Installation
If you prefer direct installation:
```powershell
# Download from: https://nodejs.org/en/download/
# Choose "Windows Installer (.msi)" - LTS version
# Run as Administrator
# Restart PowerShell after installation
```

## 📋 PHASE 2: Package Manager Setup

### 2.1 Update npm to Latest
```powershell
npm install -g npm@latest
npm --version
```

### 2.2 Install pnpm (Recommended for Monorepos)
```powershell
# Install pnpm globally
npm install -g pnpm

# Verify installation
pnpm --version

# Set pnpm store location (optional, for better performance)
pnpm config set store-dir "C:\pnpm-store"
```

### 2.3 Install Yarn (Optional Alternative)
```powershell
npm install -g yarn
yarn --version
```

## 📋 PHASE 3: System Environment Variables

### 3.1 Critical Path Variables
Open PowerShell as Administrator and run:

```powershell
# Check current PATH
$env:PATH -split ';'

# Add Node.js paths if missing (usually automatic)
# These should be present:
# C:\Program Files\nodejs\
# %APPDATA%\npm
# %LOCALAPPDATA%\pnpm
```

### 3.2 Set Development Environment Variables
```powershell
# Set NODE_ENV for development
[Environment]::SetEnvironmentVariable("NODE_ENV", "development", "User")

# Set npm cache location (optional, for better performance)
[Environment]::SetEnvironmentVariable("NPM_CONFIG_CACHE", "C:\npm-cache", "User")

# Set pnpm home (if using pnpm)
[Environment]::SetEnvironmentVariable("PNPM_HOME", "$env:LOCALAPPDATA\pnpm", "User")
```

### 3.3 PowerShell Execution Policy
```powershell
# Allow script execution (run as Administrator)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Verify
Get-ExecutionPolicy -List
```

## 📋 PHASE 4: Global Development Tools

### 4.1 Essential Global Packages
```powershell
# TypeScript and build tools
npm install -g typescript
npm install -g ts-node
npm install -g nodemon

# Electron development
npm install -g electron
npm install -g electron-builder

# Utility tools
npm install -g rimraf
npm install -g cross-env
npm install -g concurrently

# Verify installations
tsc --version
electron --version
```

### 4.2 Optional Development Tools
```powershell
# Code quality tools
npm install -g eslint
npm install -g prettier
npm install -g @typescript-eslint/parser

# Testing tools
npm install -g mocha
npm install -g jest

# Package management utilities
npm install -g npm-check-updates
npm install -g depcheck
```

## 📋 PHASE 5: Windows-Specific Optimizations

### 5.1 Windows Build Tools
```powershell
# Install Windows Build Tools (for native modules)
npm install -g windows-build-tools

# Alternative: Install Visual Studio Build Tools manually
# Download from: https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022
```

### 5.2 Python for Node-gyp
```powershell
# Install Python (required for some native modules)
# Download from: https://www.python.org/downloads/
# Ensure "Add Python to PATH" is checked during installation

# Verify Python installation
py --version
```

### 5.3 Git Configuration
```powershell
# Configure Git for Windows line endings
git config --global core.autocrlf true
git config --global core.eol lf

# Set default branch name
git config --global init.defaultBranch main
```

## 📋 PHASE 6: Performance Optimizations

### 6.1 npm Configuration
```powershell
# Set npm registry (use fastest mirror)
npm config set registry https://registry.npmjs.org/

# Increase npm timeout for slow connections
npm config set timeout 60000

# Set npm cache location
npm config set cache "C:\npm-cache"

# Enable npm audit fix
npm config set audit-level moderate
```

### 6.2 pnpm Configuration
```powershell
# Set pnpm store location for better performance
pnpm config set store-dir "C:\pnpm-store"

# Enable shamefully-hoist for compatibility
pnpm config set shamefully-hoist true

# Set network timeout
pnpm config set network-timeout 60000
```

### 6.3 Windows Defender Exclusions
Add these folders to Windows Defender exclusions for better performance:
- `C:\Program Files\nodejs\`
- `%APPDATA%\npm`
- `%LOCALAPPDATA%\pnpm`
- `C:\npm-cache`
- `C:\pnpm-store`
- Your development projects folder (e.g., `C:\dev\`)

## 📋 PHASE 7: Verification & Testing

### 7.1 Verify All Installations
```powershell
# Core tools
node --version
npm --version
pnpm --version
py --version

# Development tools
tsc --version
electron --version
git --version

# Check global packages
npm list -g --depth=0
pnpm list -g --depth=0
```

### 7.2 Test Package Manager Commands
```powershell
# Test npm
cd C:\temp
mkdir test-npm
cd test-npm
npm init -y
npm install lodash
npm uninstall lodash
cd ..
rmdir test-npm /s

# Test pnpm
mkdir test-pnpm
cd test-pnpm
pnpm init
pnpm add lodash
pnpm remove lodash
cd ..
rmdir test-pnpm /s
```

## 📋 PHASE 8: SnipFlow-Specific Setup

### 8.1 Project Dependencies
```powershell
# Navigate to SnipFlow project
cd C:\dev\SnipFlow

# Install root dependencies
npm install
# OR if using pnpm:
pnpm install

# Navigate to desktop package
cd packages\desktop

# Install desktop dependencies
npm install
# OR:
pnpm install
```

### 8.2 Verify SnipFlow Launch
```powershell
# From packages\desktop directory
npm run dev
# OR:
pnpm run dev

# Alternative launch methods:
npm start
pnpm start
npx electron .
```

## 🚨 TROUBLESHOOTING COMMON ISSUES

### Issue: "Missing script: start"
**Solution**: You're in the wrong directory
```powershell
# Check current location
Get-Location

# Navigate to correct directory
cd packages\desktop

# Verify package.json exists
Test-Path package.json
```

### Issue: "Cannot find module 'better-sqlite3'"
**Solution**: Rebuild native modules
```powershell
npm rebuild
# OR:
pnpm rebuild
```

### Issue: Permission Denied
**Solution**: Run PowerShell as Administrator
```powershell
# Check if running as admin
[Security.Principal.WindowsIdentity]::GetCurrent().Groups -contains 'S-1-5-32-544'
```

### Issue: Path not found
**Solution**: Restart PowerShell after installations
```powershell
# Refresh environment variables
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")
```

## 📋 QUICK REFERENCE COMMANDS

### Package Manager Commands
```powershell
# npm
npm install          # Install dependencies
npm run <script>     # Run package.json script
npm list -g         # List global packages

# pnpm (faster, more efficient)
pnpm install        # Install dependencies
pnpm run <script>   # Run package.json script
pnpm list -g        # List global packages

# npx (run packages without installing)
npx <package>       # Run package directly
npx electron .      # Run electron directly
```

### Development Workflow
```powershell
# Standard workflow
cd C:\dev\SnipFlow\packages\desktop
pnpm install
pnpm run dev

# Alternative workflow
cd C:\dev\SnipFlow\packages\desktop
npm install
npm start
```

## ✅ SUCCESS CRITERIA

After completing this setup, you should be able to:
- [x] Run `node --version` and get a version number
- [x] Run `npm --version` and get a version number  
- [x] Run `pnpm --version` and get a version number
- [x] Navigate to any Node.js project and run `npm install`
- [x] Use `npx` to run packages without installing
- [x] Launch SnipFlow with `pnpm run dev` from `packages\desktop`
- [x] Switch between Node.js versions with `nvm` (if installed)

---
**Estimated Setup Time**: 30-45 minutes  
**Difficulty**: Intermediate  
**Prerequisites**: Windows 10/11, Administrator access  
**Next Step**: Launch SnipFlow and test overlay positioning 