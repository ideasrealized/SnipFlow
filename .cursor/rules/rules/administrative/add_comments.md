---
description: 
globs: 
alwaysApply: false
---
---
description: The Global Code Documentation and Commenting System ensures comprehensive contextual comments throughout the codebase to enhance AI understanding and code maintainability.
globs: 
alwaysApply: false
---

# Global Code Documentation and Commenting System

Following this system, you are to research the codebase, create a wbs_checklist in `\docs\plans\plan_name\wbs_checklist.md` for adding proper comments and documentation throughout the file structure.

## 1. Code Documentation Architecture

### Core Documentation Philosophy
Every file, function, class, and significant code block must contain sufficient contextual comments to enable AI assistants to understand:
- **Purpose**: What the code does and why it exists
- **Context**: How it fits into the larger system
- **Dependencies**: What it relies on and what relies on it
- **Data Flow**: How data moves through the code
- **Business Logic**: The business rules and requirements it implements

### Documentation Hierarchy
```
File Level Documentation
├── Header Comments          # File purpose, dependencies, exports
├── Import/Dependency Comments   # Why each dependency is needed
├── Class/Component Comments     # Purpose, props, state, lifecycle
├── Function/Method Comments     # Parameters, return values, side effects
├── Code Block Comments         # Complex logic explanations
└── Inline Comments            # Variable purposes, edge cases
```

## 2. File-Level Documentation Standards

### File Header Template
Every file must begin with a comprehensive header comment:

```typescript
/**
 * FILE: [filename]
 * PURPOSE: [Brief description of what this file does]
 * CONTEXT: [How this file fits into the larger application]
 * DEPENDENCIES: [Key dependencies and why they're needed]
 * EXPORTS: [What this file provides to other parts of the system]
 * LAST_UPDATED: [Date of last significant change]
 * MAINTAINER: [Team or person responsible]
 * 
 * BUSINESS_LOGIC:
 * - [Key business rule 1]
 * - [Key business rule 2]
 * 
 * DATA_FLOW:
 * - [Input sources and formats]
 * - [Processing steps]
 * - [Output destinations and formats]
 * 
 * INTEGRATION_POINTS:
 * - [External APIs or services used]
 * - [Database interactions]
 * - [Event handling or state management]
 */
```

### Import Documentation
Each import statement should be accompanied by context:

```typescript
// Core React functionality for component lifecycle and state management
import React, { useState, useEffect } from 'react';

// Supabase client for database operations and real-time subscriptions
import { supabase } from '@/lib/supabase';

// OpenAI integration for AI-powered content generation
import { openai } from '@/lib/openai';

// Custom logging utility for tracking user actions and system events
import { logger } from '@/utils/logger';
```

## 3. Component and Class Documentation

### React Component Documentation
```typescript
/**
 * COMPONENT: TaskManager
 * PURPOSE: Manages user tasks with AI-powered suggestions and real-time collaboration
 * 
 * PROPS:
 * - userId: string - Current user identifier for task ownership
 * - projectId: string - Project context for task organization
 * - onTaskUpdate: (task: Task) => void - Callback for task state changes
 * 
 * STATE:
 * - tasks: Task[] - Current list of user tasks
 * - isLoading: boolean - Loading state for async operations
 * - aiSuggestions: Suggestion[] - AI-generated task suggestions
 * 
 * LIFECYCLE:
 * - Mount: Fetches user tasks and subscribes to real-time updates
 * - Update: Processes AI suggestions when task list changes
 * - Unmount: Cleans up subscriptions and pending requests
 * 
 * BUSINESS_LOGIC:
 * - Tasks are automatically categorized by AI based on content
 * - Real-time collaboration updates are merged with local state
 * - AI suggestions are generated based on user patterns and project context
 * 
 * PERFORMANCE_CONSIDERATIONS:
 * - Uses React.memo for expensive re-renders
 * - Debounces AI suggestion requests
 * - Implements virtual scrolling for large task lists
 */
const TaskManager: React.FC<TaskManagerProps> = ({ userId, projectId, onTaskUpdate }) => {
```

### Class Documentation
```typescript
/**
 * CLASS: DatabaseManager
 * PURPOSE: Centralized database operations with connection pooling and query optimization
 * 
 * RESPONSIBILITIES:
 * - Manages Supabase connection lifecycle
 * - Provides type-safe database operations
 * - Handles connection pooling and retry logic
 * - Implements query caching and optimization
 * 
 * DESIGN_PATTERNS:
 * - Singleton pattern for connection management
 * - Repository pattern for data access
 * - Observer pattern for real-time updates
 * 
 * ERROR_HANDLING:
 * - Automatic retry with exponential backoff
 * - Graceful degradation for offline scenarios
 * - Comprehensive error logging and monitoring
 */
class DatabaseManager {
```

