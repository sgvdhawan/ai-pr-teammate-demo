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
      this.model = 'gpt-4-turbo-preview';
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

