import { execSync } from 'child_process';
import { setTimeout } from 'timers/promises';

/**
 * Git Service - Handles all Git operations
 * Migrated from lib/services/git-service.js
 *
 * @version 2.0.0
 * @package @jantonca/git-files-sync
 */
export class GitService {
  constructor(options = {}) {
    this.timeout = options.timeout || 30000; // 30s default
    this.retries = options.retries || 3;
    this.retryDelay = options.retryDelay || 2000;
  }

  /**
   * Execute git command safely
   * @param {string} command - Git command to execute (without 'git' prefix)
   * @param {object} options - Execution options
   * @returns {Promise<object>} Result object
   */
  async safeExec(command, options = {}) {
    const fullCommand = `git ${command}`;
    
    try {
      const execOptions = {
        stdio: options.silent ? 'pipe' : 'inherit',
        encoding: 'utf8',
        timeout: options.timeout || this.timeout,
        cwd: options.cwd || process.cwd(),
        ...options,
      };

      const result = execSync(fullCommand, execOptions);
      return { success: true, output: result };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        output: error.stdout || error.stderr || '',
        code: error.status || error.signal
      };
    }
  }

  /**
   * Get remote commit hash
   * @param {string} repoUrl - Repository URL
   * @param {string} branch - Branch name
   * @returns {Promise<string>} Commit hash
   */
  async getRemoteCommitHash(repoUrl, branch = 'master') {
    const result = await this.safeExec(`ls-remote ${repoUrl} ${branch}`, {
      silent: true,
      timeout: 10000,
    });

    if (result.success && result.output) {
      const commitHash = result.output.trim().split('\t')[0];
      return commitHash;
    }

    throw new Error(`Failed to get remote commit: ${result.error}`);
  }

  /**
   * Clone repository with sparse checkout
   * @param {string} repoUrl - Repository URL
   * @param {string} branch - Branch to clone
   * @param {string} destination - Destination directory
   * @param {Array} sparsePaths - Paths for sparse checkout
   * @returns {Promise<boolean>} Success status
   */
  async cloneWithSparseCheckout(
    repoUrl,
    branch = 'master',
    destination,
    sparsePaths = []
  ) {
    // Step 1: Clone with shallow depth and blob filtering
    const cloneResult = await this.safeExec(
      `clone --depth 1 --branch ${branch} --filter=blob:none --sparse ${repoUrl} ${destination}`
    );

    if (!cloneResult.success) {
      throw new Error(`Clone failed: ${cloneResult.error}`);
    }

    // Step 2: Configure sparse checkout if paths specified
    if (sparsePaths.length > 0) {
      const sparseResult = await this.safeExec(
        `sparse-checkout set ${sparsePaths.join(' ')}`,
        { cwd: destination }
      );

      if (!sparseResult.success) {
        throw new Error(`Sparse checkout failed: ${sparseResult.error}`);
      }
    }

    return true;
  }  /**
   * Check if directory is a git repository
   * @param {string} path - Directory path
   * @returns {Promise<boolean>} True if git repo
   */
  async isGitRepository(path) {
    const result = await this.safeExec(
      `rev-parse --git-dir`,
      { silent: true, cwd: path }
    );
    return result.success;
  }

  /**
   * Get current commit hash
   * @param {string} path - Repository path
   * @returns {Promise<string|null>} Current commit hash or null
   */
  async getCurrentCommit(path) {
    const result = await this.safeExec(`rev-parse HEAD`, {
      silent: true,
      cwd: path,
    });

    if (result.success && result.output) {
      return result.output.trim();
    }

    return null;
  }

  /**
   * Get repository information
   * @param {string} path - Repository path
   * @returns {Promise<object>} Repository info
   */
  async getRepositoryInfo(path) {
    const [commit, branch, remote] = await Promise.all([
      this.getCurrentCommit(path),
      this.getCurrentBranch(path),
      this.getRemoteUrl(path),
    ]);

    return { commit, branch, remote };
  }

  /**
   * Get current branch name
   * @param {string} path - Repository path
   * @returns {Promise<string|null>} Current branch name
   */
  async getCurrentBranch(path) {
    const result = await this.safeExec(
      `rev-parse --abbrev-ref HEAD`,
      { silent: true, cwd: path }
    );

    if (result.success && result.output) {
      return result.output.trim();
    }

    return null;
  }

  /**
   * Get remote URL
   * @param {string} path - Repository path
   * @returns {Promise<string|null>} Remote URL
   */
  async getRemoteUrl(path) {
    const result = await this.safeExec(
      `config --get remote.origin.url`,
      { silent: true, cwd: path }
    );

    if (result.success && result.output) {
      return result.output.trim();
    }

    return null;
  }

  /**
   * Validate repository URL format
   * @param {string} url - Repository URL
   * @returns {boolean} True if valid
   */
  validateRepositoryUrl(url) {
    if (!url) {
      return false;
    }

    // Allow both SSH and HTTPS git URLs
    const validPatterns = [
      /^git@[\w.-]+:[\w.-]+\/[\w.-]+\.git$/, // SSH: git@host:org/repo.git
      /^https:\/\/[\w.-]+\/[\w.-]+\/[\w.-]+\.git$/, // HTTPS: https://host/org/repo.git
    ];

    return validPatterns.some(pattern => pattern.test(url));
  }

  /**
   * Retry git operation with exponential backoff
   * @param {Function} operation - Operation to retry
   * @param {string} context - Context for error messages
   * @returns {Promise<any>} Operation result
   */
  async retryOperation(operation, context = 'Git operation') {
    let lastError;

    for (let attempt = 1; attempt <= this.retries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt < this.retries) {
          const delay = this.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
          await setTimeout(delay);
        }
      }
    }

    throw new Error(
      `${context} failed after ${this.retries} attempts: ${lastError.message}`
    );
  }

  /**
   * Clean up git repository
   * @param {string} path - Repository path
   * @returns {Promise<void>}
   */
  async cleanup(path) {
    try {
      const result = await this.safeExec(`rm -rf ${path}`, { silent: true });
      return result.success;
    } catch {
      return false;
    }
  }
}
