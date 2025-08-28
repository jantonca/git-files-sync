/**
 * Repository Manager - Handles Git operations and repository handling
 * Extracted from content-fetcher.js for better separation of concerns
 */

import { CONFIG } from '../utils/config.js';

export class RepositoryManager {
  constructor(options = {}) {
    this.gitService = options.gitService;
    this.fileService = options.fileService;
  }

  /**
   * Clone repository using GitService with sparse checkout
   */
  async cloneRepository() {
    console.log('📥 Cloning content repository...');

    // Clean up any existing temp directory first
    await this.cleanupTempDirectory();

    // Get sparse checkout paths
    const sparsePaths = this.getSparseCheckoutPaths();

    await this.gitService.retryOperation(
      () =>
        this.gitService.cloneWithSparseCheckout(
          CONFIG.REPO_URL,
          CONFIG.BRANCH,
          CONFIG.TEMP_DIR,
          sparsePaths
        ),
      'Repository clone'
    );

    // Validate cloned content
    if (!this.fileService.exists(CONFIG.TEMP_DIR)) {
      throw new Error('Repository clone failed - temp directory not created');
    }
  }

  /**
   * Get sparse checkout paths from content mapping
   */
  getSparseCheckoutPaths() {
    return Object.values(CONFIG.CONTENT_MAPPING).map(
      mapping => mapping.source || mapping
    );
  }

  /**
   * Clean up temporary directory after successful content installation
   */
  async cleanupTempDirectory() {
    if (this.fileService.exists(CONFIG.TEMP_DIR)) {
      console.log('🧹 Cleaning up temporary directory...');
      await this.fileService.remove(CONFIG.TEMP_DIR, { recursive: true });
      console.log('✅ Temporary directory cleaned up');
    }
  }

  /**
   * Get current remote commit hash for comparison
   */
  async getCurrentCommitHash() {
    return await this.gitService.getRemoteCommitHash(
      CONFIG.REPO_URL,
      CONFIG.BRANCH
    );
  }

  /**
   * Validate repository configuration
   */
  validateRepositoryConfig() {
    if (!CONFIG.REPO_URL || CONFIG.REPO_URL.trim() === '') {
      throw new Error('Repository URL is not configured');
    }

    if (!CONFIG.BRANCH || CONFIG.BRANCH.trim() === '') {
      throw new Error('Repository branch is not configured');
    }

    return true;
  }

  /**
   * Check if repository is accessible
   */
  async checkRepositoryAccess() {
    try {
      await this.getCurrentCommitHash();
      return true;
    } catch (error) {
      console.warn(`⚠️  Repository access check failed: ${error.message}`);
      return false;
    }
  }
}
