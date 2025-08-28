import { CacheService } from './cache.js';
import { performance } from 'perf_hooks';
import { setTimeout, clearTimeout } from 'timers';

/**
 * Performance Manager - Advanced performance optimization
 * Migrated from lib/services/performance-manager.js
 *
 * Features:
 * - Smart concurrency control
 * - Batch processing with memory management
 * - Advanced retry logic with exponential backoff
 * - Performance metrics and monitoring
 * - Intelligent caching integration
 * - Operation tracking and timeout management
 *
 * @version 2.0.0
 * @package @jantonca/git-files-sync
 */
export class PerformanceManager {
  constructor(options = {}) {
    this.maxConcurrency = options.maxConcurrency || 10;
    this.batchSize = options.batchSize || 50;
    this.timeout = options.timeout || 30000;
    this.retryAttempts = options.retryAttempts || 3;
    this.retryDelay = options.retryDelay || 1000;
    this.enableMetrics = options.enableMetrics !== false;
    this.cacheService = options.cacheService || new CacheService();

    // Performance metrics
    this.metrics = {
      operations: 0,
      successes: 0,
      failures: 0,
      totalTime: 0,
      averageTime: 0,
      cacheHits: 0,
      cacheMisses: 0,
    };

    // Active operations tracking
    this.activeOperations = new Map();
    this.operationQueue = [];
  }

  /**
   * Initialize performance manager
   */
  async initialize() {
    await this.cacheService.initialize();
  }

  /**
   * Execute operations with advanced concurrency control
   * @param {Array} items - Items to process
   * @param {Function} processor - Processing function
   * @param {object} options - Processing options
   * @returns {Promise<Array>} Results array
   */
  async executeConcurrent(items, processor, options = {}) {
    const startTime = performance.now();
    const concurrency = options.concurrency || this.maxConcurrency;
    const batchSize = options.batchSize || this.batchSize;
    const enableCache = options.cache !== false;
    const cacheNamespace = options.cacheNamespace || 'concurrent-ops';

    const results = [];
    const errors = [];
    let processed = 0;

    // Process in batches to manage memory
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await this.processBatch(batch, processor, {
        concurrency,
        enableCache,
        cacheNamespace,
        timeout: options.timeout || this.timeout,
      });

      results.push(...batchResults.results);
      errors.push(...batchResults.errors);
      processed += batch.length;

      // Progress callback
      if (options.onProgress) {
        options.onProgress({
          processed,
          total: items.length,
          percentage: Math.round((processed / items.length) * 100),
          errors: errors.length,
        });
      }
    }

    // Update metrics
    if (this.enableMetrics) {
      const duration = performance.now() - startTime;
      this.updateMetrics(items.length, results.length, errors.length, duration);
    }

