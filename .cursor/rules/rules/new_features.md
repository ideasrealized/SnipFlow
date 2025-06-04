---
description: 
globs: 
alwaysApply: false
---
---
description: Workflow for adding and integrating new features.
globs: 
alwaysApply: false
---
# Feature Addition Documentation Guidelines

## 1. Research Document
- **Location:** `.\docs\features\[feature_name]\research.md`
- **Contents:**
  - Summary of codebase exploration relevant to the feature.
  - External research from the web or industry best practices.
  - Notes on similar implementations in open-source or proprietary software.

## 2. Implementation Proposals
- **Location:** `.\docs\features\[feature_name]\implementation_options.md`
- **Contents:**
  - Three potential implementation strategies.
  - Ordered list by the likelihood of success.
  - Justification for each option, including:
    - Pros and cons.
    - Feasibility analysis.

## 3. Impact Analysis Document
- **Location:** `.\docs\features\[feature_name]\impact_analysis.md`
- **Contents:**
  - Potential pitfalls of the feature.
  - Second-order and third-order consequences.
  - Consideration of how this feature interacts with existing components.

## 4. Feature Plan
- **Location:** `.\docs\features\[feature_name]\plan.md`
- **Contents:**
  - High-level plan outlining implementation steps.
  - Dependencies and prerequisites.
  - Project timeline and milestone estimates.
  - Required changes in:
    - Database
    - API
    - UI
    - System architecture
  - Testing strategy and expected outcomes.

## 5. Project Documentation Updates
- **Location:** `.\docs\project_documentation\` (or update existing documents)
- **Contents:**
  - Modifications to existing architecture.
  - API documentation updates (if applicable).
  - Developer notes for maintenance and scaling.

By following this structured approach, the feature addition will be well-documented, reducing risk and improving long-term maintainability.
