/**
 * Core module exports
 * Business logic and main functionality for content management
 *
 * @version 2.0.0
 * @package @jantonca/git-files-sync
 */

// Main orchestrator (primary export)
export { ContentFetcher } from './content-fetcher.js';

// Core modules for advanced usage
export { ContentManager } from './content-manager.js';
export { ContentInstaller } from './content-installer.js';
export { RepositoryManager } from './repository-manager.js';
export { BackupManager } from './backup-manager.js';

// Re-export everything for convenience and tree-shaking support
export * from './content-fetcher.js';
export * from './content-manager.js';
export * from './content-installer.js';
export * from './repository-manager.js';
export * from './backup-manager.js';

/**
 * Default export - Main ContentFetcher for simple usage
 *
 * @example
 * ```javascript
 * import ContentFetcher from './src/core/index.js';
 * // or
 * import { ContentFetcher } from './src/core/index.js';
 * ```
 */
export { ContentFetcher as default } from './content-fetcher.js';
