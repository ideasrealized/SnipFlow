---
description: 
globs: 
alwaysApply: false
---
---
description: The Global Logging System Rules ensure structured logging, session tracking, automated cleanup, and comprehensive logging coverage across the entire application.
globs: 
alwaysApply: false
---

# Global Logging System Rules

## 1. Global Logging System Architecture

### Core Logging Infrastructure
All application logs must be stored in the `/logs/` directory with the following structure:
```
/logs/
├── application/          # Application runtime logs
├── database/            # Database operation logs
├── api/                 # API request/response logs
├── security/            # Security and authentication logs
├── performance/         # Performance monitoring logs
├── errors/              # Error and exception logs
├── user-actions/        # User interaction logs
├── system/              # System operation logs
├── cleanup/             # Cleanup and maintenance logs
└── console/             # Console and debug logs
```

### Log File Naming Convention
All log files must follow the naming format: `YYYY-MM-DD_HH-MM-SS_[category]_[session-id].log`
Example: `2025-01-26_14-30-15_application_sess-abc123.log`

### Session Management
Each user session or system process must have a dedicated log file with unique session identifiers.
Session logs must be compiled per session to ensure complete traceability.

## 2. Standardized Log Entry Format

### Required Log Structure
All log entries must follow this standardized format:
```
[TIMESTAMP] [LEVEL] [MODULE/COMPONENT] [SESSION-ID] [USER-ID] MESSAGE [METADATA]
```

### Log Levels Hierarchy
- **TRACE**: Detailed diagnostic information for debugging
- **DEBUG**: General diagnostic information
- **INFO**: General operational information
- **WARN**: Non-critical issues requiring attention
- **ERROR**: Failures requiring immediate resolution
- **FATAL**: Severe failures affecting system stability

### Metadata Requirements
Each log entry must include relevant metadata such as:
- Request ID for API calls
- User ID for user actions
- IP address for security logs
- Performance metrics for performance logs
- Stack traces for error logs

## 3. Comprehensive File-by-File Logging Implementation

### Implementation Checklist
The cursor agent must systematically review and implement logging in every file according to these requirements:

#### Frontend Components (React/TypeScript)
- [ ] **User Interaction Logging**: Log all user clicks, form submissions, navigation
- [ ] **Component Lifecycle Logging**: Log component mount, unmount, and state changes
- [ ] **Error Boundary Logging**: Comprehensive error catching and logging
- [ ] **Performance Logging**: Log component render times and performance metrics
- [ ] **API Call Logging**: Log all frontend API requests and responses

#### Backend API Routes
- [ ] **Request/Response Logging**: Log all incoming requests and outgoing responses
- [ ] **Authentication Logging**: Log all authentication attempts and results
- [ ] **Authorization Logging**: Log permission checks and access control decisions
- [ ] **Database Query Logging**: Log all database operations and performance
- [ ] **Error Handling Logging**: Comprehensive error logging with stack traces

#### Database Operations
- [ ] **Query Performance Logging**: Log query execution times and optimization metrics
- [ ] **Data Modification Logging**: Log all INSERT, UPDATE, DELETE operations
- [ ] **Schema Change Logging**: Log all database schema modifications
- [ ] **Connection Logging**: Log database connection events and pool status
- [ ] **Security Logging**: Log database access patterns and security events

#### Security Components
- [ ] **Authentication Events**: Log login, logout, password changes
- [ ] **Authorization Decisions**: Log access control decisions and violations
- [ ] **Security Violations**: Log suspicious activities and potential threats
- [ ] **Data Access Logging**: Log sensitive data access and modifications
- [ ] **Audit Trail Logging**: Comprehensive audit trail for compliance

#### AI/ML Components
- [ ] **AI Request Logging**: Log all AI service requests and responses
- [ ] **Content Generation Logging**: Log AI-generated content and metadata
- [ ] **Model Performance Logging**: Log AI model performance and accuracy metrics
- [ ] **Safety Filter Logging**: Log content moderation and safety decisions
- [ ] **Usage Analytics Logging**: Log AI feature usage patterns and metrics

#### System Operations
- [ ] **Startup/Shutdown Logging**: Log system lifecycle events
- [ ] **Configuration Logging**: Log configuration changes and updates
- [ ] **Resource Usage Logging**: Log memory, CPU, and storage usage
- [ ] **Background Job Logging**: Log scheduled tasks and background processes
- [ ] **Integration Logging**: Log third-party service interactions

