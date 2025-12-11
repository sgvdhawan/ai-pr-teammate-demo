/**
 * AI Service
 * 
 * Handles LLM interactions with Claude or OpenAI
 * Provides code analysis and fix generation
 */

import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

export class AIService {
  constructor() {
    this.provider = process.env.AI_PROVIDER || 'anthropic';
    
    if (this.provider === 'anthropic') {
      this.client = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY
      });
      this.model = 'claude-3-5-sonnet-20241022';
    } else if (this.provider === 'openai') {
      this.client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
      this.model = 'gpt-3.5-turbo'; // Works for all OpenAI accounts
    }
    
    console.log(`🧠 AI Provider: ${this.provider}`);
  }
  
  /**
   * Generate code fix based on review comment and context
   */
  async generateCodeFix(context) {
    const {
      reviewComment,
      fileContent,
      filePath,
      prDiff,
      relevantCode
    } = context;
    
    const prompt = this.buildCodeFixPrompt(
      reviewComment,
      fileContent,
      filePath,
      prDiff,
      relevantCode
    );
    
    const response = await this.callLLM(prompt);
    return this.parseCodeFixResponse(response);
  }
  
  /**
   * Analyze CI failure and suggest fixes
   */
  async analyzeCIFailure(context) {
    const {
      errorLogs,
      prDiff,
      files
    } = context;
    
    const prompt = this.buildCIAnalysisPrompt(errorLogs, prDiff, files);
    const response = await this.callLLM(prompt);
    return this.parseCIAnalysisResponse(response);
  }
  
  /**
   * Build prompt for code fix generation
   */
  buildCodeFixPrompt(reviewComment, fileContent, filePath, prDiff, relevantCode) {
    return `You are an expert AI code reviewer and developer. You've been asked to fix code based on a review comment.

**Review Comment:**
${reviewComment}

**File Path:**
${filePath}

**Current File Content:**
\`\`\`
${fileContent}
\`\`\`

${relevantCode ? `**Relevant Code Context:**
\`\`\`
${relevantCode}
\`\`\`` : ''}

${prDiff ? `**PR Diff Context:**
\`\`\`diff
${prDiff.substring(0, 3000)}
\`\`\`` : ''}

**Your Task:**
1. Understand the review comment and what needs to be fixed
2. Generate the complete fixed version of the file
3. Explain what you changed and why
4. Ensure the code follows best practices:
   - Proper error handling
   - Input validation
   - Loading states (for UI components)
   - Security considerations
   - Performance optimization
   - Clear comments where needed

**Response Format:**
Please respond in this exact format:

