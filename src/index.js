#!/usr/bin/env node

/**
 * AI PR Teammate - Main Entry Point
 * 
 * This is the core orchestrator that:
 * 1. Detects the trigger (comment, CI failure)
 * 2. Fetches context (PR diff, files, logs)
 * 3. Calls AI to generate fixes
 * 4. Applies changes and commits
 * 5. Posts explanation
 */

import * as core from '@actions/core';
import * as github from '@actions/github';
import { GitHubService } from './services/github-service.js';
import { AIService } from './services/ai-service.js';
import { CodeFixer } from './services/code-fixer.js';
import { CIAnalyzer } from './services/ci-analyzer.js';

const AI_TRIGGER_PATTERNS = [
  /@ai-teammate/i,
  /@ai-bot/i,
  /@ai-pr-assistant/i
];

async function main() {
  try {
    const context = github.context;
    const eventName = context.eventName;
    
    console.log(`🤖 AI PR Teammate activated!`);
    console.log(`Event: ${eventName}`);
    
    // Initialize services
    const githubToken = process.env.GITHUB_TOKEN;
    const githubService = new GitHubService(githubToken, context);
    const aiService = new AIService();
    const codeFixer = new CodeFixer(githubService, aiService);
    const ciAnalyzer = new CIAnalyzer(githubService, aiService);
    
    let shouldProcess = false;
    let taskType = null;
    let commentBody = null;
    let prNumber = null;
    
    // Determine if we should process this event
    if (eventName === 'issue_comment') {
      commentBody = context.payload.comment?.body || '';
      prNumber = context.payload.issue?.number;
      shouldProcess = AI_TRIGGER_PATTERNS.some(pattern => pattern.test(commentBody));
      taskType = 'comment';
    } else if (eventName === 'pull_request_review_comment') {
      commentBody = context.payload.comment?.body || '';
      prNumber = context.payload.pull_request?.number;
      shouldProcess = AI_TRIGGER_PATTERNS.some(pattern => pattern.test(commentBody));
      taskType = 'review_comment';
    } else if (eventName === 'check_run') {
      const checkRun = context.payload.check_run;
      if (checkRun.conclusion === 'failure') {
        // Find associated PR
        const prs = checkRun.pull_requests || [];
        if (prs.length > 0) {
          prNumber = prs[0].number;
          shouldProcess = true;
          taskType = 'ci_failure';
        }
      }
    }
    
    if (!shouldProcess) {
      console.log('⏭️  No AI trigger detected or not applicable. Skipping.');
      return;
    }
    
    if (!prNumber) {
      console.log('⚠️  Could not determine PR number. Skipping.');
      return;
    }
    
    console.log(`📋 Task Type: ${taskType}`);
    console.log(`🎯 PR Number: ${prNumber}`);
    
    // Post acknowledgment comment
    await githubService.postComment(
      prNumber,
      '🤖 AI PR Teammate is analyzing your request... Please wait.'
    );
    
    // Handle different task types
    let result;
    
    if (taskType === 'ci_failure') {
      console.log('🔍 Analyzing CI failure...');
      result = await ciAnalyzer.analyzeFix(prNumber);
    } else {
      console.log('🔍 Processing review comment...');
      const commentContext = {
        body: commentBody,
        type: taskType,
        comment: context.payload.comment
      };
      result = await codeFixer.processReviewComment(prNumber, commentContext);
    }
    
    // Post results
    if (result.success) {
      const successMessage = `
✅ **AI PR Teammate completed the task!**

### Changes Made:
${result.changes}

### Explanation:
${result.explanation}

${result.commitSha ? `📝 Commit: ${result.commitSha}` : ''}

---
*Powered by AI PR Teammate*
      `.trim();
      
      await githubService.postComment(prNumber, successMessage);
      console.log('✅ Task completed successfully!');
    } else {
      const errorMessage = `
⚠️ **AI PR Teammate encountered an issue**

${result.error}

Please review and try again, or handle this manually.

---
*Powered by AI PR Teammate*
      `.trim();
      
      await githubService.postComment(prNumber, errorMessage);
      console.log('❌ Task failed:', result.error);
    }
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
    core.setFailed(error.message);
  }
}

main();
