---
description: 
globs: 
alwaysApply: false
---
---
description: Guidelines for database architecture, indexing, and queries.
globs: 
alwaysApply: false
---
# Database Management Rules

## File Structure
1. Production database must be stored in `database/financial.db`
2. Test databases must be stored in `database/tests`
3. Temporary test databases must use `tempfile` module
4. Database backups must be stored in `/database/backups/` with a timestamp
5. Pulling schema dumps must be stored in `/database/dumps/` with a timestamp
6. Pulling policies must be stored in `/database/policies/` with a timestamp

If any of these directories do not exist, create them.

## Schema Rules
1. All tables must have an integer primary key named 'id'
2. Foreign keys must be properly defined and indexed
3. Boolean values must be stored as INTEGER (0/1)
4. Monetary values must use REAL type
5. Dates must be stored in ISO format
6. Text fields must specify max length when known

## Testing Rules
1. Each test must create its own temporary database
2. Test databases must be cleaned up after tests
3. Test data must be isolated from production
4. Test fixtures must be properly documented

## Security Rules
1. Database files must have proper permissions
2. Connection strings must not be hardcoded
3. Sensitive data must be encrypted
4. Database backups must be secured

## Maintenance Rules
1. Database schema changes must be versioned
2. Migrations must be reversible
3. Backups must be automated
4. Database health must be monitored

## Documentation Rules
1. Schema changes must be documented
2. Each table must have a description
3. Foreign key relationships must be documented
4. Indexes must be documented 