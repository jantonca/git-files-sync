#!/usr/bin/env node

/**
 * Production Content Fetcher - Optimized for framework-agnostic content management
 * Combines Phase 1-3 optimizations in a clean, production-ready package
 */

import path from 'path';
import { createFrameworkAdapter } from './src/adapters/index.js';
import { GitService } from './src/services/index.js';
import { FileService } from './src/services/index.js';
import { ValidationService } from './src/services/index.js';
import { CacheService } from './src/services/index.js';
import { PerformanceManager } from './src/services/index.js';
import { GitIgnoreManager } from './src/utils/index.js';
import {
  PluginManager,
  PerformancePlugin,
  LoggingPlugin,
} from './src/plugins/index.js';
import { CONFIG } from './src/utils/index.js';

/**
 * Production Content Fetcher - Ultimate optimization with all Phase 1-3 features
 */
export class ContentFetcher {
  constructor(options = {}) {
    // Core services (Phase 1)
    this.gitService = new GitService({
      timeout: options.timeout || 30000,
      retries: options.retries || 3,
    });

    this.fileService = new FileService({
      maxFileSize: options.maxFileSize,
      allowedExtensions: options.allowedExtensions,
      concurrentOperations: options.concurrentOperations || 5,
    });

    this.validationService = new ValidationService({
      enableValidation: options.enableValidation !== false,
    });

    // Phase 3 advanced services
    this.cacheService = new CacheService({
      cacheDir: options.cacheDir,
      maxAge: options.cacheMaxAge || 24 * 60 * 60 * 1000, // 24 hours
      enabled: options.enableCache !== false,
    });

    this.performanceManager = new PerformanceManager({
      maxConcurrency: options.maxConcurrency || 10,
      batchSize: options.batchSize || 50,
      cacheService: this.cacheService,
      enableMetrics: options.enableMetrics !== false,
    });

    this.pluginManager = new PluginManager({
      config: options.pluginConfig || {},
      enableValidation: options.enablePluginValidation !== false,
    });

    // GitIgnore manager for auto-managed content paths
    this.gitIgnoreManager = new GitIgnoreManager({
      projectRoot: options.projectRoot,
    });

    // Framework adapter (Phase 2)
    this.frameworkAdapter = null;

    // Performance tracking
    this.metrics = {
      startTime: null,
      fetchTime: 0,
      cacheHits: 0,
      cacheMisses: 0,
      filesProcessed: 0,
      operationsCount: 0,
    };
  }

  /**
   * Initialize the fetcher with framework detection
   */
  async initialize() {
    // Determine project root (same logic as config-loader)
    let projectRoot = process.cwd();
    if (projectRoot.endsWith('content-management')) {
      projectRoot = path.resolve(projectRoot, '..');
    }

    // Detect and initialize framework adapter
    this.frameworkAdapter = await createFrameworkAdapter(null, { projectRoot });

    if (this.frameworkAdapter?.framework) {
      console.log(`🎯 Detected framework: ${this.frameworkAdapter.framework}`);
    }

    // Initialize Phase 3 services
    await this.cacheService.initialize();
    await this.performanceManager.initialize();

    // Register built-in plugins
    await this.registerBuiltinPlugins();

    // Execute plugin hook
    await this.pluginManager.executeHook('after-initialize', {
      fetcher: this,
      framework: this.frameworkAdapter?.framework,
    });
  }