## 4. Function and Method Documentation

### Function Documentation Template
```typescript
/**
 * FUNCTION: generateAIContent
 * PURPOSE: Generates AI-powered content suggestions based on user input and context
 * 
 * PARAMETERS:
 * @param prompt - string: User input or content prompt
 * @param context - ContentContext: Additional context including user preferences, project data
 * @param options - GenerationOptions: Configuration for AI generation (model, temperature, etc.)
 * 
 * RETURNS:
 * @returns Promise<AIGeneratedContent> - Generated content with metadata and confidence scores
 * 
 * SIDE_EFFECTS:
 * - Logs AI request for analytics and billing
 * - Updates user's AI usage metrics
 * - Caches results for similar future requests
 * 
 * ERROR_HANDLING:
 * - Throws AIServiceError for API failures
 * - Returns fallback content for rate limit scenarios
 * - Logs errors for monitoring and debugging
 * 
 * BUSINESS_LOGIC:
 * - Applies content safety filters before and after generation
 * - Incorporates user's writing style and preferences
 * - Respects user's content generation limits and subscription tier
 * 
 * PERFORMANCE:
 * - Implements request debouncing to prevent spam
 * - Uses streaming responses for long content generation
 * - Caches frequently requested content patterns
 */
async function generateAIContent(
  prompt: string, 
  context: ContentContext, 
  options: GenerationOptions
): Promise<AIGeneratedContent> {
```

## 5. Code Block and Logic Documentation

### Complex Logic Documentation
```typescript
// BUSINESS_LOGIC: Task Priority Calculation
// This algorithm calculates task priority based on multiple factors:
// 1. Due date proximity (weight: 40%)
// 2. User-defined importance (weight: 30%)
// 3. Project criticality (weight: 20%)
// 4. AI-predicted impact (weight: 10%)
//
// ALGORITHM_RATIONALE:
// - Due dates have highest weight to prevent missed deadlines
// - User importance respects manual prioritization
// - Project criticality ensures high-value work gets attention
// - AI predictions help surface overlooked important tasks
const calculateTaskPriority = (task: Task, project: Project): number => {
  // Due date factor: exponential increase as deadline approaches
  const daysUntilDue = differenceInDays(task.dueDate, new Date());
  const dueDateFactor = Math.max(0, Math.min(1, 1 - (daysUntilDue / 30)));
  
  // User importance: direct mapping from 1-5 scale to 0-1
  const importanceFactor = (task.userImportance - 1) / 4;
  
  // Project criticality: based on project tier and stakeholder impact
  const projectFactor = project.criticalityScore / 100;
  
  // AI prediction: machine learning model output for task impact
  const aiPrediction = task.aiImpactScore || 0.5; // Default to neutral if not available
  
  // Weighted combination of all factors
  return (dueDateFactor * 0.4) + (importanceFactor * 0.3) + (projectFactor * 0.2) + (aiPrediction * 0.1);
};
```

### State Management Documentation
```typescript
// STATE_MANAGEMENT: User Authentication State
// This reducer manages the complete authentication lifecycle including:
// - Login/logout operations
// - Session persistence and restoration
// - Token refresh and expiration handling
// - Multi-factor authentication flows
//
// STATE_STRUCTURE:
// - user: Current user object with profile and permissions
// - isAuthenticated: Boolean flag for authentication status
// - isLoading: Loading state for async auth operations
// - sessionExpiry: Timestamp for automatic logout
// - mfaRequired: Flag for multi-factor authentication requirement
//
// SIDE_EFFECTS:
// - Updates localStorage for session persistence
// - Triggers analytics events for user behavior tracking
// - Manages Supabase auth state synchronization
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
```

## 6. API and Integration Documentation

### API Route Documentation
```typescript
/**
 * API_ROUTE: /api/tasks
 * METHOD: POST
 * PURPOSE: Creates a new task with AI-powered categorization and priority assignment
 * 
 * AUTHENTICATION: Required - Bearer token
 * AUTHORIZATION: User must have write access to the specified project
 * 
 * REQUEST_BODY:
 * - title: string (required) - Task title, max 200 characters
 * - description: string (optional) - Detailed task description
 * - projectId: string (required) - UUID of the parent project
 * - dueDate: ISO string (optional) - Task deadline
 * - tags: string[] (optional) - User-defined tags for organization
 * 
 * RESPONSE:
 * - 201: Task created successfully with AI-generated metadata
 * - 400: Invalid request data or validation errors
 * - 401: Authentication required
 * - 403: Insufficient permissions for project access
 * - 429: Rate limit exceeded
 * 
 * BUSINESS_LOGIC:
 * - AI automatically categorizes task based on title and description
 * - Priority is calculated using project context and user patterns
 * - Task is added to user's notification queue if due within 24 hours
 * - Real-time updates are sent to all project collaborators
 * 
 * SIDE_EFFECTS:
 * - Triggers AI categorization service
 * - Updates project statistics and metrics
 * - Sends real-time notifications to team members
 * - Logs task creation for analytics and audit trail
 */
export async function POST(request: Request) {
```

