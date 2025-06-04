---
description: Solving null bytes
globs: 
alwaysApply: false
---
# Null Bytes Handling Rules

## 1. Directory Structure and Imports

### Directory Structure Verification
1. Verify all directories have `__init__.py` files
2. Ensure proper package hierarchy (e.g., `gui/`, `src/`, `scripts/`)
3. Verify no circular imports exist

### Python Path Configuration
1. Print `sys.path` to verify correct directories
2. Add project root to `PYTHONPATH` if needed
3. Use absolute paths with `Path().absolute()`

### Import Statement Verification
1. Check for relative vs absolute imports
2. Ensure imports match directory structure
3. Monitor logs for import errors

## 2. File Recreation Process

### Backup Procedure
1. Create backup of original file content
2. Document file permissions and location
3. Note any special characters/encoding

### Recreation Steps
1. Delete the original file
2. Create new file with same name
3. Use UTF-8 encoding explicitly
4. Copy content without special characters
5. Use consistent line endings (LF or CRLF)

### Verification Process
1. Check file encoding (`file -i filename`)
2. Verify no null bytes (using hexdump or editor)
3. Test imports from new file

## 3. Best Practices

### File Operations
1. Always use 'with' statements
2. Specify encoding explicitly:
   ```python
   with open(file, 'r', encoding='utf-8') as f:
       content = f.read()
   ```
3. Use `pathlib.Path` for path operations

### Package Structure
```
project_root/
├── package/
│   ├── __init__.py
│   ├── module1.py
│   └── module2.py
├── tests/
└── setup.py
```

### Import Management
1. Add project root to PYTHONPATH in entry scripts
2. Use importlib for dynamic imports
3. Handle import errors gracefully

## 4. Testing and Verification

### Test Levels
1. Test individual file imports
2. Test package imports
3. Test full application startup

### Common Issues
1. File encoding issues
2. Line ending inconsistencies
3. Hidden characters
4. Path resolution problems

### Debugging Steps
1. Use verbose logging
2. Print sys.path and file paths
3. Check for encoding warnings
4. Verify file permissions

## 5. Implementation Example

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Entry point script with proper encoding and path handling.
"""
import os
import sys
from pathlib import Path
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def setup_python_path():
    """Set up Python path to include project root."""
    try:
        project_root = Path(__file__).parent.parent.absolute()
        if str(project_root) not in sys.path:
            sys.path.insert(0, str(project_root))
            logger.info(f"Added to PYTHONPATH: {project_root}")
        os.chdir(project_root)
        return project_root
    except Exception as e:
        logger.error(f"Failed to setup Python path: {e}")
        raise

def main():
    """Main entry point with proper error handling."""
    try:
        project_root = setup_python_path()
        # ... rest of the implementation
    except Exception as e:
        logger.error(f"Error in setup: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
```

## 6. Utility Scripts

### Available Scripts
1. `find_null_bytes.py`: Scans for files containing null bytes
2. `remove_null_bytes.py`: Removes null bytes from files
3. `fix_encoding.py`: Fixes file encoding issues
4. `verify_encoding.py`: Verifies file encoding
5. `file_utils.py`: Common file handling utilities

### Script Usage
```bash
# 1. Scan for null bytes
python scripts/find_null_bytes.py

# 2. Remove null bytes
python scripts/remove_null_bytes.py

# 3. Fix encoding
python scripts/fix_encoding.py

# 4. Verify encoding
python scripts/verify_encoding.py
```

### Best Practices for Script Usage
1. Always run `find_null_bytes.py` first
2. Make backups before running fix scripts
3. Run `verify_encoding.py` after fixes
4. Check logs for issues
5. Test affected files after fixes
6. Document manual interventions 