  /**
   * Safely update content without destructive cleanup (for watch mode)
   */
  async updateContentSafely() {
    this.metrics.startTime = Date.now();

    try {
      console.log('🔄 Performing safe content update...');

      // Clear all caches to ensure we get the latest commit
      await this.cacheService.clear();

      // Execute pre-fetch hooks
      await this.pluginManager.executeHook('before-fetch', {
        forceUpdate: false,
        config: CONFIG,
        safeMode: true,
      });

      // Clone repository to temp directory
      await this.executeWithHooks('clone', () => this.cloneRepository());

      // Install content without backup/cleanup
      await this.executeWithHooks('install', () =>
        this.installContentConcurrent()
      );

      // Clean up temporary directory
      await this.executeWithHooks('cleanup-temp', () =>
        this.cleanupTempDirectory()
      );

      // Update gitignore with managed content paths
      await this.executeWithHooks('update-gitignore', () =>
        this.updateGitignoreWithContent()
      );

      // Cache validation data for future runs
      await this.cacheValidationData();

      // Execute post-fetch hooks
      await this.pluginManager.executeHook('after-fetch', {
        success: true,
        metrics: this.getMetrics(),
        safeMode: true,
      });

      this.metrics.fetchTime = Date.now() - this.metrics.startTime;

      return true;
    } catch (error) {
      // Execute error hooks
      await this.pluginManager.executeHook('error', error);

      console.error('❌ Safe content update failed:', error.message);

      // Clean up temp directory on error
      try {
        await this.cleanupTempDirectory();
      } catch (cleanupError) {
        console.warn(
          '⚠️  Failed to clean up temp directory:',
          cleanupError.message
        );
      }

      throw error;
    }
  }

  /**
   * Main content fetch method with all optimizations
   */
  async fetchContent(forceUpdate = false) {
    this.metrics.startTime = Date.now();
    this.metrics.operationsCount++;

    try {
      // Check if repository is configured
      if (!CONFIG.REPO_URL || CONFIG.REPO_URL.trim() === '') {
        console.log('ℹ️  No content repository configured.');
        console.log('   Content fetcher running in local-only mode.');
        console.log(
          '   To set up content management, run: ./content-management/setup.sh'
        );
        return true;
      }

      // Clear cache if force update
      if (forceUpdate) {
        console.log('🗑️  Clearing cache due to force flag...');
        await this.cacheService.clear();
      }

      // Execute pre-fetch hooks
      await this.pluginManager.executeHook('before-fetch', {
        forceUpdate,
        config: CONFIG,
      });

      // Smart cache validation (Phase 3)
      if (!forceUpdate && (await this.isContentUpToDate())) {
        console.log('✅ Content is up-to-date (cached validation)');
        this.metrics.cacheHits++;
        return true;
      }

      // Additional safety check - if content exists and commits match, don't proceed
      if (!forceUpdate) {
        try {
          const contentExists = await this.checkContentExists();
          const cachedInfo = await this.cacheService.getCachedRepositoryInfo(
            CONFIG.REPO_URL
          );

          if (contentExists === true && cachedInfo) {
            const currentCommit = await this.gitService.getRemoteCommitHash(
              CONFIG.REPO_URL,
              CONFIG.BRANCH
            );
            console.log(
              `🔍 Checking commits: cached=${cachedInfo.commitHash?.substring(0, 8)} vs current=${currentCommit?.substring(0, 8)}`
            );

            if (cachedInfo.commitHash === currentCommit) {
              console.log(
                '✅ Content exists and is up-to-date, skipping fetch'
              );
              this.metrics.cacheHits++;
              return true;
            } else {
              console.log('🔄 Commits differ, using safe update method...');
              // Use safe update method when content exists but needs updating
              const result = await this.updateContentSafely();
              if (result) {
                console.log(
                  '✅ Content updated safely without removing existing files'
                );
                return true;
              }
            }
          } else if (contentExists === true && !cachedInfo) {
            console.log(
              '🔄 Content exists but no cache info, using safe update method...'
            );
            // Use safe update method when content exists but no cache info
            const result = await this.updateContentSafely();
            if (result) {
              console.log(
                '✅ Content updated safely without removing existing files'
              );
              return true;
            }
          } else if (contentExists === 'partial') {
            console.log(
              '🔄 Detected partial content, using safe update method to preserve existing files...'
            );
            const result = await this.updateContentSafely();
            if (result) {
              console.log(
                '✅ Content updated safely without removing existing files'
              );
              return true;
            }
          } else if (contentExists === false && cachedInfo) {
            console.log(
              '🔄 No local content but have cache info, using safe update method...'
            );
            // Use safe update method when no content exists but we have cache
            const result = await this.updateContentSafely();
            if (result) {
              console.log('✅ Content installed safely');
              return true;
            }
          } else {
            console.log(
              `🔍 Safety check: contentExists=${contentExists}, cachedInfo=${!!cachedInfo}`
            );
          }
        } catch (error) {
          console.warn('⚠️  Failed to perform safety check:', error.message);
          // Don't continue with destructive operations if safety check fails
          if (!forceUpdate) {
            console.log(
              '🛑 Aborting fetch due to safety check failure (use --force to override)'
            );
            throw new Error(`Safety check failed: ${error.message}`);
          }
        }
      }

      console.log(
        '🚀 Proceeding with full content fetch (no existing content or force mode)...'
      );
      this.metrics.cacheMisses++;

      // Enhanced workflow with hooks
      await this.executeWithHooks('backup', () => this.createBackup());
      await this.executeWithHooks('clean', () => this.cleanOldContent());
      await this.executeWithHooks('clone', () => this.cloneRepository());
      await this.executeWithHooks('install', () =>
        this.installContentConcurrent()
      );

      // Clean up temporary directory after successful installation
      await this.executeWithHooks('cleanup-temp', () =>
        this.cleanupTempDirectory()
      );

      // Update gitignore with managed content paths
      await this.executeWithHooks('update-gitignore', () =>
        this.updateGitignoreWithContent()
      );

      // Cache validation data for future runs
      await this.cacheValidationData();

      // Execute post-fetch hooks
      await this.pluginManager.executeHook('after-fetch', {
        success: true,
        metrics: this.getMetrics(),
      });

      this.metrics.fetchTime = Date.now() - this.metrics.startTime;

      console.log(`🚀 Content fetch completed in ${this.metrics.fetchTime}ms`);

      return true;
    } catch (error) {
      // Execute error hooks
      await this.pluginManager.executeHook('error', error);

      console.error('❌ Content fetch failed:', error.message);

      // Clean up temp directory even on error to prevent partial state
      try {
        await this.cleanupTempDirectory();
      } catch (cleanupError) {
        console.warn(
          '⚠️  Failed to clean up temp directory:',
          cleanupError.message
        );
      }

      // Attempt to restore backup on error
      await this.restoreBackup();
      throw error;
    }
  }

