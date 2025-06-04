---
description: 
globs: 
alwaysApply: false
---
---
description: 
globs: 
alwaysApply: false
---
---
description: Standards for writing and maintaining project documentation.
globs: 
alwaysApply: false
---
# Developer Documentation Standards

## 1. General Documentation Principles
- **Always Keep Documentation Up to Date**
  - Update documentation whenever changes are made to the codebase.
  - Maintain consistency in format and organization.
  
- **Review Documentation Before Starting Work**
  - Before implementing a feature or fixing a bug, review:
    - `README.md` for project context.
    - `.cursor\rules\` for existing workflow standards.
    - `.\scripts\` folder for reusable utilities.
  
- **Document All Major Changes**
  - Use `_change.logs` to record modifications.
  - Ensure all updates are committed to version control.

## 2. Folder-Level Documentation

- **Maintain `_change.logs` in the Root Folder**
  - Tracks all modifications within the folder.
  - Logs changes with timestamps and brief descriptions.

- **Update `README.md` Upon Project Completion**
  - Document new features, file additions, and system changes.
  - Ensure the `README.md` remains the central reference point.

## 3. Code Documentation Best Practices
- **Use Docstrings with Examples**
  - Include function descriptions, parameters, and return values.
  - Provide usage examples to demonstrate functionality.

- **Document Complex Algorithms**
  - Add detailed explanations for intricate logic and calculations.
  - Use inline comments where necessary.

- **Link Documentation with Codebase**
  - Reference relevant source code in documentation.
  - Example:
    ```markdown
    ## Feature: Payment Gateway Integration
    - Related Code:
      - [`/src/payments/processor.py`](mdc:../src/payments/processor.py)
      - [`/tests/payments/test_processor.py`](mdc:../tests/payments/test_processor.py)
    ```

## 4. Problem-Solving Documentation
- **Store Research Notes in `.\docs\bugs\`, `.\docs\plans\`**
  - When debugging or implementing a feature, document findings.
  - Helps with future reference and problem-solving.
  - Create the roadmap in the `.\docs\plans\roadmap.md`

- **Use Comprehensive Logging Systems**
  - Include logging mechanisms in your plan.
  - Find the SOP for logging systems in /cursor/rules/protocols/loggers.mdc
  - Store logs in `.\logs\` for tracking changes.

- **Update Documentation with Change Orders**
  - If plans change mid-implementation, update all relevant documentation.
  - Ensure project documents stay aligned with development.

## 5. Versioning for Documentation
- **Use Versioned Logs for Tracking Changes**
  - Follow a structured format for `_change.logs`:
    ```markdown
    ## Change Log - [feature_name]
    - v1.0.1 - 2025-03-16: Fixed bug in API response format.
    - v1.0.0 - 2025-03-15: Initial implementation of feature.

- **Commit Documentation Updates Alongside Code Changes**
  - Maintain Git versioning for documentation.
  - Use Git tags or branches for major update

## 6. Knowledgebase Updates

- **Keep Knowledgebase Updated**
  - Fixes or features can produce work that can summarrized into a knowledgebase document
  - Follow the "knowledge base protocol" found at `.cursor\rules\protocols\knowledge_base.mdc`

## 6. Developer Rules and Best Practices
- **Capture Valuable Development Rules**
  - When identifying a useful coding or workflow rule:
    - Document it in `.cursor\rules\` as a `.mdc` file.
    - Keep it easily accessible for future reference.

- **Keep the Codebase Well Indexed**
  - Maintain a logical file structure.
  - Use consistent naming conventions for files and directories.

By following these documentation standards, developers ensure clarity, maintainability, and streamlined collaboration across all projects.