### Database Query Documentation
```typescript
// DATABASE_QUERY: Fetch User Tasks with AI Suggestions
// This query retrieves user tasks along with AI-generated suggestions and real-time collaboration data
//
// QUERY_OPTIMIZATION:
// - Uses indexed columns (user_id, project_id, created_at) for efficient filtering
// - Implements pagination to handle large task lists
// - Joins with projects table to include project context
// - Left joins with ai_suggestions to include optional AI data
//
// PERFORMANCE_CONSIDERATIONS:
// - Query is optimized for < 100ms execution time
// - Uses connection pooling to manage database connections
// - Implements query result caching for frequently accessed data
// - Includes query plan analysis for ongoing optimization
//
// SECURITY:
// - Row-level security ensures users only see their own tasks
// - Parameterized queries prevent SQL injection
// - Audit logging tracks all data access
const fetchUserTasksWithSuggestions = async (userId: string, projectId?: string) => {
  const query = supabase
    .from('tasks')
    .select(`
      *,
      projects:project_id (
        name,
        description,
        criticality_score
      ),
      ai_suggestions:task_id (
        suggestion_type,
        content,
        confidence_score,
        created_at
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
```

## 7. Error Handling and Edge Case Documentation

### Error Handling Documentation
```typescript
// ERROR_HANDLING: AI Service Integration
// This error handling strategy manages various failure scenarios when interacting with AI services
//
// ERROR_CATEGORIES:
// 1. Network errors (timeout, connection failure)
// 2. API errors (rate limits, invalid requests, service unavailable)
// 3. Content errors (safety violations, inappropriate content)
// 4. Authentication errors (invalid API keys, expired tokens)
//
// RECOVERY_STRATEGIES:
// - Exponential backoff for transient failures
// - Fallback to cached responses when available
// - Graceful degradation to non-AI functionality
// - User notification for persistent failures
//
// MONITORING:
// - All errors are logged with context for debugging
// - Error rates are tracked for service health monitoring
// - User impact is measured and reported
try {
  const aiResponse = await openai.generateContent(prompt, options);
  return aiResponse;
} catch (error) {
  // Log error with full context for debugging
  logger.error('AI content generation failed', {
    error: error.message,
    prompt: prompt.substring(0, 100), // Truncated for privacy
    userId,
    timestamp: new Date().toISOString(),
    requestId: generateRequestId()
  });

  // Handle specific error types with appropriate recovery
  if (error instanceof RateLimitError) {
    // Return cached content if available, otherwise show user-friendly message
    const cachedContent = await getCachedContent(prompt);
    if (cachedContent) {
      return { ...cachedContent, source: 'cache', warning: 'Using cached content due to rate limits' };
    }
    throw new UserFacingError('AI service is temporarily busy. Please try again in a few minutes.');
  }
```

## 8. Performance and Optimization Documentation

### Performance Critical Code Documentation
```typescript
// PERFORMANCE_CRITICAL: Real-time Task Synchronization
// This code handles real-time synchronization of tasks across multiple users and devices
//
// PERFORMANCE_REQUIREMENTS:
// - Updates must propagate to all clients within 500ms
// - System must handle 1000+ concurrent users per project
// - Memory usage must remain under 50MB per client connection
// - CPU usage should not exceed 10% during normal operations
//
// OPTIMIZATION_TECHNIQUES:
// - Uses WebSocket connections for low-latency updates
// - Implements differential synchronization to minimize data transfer
// - Employs client-side caching with intelligent invalidation
// - Uses connection pooling and load balancing for scalability
//
// MONITORING_METRICS:
// - Connection count and health status
// - Message latency and throughput
// - Memory and CPU usage per connection
// - Error rates and connection stability
const setupRealTimeSync = (projectId: string, userId: string) => {
  // Establish WebSocket connection with automatic reconnection
  const ws = new WebSocket(`${WS_ENDPOINT}/projects/${projectId}`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });

  // Implement heartbeat to detect connection issues
  const heartbeatInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'heartbeat', timestamp: Date.now() }));
    }
  }, 30000); // 30-second heartbeat
