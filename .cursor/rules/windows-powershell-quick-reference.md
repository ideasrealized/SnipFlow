# Windows PowerShell Development Quick Reference

## 🚨 CRITICAL REMINDERS 🚨

### PowerShell Command Syntax
- ❌ **NEVER USE `&&`** - PowerShell doesn't support bash-style command chaining
- ✅ **USE SEMICOLONS**: `cd packages/desktop; node script.js`
- ✅ **USE SEPARATE COMMANDS**: Run one command at a time
- ✅ **USE PIPELINES**: `Get-Process | Where-Object {$_.Name -eq "node"}`

### Language/Runtime Commands
- ✅ **Python**: Use `py` instead of `python`
- ✅ **NPM/Node**: Use `npx` for most npm executables
- ✅ **Node**: Use `node` directly
- ✅ **PowerShell**: Native cmdlets work best

### 🔍 VERIFICATION RULES (CRITICAL)
- ❌ **NEVER ASSUME** a process has launched until confirmed
- ❌ **NEVER ASSUME** a fix/patch has worked until user testing confirms
- ✅ **ALWAYS VERIFY** with explicit confirmation (process list, user testing, visible UI)
- ✅ **WAIT FOR CONFIRMATION** before proceeding to next steps
- ✅ **ASK USER** to verify when uncertain about process status

#### Examples of Proper Verification
```powershell
# ❌ WRONG: Assuming app launched
npm start
# Proceeding immediately without confirmation...

# ✅ CORRECT: Verify process launched
npm start
# Then: "Please confirm the SnipFlow app window is visible"
# Or: Get-Process | Where-Object {$_.Name -like "*electron*"}

# ❌ WRONG: Assuming fix worked
npm rebuild better-sqlite3
# Proceeding immediately without testing...

# ✅ CORRECT: Verify fix worked
npm rebuild better-sqlite3
# Then: Run test script and confirm success
# Then: Ask user to verify functionality works
```

## 📁 File System Patterns

### Path Separators
- Windows uses `\` but most tools accept `/`
- PowerShell paths: `C:\dev\SnipFlow\packages\desktop`
- Cross-platform paths in Node: `path.join()`

### Common Directories
- **User Home**: `$env:USERPROFILE` or `~`
- **AppData**: `$env:APPDATA` 
- **Electron Data**: `%APPDATA%\Electron\.snipflow\`
- **Project Root**: `/c%3A/dev/SnipFlow` (URL encoded)

## 🔧 Development Commands

### Electron/Node.js
```powershell
# Start development
npm start
npm run dev

# Package management
npm install
npm ci
npx electron .

# Database operations
node populate-test-data.cjs
py database-migration.py
```

### Git Operations
```powershell
git status
git add .
git commit -m "message"
git push origin main
```

### File Operations
```powershell
# List contents
Get-ChildItem
ls  # alias for Get-ChildItem

# Create directory
New-Item -ItemType Directory -Path "folder"
mkdir folder  # alias

# Copy files
Copy-Item source destination
cp source destination  # alias

# Remove files (NEVER DELETE - follow Rule #3)
Move-Item file archive/
```

## ⚠️ FORBIDDEN OPERATIONS (Rule #3)

### NEVER Delete Files
```powershell
❌ Remove-Item file.js
❌ rm file.js
❌ del file.js

✅ Move-Item file.js archive/file.js.backup
✅ Rename-Item file.js file.js.$(Get-Date -Format "yyyyMMdd-HHmmss").bak
```

## 🐛 Debugging Commands

### Process Management
```powershell
# Find running processes
Get-Process | Where-Object {$_.Name -like "*electron*"}
Get-Process | Where-Object {$_.Name -like "*node*"}

# Kill processes if needed
Stop-Process -Name "electron" -Force
```

### Process Verification Examples
```powershell
# Verify SnipFlow is actually running
Get-Process | Where-Object {$_.Name -like "*electron*"} | Select-Object Name, Id, StartTime

# Verify specific Node processes
Get-Process | Where-Object {$_.Name -eq "node"} | Format-Table Name, Id, StartTime, CommandLine

# Check if app window is responsive (manual verification needed)
# Always ask user: "Can you see the SnipFlow app window?"
```

### Network/Ports
```powershell
# Check ports
netstat -an | findstr :3000
Get-NetTCPConnection | Where-Object {$_.LocalPort -eq 3000}
```

### Environment Variables
```powershell
# Check environment
$env:NODE_ENV
$env:PATH
Get-ChildItem Env:
```

## 📝 Project-Specific Commands

### SnipFlow Development
```powershell
# Navigate to project
cd C:\dev\SnipFlow

# Desktop app
cd packages\desktop
npm start

# Populate test data
node populate-test-data.cjs

# Check logs
Get-Content logs\app.log -Tail 20
```

### Database Operations
```powershell
# Check database location
$dbPath = "$env:APPDATA\Electron\.snipflow\snippets.db"
Test-Path $dbPath

# Backup database
Copy-Item $dbPath "$dbPath.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
```

## 🎯 Common Patterns

### Error Handling
- Always check exit codes: `$LASTEXITCODE`
- Capture output: `$output = node script.js 2>&1`
- Check for errors: `if ($LASTEXITCODE -ne 0) { Write-Error "Command failed" }`

### Multi-Step Operations
```powershell
# Instead of using &&, use separate commands
cd packages/desktop
if ($LASTEXITCODE -eq 0) {
    npm install
    if ($LASTEXITCODE -eq 0) {
        npm start
    }
}

# Or use try/catch blocks
try {
    Set-Location packages/desktop
    npm install
    npm start
} catch {
    Write-Error "Operation failed: $_"
}
```

## 🔄 Quick Triggers

### For Future Chats
- **Trigger**: "PowerShell rules" or "Windows dev patterns"
- **Purpose**: Remind about command syntax differences
- **Key Points**: No &&, use py/npx, semicolon separation, verify before assuming

### Emergency Commands
```powershell
# Kill all Node/Electron processes
Get-Process | Where-Object {$_.Name -like "*node*" -or $_.Name -like "*electron*"} | Stop-Process -Force

# Free up ports
netstat -ano | findstr :3000
# Then: taskkill /PID <PID> /F
```

## 📋 Checklist Before Running Commands
- [ ] Am I in the right directory?
- [ ] Am I using PowerShell syntax (no &&)?
- [ ] Do I need admin privileges?
- [ ] Have I backed up important files?
- [ ] Am I following the "no delete" rule?
- [ ] Will I verify the command worked before proceeding?
- [ ] Do I have a way to confirm the process launched?

## 📋 Checklist After Running Commands
- [ ] Did the command complete successfully? (Check $LASTEXITCODE)
- [ ] Is the process actually running? (Get-Process verification)
- [ ] Can the user see/interact with the launched application?
- [ ] Did the fix/change actually solve the problem? (User testing required)
- [ ] Are there any error messages in logs or console?

---
**Last Updated**: January 2025  
**Environment**: Windows 10/11 + PowerShell + Node.js + Electron  
**Project**: SnipFlow Desktop Application 