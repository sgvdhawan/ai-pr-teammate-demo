/**
 * Code Fixer Service
 * 
 * Orchestrates the code fixing process:
 * 1. Extracts context from review comments
 * 2. Calls AI service to generate fixes
 * 3. Applies fixes via GitHub service
 */

export class CodeFixer {
  constructor(githubService, aiService) {
    this.github = githubService;
    this.ai = aiService;
  }
  
  /**
   * Process a review comment and generate fixes
   */
  async processReviewComment(prNumber, commentContext) {
    try {
      console.log('🔧 Processing review comment...');
      
      // Get PR context
      const prContext = await this.github.getPRContext(prNumber);
      const { pr, diff, files, comments } = prContext;
      
      // Extract the specific file and code being discussed
      const targetInfo = this.extractTargetFromComment(commentContext, prContext);
      
      if (!targetInfo.filePath) {
        return {
          success: false,
          error: 'Could not determine which file to fix. Please mention the file path or use inline comments.'
        };
      }
      
      console.log(`📝 Target file: ${targetInfo.filePath}`);
      
      // Get file content
      const fileContent = await this.github.getFileContent(
        targetInfo.filePath,
        pr.head.ref
      );
      
      if (!fileContent) {
        return {
          success: false,
          error: `Could not read file: ${targetInfo.filePath}`
        };
      }
      
      // Prepare context for AI
      const aiContext = {
        reviewComment: commentContext.body,
        fileContent,
        filePath: targetInfo.filePath,
        prDiff: diff,
        relevantCode: targetInfo.relevantCode
      };
      
      console.log('🧠 Calling AI to generate fix...');
      
      // Generate fix
      const fixResult = await this.ai.generateCodeFix(aiContext);
      
      if (!fixResult.fixedCode) {
        return {
          success: false,
          error: 'AI could not generate a fix. Please provide more details.'
        };
      }
      
      console.log('💾 Applying fix...');
      
      // Apply fix
      const commitResult = await this.github.updateFile(
        prNumber,
        targetInfo.filePath,
        fixResult.fixedCode,
        `🤖 AI PR Teammate: ${fixResult.changes.split('\n')[0] || 'Apply code review feedback'}`
      );
      
      return {
        success: true,
        changes: fixResult.changes,
        explanation: fixResult.explanation,
        commitSha: commitResult.commitSha
      };
      
    } catch (error) {
      console.error('Error processing review comment:', error);
      return {
        success: false,
        error: `Error: ${error.message}`
      };
    }
  }
  
  /**
   * Extract target file and relevant code from comment context
   */
  extractTargetFromComment(commentContext, prContext) {
    let filePath = null;
    let relevantCode = null;
    
    // If it's a review comment (inline), we have the file path
    if (commentContext.type === 'review_comment' && commentContext.comment) {
      filePath = commentContext.comment.path;
      
      // Try to get the specific lines being commented on
      if (commentContext.comment.line) {
        const line = commentContext.comment.line;
        const fileContent = commentContext.comment.diff_hunk;
        relevantCode = fileContent;
      }
    }
    
    // Try to extract file path from comment body
    if (!filePath) {
      const filePathMatch = commentContext.body.match(/`([^`]+\.[a-zA-Z]+)`/);
      if (filePathMatch) {
        filePath = filePathMatch[1];
      } else {
        // Look for common file path patterns
        const pathMatch = commentContext.body.match(/\b([\w\-]+\/[\w\-./]+\.\w+)\b/);
        if (pathMatch) {
          filePath = pathMatch[1];
        }
      }
    }
    
    // If still no file path, use the first modified file in the PR
    if (!filePath && prContext.files.length > 0) {
      filePath = prContext.files[0].filename;
      console.log(`⚠️  No specific file mentioned, using first modified file: ${filePath}`);
    }
    
    return {
      filePath,
      relevantCode
    };
  }
  
  /**
   * Process multiple files at once (for batch fixes)
   */
  async processMultipleFixes(prNumber, fileFixes, commitMessage) {
    try {
      const fileChanges = fileFixes.map(fix => ({
        path: fix.path,
        content: fix.content
      }));
      
      const result = await this.github.updateMultipleFiles(
        prNumber,
        fileChanges,
        commitMessage
      );
      
      return result;
    } catch (error) {
      console.error('Error processing multiple fixes:', error);
      throw error;
    }
  }
}

