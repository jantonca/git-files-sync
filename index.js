/**
 * @jantonca/git-files-sync
 * Framework-agnostic git files synchronization system
 *
 * Main entry point for programmatic usage
 */

// Core exports - Main content management classes
export {
  ContentFetcher,
  ContentManager,
  ContentInstaller,
  RepositoryManager,
  BackupManager,
} from './src/core/index.js';

// Service exports - Core infrastructure services
export {
  GitService,
  FileService,
  CacheService,
  ValidationService,
  PerformanceManager,
} from './src/services/index.js';

// Adapter exports - Framework integration
export {
  createFrameworkAdapter,
  AstroAdapter,
  NextJSAdapter,
  ReactAdapter,
} from './src/adapters/index.js';

// Utility exports - Helper functions and classes
export {
  CONFIG,
  getSparseCheckoutPaths,
  validateConfig,
  Logger,
  logger,
  CONSTANTS,
  GitIgnoreManager,
  ContentMappingManager,
  CLIInterfaceManager,
} from './src/utils/index.js';

// Default export - Main ContentFetcher for simple usage
export { ContentFetcher as default } from './src/core/index.js';
