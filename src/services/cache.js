import fs from 'fs';
import { readFile, writeFile, mkdir, stat } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

/**
 * Cache Service - Smart caching layer for content operations
 * Migrated from lib/services/cache-service.js
 *
 * Features:
 * - Memory and file-based caching
 * - TTL (Time To Live) management
 * - Namespace support
 * - Specialized Git repository caching
 * - File hash caching for change detection
 * - Automatic cleanup of expired entries
 *
 * @version 2.0.0
 * @package @jantonca/git-files-sync
 */
export class CacheService {
  constructor(options = {}) {
    this.cacheDir =
      options.cacheDir || path.join(process.cwd(), '.cache', 'content-scripts');
    this.maxAge = options.maxAge || 24 * 60 * 60 * 1000; // 24 hours default
    this.maxSize = options.maxSize || 100 * 1024 * 1024; // 100MB default
    this.compressionEnabled = options.compression !== false;
    this.memoryCache = new Map();
    this.memoryLimit = options.memoryLimit || 50; // Max items in memory
    this.enabled = options.enabled !== false;
  }

  /**
   * Initialize cache directory
   */
  async initialize() {
    if (!this.enabled) return;

    try {
      await mkdir(this.cacheDir, { recursive: true });
      await this.cleanupExpired();
    } catch (error) {
      console.warn(`Cache initialization failed: ${error.message}`);
      this.enabled = false;
    }
  }

  /**
   * Generate cache key from input data
   * @param {string|object} input - Input to generate key for
   * @param {string} namespace - Cache namespace
   * @returns {string} Cache key
   */
  generateKey(input, namespace = 'default') {
    const content = typeof input === 'string' ? input : JSON.stringify(input);
    const hash = crypto.createHash('sha256').update(content).digest('hex');
    return `${namespace}_${hash.substring(0, 16)}`;
  }

  /**
   * Get cache file path
   * @param {string} key - Cache key
   * @returns {string} Cache file path
   */
  getCachePath(key) {
    return path.join(this.cacheDir, `${key}.json`);
  }

  /**
   * Check if cache entry is valid
   * @param {object} cacheData - Cache data with metadata
   * @returns {boolean} True if valid
   */
  isValid(cacheData) {
    if (!cacheData || !cacheData.timestamp) return false;

    const age = Date.now() - cacheData.timestamp;
    return age < this.maxAge;
  }

  /**
   * Get cached data
   * @param {string} key - Cache key
   * @param {string} namespace - Cache namespace
   * @returns {Promise<any|null>} Cached data or null
   */
  async get(key, namespace = 'default') {
    if (!this.enabled) return null;

    const cacheKey = this.generateKey(key, namespace);

    // Check memory cache first
    if (this.memoryCache.has(cacheKey)) {
      const cached = this.memoryCache.get(cacheKey);
      if (this.isValid(cached)) {
        return cached.data;
      }
      this.memoryCache.delete(cacheKey);
    }

    // Check file cache
    try {
      const cachePath = this.getCachePath(cacheKey);
      if (!fs.existsSync(cachePath)) return null;

      const cacheContent = await readFile(cachePath, 'utf8');
      const cached = JSON.parse(cacheContent);

      if (!this.isValid(cached)) {
        await this.delete(key, namespace);
        return null;
      }

      // Add to memory cache if not too large
      if (this.memoryCache.size < this.memoryLimit) {
        this.memoryCache.set(cacheKey, cached);
      }

      return cached.data;
    } catch (error) {
      console.warn(`Cache read failed for key ${cacheKey}: ${error.message}`);
      return null;
    }
  }

  /**
   * Set cached data
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   * @param {string} namespace - Cache namespace
   * @param {object} options - Cache options
   * @returns {Promise<boolean>} Success status
   */
  async set(key, data, namespace = 'default', options = {}) {
    if (!this.enabled) return false;

    const cacheKey = this.generateKey(key, namespace);
    const cacheData = {
      data,
      timestamp: Date.now(),
      ttl: options.ttl || this.maxAge,
      size: JSON.stringify(data).length,
      metadata: options.metadata || {},
    };

    try {
      // Write to file cache
      const cachePath = this.getCachePath(cacheKey);
      await writeFile(cachePath, JSON.stringify(cacheData), 'utf8');

      // Add to memory cache if not too large
      if (this.memoryCache.size < this.memoryLimit) {
        this.memoryCache.set(cacheKey, cacheData);
      }

      return true;
    } catch (error) {
      console.warn(`Cache write failed for key ${cacheKey}: ${error.message}`);
      return false;
    }
  }

  /**
   * Delete cached data
   * @param {string} key - Cache key
   * @param {string} namespace - Cache namespace
   * @returns {Promise<boolean>} Success status
   */
  async delete(key, namespace = 'default') {
    if (!this.enabled) return false;

    const cacheKey = this.generateKey(key, namespace);

    try {
      // Remove from memory cache
      this.memoryCache.delete(cacheKey);

      // Remove from file cache
      const cachePath = this.getCachePath(cacheKey);
      if (fs.existsSync(cachePath)) {
        await fs.promises.unlink(cachePath);
      }

      return true;
    } catch (error) {
      console.warn(`Cache delete failed for key ${cacheKey}: ${error.message}`);
      return false;
    }
  }