  /**
   * Create backup using FileService
   */
  async createBackup() {
    const folders = Object.values(CONFIG.CONTENT_MAPPING).map(
      mapping => mapping.destination || mapping
    );

    const result = await this.fileService.createBackup(
      folders,
      CONFIG.BACKUP_DIR
    );

    if (result) {
      console.log('💾 Created content backup');
    }

    return result;
  }

  /**
   * Restore from backup using FileService
   */
  async restoreBackup() {
    const result = await this.fileService.restoreBackup(CONFIG.BACKUP_DIR, '.');

    if (result) {
      console.log('🔄 Restored content from backup');
    }

    return result;
  }

  /**
   * Clean old content using FileService with progress tracking
   */
  async cleanOldContent() {
    const folders = Object.values(CONFIG.CONTENT_MAPPING).map(
      mapping => mapping.destination || mapping
    );

    console.log('🗑️  Removing old content...');

    let completed = 0;
    const startTime = Date.now();

    for (const folder of folders) {
      if (this.fileService.exists(folder)) {
        await this.fileService.remove(folder, { recursive: true });
      }

      completed++;
      const progress = Math.round((completed / folders.length) * 100);
      const elapsed = Date.now() - startTime;
      const eta =
        folders.length > completed
          ? Math.round(
              ((elapsed / completed) * (folders.length - completed)) / 1000
            )
          : 0;

      console.log(
        `📊 Cleanup: ${progress}% (${completed}/${folders.length}) ETA: ${eta}s`
      );
    }

    console.log(
      `✅ Cleanup completed in ${Math.round((Date.now() - startTime) / 1000)}s`
    );
  }