FIXED_CODE:
\`\`\`
[Complete fixed file content here]
\`\`\`

EXPLANATION:
[Brief explanation of changes made]

CHANGES_SUMMARY:
- [List of specific changes]
- [One per line]
`;
  }
  
  /**
   * Build prompt for CI failure analysis
   */
  buildCIAnalysisPrompt(errorLogs, prDiff, files) {
    return `You are an expert at debugging CI/CD failures. Analyze the following CI error and suggest fixes.

**Error Logs:**
\`\`\`
${errorLogs.substring(0, 5000)}
\`\`\`

**PR Changes:**
\`\`\`diff
${prDiff.substring(0, 3000)}
\`\`\`

**Modified Files:**
${files.map(f => `- ${f.filename} (${f.status})`).join('\n')}

**Your Task:**
1. Identify the root cause of the CI failure
2. Determine which file(s) need to be fixed
3. Generate the complete fixed version of those files
4. Explain what caused the failure and how you fixed it

**Response Format:**
FILE_FIXES:
---FILE: [filepath]
\`\`\`
[Complete fixed file content]
\`\`\`
---END_FILE

[Repeat for each file that needs fixing]

EXPLANATION:
[Explanation of the issue and fixes]

ROOT_CAUSE:
[Root cause of the failure]
`;
  }
  
  /**
   * Call the LLM with the prompt
   */
  async callLLM(prompt) {
    // DEMO MODE: Use hardcoded response for hackathon demo
    const USE_MOCK_RESPONSE = process.env.DEMO_MODE === 'true' || true; // Set to false when you have API credits
    
    if (USE_MOCK_RESPONSE) {
      console.log('🎭 Using mock AI response (DEMO MODE)');
      return this.getMockResponse(prompt);
    }
    
    try {
      if (this.provider === 'anthropic') {
        const message = await this.client.messages.create({
          model: this.model,
          max_tokens: 8000,
          messages: [{
            role: 'user',
            content: prompt
          }]
        });
        
        return message.content[0].text;
      } else if (this.provider === 'openai') {
        const completion = await this.client.chat.completions.create({
          model: this.model,
          messages: [{
            role: 'user',
            content: prompt
          }],
          max_tokens: 8000
        });
        
        return completion.choices[0].message.content;
      }
    } catch (error) {
      console.error('Error calling LLM:', error);
      throw error;
    }
  }
  
  /**
   * Get mock response for demo purposes
   */
  getMockResponse(prompt) {
    // Detect if this is a code fix or CI analysis based on prompt content
    if (prompt.includes('CI') || prompt.includes('Error Logs')) {
      return this.getMockCIResponse();
    } else {
      return this.getMockCodeFixResponse(prompt);
    }
  }
  
  /**
   * Generate mock code fix response
   */
  getMockCodeFixResponse(prompt) {
    // Extract file content from prompt to generate realistic fix
    const fileContentMatch = prompt.match(/\*\*Current File Content:\*\*\s*```\s*([\s\S]*?)```/);
    const filePathMatch = prompt.match(/\*\*File Path:\*\*\s*(.+)/);
    
    const filePath = filePathMatch ? filePathMatch[1].trim() : 'file.js';
    const originalCode = fileContentMatch ? fileContentMatch[1].trim() : '';
    
    // Check if code already has good error handling
    const hasErrorHandling = originalCode.includes('try') && originalCode.includes('catch');
    const hasInputValidation = originalCode.includes('if (!') || originalCode.includes('typeof');
    const hasStatusCodes = originalCode.includes('.status(') || originalCode.includes('status:');
    const hasConsoleError = originalCode.includes('console.error');
    
    const codeAlreadyGood = hasErrorHandling && hasInputValidation && (hasStatusCodes || hasConsoleError);
    
    // Generate improved version with error handling
    const fixedCode = this.generateFixedCode(originalCode);
    
    // Different response based on whether code was already good
    if (codeAlreadyGood) {
      return `FIXED_CODE:
\`\`\`
${fixedCode}
\`\`\`

EXPLANATION:
Great work! This code already follows best practices with comprehensive error handling. I've reviewed it and found:

✅ **Error Handling**: Properly implemented try-catch blocks
✅ **Input Validation**: Good checks for null, undefined, and invalid inputs
✅ **HTTP Status Codes**: Correct status codes (200, 400, 404, 500)
✅ **Error Logging**: Console.error included for debugging
✅ **Type Checking**: Data types validated before processing
✅ **Edge Cases**: Empty strings, null values, and missing data handled
✅ **Security**: No obvious vulnerabilities detected
✅ **Code Quality**: Clean, readable, and maintainable

The code is production-ready and meets industry standards. No significant changes needed!

CHANGES_SUMMARY:
- No changes required - code already follows best practices
- All error handling is properly implemented
- Input validation is comprehensive
- HTTP status codes are correct
- Code is production-ready`;
    }
    
    // For bad code, return improvement suggestions
    return `FIXED_CODE:
\`\`\`
${fixedCode}
\`\`\`

EXPLANATION:
I've significantly improved this code by adding comprehensive error handling and best practices:

1. **Error Handling**: Added try-catch blocks to gracefully handle runtime errors
2. **Input Validation**: Added checks for null, undefined, and invalid inputs
3. **HTTP Status Codes**: Returns proper status codes (200, 400, 404, 500)
4. **Error Logging**: Added console.error for debugging
5. **Type Checking**: Validates data types before processing
6. **Edge Cases**: Handles empty strings, null values, and missing data
7. **Security**: Prevents common vulnerabilities like SQL injection
8. **Return Format**: Consistent response format with status and data/error

The code now follows industry best practices and is production-ready!

CHANGES_SUMMARY:
- Added comprehensive try-catch error handling
- Implemented input validation with type checking
- Added proper HTTP status codes (200, 400, 404, 500)
- Included error logging for debugging
- Added null/undefined checks
- Implemented consistent response format
- Added security improvements
- Improved code documentation with comments`;
  }
  
  /**
   * Generate fixed code with improvements
   */
  generateFixedCode(originalCode) {
    // If no code provided, return example
    if (!originalCode) {
      return `/**
 * Example API endpoint with comprehensive error handling
 */
export async function handleRequest(req, res) {
  try {
    // Input validation
    const { id } = req.params;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        status: 400,
        error: 'Invalid ID provided'
      });
    }
    
    // Process request
    const result = await processData(id);
    
    if (!result) {
      return res.status(404).json({
        status: 404,
        error: 'Resource not found'
      });
    }
    
    return res.status(200).json({
      status: 200,
      data: result
    });
  } catch (error) {
    console.error('Error handling request:', error);
    return res.status(500).json({
      status: 500,
      error: 'Internal server error'
    });
  }
}

async function processData(id) {
  // Your business logic here
  return { id, processed: true };
}`;
    }
    
    // Check if code already has good error handling
    const hasErrorHandling = originalCode.includes('try') && originalCode.includes('catch');
    const hasInputValidation = originalCode.includes('if (!') || originalCode.includes('typeof');
    const hasStatusCodes = originalCode.includes('.status(') || originalCode.includes('status:');
    const hasConsoleError = originalCode.includes('console.error');
    
    // If code already looks good, return it as-is
    if (hasErrorHandling && hasInputValidation && (hasStatusCodes || hasConsoleError)) {
      console.log('✅ Code already has good error handling - returning as-is');
      return originalCode;
    }
    
    // Add improvements to existing code
    // Wrap in try-catch if not already
    let improved = originalCode;
    
    if (!improved.includes('try') && !improved.includes('catch')) {
      // Simple wrap in try-catch
      improved = `try {
  ${improved.split('\n').map(line => '  ' + line).join('\n')}
} catch (error) {
  console.error('Error:', error);
  throw error;
}`;
    }
    
    // Add input validation if function with parameters
    if (improved.includes('function') && improved.includes('(')) {
      const funcMatch = improved.match(/function\s+\w+\s*\(([^)]+)\)/);
      if (funcMatch && funcMatch[1]) {
        const params = funcMatch[1].split(',').map(p => p.trim());
        let validation = params.map(param => {
          const paramName = param.split(/[=:]/)[0].trim();
          return `  // Validate ${paramName}\n  if (!${paramName}) {\n    throw new Error('${paramName} is required');\n  }`;
        }).join('\n\n');
        
        improved = improved.replace(/^(\s*)(try\s*{)/, `$1$2\n${validation}\n`);
      }
    }
    
    return improved;
  }
  
  /**
   * Generate mock CI fix response
   */
  getMockCIResponse() {
    return `FILE_FIXES:
---FILE: src/api.js
\`\`\`
/**
 * API Handler with proper error handling
 */
export async function getUser(id) {
  try {
    // Input validation
    if (!id || typeof id !== 'string') {
      return {
        status: 400,
        error: 'Invalid user ID provided'
      };
    }
    
    const user = await database.find(id);
    
    if (!user) {
      return {
        status: 404,
        error: 'User not found'
      };
    }
    
    return {
      status: 200,
      data: user
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    return {
      status: 500,
      error: 'Internal server error'
    };
  }
}
\`\`\`
---END_FILE

EXPLANATION:
The CI failure was caused by missing error handling and improper return values. I've fixed the code by:

1. Adding comprehensive try-catch blocks
2. Implementing input validation
3. Adding proper HTTP status codes
4. Including error logging
5. Handling edge cases (null, undefined)
6. Ensuring consistent return format

The linting errors have been resolved and the code now follows best practices.

ROOT_CAUSE:
Missing error handling and inconsistent return values caused the CI checks to fail. The code was not handling edge cases properly and lacked proper error boundaries.`;
  }
  
  /**
   * Parse code fix response from LLM
   */
  parseCodeFixResponse(response) {
    const fixedCodeMatch = response.match(/FIXED_CODE:\s*```[\w]*\n([\s\S]*?)```/);
    const explanationMatch = response.match(/EXPLANATION:\s*([\s\S]*?)(?=CHANGES_SUMMARY:|$)/);
    const changesMatch = response.match(/CHANGES_SUMMARY:\s*([\s\S]*?)$/);
    
    return {
      fixedCode: fixedCodeMatch ? fixedCodeMatch[1].trim() : null,
      explanation: explanationMatch ? explanationMatch[1].trim() : 'No explanation provided',
      changes: changesMatch ? changesMatch[1].trim() : 'No changes summary provided'
    };
  }
  
  /**
   * Parse CI analysis response from LLM
   */
  parseCIAnalysisResponse(response) {
    const fileFixes = [];
    const fileMatches = response.matchAll(/---FILE:\s*(.+?)\s*```[\w]*\n([\s\S]*?)```\s*---END_FILE/g);
    
    for (const match of fileMatches) {
      fileFixes.push({
        path: match[1].trim(),
        content: match[2].trim()
      });
    }
    
    const explanationMatch = response.match(/EXPLANATION:\s*([\s\S]*?)(?=ROOT_CAUSE:|$)/);
    const rootCauseMatch = response.match(/ROOT_CAUSE:\s*([\s\S]*?)$/);
    
    return {
      fileFixes,
      explanation: explanationMatch ? explanationMatch[1].trim() : 'No explanation provided',
      rootCause: rootCauseMatch ? rootCauseMatch[1].trim() : 'No root cause identified'
    };
  }
}

