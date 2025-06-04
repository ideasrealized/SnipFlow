---
description: 
globs: 
alwaysApply: false
---
**Title:** Refactoring Protocol  

**Description:** The Refactoring Protocol ensures a structured and reliable process for updating code while preserving the integrity of the project. It emphasizes maintaining backups, following structured problem-solving approaches, ensuring test coverage, aligning with broader system goals, and finalizing documentation before removing backups.

This should be completed using the `\.cursor\rules\administrative\plan_and_execute.mdc` protocol.

**Refactoring Protocol**  

**1. Preserve a Backup of the Original File**  
- Before making any changes, create a backup of the original file.  
- Store the backup in a secure location and retain it until the refactoring process is verified as successful.  

**2. Initiate the Problem-Solving Protocol**  
- Navigate to `.cursor\rules\specialty\problem_solving.mdc`.  
- Follow the problem-solving protocol to analyze and plan necessary improvements.  
- Identify root issues and document solutions before implementing changes.  

**3. Commit and Approve Changes**  
- Ensure all pending changes are committed and approved before starting refactoring.  
- Verify that the current codebase is stable and passes all tests.  

**4. Check and Update `index.md`**  
- Review `index.md` to ensure it accurately lists all folders, files, and functions in the project.  
- Update missing or outdated descriptions for each item.  
- Ensure consistency in naming and structure before proceeding with refactoring.  

**5. Define Refactoring Scope**  
- Identify functions, modules, or classes that require improvement.  
- Document the refactoring plan in `.\docs\refactoring\plan.md`.  
- List specific files and functions being refactored.  

**6. Follow the Big Picture Protocol**  
- Navigate to `.cursor\rules\specialty\big_picture_protocol.mdc`.  
- Apply system-wide considerations to ensure refactoring aligns with project goals.  
- Verify that changes improve long-term maintainability and scalability.  

**7. Ensure Test Coverage**  
- Review existing test cases to confirm they adequately cover refactored areas.  
- If necessary, write additional tests before making any changes.  

**8. Refactor in Small, Manageable Steps**  
- Break down refactoring into logical, incremental improvements.  
- Optimize code structure while preserving functionality.  
- Eliminate redundant code, improve readability, and enhance maintainability.  

**9. Update Dependencies and Imports**  
- Adjust imports, dependencies, and references affected by refactoring.  
- Remove unused imports and dependencies.  

**10. Complete the Testing Phase Before Deleting the Backup** 
- Execute the full test suite to confirm that refactoring has not introduced errors.  
- Compare performance metrics if optimizing for efficiency.  
- Before deleting the backup, complete the full testing phase.  
- Navigate to `.cursor\rules\protocols\testing.mdc` and follow the standard operating procedure for testing.  
- Only proceed once all tests have passed and functionality is confirmed.  

**11. Follow the Documentation Protocol**  
- Navigate to `.cursor\rules\protocols\documentation.mdc`.  
- Ensure that all changes are well-documented for future reference.  
- Revise `index.md` again to reflect all changes after refactoring.  
- Update related `.md` files in `.\docs\` as needed.  

**12. Perform Code Review**  
- Remind user to submit changes for peer review at https://www.greptile.com/ and discuss optimizations.  
- Address feedback and ensure maintainability standards are met.  

**13. Commit and Merge Refactored Code**  
- Once verified, commit changes and push to GitHub.  
- Document major refactoring updates in `.\docs\refactoring\log.md`.  

**14. Create a Knowledge Base Document**  
- Once refactoring is complete, create a knowledge base document.  
- Follow the knowledge base protocol found in `.cursor\rules\protocols\knowledge_base.mdc`.  
- Ensure the document includes details of what was refactored, why it was done, and how it improves the project.  