  /**
   * Check if content already exists in the project
   */
  async checkContentExists() {
    try {
      console.log('🔍 Checking if content exists locally...');

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

      // Return granular information: true = all exists, 'partial' = some exists, false = none exists
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
      console.log('🔍 Checking if content is already managed in gitignore...');

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
   * Clone repository using GitService with sparse checkout
   */
  async cloneRepository() {
    console.log('📥 Cloning content repository...');

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
   * Install content with concurrent processing (Phase 3)
   */
  async installContentConcurrent() {
    console.log('📦 Installing content with enhanced performance...');

    const mappings = Object.entries(CONFIG.CONTENT_MAPPING);

    // Process mappings concurrently
    const results = await this.performanceManager.executeConcurrent(
      mappings,
      async ([key, mapping]) => {
        await this.executeWithHooks('install-mapping', () =>
          this.installSingleMappingEnhanced(key, mapping)
        );
        return { key, mapping, success: true };
      },
      {
        concurrency: 5,
        cache: true,
        cacheNamespace: 'content-mappings',
        onProgress: progress => {
          if (progress.percentage % 20 === 0) {
            console.log(`📊 Installation progress: ${progress.percentage}%`);
          }
        },
      }
    );

    this.metrics.filesProcessed = results.results.length;

    console.log(`✅ Installed ${results.results.length} content mappings`);

    if (results.errors.length > 0) {
      console.warn(`⚠️  ${results.errors.length} installation errors occurred`);
    }
  }

  /**
   * Enhanced single mapping installation with caching
   */
  async installSingleMappingEnhanced(key, mapping) {
    const normalizedMapping = this.normalizeMapping(mapping);
    const sourcePath = `${CONFIG.TEMP_DIR}/${normalizedMapping.source}`;
    const destinationPath = this.frameworkAdapter.transformContentPath(
      normalizedMapping.destination
    );

    // Check cache for content changes
    const cacheKey = `mapping-${key}-${normalizedMapping.source}`;
    const cached = await this.cacheService.get(cacheKey, 'content-hashes');

    // Generate content hash for change detection
    const contentHash = await this.generateContentHash(sourcePath);

    // Only skip if cache matches AND destination actually exists with content
    if (cached === contentHash && this.fileService.exists(destinationPath)) {
      try {
        const destFiles =
          await this.fileService.getFilesRecursively(destinationPath);
        if (destFiles && destFiles.length > 0) {
          console.log(`💾 Skipping unchanged mapping: ${key}`);
          return;
        }
      } catch {
        // If we can't read the destination, assume it needs to be installed
      }
    }

    // Install mapping with validation
    await this.installSingleMapping(key, mapping);

    // Cache content hash
    await this.cacheService.set(cacheKey, contentHash, 'content-hashes');
  }

  /**
   * Install single content mapping
   */
  async installSingleMapping(key, mapping) {
    const normalizedMapping = this.normalizeMapping(mapping);
    const sourcePath = `${CONFIG.TEMP_DIR}/${normalizedMapping.source}`;
    const destinationPath = this.frameworkAdapter.transformContentPath(
      normalizedMapping.destination
    );

    if (!this.fileService.exists(sourcePath)) {
      // Create empty placeholder
      await this.fileService.createDirectory(destinationPath);
      return { success: false, description: key, destinationPath };
    }

    // Process based on mapping type
    switch (normalizedMapping.type) {
      case 'folder':
        // Move contents of source directory to destination directory
        await this.installFolderContents(sourcePath, destinationPath);
        break;

      case 'selective':
        await this.installSelectiveFiles(
          sourcePath,
          destinationPath,
          normalizedMapping.files
        );
        break;

      case 'file':
        await this.fileService.copy(sourcePath, destinationPath);
        break;

      default:
        throw new Error(`Unknown mapping type: ${normalizedMapping.type}`);
    }

    return { success: true, description: key, destinationPath };
  }

  /**
   * Install folder contents (move all files from source to destination)
   */
  async installFolderContents(sourcePath, destinationPath) {
    // Create destination directory
    await this.fileService.createDirectory(destinationPath);

    // Get all files from source directory
    const files = await this.fileService.getFilesRecursively(sourcePath);

    // Process files concurrently
    await this.fileService.processFilesConcurrently(files, async sourceFile => {
      // Calculate relative path from source directory
      const relativePath = path.relative(sourcePath, sourceFile);
      const destFile = path.join(destinationPath, relativePath);

      // Ensure destination directory exists
      await this.fileService.createDirectory(path.dirname(destFile));

      // Copy the file
      return await this.fileService.copy(sourceFile, destFile);
    });
  }

  /**
   * Install selective files
   */
  async installSelectiveFiles(sourcePath, destinationPath, fileList) {
    await this.fileService.createDirectory(destinationPath);

    // Process files concurrently
    await this.fileService.processFilesConcurrently(
      fileList,
      async fileName => {
        const sourceFile = `${sourcePath}/${fileName}`;
        const destFile = `${destinationPath}/${fileName}`;

        if (this.fileService.exists(sourceFile)) {
          return await this.fileService.copy(sourceFile, destFile);
        }
        return false;
      }
    );
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
   * Check if content is up-to-date using cache
   */
  async isContentUpToDate() {
    try {
      // Check cached repository info
      const cachedInfo = await this.cacheService.getCachedRepositoryInfo(
        CONFIG.REPO_URL
      );
      if (!cachedInfo) {
        console.log('🔍 isContentUpToDate: No cached info, returning false');
        return false;
      }

      // Get current remote commit
      const currentCommit = await this.gitService.getRemoteCommitHash(
        CONFIG.REPO_URL,
        CONFIG.BRANCH
      );

      console.log(
        `🔍 isContentUpToDate: cached=${cachedInfo.commitHash?.substring(0, 8)}, current=${currentCommit?.substring(0, 8)}`
      );

      // If commits don't match, content is not up-to-date
      if (cachedInfo.commitHash !== currentCommit) {
        console.log('🔍 isContentUpToDate: Commits differ, returning false');
        return false;
      }

      // Even if commits match, check if local content actually exists
      const contentExists = await this.checkContentExists();
      if (contentExists !== true) {
        console.log(
          `🔍 isContentUpToDate: Content incomplete locally (${contentExists}), returning false`
        );
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
   * Execute operation with plugin hooks
   */
  async executeWithHooks(operation, callback) {
    await this.pluginManager.executeHook(`before-${operation}`, {
      operation,
      timestamp: Date.now(),
    });

    const result = await callback();

    await this.pluginManager.executeHook(`after-${operation}`, {
      operation,
      result,
      timestamp: Date.now(),
    });

    return result;
  }

  /**
   * Register built-in plugins
   */
  async registerBuiltinPlugins() {
    // Register performance plugin
    const perfPlugin = new PerformancePlugin();
    this.pluginManager.register('performance', perfPlugin);
    await this.pluginManager.enable('performance');

    // Register logging plugin
    const logPlugin = new LoggingPlugin();
    this.pluginManager.register('logging', logPlugin);
    await this.pluginManager.enable('logging');
  }

  /**
   * Get comprehensive metrics
   */
  getMetrics() {
    const perfStats = this.performanceManager.getStats();
    const cacheStats = this.cacheService.getStats();
    const pluginStats = this.pluginManager.getStats();

    return {
      fetcher: this.metrics,
      performance: perfStats.performance,
      cache: cacheStats,
      plugins: pluginStats,
      timestamp: Date.now(),
    };
  }

  /**
   * Get cache statistics
   */
  async getCacheStats() {
    return await this.cacheService.getStats();
  }

  /**
   * Clear cache
   */
  async clearCache(namespace = null) {
    return await this.cacheService.clear(namespace);
  }

  /**
   * Get plugin manager for external plugin registration
   */
  getPluginManager() {
    return this.pluginManager;
  }

  /**
   * Register custom plugin
   */
  async registerPlugin(name, plugin, config = {}) {
    const success = this.pluginManager.register(name, plugin);
    if (success) {
      return await this.pluginManager.enable(name, config);
    }
    return false;
  }

  /**
   * Get performance report
   */
  getPerformanceReport() {
    const metrics = this.getMetrics();

    return {
      summary: {
        totalOperations: metrics.fetcher.operationsCount,
        averageFetchTime: metrics.fetcher.fetchTime || 0,
        cacheHitRate: metrics.cache.enabled
          ? `${((metrics.fetcher.cacheHits / (metrics.fetcher.cacheHits + metrics.fetcher.cacheMisses)) * 100).toFixed(2)}%`
          : 'N/A',
        filesProcessed: metrics.fetcher.filesProcessed,
      },
      performance: metrics.performance,
      cache: metrics.cache,
      plugins: metrics.plugins,
      recommendations: this.generateRecommendations(metrics),
    };
  }

  /**
   * Generate performance recommendations
   */
  generateRecommendations(metrics) {
    const recommendations = [];

    // Cache recommendations
    if (
      metrics.cache.enabled &&
      metrics.fetcher.cacheMisses > metrics.fetcher.cacheHits
    ) {
      recommendations.push(
        'Consider increasing cache TTL for better hit rates'
      );
    }

    // Performance recommendations
    if (metrics.performance && metrics.performance.successRate < '90%') {
      recommendations.push('Review error handling - low success rate detected');
    }

    // Plugin recommendations
    if (metrics.plugins.enabled < 2) {
      recommendations.push(
        'Consider enabling more plugins for enhanced functionality'
      );
    }

    return recommendations;
  }
}

/**
 * Detect if running in CloudCannon environment
 * CloudCannon uses mounted folders that conflict with prebuild content fetching
 */
function isCloudCannonEnvironment() {
  // Check for CloudCannon-specific environment variables
  const hasCloudCannonEnvVars = !!(
    process.env.IS_CLOUDCANNON_BUILD ||
    process.env.CLOUDCANNON_BUILD ||
    process.env.CLOUDCANNON_SITE_ID ||
    process.env.CLOUDCANNON_CONFIG_PATH ||
    process.env.CLOUDCANNON
  );

  // Only consider config file if we also have environment variables
  // This prevents false positives in local development with cloudcannon.config.yml
  const isCloudCannon = hasCloudCannonEnvVars;

  if (isCloudCannon && process.env.DEBUG_CLOUDCANNON) {
    console.log('🔍 CloudCannon Detection Debug:');
    console.log(`   Environment variables: ${hasCloudCannonEnvVars}`);
    console.log(`   Detected as CloudCannon: ${isCloudCannon}`);
  }

  return isCloudCannon;
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const fetcher = new ContentFetcher();

  async function main() {
    try {
      // Check if we're in CloudCannon environment and should skip content fetching
      if (isCloudCannonEnvironment()) {
        console.log('🌤️  CloudCannon environment detected');

        // Check if force override is set
        if (process.env.CLOUDCANNON_FORCE_CONTENT_FETCH === 'true') {
          console.log(
            '🔧 CLOUDCANNON_FORCE_CONTENT_FETCH=true detected, proceeding with content fetch...'
          );
        } else {
          console.log(
            '⏭️  Skipping content fetching (content mounted by CloudCannon)'
          );
          console.log(
            '💡 To force content fetching in CloudCannon, set CLOUDCANNON_FORCE_CONTENT_FETCH=true'
          );
          console.log(
            '✅ Content fetcher completed successfully (no-op for CloudCannon)'
          );
          return;
        }
      }

      await fetcher.initialize();

      const forceUpdate = process.argv.includes('--force');
      const watchMode = process.argv.includes('--watch');
      const autoMode = process.argv.includes('--auto');

      if (watchMode) {
        console.log('👀 Starting repository watcher...');
        console.log(`📡 Monitoring: ${CONFIG.REPO_URL} (${CONFIG.BRANCH})`);

        // In watch mode, don't do initial content fetch unless forced
        if (forceUpdate) {
          console.log(
            '📥 Performing initial content fetch due to --force flag...'
          );
          await fetcher.fetchContent(forceUpdate);
          console.log('✅ Initial content fetch completed!');
        } else {
          console.log(
            '✅ Watch mode started, monitoring repository for changes...'
          );
        }

        // Get initial commit hash for comparison
        let lastKnownCommit;
        try {
          lastKnownCommit = await fetcher.gitService.getRemoteCommitHash(
            CONFIG.REPO_URL,
            CONFIG.BRANCH
          );
          console.log(
            `� Current commit: ${lastKnownCommit.substring(0, 8)}...`
          );
        } catch (error) {
          console.error('❌ Failed to get initial commit hash:', error.message);
          process.exit(1);
        }

        let isUpdating = false;

        // Initialize lastNotifiedCommit to what was last successfully fetched
        const initialCachedInfo =
          await fetcher.cacheService.getCachedRepositoryInfo(CONFIG.REPO_URL);
        let lastNotifiedCommit = initialCachedInfo?.commitHash; // Track what we've already notified about

        const pollInterval = 30000; // Check every 30 seconds

        const checkForUpdates = async () => {
          if (isUpdating) return;

          try {
            const currentCommit = await fetcher.gitService.getRemoteCommitHash(
              CONFIG.REPO_URL,
              CONFIG.BRANCH
            );

            // Clear memory cache to ensure we get fresh data from disk
            fetcher.cacheService.memoryCache.clear();

            // Check what we last successfully fetched from cache
            const cachedInfo =
              await fetcher.cacheService.getCachedRepositoryInfo(
                CONFIG.REPO_URL
              );
            const lastFetchedCommit = cachedInfo?.commitHash;

            // Only show "new content available" if current differs from last successfully fetched
            if (currentCommit !== lastFetchedCommit) {
              // Only show the message if we haven't already notified about this commit
              if (currentCommit !== lastNotifiedCommit) {
                console.log(
                  `🔄 New commit detected: ${currentCommit.substring(0, 8)}... (was ${lastFetchedCommit?.substring(0, 8) || 'unknown'}...)`
                );

                if (autoMode) {
                  console.log('🤖 Auto mode: Fetching updated content...');
                } else {
                  console.log(
                    '💡 New content available. Run with --auto flag for automatic updates, or use `npm run content:fetch` to update manually.'
                  );
                }

                lastNotifiedCommit = currentCommit; // Mark this commit as notified
              }

              if (autoMode) {
                isUpdating = true;

                try {
                  // Use lighter update method to avoid removing existing content
                  await fetcher.updateContentSafely();
                  console.log('✅ Content updated successfully!');
                } catch (error) {
                  console.error('❌ Failed to update content:', error.message);
                } finally {
                  isUpdating = false;
                }
              }
            } else {
              // Commits match - check if we just resolved a pending notification
              if (lastNotifiedCommit && lastNotifiedCommit === currentCommit) {
                console.log('✅ Content is now up to date!');
                console.log('⏱️  Continuing to monitor for changes...');
                lastNotifiedCommit = null; // Clear notification state
              }
            }
            // Continue monitoring...
          } catch (error) {
            console.warn(`⚠️  Failed to check for updates: ${error.message}`);
          }
        };

        console.log('🎉 Repository watcher started successfully!');
        console.log(
          `⏱️  Checking for updates every ${pollInterval / 1000} seconds`
        );
        console.log('📝 Press Ctrl+C to stop watching...');

        // Set up periodic checking
        const { setInterval, clearInterval } = await import('timers');
        const pollTimer = setInterval(checkForUpdates, pollInterval);

        // Perform initial check immediately
        await checkForUpdates();

        // Handle graceful shutdown
        process.on('SIGINT', () => {
          console.log('\n🛑 Shutting down repository watcher...');
          clearInterval(pollTimer);
          console.log('✅ Repository watcher stopped.');
          process.exit(0);
        });

        // Keep the process alive
        process.stdin.resume();
      } else {
        // Normal single-run mode
        await fetcher.fetchContent(forceUpdate);
        console.log('✅ Content fetch completed successfully!');
      }
    } catch (error) {
      console.error('❌ Content fetch failed:', error.message);
      process.exit(1);
    }
  }

  main();
}
