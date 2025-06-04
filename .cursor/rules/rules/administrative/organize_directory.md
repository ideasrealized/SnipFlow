---
description: 
globs: 
alwaysApply: false
---
# Comprehensive Directory Organization SOP

## Overview

This SOP provides detailed instructions for the cursor agent to systematically organize codebases into logical, maintainable directory structures while managing dependencies, imports/exports, and preventing circular imports. The process follows the @plan_and_execute.mdc protocol to ensure thorough planning and execution.

## Core Organization Principles

### 1. Separation of Concerns
- **Frontend**: User interface components, pages, and client-side logic
- **Backend**: Server-side logic, APIs, and business logic
- **Database**: Schema, migrations, seeds, and database-related utilities
- **Shared**: Common utilities, types, and configurations used across layers

### 2. Logical Hierarchy
- Group related functionality together
- Use clear, descriptive folder names
- Maintain consistent naming conventions
- Organize by feature/domain when appropriate

### 3. Dependency Management
- Minimize cross-layer dependencies
- Prevent circular imports through careful organization
- Use barrel exports for clean import paths
- Document dependency relationships

## Plan and Execute Protocol Integration

Read the `plan_and_execute.mdc` rule file.

### STEP 1: Initialize Planning Structure

Create the following directories for the organization project:

```
\docs\plans\directory_organization\
\docs\plans\directory_organization\research\
\docs\plans\directory_organization\backups\
```

### STEP 2: Research and Analysis Phase

#### A. Codebase Analysis
- [ ] **Current Structure Analysis**: Document existing directory structure
- [ ] **File Inventory**: Create comprehensive list of all files and their purposes
- [ ] **Dependency Mapping**: Analyze import/export relationships
- [ ] **Circular Import Detection**: Identify existing circular dependencies
- [ ] **Technology Stack Review**: Understand framework-specific organization patterns

#### B. Database Schema Analysis
- [ ] **Schema Review**: Analyze current database structure from dump files
- [ ] **Data Layer Organization**: Plan database-related file organization
- [ ] **Migration Strategy**: Plan for database file reorganization

#### C. Documentation Review
- [ ] **README Analysis**: Review current documentation
- [ ] **Architecture Documentation**: Understand existing architectural decisions
- [ ] **Dependency Documentation**: Review package.json, requirements, etc.

#### D. Research Documentation
Create research files in `\docs\plans\directory_organization\research\`:
- [ ] `current_structure_analysis.md`
- [ ] `dependency_mapping.md`
- [ ] `circular_imports_report.md`
- [ ] `technology_patterns.md`
- [ ] `proposed_structure.md`

### STEP 3: Standardized Directory Structure Design

#### Frontend Organization (`/src/frontend/` or `/frontend/`)
```
frontend/
├── components/           # Reusable UI components
│   ├── common/          # Shared components across features
│   ├── forms/           # Form-specific components
│   ├── layout/          # Layout components (header, footer, sidebar)
│   └── ui/              # Basic UI elements (buttons, inputs, etc.)
├── pages/               # Page-level components
│   ├── admin/           # Admin-specific pages
│   ├── auth/            # Authentication pages
│   ├── dashboard/       # Dashboard pages
│   └── user/            # User-specific pages
├── hooks/               # Custom React hooks
├── services/            # API calls and external service integrations
├── utils/               # Frontend-specific utilities
├── types/               # TypeScript type definitions
├── constants/           # Frontend constants and configurations
├── assets/              # Static assets
│   ├── images/
│   ├── icons/
│   └── fonts/
└── styles/              # Styling files
    ├── components/
    ├── pages/
    └── globals/
```

#### Backend Organization (`/src/backend/` or `/backend/`)
```
backend/
├── api/                 # API route handlers
│   ├── auth/            # Authentication endpoints
│   ├── users/           # User management endpoints
│   ├── admin/           # Admin endpoints
│   └── public/          # Public endpoints
├── middleware/          # Express/API middleware
├── services/            # Business logic services
├── models/              # Data models and schemas
├── utils/               # Backend-specific utilities
├── config/              # Configuration files
├── validators/          # Input validation schemas
├── types/               # TypeScript type definitions
└── tests/               # Backend tests
    ├── unit/
    ├── integration/
    └── fixtures/
