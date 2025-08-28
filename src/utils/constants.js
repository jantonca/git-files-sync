/**
 * Constants
 * Centralized constants for the content management system
 * Extracted from various files to improve maintainability
 */

// ========================================
// TIMING CONSTANTS
// ========================================

/**
 * Default timeout values (in milliseconds)
 */
export const TIMEOUTS = {
  DEFAULT: 30000, // 30 seconds - default for most operations
  GIT_OPERATION: 30000, // 30 seconds - git clone, fetch, etc.
  GIT_VALIDATION: 10000, // 10 seconds - quick git validation
  PERFORMANCE_TEST: 5000, // 5 seconds - performance testing
  SHORT: 15000, // 15 seconds - shorter operations
  CACHE_CHECK: 5000, // 5 seconds - cache validation
};

/**
 * Retry configurations
 */
export const RETRIES = {
  DEFAULT: 3, // Default retry count
  GIT_OPERATIONS: 3, // Git operation retries
  CACHE_OPERATIONS: 2, // Cache operation retries
  NETWORK_REQUESTS: 2, // Network request retries
};

/**
 * Cache durations (in milliseconds)
 */
export const CACHE_DURATIONS = {
  DEFAULT: 24 * 60 * 60 * 1000, // 24 hours
  SHORT: 1 * 60 * 60 * 1000, // 1 hour
  LONG: 7 * 24 * 60 * 60 * 1000, // 7 days
  REPOSITORY_INFO: 24 * 60 * 60 * 1000, // 24 hours
  CONFIG: 1 * 60 * 60 * 1000, // 1 hour
};

// ========================================
// DIRECTORY AND FILE CONSTANTS
// ========================================

/**
 * Default directory names
 */
export const DIRECTORIES = {
  TEMP: '.content-temp',
  BACKUP: '.content-backup',
  CACHE: '.content-cache',
  OUTPUT: './src/content',
  GIT_FILES_SYNC: 'git-files-sync',
};

/**
 * Default file names and extensions
 */
export const FILES = {
  CONFIG: 'content.config.js',
  GITIGNORE: '.gitignore',
  PACKAGE_JSON: 'package.json',
  README: 'README.md',
};

/**
 * File extensions for content validation
 */
export const EXTENSIONS = {
  MARKDOWN: ['.md', '.mdx'],
  JSON: ['.json'],
  JAVASCRIPT: ['.js', '.mjs'],
  TYPESCRIPT: ['.ts'],
  YAML: ['.yml', '.yaml'],
  ALL_CONTENT: ['.md', '.mdx', '.json', '.yml', '.yaml'],
  ALL_CODE: ['.js', '.mjs', '.ts', '.jsx', '.tsx'],
};

// ========================================
// GIT AND REPOSITORY CONSTANTS
// ========================================

/**
 * Default git settings
 */
export const GIT = {
  DEFAULT_BRANCH: 'main',
  FALLBACK_BRANCH: 'master',
  REMOTE_NAME: 'origin',
  SPARSE_CHECKOUT_FILE: '.git/info/sparse-checkout',
};

/**
 * Repository validation patterns
 */
export const REPOSITORY_PATTERNS = {
  SSH: /^git@[\w.-]+:[\w.-]+\/[\w.-]+\.git$/,
  HTTPS: /^https:\/\/[\w.-]+\/[\w.-]+\/[\w.-]+(?:\.git)?$/,
  GITHUB:
    /^(?:git@github\.com:|https:\/\/github\.com\/)[\w.-]+\/[\w.-]+(?:\.git)?$/,
  BITBUCKET:
    /^(?:git@bitbucket\.org:|https:\/\/bitbucket\.org\/)[\w.-]+\/[\w.-]+(?:\.git)?$/,
};

// ========================================
// FRAMEWORK CONSTANTS
// ========================================

/**
 * Supported frameworks
 */
export const FRAMEWORKS = {
  ASTRO: 'astro',
  NEXTJS: 'nextjs',
  REACT: 'react',
  NUXT: 'nuxt',
  GATSBY: 'gatsby',
  DEFAULT: 'astro',
};

/**
 * Framework-specific file patterns
 */
