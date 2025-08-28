/**
 * Services Module - Export aggregator for all service classes
 * 
 * Provides unified exports for core infrastructure services
 * 
 * @package @jantonca/git-files-sync
 */

// Core services - all migrated
export { GitService } from './git.js';
export { FileService } from './file.js';
export { CacheService } from './cache.js';
export { ValidationService } from './validation.js';
export { PerformanceManager } from './performance.js';

// Re-export everything for convenience
export * from './git.js';
export * from './file.js';
export * from './cache.js';
export * from './validation.js';
export * from './performance.js';