  /**
   * Clear all cache data
   * @param {string} namespace - Optional namespace to clear
   * @returns {Promise<boolean>} Success status
   */
  async clear(namespace = null) {
    if (!this.enabled) return false;

    try {
      // Clear memory cache
      if (namespace) {
        for (const [key] of this.memoryCache) {
          if (key.startsWith(`${namespace}_`)) {
            this.memoryCache.delete(key);
          }
        }
      } else {
        this.memoryCache.clear();
      }

      // Clear file cache
      const files = await fs.promises.readdir(this.cacheDir);
      const deletePromises = files
        .filter(file => !namespace || file.startsWith(`${namespace}_`))
        .map(file => fs.promises.unlink(path.join(this.cacheDir, file)));

      await Promise.all(deletePromises);
      return true;
    } catch (error) {
      console.warn(`Cache clear failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Get cache statistics
   * @returns {Promise<object>} Cache statistics
   */
  async getStats() {
    if (!this.enabled) {
      return { enabled: false };
    }

    try {
      const files = await fs.promises.readdir(this.cacheDir);
      let totalSize = 0;
      let validEntries = 0;
      let expiredEntries = 0;

      for (const file of files) {
        try {
          const filePath = path.join(this.cacheDir, file);
          const stats = await stat(filePath);
          totalSize += stats.size;

          const content = await readFile(filePath, 'utf8');
          const cached = JSON.parse(content);

          if (this.isValid(cached)) {
            validEntries++;
          } else {
            expiredEntries++;
          }
        } catch {
          // Ignore invalid cache files
        }
      }

      return {
        enabled: true,
        totalFiles: files.length,
        validEntries,
        expiredEntries,
        totalSize: `${(totalSize / 1024 / 1024).toFixed(2)}MB`,
        memoryEntries: this.memoryCache.size,
        cacheDir: this.cacheDir,
        maxAge: `${(this.maxAge / 1000 / 60 / 60).toFixed(1)}h`,
      };
    } catch (error) {
      return { enabled: true, error: error.message };
    }
  }

  /**
   * Clean up expired cache entries
   * @returns {Promise<number>} Number of entries cleaned
   */
  async cleanupExpired() {
    if (!this.enabled) return 0;

    let cleaned = 0;

    try {
      const files = await fs.promises.readdir(this.cacheDir);

      for (const file of files) {
        try {
          const filePath = path.join(this.cacheDir, file);
          const content = await readFile(filePath, 'utf8');
          const cached = JSON.parse(content);

          if (!this.isValid(cached)) {
            await fs.promises.unlink(filePath);
            cleaned++;
          }
        } catch {
          // Remove invalid cache files
          try {
            await fs.promises.unlink(path.join(this.cacheDir, file));
            cleaned++;
          } catch {
            // Ignore cleanup failures
          }
        }
      }

      // Clean memory cache
      for (const [key, cached] of this.memoryCache) {
        if (!this.isValid(cached)) {
          this.memoryCache.delete(key);
        }
      }
    } catch (error) {
      console.warn(`Cache cleanup failed: ${error.message}`);
    }

    return cleaned;
  }

  /**
   * Cache wrapper for expensive operations
   * @param {string} key - Cache key
   * @param {Function} operation - Operation to cache
   * @param {object} options - Cache options
   * @returns {Promise<any>} Operation result
   */
  async wrap(key, operation, options = {}) {
    const namespace = options.namespace || 'operations';

    // Try to get from cache first
    const cached = await this.get(key, namespace);
    if (cached !== null) {
      return cached;
    }

    // Execute operation and cache result
    const result = await operation();
    await this.set(key, result, namespace, options);
    return result;
  }

  /**
   * Cache Git repository information
   * @param {string} repoUrl - Repository URL
   * @param {object} repoInfo - Repository information
   * @returns {Promise<boolean>} Success status
   */
  async cacheRepositoryInfo(repoUrl, repoInfo) {
    return await this.set(repoUrl, repoInfo, 'git-repos', {
      ttl: 2 * 60 * 60 * 1000, // 2 hours for git info
      metadata: { type: 'repository-info' },
    });
  }

  /**
   * Get cached Git repository information
   * @param {string} repoUrl - Repository URL
   * @returns {Promise<object|null>} Repository information
   */
  async getCachedRepositoryInfo(repoUrl) {
    return await this.get(repoUrl, 'git-repos');
  }

  /**
   * Cache file content hash for change detection
   * @param {string} filePath - File path
   * @param {string} hash - Content hash
   * @returns {Promise<boolean>} Success status
   */
  async cacheFileHash(filePath, hash) {
    return await this.set(
      filePath,
      { hash, timestamp: Date.now() },
      'file-hashes',
      {
        ttl: 7 * 24 * 60 * 60 * 1000, // 7 days for file hashes
        metadata: { type: 'file-hash' },
      }
    );
  }

  /**
   * Get cached file hash
   * @param {string} filePath - File path
   * @returns {Promise<string|null>} File hash
   */
  async getCachedFileHash(filePath) {
    const cached = await this.get(filePath, 'file-hashes');
    return cached ? cached.hash : null;
  }
}
