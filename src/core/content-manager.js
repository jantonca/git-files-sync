/**
 * Content Manager - Handles content state management and validation
 * Extracted from content-fetcher.js for better separation of concerns
 */

import { CONFIG } from '../utils/config.js';

export class ContentManager {
  constructor(options = {}) {
    this.fileService = options.fileService;
    this.cacheService = options.cacheService;
    this.gitService = options.gitService;
    this.gitIgnoreManager = options.gitIgnoreManager;
    this.frameworkAdapter = options.frameworkAdapter;
  }

  /**
   * Check if content already exists in the project
   * Returns: true = all exists, 'partial' = some exists, false = none exists
   */
  async checkContentExists() {
    try {
      // Check if ALL mapped content destinations exist and have content
      const mappings = Object.entries(CONFIG.CONTENT_MAPPING);
      let allContentExists = true;
      let hasAnyContent = false;
      const checkedPaths = [];

      for (const [key, mapping] of mappings) {
        const normalizedMapping = this.normalizeMapping(mapping);
        const destinationPath = this.frameworkAdapter.transformContentPath(
          normalizedMapping.destination
        );

        checkedPaths.push(`${key}: ${destinationPath}`);

        if (this.fileService.exists(destinationPath)) {
          // Check if the directory has content
          try {
            const files =
              await this.fileService.getFilesRecursively(destinationPath);
            console.log(
              `📁 ${key}: found ${files?.length || 0} files in ${destinationPath}`
            );

            if (files && files.length > 0) {
              hasAnyContent = true;
              // Continue checking all mappings
            } else {
              console.log(`⚠️  ${key}: directory exists but is empty`);
              allContentExists = false;
            }
          } catch (error) {
            console.warn(
              `⚠️  Could not read directory ${destinationPath}: ${error.message}`
            );
            allContentExists = false;
          }
        } else {
          console.log(`❌ ${key}: ${destinationPath} does not exist`);
          allContentExists = false;
        }
      }

      const resultStatus = allContentExists
        ? 'ALL_FOUND'
        : hasAnyContent
          ? 'PARTIAL'
          : 'NOT_FOUND';
      console.log(`📊 Content check result: ${resultStatus}`);
      console.log(
        `📋 Checked paths:\n${checkedPaths.map(p => `  - ${p}`).join('\n')}`
      );

      // Return granular information
      if (allContentExists) return true;
      if (hasAnyContent) return 'partial';
      return false;
    } catch (error) {
      console.warn(`⚠️  Error checking existing content: ${error.message}`);
      return false; // Assume no content exists if we can't check
    }
  }

