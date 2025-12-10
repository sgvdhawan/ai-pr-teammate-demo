/**
 * GitHub Service
 * 
 * Handles all GitHub API interactions:
 * - Fetching PR details, diffs, files
 * - Creating commits
 * - Posting comments
 * - Fetching CI logs
 */

import * as github from '@actions/github';
import parseDiff from 'parse-diff';

export class GitHubService {
  constructor(token, context) {
    this.octokit = github.getOctokit(token);
    this.context = context;
    this.owner = context.repo.owner;
    this.repo = context.repo.repo;
  }
  
  /**
   * Get PR details including diff and files
   */
  async getPRContext(prNumber) {
    try {
      console.log(`📥 Fetching PR #${prNumber} context...`);
      
      // Get PR details
      const { data: pr } = await this.octokit.rest.pulls.get({
        owner: this.owner,
        repo: this.repo,
        pull_number: prNumber
      });
      
      // Get PR diff
      const { data: diff } = await this.octokit.rest.pulls.get({
        owner: this.owner,
        repo: this.repo,
        pull_number: prNumber,
        mediaType: {
          format: 'diff'
        }
      });
      
      // Get PR files
      const { data: files } = await this.octokit.rest.pulls.listFiles({
        owner: this.owner,
        repo: this.repo,
        pull_number: prNumber
      });
      
      // Get review comments
      const { data: comments } = await this.octokit.rest.pulls.listReviewComments({
        owner: this.owner,
        repo: this.repo,
        pull_number: prNumber
      });
      
      // Get issue comments
      const { data: issueComments } = await this.octokit.rest.issues.listComments({
        owner: this.owner,
        repo: this.repo,
        issue_number: prNumber
      });
      
      return {
        pr,
        diff,
        files,
        comments,
        issueComments,
        parsedDiff: parseDiff(diff)
      };
    } catch (error) {
      console.error('Error fetching PR context:', error);
      throw error;
    }
  }
  
  /**
   * Get file content from the PR branch
   */
  async getFileContent(path, ref) {
    try {
      const { data } = await this.octokit.rest.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path,
        ref
      });
      
      if (data.type === 'file' && data.content) {
        return Buffer.from(data.content, 'base64').toString('utf-8');
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching file ${path}:`, error.message);
      return null;
    }
  }
  
  /**
   * Create or update file in the PR branch
   */
  async updateFile(prNumber, filePath, newContent, commitMessage) {
    try {
      const { data: pr } = await this.octokit.rest.pulls.get({
        owner: this.owner,
        repo: this.repo,
        pull_number: prNumber
      });
      
      const branch = pr.head.ref;
      const sha = pr.head.sha;
      
      // Get current file to get its SHA
      let fileSha;
      try {
        const { data: fileData } = await this.octokit.rest.repos.getContent({
          owner: this.owner,
          repo: this.repo,
          path: filePath,
          ref: branch
        });
        fileSha = fileData.sha;
      } catch (error) {
        // File doesn't exist, will be created
        fileSha = null;
      }
      
      // Update or create file
      const { data } = await this.octokit.rest.repos.createOrUpdateFileContents({
        owner: this.owner,
        repo: this.repo,
        path: filePath,
        message: commitMessage,
        content: Buffer.from(newContent).toString('base64'),
        branch: branch,
        ...(fileSha && { sha: fileSha })
      });
      
      return {
        success: true,
        commitSha: data.commit.sha
      };
    } catch (error) {
      console.error(`Error updating file ${filePath}:`, error);
      throw error;
    }
  }
  
  /**
   * Update multiple files in a single commit
   */
  async updateMultipleFiles(prNumber, fileChanges, commitMessage) {
    try {
      const { data: pr } = await this.octokit.rest.pulls.get({
        owner: this.owner,
        repo: this.repo,
        pull_number: prNumber
      });
      
      const branch = pr.head.ref;
      const baseSha = pr.head.sha;
      
      // Get the current commit
      const { data: currentCommit } = await this.octokit.rest.git.getCommit({
        owner: this.owner,
        repo: this.repo,
        commit_sha: baseSha
      });
      
      const baseTreeSha = currentCommit.tree.sha;
      
      // Create blobs for each file
      const tree = await Promise.all(
        fileChanges.map(async ({ path, content }) => {
          const { data: blob } = await this.octokit.rest.git.createBlob({
            owner: this.owner,
            repo: this.repo,
            content: Buffer.from(content).toString('base64'),
            encoding: 'base64'
          });
          
          return {
            path,
            mode: '100644',
            type: 'blob',
            sha: blob.sha
          };
        })
      );
      
      // Create new tree
      const { data: newTree } = await this.octokit.rest.git.createTree({
        owner: this.owner,
        repo: this.repo,
        base_tree: baseTreeSha,
        tree
      });
      
      // Create new commit
      const { data: newCommit } = await this.octokit.rest.git.createCommit({
        owner: this.owner,
        repo: this.repo,
        message: commitMessage,
        tree: newTree.sha,
        parents: [baseSha]
      });
      
      // Update branch reference
      await this.octokit.rest.git.updateRef({
        owner: this.owner,
        repo: this.repo,
        ref: `heads/${branch}`,
        sha: newCommit.sha
      });
      
      return {
        success: true,
        commitSha: newCommit.sha
      };
    } catch (error) {
      console.error('Error updating multiple files:', error);
      throw error;
    }
  }
  
  /**
   * Post a comment on the PR
   */
  async postComment(prNumber, body) {
    try {
      await this.octokit.rest.issues.createComment({
        owner: this.owner,
        repo: this.repo,
        issue_number: prNumber,
        body
      });
    } catch (error) {
      console.error('Error posting comment:', error);
      throw error;
    }
  }
  
  /**
   * Get CI check runs for a PR
   */
  async getCheckRuns(prNumber) {
    try {
      const { data: pr } = await this.octokit.rest.pulls.get({
        owner: this.owner,
        repo: this.repo,
        pull_number: prNumber
      });
      
      const { data: checkRuns } = await this.octokit.rest.checks.listForRef({
        owner: this.owner,
        repo: this.repo,
        ref: pr.head.sha
      });
      
      return checkRuns.check_runs;
    } catch (error) {
      console.error('Error fetching check runs:', error);
      return [];
    }
  }
  
  /**
   * Get workflow run logs
   */
  async getWorkflowLogs(runId) {
    try {
      const { data: logs } = await this.octokit.rest.actions.downloadWorkflowRunLogs({
        owner: this.owner,
        repo: this.repo,
        run_id: runId
      });
      
      return logs;
    } catch (error) {
      console.error('Error fetching workflow logs:', error);
      return null;
    }
  }
}