```

#### Database Organization (`/database/`)
```
database/
├── migrations/          # Database migration files
├── seeds/               # Database seed files
├── dumps/               # Database dump files
├── schemas/             # Schema documentation
├── queries/             # Common query files
└── utils/               # Database utilities and helpers
```

#### Shared Organization (`/shared/`)
```
shared/
├── types/               # Shared TypeScript types
├── constants/           # Shared constants
├── utils/               # Shared utility functions
├── validators/          # Shared validation schemas
└── config/              # Shared configuration
```

#### Root Level Organization
```
/
├── docs/                # Project documentation
│   ├── api/             # API documentation
│   ├── architecture/    # Architecture documentation
│   ├── deployment/      # Deployment guides
│   └── plans/           # Planning documents
├── scripts/             # Build and deployment scripts
├── tests/               # Cross-cutting tests
│   ├── e2e/             # End-to-end tests
│   └── integration/     # Integration tests
├── logs/                # Application logs
└── archive/             # Archived/deprecated files
```

### STEP 4: Work Breakdown Structure (WBS) Creation

Create `\docs\plans\directory_organization\wbs_checklist.md` with the following structure:

#### Phase 1: Pre-Organization Analysis
- [ ] **1.1 Current Structure Documentation**
  - [ ] Research: Document existing directory structure
  - [ ] Findings: Create visual map of current organization
  - [ ] Actions: Generate structure report in research folder
  - [ ] Backup: Create full codebase backup before changes

- [ ] **1.2 Dependency Analysis**
  - [ ] Research: Map all import/export relationships
  - [ ] Findings: Identify dependency patterns and issues
  - [ ] Actions: Create dependency graph documentation
  - [ ] Backup: Document current import paths

- [ ] **1.3 Circular Import Detection**
  - [ ] Research: Scan for circular dependencies
  - [ ] Findings: Document all circular import chains
  - [ ] Actions: Plan resolution strategies
  - [ ] Backup: Create list of files with circular imports

#### Phase 2: Structure Planning
- [ ] **2.1 Target Structure Design**
  - [ ] Research: Review best practices for technology stack
  - [ ] Findings: Design optimal directory structure
  - [ ] Actions: Create detailed structure plan
  - [ ] Backup: Document proposed changes

- [ ] **2.2 Migration Strategy Planning**
  - [ ] Research: Plan file movement sequence
  - [ ] Findings: Identify dependencies that need updating
  - [ ] Actions: Create step-by-step migration plan
  - [ ] Backup: Plan rollback procedures

#### Phase 3: Dependency Resolution
- [ ] **3.1 Circular Import Resolution**
  - [ ] Research: Analyze each circular import case
  - [ ] Findings: Design resolution approach
  - [ ] Actions: Implement fixes before reorganization
  - [ ] Backup: Create backup of modified files

- [ ] **3.2 Import Path Optimization**
  - [ ] Research: Plan new import path structure
  - [ ] Findings: Design barrel export strategy
  - [ ] Actions: Create index files for clean imports
  - [ ] Backup: Document old import patterns

#### Phase 4: Directory Creation and File Movement
- [ ] **4.1 Create New Directory Structure**
  - [ ] Research: Verify directory naming conventions
  - [ ] Findings: Confirm structure aligns with standards
  - [ ] Actions: Create all necessary directories
  - [ ] Backup: Document directory creation

- [ ] **4.2 Move Files by Category**
  - [ ] Research: Group files by logical categories
  - [ ] Findings: Plan movement order to avoid breaking dependencies
  - [ ] Actions: Move files systematically
  - [ ] Backup: Create backup before each major move

#### Phase 5: Import/Export Updates
- [ ] **5.1 Update Import Statements**
  - [ ] Research: Identify all files needing import updates
  - [ ] Findings: Map old paths to new paths
  - [ ] Actions: Update all import statements
  - [ ] Backup: Backup files before import changes

- [ ] **5.2 Create Barrel Exports**
  - [ ] Research: Identify opportunities for barrel exports
  - [ ] Findings: Design clean export structure
  - [ ] Actions: Create index.ts/js files with exports
  - [ ] Backup: Document export structure

#### Phase 6: Testing and Validation
- [ ] **6.1 Dependency Validation**
  - [ ] Research: Test all import/export relationships
  - [ ] Findings: Verify no broken dependencies
  - [ ] Actions: Fix any remaining import issues
  - [ ] Backup: Document validation results

- [ ] **6.2 Circular Import Re-check**
  - [ ] Research: Scan for new circular dependencies
  - [ ] Findings: Verify circular imports are resolved
  - [ ] Actions: Fix any new circular dependencies
  - [ ] Backup: Document final dependency state

#### Phase 7: Documentation Updates
- [ ] **7.1 README.md Update**
  - [ ] Research: Review current README structure
  - [ ] Findings: Plan comprehensive structure documentation
  - [ ] Actions: Update README with new file structure
  - [ ] Backup: Backup original README

- [ ] **7.2 Architecture Documentation**
  - [ ] Research: Document new organizational patterns
  - [ ] Findings: Create comprehensive architecture guide
  - [ ] Actions: Update all relevant documentation
  - [ ] Backup: Archive old documentation

#### Phase 8: Cleanup and Finalization
- [ ] **8.1 Remove Empty Directories**
  - [ ] Research: Identify empty directories from reorganization
  - [ ] Findings: Verify directories are truly empty
  - [ ] Actions: Remove empty directories
  - [ ] Backup: Document removed directories

- [ ] **8.2 Final Validation**
  - [ ] Research: Perform comprehensive system test
  - [ ] Findings: Verify all functionality works
  - [ ] Actions: Fix any remaining issues
  - [ ] Backup: Create final backup of organized structure

- [ ] **8.3 Cleanup Planning Documents**
  - [ ] Research: Review all planning documents
  - [ ] Findings: Archive useful documentation
  - [ ] Actions: Clean up temporary planning files
  - [ ] Backup: Archive planning documents before cleanup

### STEP 5: Implementation Guidelines

#### A. File Movement Strategy
1. **Dependency-First Approach**: Move files with no dependencies first
2. **Layer-by-Layer**: Organize by architectural layers (database → backend → frontend)
3. **Feature Grouping**: Group related functionality together
4. **Incremental Testing**: Test after each major movement phase

#### B. Import/Export Management
1. **Barrel Exports**: Create index files for clean import paths
2. **Relative Imports**: Use relative imports within feature directories
3. **Absolute Imports**: Use absolute imports for cross-feature dependencies
4. **Type-Only Imports**: Separate type imports from value imports

#### C. Circular Import Prevention
1. **Dependency Hierarchy**: Establish clear dependency direction
2. **Interface Segregation**: Use interfaces to break circular dependencies
3. **Event-Driven Architecture**: Use events instead of direct dependencies
4. **Dependency Injection**: Use DI patterns to invert dependencies

### STEP 6: Quality Assurance Checklist

#### Pre-Organization Validation
- [ ] All files are backed up in `\docs\plans\directory_organization\backups\`
- [ ] Current structure is fully documented
- [ ] All dependencies are mapped
- [ ] Circular imports are identified

#### During Organization Validation
- [ ] Each file movement is tested immediately
- [ ] Import paths are updated before moving dependent files
- [ ] No broken imports are introduced
- [ ] Directory structure follows established patterns

#### Post-Organization Validation
- [ ] All imports/exports work correctly
- [ ] No circular dependencies exist
- [ ] Application builds and runs successfully
- [ ] All tests pass
- [ ] README.md reflects new structure
- [ ] Documentation is updated

### STEP 7: README.md Update Template

Upon completion, update the README.md file with the following structure section:

```markdown
## Project Structure

