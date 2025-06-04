---
description: 
globs: 
alwaysApply: false
---
---
description: Rules for setting up, managing, and automating environments.
globs: 
alwaysApply: false
---
# Environment Management Rules

## 1. Virtual Environment Standards

### Core Requirements
- Use a virtual environment for all development.
- Name the virtual environment directory `.venv`.
- Include `.venv` in `.gitignore`.
- Document setup in `README.md`.

### Setup Example
```powershell
# Create virtual environment
python -m venv .venv

# Activate virtual environment
.\.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Cross-Platform Setup Script
```bash
# setup_environment.sh
# Usage: Run this script to set up the environment

# Create virtual environment
python3 -m venv .venv

# Activate virtual environment (Linux/Mac)
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create required directories
mkdir -p data logs reports
```

## 2. Batch File Standards

### Entry Point Requirements
- Use `run_program.bat` as the primary entry point.
- Activate the virtual environment.
- Include error handling.
- Provide clear feedback.

### Example Implementation
```batch
@echo off
setlocal enabledelayedexpansion

:: Check if virtual environment exists
if not exist ".venv" (
    echo Creating virtual environment...
    python -m venv .venv
    if errorlevel 1 (
        echo Failed to create virtual environment
        exit /b 1
    )
)

:: Activate virtual environment
call .venv\Scripts\activate
if errorlevel 1 (
    echo Failed to activate virtual environment
    exit /b 1
)

:: Install dependencies
pip install -r requirements.txt
if errorlevel 1 (
    echo Failed to install dependencies
    exit /b 1
)

:: Run program
python main.py %*
```

## 3. Dependency Management

### Requirements File
- Keep `requirements.txt` updated.
- Use version constraints.
- Document the installation process.
- Perform regular dependency audits.

### Version Management Using Pip-Tools
```bash
pip install pip-tools
pip-compile requirements.in  # Generates requirements.txt with pinned versions
pip-sync                     # Installs exactly what's in requirements.txt
```

### Example `requirements.txt`
```txt
pandas==2.0.0
numpy>=1.20.0,<2.0.0
openai~=1.0.0
tkinter>=8.6
```

## 4. Environment Variables

### Configuration Rules
- Use `.env` for variables.
- Never commit `.env` to version control.
- Provide `.env.example`.
- Document all variables.

### Example Structure
```ini
# .env.example
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-4o
DEBUG=False
LOG_LEVEL=INFO
```

### Auto-Loading `.env` in Python
```python
from dotenv import load_dotenv
import os

load_dotenv()

API_KEY = os.getenv("OPENAI_API_KEY")
if not API_KEY:
    raise ValueError("OPENAI_API_KEY is not set in .env file")
```

## 5. Development Setup

### Setup Requirements
- Automate environment creation.
- Include dependency installation.
- Handle Python version requirements.
- Provide clear instructions.

### PowerShell Setup Script
```powershell
function Setup-Environment {
    # Create virtual environment
    python -m venv .venv

    # Activate environment
    .\.venv\Scripts\activate

    # Install dependencies
    pip install -r requirements.txt

    # Create necessary directories
    mkdir -p data logs reports
}
```

## 6. IDE Integration

### Configuration Requirements
- Use the project’s virtual environment.
- Document IDE settings.
- Ensure a consistent team setup.
- Handle path resolution issues.

### VSCode Settings Example
```json
{
    "python.defaultInterpreterPath": "${workspaceFolder}/.venv/Scripts/python.exe",
    "python.analysis.extraPaths": [
        "${workspaceFolder}/src"
    ],
    "python.linting.enabled": true,
    "python.formatting.provider": "black"
}
```

## 7. Linting and Formatting

### Pre-Commit Hook Enforcement
- Install pre-commit hooks to enforce formatting and linting.
- Use `black` for formatting and `flake8` for linting.

### Install and Configure Pre-Commit Hooks
```bash
pip install pre-commit
pre-commit install
```

### Example `.pre-commit-config.yaml`
```yaml
repos:
  - repo: https://github.com/psf/black
    rev: 23.1.0
    hooks:
      - id: black
  - repo: https://github.com/PyCQA/flake8
    rev: 6.0.0
    hooks:
      - id: flake8
```

## 8. Troubleshooting Guide

### Common Issues
- Environment activation fails.
- Dependency conflicts.
- Path resolution problems.
- Cross-platform issues.

### Validation Script
```python
import sys
import os
import pkg_resources
from dotenv import load_dotenv

def validate_environment():
    checks = {
        "Python Version": sys.version_info[:2] >= (3, 8),
        "Virtual Environment": hasattr(sys, 'real_prefix') or sys.prefix != sys.base_prefix,
        "Dependencies Installed": all(pkg.strip().split("==")[0] in {pkg.key for pkg in pkg_resources.working_set} for pkg in open("requirements.txt").readlines()),
        "Environment Variables Set": all(var in os.environ for var in ["OPENAI_API_KEY", "OPENAI_MODEL"]),
        "Required Directories Exist": all(os.path.isdir(dir) for dir in ["data", "logs", "reports"]),
    }
    
    for check, result in checks.items():
        print(f"{check}: {'PASS' if result else 'FAIL'}")
    return all(checks.values())

if __name__ == "__main__":
    if validate_environment():
        print("Environment setup is correct.")
    else:
        print("Issues found in setup.")
```

## 9. Best Practices Summary

- Always use a virtual environment for development.
- Automate setup for reproducibility.
- Enforce dependency versioning with `pip-tools`.
- Never commit sensitive information such as `.env` files.
- Use pre-commit hooks to enforce code quality.
- Regularly audit and update dependencies.
- Ensure all documentation is clear and maintained.