## 4. Automated Logging Implementation Process

### Phase 1: Infrastructure Setup
1. Create the global logging directory structure
2. Implement the centralized logging utility/service
3. Configure log rotation and retention policies
4. Set up log aggregation and monitoring

### Phase 2: File-by-File Implementation
1. **Systematic Review**: Go through each file in the codebase systematically
2. **Logging Assessment**: Assess current logging coverage and identify gaps
3. **Implementation**: Add comprehensive logging according to file type requirements
4. **Testing**: Test logging functionality and verify log output
5. **Documentation**: Document logging implementation in each file

### Phase 3: Validation and Optimization
1. **Coverage Verification**: Ensure all critical operations are logged
2. **Performance Testing**: Verify logging doesn't impact application performance
3. **Log Analysis**: Implement log analysis and alerting systems
4. **Continuous Improvement**: Regular review and optimization of logging

## 5. Change Logs and Documentation

### Change Log Requirements
Each logging directory must contain a `_change.log` file tracking:
- Date and time of logging changes
- Developer or system making changes
- Description of logging modifications
- Impact assessment of changes

### Documentation Standards
- Each logging implementation must be documented in the file header
- Logging decisions and rationale must be recorded
- Performance impact of logging must be assessed and documented
- Compliance requirements must be mapped to logging implementation

## 6. Log Maintenance and Cleanup

### Automated Retention Policies
- **Application Logs**: Retain for 90 days
- **Security Logs**: Retain for 1 year (compliance requirement)
- **Error Logs**: Retain for 6 months
- **Performance Logs**: Retain for 30 days
- **Debug Logs**: Retain for 7 days

### Storage Management
- Maximum of 1000 log files per category
- Implement log compression for files older than 7 days
- Automatic cleanup of logs exceeding retention periods
- Alert system for storage capacity issues

### Log Rotation
- Daily rotation for high-volume logs
- Size-based rotation (100MB maximum per file)
- Compressed archive storage for historical logs
- Automated cleanup of rotated logs based on retention policies

## 7. Monitoring and Alerting

### Real-time Monitoring
- Monitor log generation rates and patterns
- Alert on unusual logging patterns or volumes
- Track logging system performance and health
- Monitor storage usage and capacity

### Error Detection and Alerting
- Automatic detection of ERROR and FATAL level logs
- Real-time alerts for security violations
- Performance degradation alerts based on log analysis
- System health monitoring through log patterns

## 8. Compliance and Security

### Security Requirements
- Encrypt sensitive data in logs
- Implement access controls for log files
- Audit log access and modifications
- Secure transmission of logs to external systems

### Compliance Standards
- Maintain audit trails for regulatory compliance
- Implement data retention policies per legal requirements
- Ensure log integrity and tamper-evidence
- Regular compliance audits of logging system

## 9. Implementation Priority Matrix

### Critical Priority (Implement First)
1. Security and authentication logging
2. Error and exception logging
3. Database operation logging
4. API request/response logging

### High Priority (Implement Second)
1. User action logging
2. Performance monitoring logging
3. System operation logging
4. AI/ML operation logging

### Medium Priority (Implement Third)
1. Debug and trace logging
2. Component lifecycle logging
3. Background job logging
4. Integration logging

## 10. Cursor Agent Implementation Instructions

### Systematic Implementation Process
1. **Start with Critical Priority**: Begin with security, error, database, and API logging
2. **File-by-File Review**: Systematically review each file in the codebase
3. **Gap Analysis**: Identify missing logging in each file
4. **Implementation**: Add comprehensive logging according to file type
5. **Testing**: Verify logging functionality and output
6. **Documentation**: Update file documentation with logging details
7. **Progress Tracking**: Maintain implementation progress in `/logs/_implementation_progress.md`

### Quality Assurance
- Verify logging doesn't impact application performance
- Ensure log messages are clear and actionable
- Test log rotation and cleanup functionality
- Validate log format consistency across all files
- Confirm compliance with security and privacy requirements

### Continuous Monitoring
- Regular review of logging coverage and effectiveness
- Performance impact assessment of logging implementation
- User feedback integration for logging improvements
- Ongoing optimization of logging system performance