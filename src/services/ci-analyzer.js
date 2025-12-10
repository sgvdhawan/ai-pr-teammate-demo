/**
 * CI Analyzer Service
 * 
 * Analyzes CI failures and generates fixes:
 * 1. Fetches CI logs
 * 2. Identifies errors
 * 3. Calls AI to generate fixes
 * 4. Applies fixes
 */

export class CIAnalyzer {
  constructor(githubService, aiService) {
    this.github = githubService;
    this.ai = aiService;
  }
  
  /**
   * Analyze and fix CI failure
   */
  async analyzeFix(prNumber) {
    try {
      console.log('🔍 Analyzing CI failure...');
      
      // Get PR context
      const prContext = await this.github.getPRContext(prNumber);
      const { pr, diff, files } = prContext;
      
      // Get check runs
      const checkRuns = await this.github.getCheckRuns(prNumber);
      
      // Find failed checks
      const failedChecks = checkRuns.filter(check => 
        check.conclusion === 'failure' || check.conclusion === 'timed_out'
      );
      
      if (failedChecks.length === 0) {
        return {
          success: false,
          error: 'No failed CI checks found.'
        };
      }
      
      console.log(`❌ Found ${failedChecks.length} failed check(s)`);
      
      // Collect error information
      const errorLogs = this.extractErrorsFromChecks(failedChecks);
      
      if (!errorLogs) {
        return {
          success: false,
          error: 'Could not extract error information from CI logs.'
        };
      }
      
      console.log('🧠 Calling AI to analyze CI failure...');
      
      // Prepare context for AI
      const aiContext = {
        errorLogs,
        prDiff: diff,
        files
      };
      
      // Generate fix
      const analysisResult = await this.ai.analyzeCIFailure(aiContext);
      
      if (!analysisResult.fileFixes || analysisResult.fileFixes.length === 0) {
        return {
          success: false,
          error: 'AI could not determine a fix. Manual intervention may be required.'
        };
      }
      
      console.log(`💾 Applying ${analysisResult.fileFixes.length} fix(es)...`);
      
      // Apply fixes
      const commitResult = await this.github.updateMultipleFiles(
        prNumber,
        analysisResult.fileFixes,
        `🤖 AI PR Teammate: Fix CI failures\n\n${analysisResult.rootCause}`
      );
      
      return {
        success: true,
        changes: `Fixed ${analysisResult.fileFixes.length} file(s):\n${
          analysisResult.fileFixes.map(f => `- ${f.path}`).join('\n')
        }`,
        explanation: `**Root Cause:** ${analysisResult.rootCause}\n\n${analysisResult.explanation}`,
        commitSha: commitResult.commitSha
      };
      
    } catch (error) {
      console.error('Error analyzing CI failure:', error);
      return {
        success: false,
        error: `Error analyzing CI: ${error.message}`
      };
    }
  }
  
  /**
   * Extract error messages from check runs
   */
  extractErrorsFromChecks(failedChecks) {
    const errors = [];
    
    for (const check of failedChecks) {
      const checkInfo = {
        name: check.name,
        conclusion: check.conclusion,
        output: check.output
      };
      
      // Extract summary and text
      if (check.output) {
        if (check.output.title) {
          errors.push(`[${check.name}] ${check.output.title}`);
        }
        if (check.output.summary) {
          errors.push(check.output.summary);
        }
        if (check.output.text) {
          errors.push(check.output.text);
        }
      }
      
      // Extract annotations
      if (check.output && check.output.annotations) {
        for (const annotation of check.output.annotations) {
          errors.push(`${annotation.path}:${annotation.start_line}: ${annotation.message}`);
        }
      }
    }
    
    // If we have no errors yet, create a generic message
    if (errors.length === 0) {
      errors.push(`CI check failed: ${failedChecks.map(c => c.name).join(', ')}`);
    }
    
    return errors.join('\n\n');
  }
  
  /**
   * Parse common CI error patterns
   */
  parseErrorPatterns(errorLog) {
    const patterns = {
      // Syntax errors
      syntaxError: /SyntaxError: (.+)/g,
      
      // Linting errors
      eslintError: /error\s+(.+?)\s+@\w+/g,
      
      // Test failures
      testFailure: /FAIL\s+(.+)/g,
      
      // Build errors
      buildError: /ERROR in (.+)/g,
      
      // Type errors
      typeError: /TypeError: (.+)/g,
      
      // Import errors
      importError: /Cannot find module ['"](.+)['"]/g,
      
      // Compilation errors
      compilationError: /Compilation failed/g
    };
    
    const foundErrors = {};
    
    for (const [type, pattern] of Object.entries(patterns)) {
      const matches = [...errorLog.matchAll(pattern)];
      if (matches.length > 0) {
        foundErrors[type] = matches.map(m => m[1] || m[0]);
      }
    }
    
    return foundErrors;
  }
}

