# Demo PR Comments

Use these example comments during your hackathon demo to show off different capabilities.

## Basic Error Handling

```
@ai-teammate please add proper error handling to this function
```

## Comprehensive Improvements

```
@ai-teammate add error handling, input validation, and proper HTTP status codes
```

## Frontend Loading States

```
@ai-teammate this React component needs loading and error states
```

## Security Improvements

```
@ai-teammate this code has a SQL injection vulnerability, please fix it
```

## TypeScript Types

```
@ai-teammate add TypeScript types and JSDoc comments
```

## Performance Optimization

```
@ai-teammate optimize this function for better performance
```

## Multiple Files

```
@ai-teammate add error handling to both api/users.js and api/posts.js
```

## Best Practices

```
@ai-teammate refactor this to follow JavaScript best practices
```

## Async/Await

```
@ai-teammate convert this callback-based code to async/await
```

## React Best Practices

```
@ai-teammate add error boundaries and proper state management
```

## API Response Format

```
@ai-teammate make this API return consistent response format with status codes
```

## Edge Cases

```
@ai-teammate handle edge cases like null values, empty arrays, and undefined
```

## Code Comments

```
@ai-teammate add comprehensive comments explaining what this code does
```

## Linting Fixes

```
@ai-teammate fix all ESLint errors in this file
```

## Accessibility

```
@ai-teammate add proper ARIA labels and accessibility features
```

## Test Coverage

```
@ai-teammate identify what test cases are missing for this function
```

---

## Advanced Demo Scenarios

### Scenario 1: Complete API Endpoint

**Initial code:**
```javascript
export function handleUser(req, res) {
  const user = db.get(req.params.id);
  res.send(user);
}
```

**Comment:**
```
@ai-teammate this needs:
- Input validation
- Error handling
- Proper HTTP status codes
- Async/await
- Database error handling
- 404 handling
```

### Scenario 2: React Component

**Initial code:**
```javascript
export function UserList({ users }) {
  return (
    <div>
      {users.map(user => (
        <div>{user.name}</div>
      ))}
    </div>
  );
}
```

**Comment:**
```
@ai-teammate improve this component with:
- Loading state
- Error state
- Empty state
- Key props
- Proper semantic HTML
- Accessibility
```

### Scenario 3: Security Issue

**Initial code:**
```javascript
export function search(query) {
  return db.query(`SELECT * FROM users WHERE name LIKE '%${query}%'`);
}
```

**Comment:**
```
@ai-teammate this has SQL injection vulnerability, please fix using parameterized queries
```

---

## Quick Demo Responses

These are approximate responses the AI will provide:

### For Error Handling Request

**AI Response:**
```
✅ AI PR Teammate completed the task!

### Changes Made:
- Add try-catch error handling
- Add input validation
- Add null/undefined checks
- Add proper error logging

### Explanation:
I added comprehensive error handling to prevent runtime crashes. 
The function now validates inputs, handles errors gracefully, 
and returns appropriate error messages to the caller.

📝 Commit: abc123
```

### For CI Failure

**AI Response:**
```
✅ AI PR Teammate completed the task!

### Changes Made:
Fixed 3 file(s):
- src/utils/validator.js
- src/api/users.js
- tests/users.test.js

### Explanation:
**Root Cause:** ESLint errors due to missing semicolons and unused variables

I fixed the linting errors by:
1. Adding missing semicolons
2. Removing unused imports
3. Fixing variable naming conventions

📝 Commit: def456
```

---

## Tips for Live Demo

1. **Start Simple**: Begin with a basic error handling request
2. **Show Speed**: Highlight how fast the AI responds (< 30 seconds)
3. **Show Quality**: Review the generated code to show it's production-ready
4. **Show Explanation**: Always show the AI's explanation comment
5. **Show CI Fix**: This is the most impressive feature - save it for last!

## What to Avoid

- ❌ Don't use overly complex requests first
- ❌ Don't rush through the demo
- ❌ Don't skip showing the generated code
- ❌ Don't forget to highlight the commit message
- ❌ Don't assume internet will work (have backup video!)

## Backup Demo Data

If live demo fails, have screenshots ready of:
1. The initial problematic code
2. The review comment
3. The Actions workflow running
4. The fixed code commit
5. The explanation comment
6. The CI going from red to green