    return {
      results,
      errors,
      totalProcessed: processed,
      successRate: results.length / items.length,
      duration: performance.now() - startTime,
    };
  }

  /**
   * Process a batch of items with controlled concurrency
   * @param {Array} batch - Batch of items
   * @param {Function} processor - Processing function
   * @param {object} options - Processing options
   * @returns {Promise<object>} Batch results
   */
  async processBatch(batch, processor, options = {}) {
    const { concurrency, enableCache, cacheNamespace, timeout } = options;
    const results = [];
    const errors = [];
    const semaphore = new Semaphore(concurrency);

    const processItem = async (item, index) => {
      await semaphore.acquire();

      try {
        const operationId = `${Date.now()}-${index}`;
        const startTime = performance.now();

        let result;

        // Check cache first if enabled
        if (enableCache) {
          const cacheKey = this.generateItemKey(item);
          result = await this.cacheService.get(cacheKey, cacheNamespace);

          if (result !== null) {
            this.metrics.cacheHits++;
            return { index, result, cached: true };
          }
          this.metrics.cacheMisses++;
        }

        // Track operation
        this.activeOperations.set(operationId, {
          item,
          startTime,
          timeout: timeout
            ? setTimeout(() => {
                this.activeOperations.delete(operationId);
              }, timeout)
            : null,
        });

        // Execute with retry logic
        result = await this.executeWithRetry(
          () => processor(item, index),
          this.retryAttempts,
          this.retryDelay
        );

        // Cache result if enabled
        if (enableCache && result !== undefined) {
          const cacheKey = this.generateItemKey(item);
          await this.cacheService.set(cacheKey, result, cacheNamespace);
        }

        // Clean up tracking
        const operation = this.activeOperations.get(operationId);
        if (operation && operation.timeout) {
          clearTimeout(operation.timeout);
        }
        this.activeOperations.delete(operationId);

        return { index, result, cached: false };
      } catch (error) {
        return { index, error: error.message };
      } finally {
        semaphore.release();
      }
    };

    // Execute all items in batch
    const promises = batch.map((item, index) => processItem(item, index));
    const batchResults = await Promise.allSettled(promises);

    // Organize results
    for (const settled of batchResults) {
      if (settled.status === 'fulfilled') {
        const { index, result, error, cached } = settled.value;
        if (error) {
          errors.push({ index, error });
        } else {
          results.push({ index, result, cached });
        }
      } else {
        errors.push({ index: -1, error: settled.reason.message });
      }
    }

    return { results, errors };
  }

  /**
   * Execute operation with retry logic
   * @param {Function} operation - Operation to execute
   * @param {number} attempts - Number of retry attempts
   * @param {number} delay - Delay between retries
   * @returns {Promise<any>} Operation result
   */
  async executeWithRetry(
    operation,
    attempts = this.retryAttempts,
    delay = this.retryDelay
  ) {
    let lastError;

    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt < attempts) {
          // Exponential backoff
          const backoffDelay = delay * Math.pow(2, attempt - 1);
          await this.sleep(backoffDelay);
        }
      }
    }

    throw new Error(
      `Operation failed after ${attempts} attempts: ${lastError.message}`
    );
  }

  /**
   * Generate cache key for item
   * @param {any} item - Item to generate key for
   * @returns {string} Cache key
   */
  generateItemKey(item) {
    if (typeof item === 'string') return item;
    if (typeof item === 'object' && item.id) return item.id;
    if (typeof item === 'object' && item.path) return item.path;
    return JSON.stringify(item);
  }

  /**
   * Update performance metrics
   * @param {number} total - Total operations
   * @param {number} successes - Successful operations
   * @param {number} failures - Failed operations
   * @param {number} duration - Operation duration
   */
  updateMetrics(total, successes, failures, duration) {
    this.metrics.operations += total;
    this.metrics.successes += successes;
    this.metrics.failures += failures;
    this.metrics.totalTime += duration;
    this.metrics.averageTime = this.metrics.totalTime / this.metrics.operations;
  }

  /**
   * Get performance statistics
   * @returns {object} Performance statistics
   */
  getStats() {
    const cacheStats = this.cacheService ? this.cacheService.getStats() : null;

    return {
      performance: {
        ...this.metrics,
        successRate:
          this.metrics.operations > 0
            ? (
                (this.metrics.successes / this.metrics.operations) *
                100
              ).toFixed(2) + '%'
            : '0%',
        averageTimeMs: this.metrics.averageTime.toFixed(2),
        cacheHitRate:
          this.metrics.cacheHits + this.metrics.cacheMisses > 0
            ? (
                (this.metrics.cacheHits /
                  (this.metrics.cacheHits + this.metrics.cacheMisses)) *
                100
              ).toFixed(2) + '%'
            : '0%',
      },
      cache: cacheStats,
      activeOperations: this.activeOperations.size,
      queuedOperations: this.operationQueue.length,
    };
  }

  /**
   * Reset performance metrics
   */
  resetMetrics() {
    this.metrics = {
      operations: 0,
      successes: 0,
      failures: 0,
      totalTime: 0,
      averageTime: 0,
      cacheHits: 0,
      cacheMisses: 0,
    };
  }

  /**
   * Sleep utility
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Create optimized file processor
   * @param {object} options - Processor options
   * @returns {Function} File processor function
   */
  createFileProcessor(options = {}) {
    const { validateContent = true, transformContent = null } = options;

    return async (filePath, index) => {
      const startTime = performance.now();

      try {
        // Basic validation
        if (validateContent && !filePath) {
          throw new Error('Invalid file path');
        }

        // Process file (placeholder for actual file operations)
        let content = { path: filePath, processed: true };

        // Apply content transformation if provided
        if (transformContent) {
          content = await transformContent(content);
        }

        // Track processing time
        const processingTime = performance.now() - startTime;

        return {
          ...content,
          processingTime: processingTime.toFixed(2),
          index,
        };
      } catch (error) {
        throw new Error(
          `File processing failed for ${filePath}: ${error.message}`
        );
      }
    };
  }

  /**
   * Create optimized Git processor
   * @param {object} gitService - Git service instance
   * @param {object} options - Processor options
   * @returns {Function} Git processor function
   */
  createGitProcessor(gitService, options = {}) {
    const { enableCache = true, validateRepo = true } = options;

    return async (repoInfo, index) => {
      const { url, branch = 'master' } = repoInfo;

      try {
        // Check cache first
        if (enableCache) {
          const cached = await this.cacheService.getCachedRepositoryInfo(url);
          if (cached) {
            return { ...cached, cached: true, index };
          }
        }

        // Validate repository URL
        if (validateRepo && !gitService.validateRepositoryUrl(url)) {
          throw new Error(`Invalid repository URL: ${url}`);
        }

        // Get repository information
        const commitHash = await gitService.getRemoteCommitHash(url, branch);
        const result = {
          url,
          branch,
          commitHash,
          timestamp: Date.now(),
          cached: false,
          index,
        };

        // Cache result
        if (enableCache) {
          await this.cacheService.cacheRepositoryInfo(url, result);
        }

        return result;
      } catch (error) {
        throw new Error(`Git processing failed for ${url}: ${error.message}`);
      }
    };
  }
}

/**
 * Semaphore class for concurrency control
 */
class Semaphore {
  constructor(permits) {
    this.permits = permits;
    this.waiting = [];
  }

  async acquire() {
    if (this.permits > 0) {
      this.permits--;
      return Promise.resolve();
    }

    return new Promise(resolve => {
      this.waiting.push(resolve);
    });
  }

  release() {
    this.permits++;
    if (this.waiting.length > 0) {
      const resolve = this.waiting.shift();
      this.permits--;
      resolve();
    }
  }
}