  /**
   * Check if content paths are already managed in gitignore and have existing content
   * @returns {Promise<boolean>} True if content is already managed and exists
   */
  async checkContentInGitignore() {
    try {
      // Get current auto-managed paths from gitignore
      const managedPaths = this.gitIgnoreManager.getCurrentManagedPaths();

      if (managedPaths.length === 0) {
        console.log('📄 No auto-managed content paths found in gitignore');
        return false;
      }

      console.log(
        `📋 Found ${managedPaths.length} auto-managed paths in gitignore`
      );

      // Check if the managed paths correspond to our current content mapping
      const mappings = Object.entries(CONFIG.CONTENT_MAPPING);
      let hasMatchingContent = false;

      for (const [key, mapping] of mappings) {
        const normalizedMapping = this.normalizeMapping(mapping);
        const destinationPath = this.frameworkAdapter.transformContentPath(
          normalizedMapping.destination
        );

        // Check if this destination is in gitignore managed paths
        const isManaged = managedPaths.some(
          path =>
            destinationPath.includes(path) ||
            path.includes(destinationPath.replace(/^.*\//, ''))
        );

        if (isManaged && this.fileService.exists(destinationPath)) {
          try {
            const files =
              await this.fileService.getFilesRecursively(destinationPath);
            if (files && files.length > 0) {
              console.log(
                `✅ ${key}: Already managed in gitignore with ${files.length} files`
              );
              hasMatchingContent = true;
            }
          } catch (error) {
            console.warn(
              `⚠️  Could not check files in ${destinationPath}: ${error.message}`
            );
          }
        } else {
          console.log(
            `❌ ${key}: Not managed or missing content in ${destinationPath}`
          );
        }
      }

      return hasMatchingContent;
    } catch (error) {
      console.warn(
        `⚠️  Error checking gitignore managed content: ${error.message}`
      );
      return false;
    }
  }

  /**
   * Check if content is up-to-date using cache
   */
  async isContentUpToDate() {
    try {
      // Check cached repository info
      const cachedInfo = await this.cacheService.getCachedRepositoryInfo(
        CONFIG.REPO_URL
      );
      if (!cachedInfo) {
        return false;
      }

      // Get current remote commit
      const currentCommit = await this.gitService.getRemoteCommitHash(
        CONFIG.REPO_URL,
        CONFIG.BRANCH
      );

      // If commits don't match, content is not up-to-date
      if (cachedInfo.commitHash !== currentCommit) {
        return false;
      }

      // Even if commits match, check if local content actually exists
      const contentExists = await this.checkContentExists();
      if (contentExists !== true) {
        return false; // Content is missing or partial locally, need to fetch
      }

      return true; // Commits match and content exists locally
    } catch {
      return false; // On error, assume update needed
    }
  }

  /**
   * Cache validation data for future checks
   */
  async cacheValidationData() {
    try {
      const commitHash = await this.gitService.getRemoteCommitHash(
        CONFIG.REPO_URL,
        CONFIG.BRANCH
      );

      await this.cacheService.cacheRepositoryInfo(CONFIG.REPO_URL, {
        commitHash,
        branch: CONFIG.BRANCH,
        timestamp: Date.now(),
      });

      console.log(`✅ Cache validation data completed`);
    } catch (error) {
      console.warn('Failed to cache validation data:', error.message);
    }
  }

  /**
   * Update gitignore with content paths after successful installation
   */
  async updateGitignoreWithContent() {
    try {
      console.log('📝 Updating .gitignore with managed content paths...');

      // Get destination paths from content mapping
      const contentPaths = [];
      const mappings = Object.entries(CONFIG.CONTENT_MAPPING);

      for (const [, mapping] of mappings) {
        const normalizedMapping = this.normalizeMapping(mapping);
        const destinationPath = this.frameworkAdapter.transformContentPath(
          normalizedMapping.destination
        );

        // Convert absolute path to relative path for gitignore
        const relativePath = destinationPath.replace(process.cwd() + '/', '');
        contentPaths.push(relativePath);
      }

      // Update gitignore with the content paths
      const result = await this.gitIgnoreManager.updateGitignore(
        Object.fromEntries(
          contentPaths.map((path, index) => [
            Object.keys(CONFIG.CONTENT_MAPPING)[index],
            path,
          ])
        )
      );

      if (result.success) {
        console.log(`✅ ${result.message}`);
      } else {
        console.warn(`⚠️  ${result.message}: ${result.error}`);
      }
    } catch (error) {
      console.warn(`⚠️  Failed to update .gitignore: ${error.message}`);
    }
  }

  /**
   * Generate content hash for change detection
   */
  async generateContentHash(sourcePath) {
    if (!this.fileService.exists(sourcePath)) {
      return null;
    }

    const files = await this.fileService.getFilesRecursively(sourcePath);
    const hashes = await Promise.all(
      files.map(async file => {
        const content = await this.fileService.read(file);
        return this.cacheService.generateKey(content, 'file-content');
      })
    );

    return this.cacheService.generateKey(hashes.join(''), 'content-mapping');
  }

  /**
   * Normalize mapping to unified format
   */
  normalizeMapping(mapping) {
    if (typeof mapping === 'string') {
      return {
        type: 'folder',
        source: mapping,
        destination: mapping,
      };
    }

    return {
      type: mapping.type || 'folder',
      source: mapping.source || mapping.destination,
      destination: mapping.destination,
      files: mapping.files || [],
    };
  }
}
