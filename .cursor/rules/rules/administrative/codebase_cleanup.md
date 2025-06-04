---
description: The Cleanup Protocol organizes files, removes redundancies, updates dependencies, and ensures project integrity.
globs: 
alwaysApply: false
---
Cleanup Protocol Rules

Commit and Approve Changes

Ensure all changes are committed to GitHub after receiving approval.
No cleanup should begin until all pending modifications have been reviewed, merged, and tested.
Review and Update index.md

Verify that index.md accurately reflects the current project structure.
Ensure all folders, files, and functions are properly documented.
If discrepancies are found, update index.md before proceeding.
Organize Non-Code Files

Identify documentation files (.md), logs, and configuration files.
Move misplaced files into designated subfolders for better organization.
Ensure documentation structure follows project guidelines.
Remove Duplicates and Unnecessary Files

Review and Clean Log Files

Review All Log Files in /logs/

Identify and analyze all log files stored in the /logs/ directory.
Categorize them based on their purpose (system logs, error logs, activity logs). Remove Profile-Specific Log Files

Identify and delete log files created for specific profiles or users that are no longer relevant. Ensure that system-wide logs remain intact. Prune General Log Entries Older Than 30 Days.

Open and review each log file. Remove all log entries that are older than 30 days.
Maintain a rolling log history to ensure recent activity is preserved. Clean _change.log Files

Identify all _change.log files in the project.Remove all entries older than 30 days to keep the logs manageable.

Identify duplicate batch files, scripts, or outdated shell commands.
Remove files that are no longer required to maintain efficiency.
If unsure about deletion, log them in .\docs\cleanup_review.md for further review.
Manage the Archive Folder

Backup any necessary files before proceeding.
Empty the Archive folder completely to prepare for new files.
Ensure no critical files are lost during this process.
Move Unused or Redundant .py Files

Scan the repository for obsolete or unused Python files.
Move these files to the Archive folder unless explicitly required.
If files are unclear in their usage, flag them for review in .\docs\cleanup_review.md.
Update Imports and Dependencies

Check for broken imports or missing dependencies caused by file restructuring.
Update all necessary imports in Python files to ensure continuity.
Run a test suite to validate that the refactored code still functions correctly.
Final Review and Verification

Perform a dry run of the project to confirm all changes are stable.
Verify that index.md is still accurate after all file movements.
Cross-check with .\docs\cleanup_review.md to ensure flagged items were reviewed.
Commit and Document Cleanup Changes

Once verification is complete, commit all cleanup-related changes to GitHub.
Update index.md one final time to reflect the cleaned structure.
Document any major changes or removed files in .\docs\cleanup_log.md.
Automate Where Possible

Implement scripts to automate redundant tasks like detecting duplicates, identifying unused imports, and checking for missing dependencies.
Schedule periodic cleanup audits to prevent clutter from accumulating in the repository.