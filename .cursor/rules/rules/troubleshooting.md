---
description: 
globs: 
alwaysApply: false
---
---
description: Systematic debugging and problem-resolution guidelines.
globs: 
alwaysApply: false
---
# Troubleshooting Guide: Follow these steps for troubleshooting problems:

Always remember that .\index.md holds the file and folder structure and notes

# Problem Resolution Documentation Guidelines

## The Golden Rule

The right set of questions always comes before finding the correct answer. Rather than making assumptions, ask yourself smart questions about the problem first. Don't get tunnel vision on the immediate problem, expand out and think big picture about why this might happen. It might require a little digging and asking the "Seven Layers of Why" and "IDEAL" or "Identify, Define Root Cause, Explore, Action, Look Back and Learn."

Then, answer the question, then ask the next logical question. This is they key to success.

If you cannot find the right question based on your own knowledge, use the web research and forums to find the question.

## General Activity
 - All console activity should be logged here: 
 - **Location** `\docs\console\logs\[HH:MM:SS][date][console_logs]`
 - Refer to this guide and \cursor\rules\protocols\documentation for how logs should be setup in the program.
 - From these logs you will find your bugs and errors

## 1. Document the Error
 - Search the docs\bugs\reports to discover if the bug has already been reported.
 - If not, create it. If so, check the remaining bug folders to see if there has been work done on the problem.
 - If there has been work, then figure out where to pick it up. If not proceed as usual.

- **Location:** `.\docs\bugs\reports\[bug_report][date][time]`
- **Contents**
   - Copy the template bug report from .\cursor\rules\templates\bug_report.mdc.
   - Complete all relevant details, including error description, stack trace, expected vs actual behavior, reproduction steps, logs, and initial troubleshooting.
   - Save the completed report inside .\docs\bugs\reports\ with a filename formatted as [bug_report][date][time].md.

## 2. Research Document
- **Location:** `.\docs\bugs\[problem]\research.md`
- **Contents:**
- Research the codebase following the error to it's root cause
- Idea on potential web searches you can perform to get better answers.
- Perform those web searches and store your research. Here are the research doc details:
  - Summary of codebase exploration related to the issue.
    - index.md (root folder), __ai__.md, and _change.logs (file location folder) have details about the program, files, folders and functions (or should)
  - External research from the web or industry best practices.
  - Notes on similar issues and their resolutions in open-source or proprietary software.

## 3. Solution Proposals
- **Location:** `.\docs\bugs\[problem]\solutions.md`
- **Contents:**
  - Five potential solutions.
  - Ordered by the likelihood of success.
  - Justification for each option, including:
    - Pros and cons.
    - Feasibility and complexity analysis.

## 4. Impact Analysis Document
- **Location:** `.\docs\bugs\[problem]\impact_analysis.md`
- **Contents:**
  - Consideration of cascading effects of the proposed solutions.
  - Second-order and third-order consequences.
  - Dependencies or potential conflicts within the system.
  - Assign Levels of Impact
    - (1) Minimal Impact – Affects a small, isolated function with no dependencies.
    - (2) Localized Impact – Affects a specific module but does not disrupt other core functions.
    - (3) Moderate Impact – Affects multiple modules and requires dependency updates but maintains system stability.
    - (4) High Impact – Affects critical components, requiring major adjustments and risk assessment.
    - (5) Severe Impact – Fundamentally changes system behavior, posing high risk and requiring extensive testing and rollback planning.

## 5. Solution Plan
- **Location:** `.\docs\bugs\[problem]\plan.md`
- **Contents:**
  - Detailed plan for implementing the most likely solution.
  - Steps required to resolve the problem.
  - Expected outcome and testing strategy.

## 6. Backup Files
- **Location:** `.\docs\bugs\[problem]\backups`
- **Instructions:**
  - Backup all files that will be modified.
  - Ensure backups are accessible in case a rollback is needed.

## 7. Implementation and Checklist
- **Process:**
  - Follow the solution plan.
  - Update the checklist as tasks are completed.
  - Log any deviations from the plan and document changes.

## 8. Quality Control and Troubleshooting
- **Process:**
  - Perform quality control checks to confirm the fix is working.
  - Identify and troubleshoot any issues that arise.
  - Repeat testing until the problem is fully resolved.

## 9. Documentation Updates
- **Location:** Update relevant files:
  - `__ai__.md`
  - `_change.logs`
  - `index.md` (if applicable)
  - Update all solutions to the \docs\knowledge_base\[solution_name]
  
## 10. Backup Cleanup
- **Process:**
  - Once the solution is verified and confirmed, delete backup files.
  - Ensure all changes are committed to version control.
