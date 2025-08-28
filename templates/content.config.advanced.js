/**
 * Advanced Content Management Configuration
 *
 * Comprehensive setup with performance optimization, advanced caching,
 * and fine-tuned settings for large-scale production projects.
 */

export const CONFIG = {
  // Repository settings - REQUIRED
  REPO_URL: 'git@github.com:jantonca/git-files-sync-test-content.git',
  BRANCH: 'main',

  // Directory settings with custom paths
  TEMP_DIR: '.content-temp',
  BACKUP_DIR: '.content-backup',
  CACHE_DIR: '.content-cache',

  // Advanced content mapping with multiple types
  CONTENT_MAPPING: {
    // Blog content with pattern matching
    'src/content/blog': {
      type: 'folder',
      source: 'content/blog',
      pattern: '**/*.{md,mdx}',
      transform: {
        frontmatter: true,
        images: true,
      },
    },

    // Documentation with selective imports
    'src/content/docs': {
      type: 'selective',
      source: 'docs',
      files: ['api/*.md', 'guides/*.md'],
      exclude: ['**/draft-*.md'],
    },

    // Configuration data
    'src/data/site': {
      type: 'selective',
      source: 'config',
      files: ['site.json', 'navigation.json', 'features.json', 'pricing.json'],
    },

    // Media assets with size optimization
    'public/images/content': {
      type: 'folder',
      source: 'assets/images',
      pattern: '**/*.{jpg,png,svg,webp}',
      transform: {
        optimize: true,
        formats: ['webp', 'avif'],
      },
    },

    // Templates and components
    'src/components/content': {
      type: 'folder',
      source: 'templates/components',
      pattern: '**/*.{astro,jsx,tsx,vue}',
    },
  },

  // Advanced performance settings
  PERFORMANCE: {
    ENABLE_CACHE: true,
    CACHE_TTL: 7200000, // 2 hours
    CACHE_MAX_SIZE: 500 * 1024 * 1024, // 500MB
    ENABLE_GZIP: true,
    ENABLE_BROTLI: true,
    MAX_CONCURRENT_OPERATIONS: 10,
    CHUNK_SIZE: 1024 * 1024, // 1MB chunks
    MEMORY_LIMIT: 2 * 1024 * 1024 * 1024, // 2GB
  },

  // Advanced Git settings
  GIT: {
    SPARSE_CHECKOUT: true,
    SHALLOW_CLONE: true,
    CLONE_DEPTH: 1,
    SINGLE_BRANCH: true,
    FETCH_TAGS: false,
    SUBMODULES: false,
    LFS_SUPPORT: true,
  },

  // Content processing
  PROCESSING: {
    ENABLE_FRONTMATTER_VALIDATION: true,
    ENABLE_MARKDOWN_PROCESSING: true,
    ENABLE_IMAGE_OPTIMIZATION: true,
    ENABLE_CODE_HIGHLIGHTING: true,
    MINIFY_JSON: true,
    VALIDATE_LINKS: true,
  },

  // Security settings
  SECURITY: {
    VALIDATE_FILE_TYPES: true,
    ALLOWED_EXTENSIONS: [
      '.md',
      '.mdx',
      '.json',
      '.yml',
      '.yaml',
      '.jpg',
      '.png',
      '.svg',
      '.webp',
    ],
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    SCAN_FOR_MALWARE: false,
  },

  // Monitoring and logging
  MONITORING: {
    ENABLE_PERFORMANCE_TRACKING: true,
    ENABLE_ERROR_REPORTING: true,
    LOG_LEVEL: 'info', // 'debug', 'info', 'warn', 'error'
    METRICS_COLLECTION: true,
  },

  // Backup settings
  BACKUP: {
    AUTO_BACKUP: true,
    BACKUP_RETENTION: 30, // days
    BACKUP_COMPRESSION: true,
    INCREMENTAL_BACKUP: true,
  },
};