### Overview
This project follows a layered architecture with clear separation of concerns:

### Directory Structure
```
/
├── frontend/                 # Frontend application
│   ├── components/          # Reusable UI components
│   ├── pages/              # Page-level components
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API integration
│   └── utils/              # Frontend utilities
├── backend/                 # Backend application
│   ├── api/                # API route handlers
│   ├── services/           # Business logic
│   ├── models/             # Data models
│   └── middleware/         # API middleware
├── database/               # Database related files
│   ├── migrations/         # Database migrations
│   ├── seeds/              # Database seeds
│   └── dumps/              # Database dumps
├── shared/                 # Shared utilities and types
│   ├── types/              # TypeScript types
│   ├── utils/              # Shared utilities
│   └── constants/          # Shared constants
└── docs/                   # Project documentation
```

### Import Conventions
- Use barrel exports (index files) for clean import paths
- Prefer relative imports within feature directories
- Use absolute imports for cross-feature dependencies
- Separate type imports from value imports

### Adding New Files
When adding new files, follow these guidelines:
1. Place files in the appropriate layer (frontend/backend/database/shared)
2. Group related functionality together
3. Update barrel exports if creating new modules
4. Maintain dependency hierarchy to prevent circular imports
```

## Success Criteria

### Organization Quality Metrics
- [ ] **Logical Structure**: Files are organized by clear, logical groupings
- [ ] **Dependency Clarity**: Import/export relationships are clear and documented
- [ ] **No Circular Imports**: All circular dependencies are resolved
- [ ] **Consistent Naming**: Directory and file names follow consistent conventions
- [ ] **Documentation**: Structure is fully documented and up-to-date

### Technical Validation
- [ ] **Build Success**: Application builds without errors
- [ ] **Test Passing**: All tests continue to pass
- [ ] **Import Resolution**: All imports resolve correctly
- [ ] **Performance**: No performance degradation from reorganization
- [ ] **Maintainability**: Structure supports easy maintenance and development

### Documentation Completeness
- [ ] **README Updated**: README.md reflects new structure
- [ ] **Architecture Docs**: Architecture documentation is current
- [ ] **Import Guidelines**: Import conventions are documented
- [ ] **Migration Notes**: Reorganization process is documented
- [ ] **Maintenance Guide**: Guidelines for maintaining structure are provided

## Maintenance and Evolution

### Regular Structure Review
- [ ] **Monthly**: Review for new organizational needs
- [ ] **Quarterly**: Validate import/export patterns
- [ ] **Per Feature**: Ensure new features follow structure guidelines
- [ ] **Per Release**: Verify structure supports release requirements

### Continuous Improvement
- [ ] **Feedback Integration**: Incorporate developer feedback on structure
- [ ] **Pattern Evolution**: Evolve patterns based on project growth
- [ ] **Tool Integration**: Integrate linting rules to enforce structure
- [ ] **Documentation Updates**: Keep documentation current with changes

## Emergency Procedures

### Rollback Process
If organization causes critical issues:
1. Stop all development work
2. Restore from backup in `\docs\plans\directory_organization\backups\`
3. Document issues encountered
4. Revise organization plan
5. Re-execute with lessons learned

### Issue Resolution
For post-organization issues:
1. Identify specific problem (imports, dependencies, etc.)
2. Locate relevant planning documentation
3. Apply targeted fix following original methodology
4. Update documentation with resolution
5. Add prevention measures to future planning


