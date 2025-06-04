---
description: 
globs: 
alwaysApply: false
---
---
description: How to handle/ Implement OpenAI API
globs: 
alwaysApply: false
---
# OpenAI API Implementation Rules

## Core API Rules
1. All OpenAI API calls must go through the centralized `OpenAIService` class
2. Use model hierarchy:
   - GPT-4o: High-accuracy tasks
   - GPT-4o-mini: Less complex tasks or performance-critical operations
   - GPT-3.5-turbo: Simple tasks or fallback
3. Never hardcode API keys; use environment variables
4. Implement proper error handling for all API calls
5. Validate all inputs before sending to the API
6. Implement rate limiting to avoid quota issues
7. Use JSON response format only with supporting models

## Pagination Implementation

### Core Principles
- Use cursor-based pagination for large datasets
- Encode cursor information in Base64 format
- Include cursor information in response metadata
- Support bidirectional pagination
- Handle pagination edge cases

### Implementation Requirements
1. Store cursor state in opaque string token
2. Server-side cursor decoding only
3. Include pagination metadata in responses
4. Support configurable page sizes
5. Implement cursor validation

### Cursor Format
```json
{
  "id": "last_record_id",
  "timestamp": "last_record_timestamp",
  "page_size": 50,
  "direction": "forward"
}
```

### Response Format
```json
{
  "data": [...],
  "pagination": {
    "next_cursor": "encoded_next_cursor",
    "prev_cursor": "encoded_prev_cursor",
    "has_more": true|false,
    "total_count": 1000
  }
}
```

## Error Handling
1. Handle pagination errors gracefully
2. Provide clear error messages
3. Implement retry logic
4. Log errors with context
5. Return partial results when possible

## Performance Guidelines
1. Cache paginated results when appropriate
2. Use parallel processing for independent batches
3. Implement backoff strategies
4. Monitor API usage
5. Use streaming for large datasets

## Security Requirements
1. Validate and sanitize cursor inputs
2. Implement cursor expiration
3. Use HTTPS for all calls
4. Implement proper authentication
5. Audit and log API access

## Example Implementation
```python
def process_with_pagination(items, batch_size=50, cursor=None):
    """
    Process items with pagination using OpenAI API.
    
    Args:
        items: List of items to process
        batch_size: Number of items per batch
        cursor: Pagination cursor (None for first page)
        
    Returns:
        tuple: (processed_items, next_cursor)
    """
    # Decode cursor if provided
    start_index = 0
    if cursor:
        cursor_data = decode_cursor(cursor)
        start_index = cursor_data.get("index", 0)
    
    # Get current batch
    end_index = min(start_index + batch_size, len(items))
    current_batch = items[start_index:end_index]
    
    # Process batch with OpenAI
    processed_batch = process_batch_with_openai(current_batch)
    
    # Create next cursor if there are more items
    next_cursor = None
    if end_index < len(items):
        next_cursor = encode_cursor({
            "index": end_index,
            "timestamp": datetime.now().isoformat(),
            "total": len(items)
        })
    
    return processed_batch, next_cursor
``` 