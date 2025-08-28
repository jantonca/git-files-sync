#!/usr/bin/env node

/**
 * Content Fetcher - Main orchestrator for content management
 * Refactored from monolithic content-fetcher.js for better separation of concerns
 */

import path from 'path';
import { createFrameworkAdapter } from '../adapters/index.js';
import {
  GitService,
  FileService,
  ValidationService,
  CacheService,
  PerformanceManager,
} from '../services/index.js';
import { GitIgnoreManager } from '../utils/gitignore.js';
import { CONFIG } from '../utils/config.js';
import {
  PluginManager,
  PerformancePlugin,
  LoggingPlugin,
} from './plugin-manager-stub.js';

// Import our new modular components
import { ContentManager } from './content-manager.js';
import { ContentInstaller } from './content-installer.js';
import { RepositoryManager } from './repository-manager.js';
import { BackupManager } from './backup-manager.js';

/**
 * Content Fetcher - Main orchestrator with modular architecture
 */
export class ContentFetcher {
  constructor(options = {}) {
    // Core services (existing)
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

    this.gitIgnoreManager = new GitIgnoreManager({
      projectRoot: options.projectRoot,
    });

    // Framework adapter
    this.frameworkAdapter = null;

    // Initialize modular components
    this.contentManager = null;
    this.contentInstaller = null;
    this.repositoryManager = null;
    this.backupManager = null;

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
    if (projectRoot.endsWith('/git-files-sync') || projectRoot.endsWith('\\git-files-sync')) {
      projectRoot = path.resolve(projectRoot, '..');
    }

    // Detect and initialize framework adapter
    this.frameworkAdapter = await createFrameworkAdapter(null, { projectRoot });

    if (this.frameworkAdapter?.framework) {
      console.log(`🎯 Detected framework: ${this.frameworkAdapter.framework}`);
    }

    // Initialize services
    await this.cacheService.initialize();
    await this.performanceManager.initialize();

    // Initialize modular components with dependencies
    this.contentManager = new ContentManager({
      fileService: this.fileService,
      cacheService: this.cacheService,
      gitService: this.gitService,
      gitIgnoreManager: this.gitIgnoreManager,
      frameworkAdapter: this.frameworkAdapter,
    });

    this.contentInstaller = new ContentInstaller({
      fileService: this.fileService,
      cacheService: this.cacheService,
      performanceManager: this.performanceManager,
      frameworkAdapter: this.frameworkAdapter,
    });

    this.repositoryManager = new RepositoryManager({
      gitService: this.gitService,
      fileService: this.fileService,
    });

    this.backupManager = new BackupManager({
      fileService: this.fileService,
    });

    // Register built-in plugins
    await this.registerBuiltinPlugins();

    // Execute plugin hook
    await this.pluginManager.executeHook('after-initialize', {
      fetcher: this,
      framework: this.frameworkAdapter?.framework,
    });
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
          '   To set up git files sync, run: ./git-files-sync/setup.sh'
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

      // Smart cache validation
      if (!forceUpdate && (await this.contentManager.isContentUpToDate())) {
        console.log('✅ Content is up-to-date (cached validation)');
        
        // Ensure gitignore is updated even when content is cached
        await this.executeWithHooks('update-gitignore', () =>
          this.contentManager.updateGitignoreWithContent()
        );
        
        this.metrics.cacheHits++;
        return true;
      }

      // Additional safety check
      if (!forceUpdate) {
        try {
          const contentExists = await this.contentManager.checkContentExists();
          const cachedInfo = await this.cacheService.getCachedRepositoryInfo(
            CONFIG.REPO_URL
          );

          if (contentExists === true && cachedInfo) {
            const currentCommit =
              await this.repositoryManager.getCurrentCommitHash();
            console.log(
              `🔍 Checking commits: cached=${cachedInfo.commitHash?.substring(0, 8)} vs current=${currentCommit?.substring(0, 8)}`
            );

            if (cachedInfo.commitHash === currentCommit) {
              console.log(
                '✅ Content exists and is up-to-date, skipping fetch'
              );
              
              // Ensure gitignore is updated even when content is cached
              await this.executeWithHooks('update-gitignore', () =>
                this.contentManager.updateGitignoreWithContent()
              );
              
              this.metrics.cacheHits++;
              return true;
            } else {
              console.log('🔄 Commits differ, using safe update method...');
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
          }
        } catch (error) {
          console.warn('⚠️  Failed to perform safety check:', error.message);
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
      await this.executeWithHooks('backup', () =>
        this.backupManager.createBackup()
      );
      await this.executeWithHooks('clean', () =>
        this.backupManager.cleanOldContent()
      );
      await this.executeWithHooks('clone', () =>
        this.repositoryManager.cloneRepository()
      );
      await this.executeWithHooks('install', () =>
        this.contentInstaller.installContentConcurrent()
      );
      await this.executeWithHooks('cleanup-temp', () =>
        this.repositoryManager.cleanupTempDirectory()
      );
      await this.executeWithHooks('update-gitignore', () =>
        this.contentManager.updateGitignoreWithContent()
      );

      // Cache validation data for future runs
      await this.contentManager.cacheValidationData();

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

      // Clean up temp directory even on error
      try {
        await this.repositoryManager.cleanupTempDirectory();
      } catch (cleanupError) {
        console.warn(
          '⚠️  Failed to clean up temp directory:',
          cleanupError.message
        );
      }

      // Attempt to restore backup on error
      await this.backupManager.restoreBackup();
      throw error;
    }
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
      await this.executeWithHooks('clone', () =>
        this.repositoryManager.cloneRepository()
      );

      // Install content without backup/cleanup
      await this.executeWithHooks('install', () =>
        this.contentInstaller.installContentConcurrent()
      );

      // Clean up temporary directory
      await this.executeWithHooks('cleanup-temp', () =>
        this.repositoryManager.cleanupTempDirectory()
      );

      // Update gitignore with managed content paths
      await this.executeWithHooks('update-gitignore', () =>
        this.contentManager.updateGitignoreWithContent()
      );

      // Cache validation data for future runs
      await this.contentManager.cacheValidationData();

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
        await this.repositoryManager.cleanupTempDirectory();
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

  // Delegate methods to appropriate modules
  async checkContentExists() {
    return await this.contentManager.checkContentExists();
  }

  async isContentUpToDate() {
    return await this.contentManager.isContentUpToDate();
  }

  async checkContentInGitignore() {
    return await this.contentManager.checkContentInGitignore();
  }

  /**
   * Check if there are changes in the remote repository
   * @returns {Promise<boolean>} True if changes detected
   */
  async checkForRepositoryChanges() {
    try {
      // Get cached repository info
      const cachedInfo = await this.cacheService.getCachedRepositoryInfo(CONFIG.REPO_URL);
      
      if (!cachedInfo) {
        // No cache, assume changes
        return true;
      }

      // Get current remote commit hash
      const currentCommit = await this.repositoryManager.getCurrentCommitHash();
      
      // Compare with cached commit
      const hasChanges = cachedInfo.commitHash !== currentCommit;
      
      if (hasChanges) {
        console.log(`🔄 Commit changed: ${cachedInfo.commitHash?.substring(0, 8)} → ${currentCommit?.substring(0, 8)}`);
      }
      
      return hasChanges;
    } catch (error) {
      console.warn('⚠️  Error checking repository changes:', error.message);
      // On error, assume no changes to avoid excessive fetching
      return false;
    }
  }

  /**
   * Get comprehensive status information
   */
  async getStatus() {
    const cacheStats = await this.getCacheStats();
    const metrics = this.getMetrics();
    const performanceReport = this.getPerformanceReport();
    
    return {
      cache: {
        enabled: cacheStats.enabled,
        totalFiles: cacheStats.totalFiles,
        validEntries: cacheStats.validEntries,
        expiredEntries: cacheStats.expiredEntries,
        directory: cacheStats.cacheDir
      },
      lastUpdate: metrics.fetcher.startTime ? new Date(metrics.fetcher.startTime).toISOString() : 'Never',
      performance: {
        operations: metrics.fetcher.operationsCount,
        averageTime: metrics.fetcher.fetchTime || 0,
        cacheHitRate: metrics.fetcher.cacheHits > 0 ? 
          Math.round((metrics.fetcher.cacheHits / (metrics.fetcher.cacheHits + metrics.fetcher.cacheMisses)) * 100) + '%' : 'N/A'
      },
      plugins: {
        total: this.pluginManager?.plugins?.size || 0,
        enabled: this.pluginManager?.enabledPlugins?.size || 0
      },
      recommendations: performanceReport.recommendations || []
    };
  }

  /**
   * Perform comprehensive health check
   */
  async healthCheck() {
    const results = {
      timestamp: new Date().toISOString(),
      overall: 'healthy',
      checks: {}
    };

    try {
      // Check cache service
      results.checks.cache = {
        status: 'ok',
        message: 'Cache service operational'
      };
      await this.getCacheStats();
    } catch (error) {
      results.checks.cache = {
        status: 'error',
        message: `Cache service error: ${error.message}`
      };
      results.overall = 'unhealthy';
    }

    try {
      // Check plugin system
      const pluginManager = this.getPluginManager();
      results.checks.plugins = {
        status: 'ok',
        message: `Plugin system operational (${pluginManager?.plugins?.size || 0} plugins)`
      };
    } catch (error) {
      results.checks.plugins = {
        status: 'error',
        message: `Plugin system error: ${error.message}`
      };
      results.overall = 'unhealthy';
    }

    try {
      // Check performance service
      this.getPerformanceReport();
      results.checks.performance = {
        status: 'ok',
        message: 'Performance monitoring operational'
      };
    } catch (error) {
      results.checks.performance = {
        status: 'error',
        message: `Performance monitoring error: ${error.message}`
      };
      results.overall = 'unhealthy';
    }

    try {
      // Check git service
      if (this.gitService) {
        results.checks.git = {
          status: 'ok',
          message: 'Git service operational'
        };
      } else {
        results.checks.git = {
          status: 'warning',
          message: 'Git service not initialized'
        };
      }
    } catch (error) {
      results.checks.git = {
        status: 'error',
        message: `Git service error: ${error.message}`
      };
      results.overall = 'unhealthy';
    }

    return results;
  }
}

/**
 * Detect if running in CloudCannon environment
 */
function isCloudCannonEnvironment() {
  const hasCloudCannonEnvVars = !!(
    process.env.IS_CLOUDCANNON_BUILD ||
    process.env.CLOUDCANNON_BUILD ||
    process.env.CLOUDCANNON_SITE_ID ||
    process.env.CLOUDCANNON_CONFIG_PATH ||
    process.env.CLOUDCANNON
  );

  const isCloudCannon = hasCloudCannonEnvVars;

  if (isCloudCannon && process.env.DEBUG_CLOUDCANNON) {
    console.log('🔍 CloudCannon Detection Debug:');
    console.log(`   Environment variables: ${hasCloudCannonEnvVars}`);
    console.log(`   Detected as CloudCannon: ${isCloudCannon}`);
  }

  return isCloudCannon;
}

// CLI execution (same as original)
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
      // const autoMode = process.argv.includes('--auto'); // For future watch mode enhancement

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

        // Watch mode implementation with actual polling
        console.log('🎉 Repository watcher functionality available');
        console.log('📝 Press Ctrl+C to stop watching...');

        // Get initial commit hash for comparison
        let lastKnownCommit;
        try {
          lastKnownCommit = await this.repositoryManager.getCurrentCommitHash();
          console.log(`🔍 Current commit: ${lastKnownCommit?.substring(0, 8)}...`);
        } catch (error) {
          console.error('❌ Failed to get initial commit hash:', error.message);
          process.exit(1);
        }

        let isUpdating = false;

        // Initialize lastNotifiedCommit to what was last successfully fetched
        const initialCachedInfo = await this.cacheService.getCachedRepositoryInfo(CONFIG.REPO_URL);
        let lastNotifiedCommit = initialCachedInfo?.commitHash;

        const pollInterval = 30000; // Check every 30 seconds

        const checkForUpdates = async () => {
          if (isUpdating) return;

          try {
            const currentCommit = await this.repositoryManager.getCurrentCommitHash();

            // Clear memory cache to ensure we get fresh data from disk
            this.cacheService.memoryCache?.clear();

            // Check what we last successfully fetched from cache
            const cachedInfo = await this.cacheService.getCachedRepositoryInfo(CONFIG.REPO_URL);
            const lastFetchedCommit = cachedInfo?.commitHash;

            // Only show "new content available" if current differs from last successfully fetched
            if (currentCommit !== lastFetchedCommit) {
              // Only show the message if we haven't already notified about this commit
              if (currentCommit !== lastNotifiedCommit) {
                console.log(
                  `🔄 New commit detected: ${currentCommit?.substring(0, 8)}... (was ${lastFetchedCommit?.substring(0, 8) || 'unknown'}...)`
                );
                console.log('🤖 Auto-updating content...');
                lastNotifiedCommit = currentCommit;
              }

              isUpdating = true;

              try {
                // Use safer update method to avoid removing existing content
                await this.updateContentSafely();
                console.log('✅ Content updated successfully!');
              } catch (error) {
                console.error('❌ Failed to update content:', error.message);
              } finally {
                isUpdating = false;
              }
            } else {
              // Commits match - check if we just resolved a pending notification
              if (lastNotifiedCommit && lastNotifiedCommit === currentCommit) {
                console.log('✅ Content is now up to date!');
                console.log('⏱️  Continuing to monitor for changes...');
                lastNotifiedCommit = null;
              }
            }
          } catch (error) {
            console.warn(`⚠️  Failed to check for updates: ${error.message}`);
          }
        };

        console.log('🎉 Repository watcher started successfully!');
        console.log(`⏱️  Checking for updates every ${pollInterval / 1000} seconds`);

        // Set up periodic checking
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

        // Keep the process alive for watch mode
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