export const FRAMEWORK_PATTERNS = {
  [FRAMEWORKS.ASTRO]: {
    config: 'astro.config.*',
    contentDir: 'src/content',
    pagesDir: 'src/pages',
  },
  [FRAMEWORKS.NEXTJS]: {
    config: 'next.config.*',
    contentDir: 'content',
    pagesDir: 'pages',
  },
  [FRAMEWORKS.REACT]: {
    config: 'package.json',
    contentDir: 'src/content',
    pagesDir: 'src/pages',
  },
};

// ========================================
// PERFORMANCE CONSTANTS
// ========================================

/**
 * Performance and concurrency limits
 */
export const PERFORMANCE = {
  MAX_CONCURRENCY: 10, // Maximum concurrent operations
  DEFAULT_CONCURRENCY: 5, // Default concurrent operations
  BATCH_SIZE: 50, // Default batch size for bulk operations
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB max file size
  CHUNK_SIZE: 64 * 1024, // 64KB chunks for streaming
};

/**
 * Memory and resource limits
 */
export const LIMITS = {
  MAX_CACHE_SIZE: 100 * 1024 * 1024, // 100MB cache limit
  MAX_LOG_SIZE: 10 * 1024 * 1024, // 10MB log file limit
  MAX_BACKUP_COUNT: 10, // Maximum backup files to keep
  MAX_RETRY_DELAY: 5000, // 5 seconds max retry delay
};

// ========================================
// LOG LEVELS AND MESSAGES
// ========================================

/**
 * Log levels
 */
export const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
  TRACE: 'trace',
};

/**
 * Common error messages
 */
export const ERROR_MESSAGES = {
  CONFIG_NOT_FOUND: 'Configuration file not found',
  INVALID_REPOSITORY: 'Invalid repository URL',
  NETWORK_ERROR: 'Network connection failed',
  PERMISSION_DENIED: 'Permission denied',
  FILE_NOT_FOUND: 'File not found',
  INVALID_JSON: 'Invalid JSON format',
  TIMEOUT: 'Operation timed out',
  CACHE_ERROR: 'Cache operation failed',
};

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  CONFIG_LOADED: 'Configuration loaded successfully',
  CONTENT_FETCHED: 'Content fetched successfully',
  CACHE_HIT: 'Cache hit - using cached data',
  BACKUP_CREATED: 'Backup created successfully',
  OPERATION_COMPLETE: 'Operation completed successfully',
};

// ========================================
// ENVIRONMENT CONSTANTS
// ========================================

/**
 * Environment variable names
 */
export const ENV_VARS = {
  NODE_ENV: 'NODE_ENV',
  DEBUG: 'DEBUG',
  CONTENT_REPO_URL: 'CONTENT_REPO_URL',
  CACHE_ENABLED: 'CACHE_ENABLED',
  LOG_LEVEL: 'LOG_LEVEL',
};

/**
 * Environment values
 */
export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test',
};

// ========================================
// VALIDATION CONSTANTS
// ========================================

/**
 * Validation rules
 */
export const VALIDATION = {
  MIN_FILENAME_LENGTH: 1,
  MAX_FILENAME_LENGTH: 255,
  MIN_CONTENT_SIZE: 0,
  MAX_CONTENT_SIZE: 10 * 1024 * 1024, // 10MB
  REQUIRED_CONFIG_FIELDS: ['REPO_URL', 'CONTENT_MAPPING'],
};

/**
 * Content patterns for validation
 */
export const CONTENT_PATTERNS = {
  FRONTMATTER: /^---\s*\n([\s\S]*?)\n---/,
  YAML_FRONTMATTER: /^---\s*\n([\s\S]*?)\n---/,
  JSON_FRONTMATTER: /^{\s*\n([\s\S]*?)\n}/,
  MARKDOWN_LINK: /\[([^\]]+)\]\(([^)]+)\)/g,
  IMAGE_LINK: /!\[([^\]]*)\]\(([^)]+)\)/g,
};

// ========================================
// DEFAULT EXPORT FOR CONVENIENCE
// ========================================

/**
 * All constants grouped for easy import
 */
export const CONSTANTS = {
  TIMEOUTS,
  RETRIES,
  CACHE_DURATIONS,
  DIRECTORIES,
  FILES,
  EXTENSIONS,
  GIT,
  REPOSITORY_PATTERNS,
  FRAMEWORKS,
  FRAMEWORK_PATTERNS,
  PERFORMANCE,
  LIMITS,
  LOG_LEVELS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  ENV_VARS,
  ENVIRONMENTS,
  VALIDATION,
  CONTENT_PATTERNS,
};

export default CONSTANTS;