```

## 9. Security and Privacy Documentation

### Security-Critical Code Documentation
```typescript
// SECURITY_CRITICAL: User Data Encryption
// This function handles encryption of sensitive user data before storage
//
// SECURITY_REQUIREMENTS:
// - Uses AES-256-GCM encryption for data at rest
// - Implements key rotation every 90 days
// - Ensures keys are never logged or exposed in error messages
// - Complies with GDPR and CCPA privacy requirements
//
// THREAT_MODEL:
// - Protects against database breaches and unauthorized access
// - Prevents data exposure in logs and error messages
// - Ensures data cannot be decrypted without proper authentication
// - Implements defense against timing attacks
//
// COMPLIANCE:
// - GDPR Article 32: Security of processing
// - CCPA: Reasonable security procedures
// - SOC 2 Type II: Security controls
//
// AUDIT_TRAIL:
// - All encryption/decryption operations are logged (without exposing data)
// - Key usage is tracked for compliance reporting
// - Access patterns are monitored for anomaly detection
const encryptSensitiveData = async (data: string, userId: string): Promise<EncryptedData> => {
  // Generate unique initialization vector for each encryption operation
  const iv = crypto.randomBytes(16);
  
  // Retrieve user-specific encryption key from secure key management service
  const encryptionKey = await getEncryptionKey(userId);
  
  // Create cipher with AES-256-GCM for authenticated encryption
  const cipher = crypto.createCipher('aes-256-gcm', encryptionKey, iv);
```

## 10. File-by-File Implementation Instructions

### Systematic Documentation Process
The cursor agent must systematically review and document every file according to these requirements:

#### Phase 1: Critical Infrastructure Files
1. **Authentication and Security Files**
   - Document all security-related functions and their threat models
   - Explain authentication flows and session management
   - Detail encryption and data protection mechanisms

2. **Database and API Files**
   - Document all database schemas and relationships
   - Explain API endpoints and their business logic
   - Detail data validation and sanitization processes

3. **Core Business Logic Files**
   - Document primary application workflows
   - Explain business rules and their implementation
   - Detail state management and data flow

#### Phase 2: User Interface and Experience Files
1. **React Components**
   - Document component purpose and user interactions
   - Explain state management and lifecycle
   - Detail accessibility and performance considerations

2. **Utility and Helper Files**
   - Document utility functions and their use cases
   - Explain algorithms and their complexity
   - Detail error handling and edge cases

#### Phase 3: Integration and Configuration Files
1. **Third-Party Integrations**
   - Document API integrations and their purposes
   - Explain error handling and fallback strategies
   - Detail rate limiting and usage monitoring

2. **Configuration and Environment Files**
   - Document configuration options and their impacts
   - Explain environment-specific settings
   - Detail deployment and scaling considerations

### Documentation Quality Standards

#### Completeness Checklist
- [ ] **File Purpose**: Clear explanation of what the file does
- [ ] **Business Context**: How it fits into the larger application
- [ ] **Dependencies**: What it requires and what requires it
- [ ] **Data Flow**: How data moves through the code
- [ ] **Error Handling**: How errors are managed and recovered
- [ ] **Performance**: Any performance considerations or optimizations
- [ ] **Security**: Security implications and protections
- [ ] **Testing**: How the code can be tested and validated

#### AI Understanding Verification
Each documented file should enable an AI assistant to:
- Understand the file's purpose without reading the implementation
- Identify potential issues or improvements
- Suggest relevant modifications or enhancements
- Explain the code's behavior to other developers
- Troubleshoot problems and debug issues

### Implementation Progress Tracking

#### Progress Documentation
Maintain implementation progress in `/docs/_documentation_progress.md`:
- Track which files have been documented
- Note any files that need special attention
- Record documentation quality scores
- Plan future documentation improvements

#### Quality Metrics
- **Coverage**: Percentage of files with comprehensive documentation
- **Clarity**: Readability and understandability of comments
- **Accuracy**: Correctness of documented behavior
- **Completeness**: Coverage of all important aspects
- **Maintainability**: Ease of keeping documentation current

## 11. Maintenance and Updates

### Documentation Maintenance Schedule
- **Daily**: Update documentation for any modified files
- **Weekly**: Review and improve documentation quality
- **Monthly**: Audit documentation coverage and accuracy
- **Quarterly**: Comprehensive documentation system review

### Automated Documentation Tools
- **Linting**: Automated checks for documentation completeness
- **Generation**: Auto-generation of basic documentation templates
- **Validation**: Verification that documentation matches implementation
- **Metrics**: Tracking of documentation quality and coverage

### Continuous Improvement
- Regular review of documentation effectiveness
- Integration of user feedback and AI suggestions
- Updates based on code changes and new requirements
- Training and guidelines for maintaining documentation quality



