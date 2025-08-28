/**
 * Data-Rich Project Configuration
 *
 * Optimized for projects with complex data structures, multiple data types,
 * and rich content from headless CMS platforms like CloudCannon.
 * Handles structured data, media assets, and configuration files.
 */

export const CONFIG = {
  // Repository settings
  REPO_URL: 'git@github.com:your-org/cms-data-repo.git',
  BRANCH: 'main',

  // Directory settings
  TEMP_DIR: '.content-temp',
  BACKUP_DIR: '.content-backup',

  // Data mapping for complex structures
  CONTENT_MAPPING: {
    // Product catalog data (JSON/YAML)
    'src/data/products': {
      type: 'folder',
      source: 'data/products',
      pattern: '**/*.{json,yaml,yml}',
    },

    // Site configuration and settings
    'src/data/config': {
      type: 'selective',
      source: 'config',
      files: [
        'site.json',
        'navigation.yaml',
        'theme-settings.json',
        'seo.yaml',
      ],
    },

    // Team/people data
    'src/data/team': {
      type: 'folder',
      source: 'data/team',
      pattern: '**/*.{json,yaml}',
    },

    // Testimonials/reviews
    'src/data/testimonials': {
      type: 'folder',
      source: 'data/testimonials',
      pattern: '**/*.{json,yaml}',
    },

    // Media assets and images
    'src/data/assets/images': {
      type: 'folder',
      source: 'assets/images',
      pattern: '**/*.{jpg,jpeg,png,svg,webp}',
    },

    // Documents and downloads
    'src/data/assets/documents': {
      type: 'folder',
      source: 'assets/documents',
      pattern: '**/*.{pdf,doc,docx,xls,xlsx}',
    },

    // Pricing data
    'src/data/pricing': {
      type: 'selective',
      source: 'data/pricing',
      files: ['plans.json', 'features.yaml'],
    },

    // FAQ data
    'src/data/faq': {
      type: 'folder',
      source: 'data/faq',
      pattern: '**/*.{json,yaml}',
    },

    // Localization/i18n data
    'src/data/i18n': {
      type: 'folder',
      source: 'locales',
      pattern: '**/*.{json,yaml}',
    },

    // Content collections (if some content is needed)
    'src/content/collections': {
      type: 'folder',
      source: 'content/collections',
      pattern: '**/*.{md,mdx}',
    },
  },

  // Performance settings optimized for data-heavy operations
  PERFORMANCE: {
    ENABLE_CACHE: true,
    CACHE_TTL: 7200000, // 2 hours for data-heavy operations
    CONCURRENT_OPERATIONS: 8,
    MEMORY_LIMIT: '1gb',
  },

  // Git settings optimized for large data repositories
  GIT: {
    SPARSE_CHECKOUT: true,
    SHALLOW_CLONE: true,
    DEPTH: 1,
    LFS_SUPPORT: true, // For large media files
  },

  // CloudCannon specific optimizations
  CLOUDCANNON: {
    BUILD_HOOK_SUPPORT: true,
    WEBHOOK_VALIDATION: true,
    STRUCTURE_VALIDATION: true,
  },

  // Data validation and transformation
  VALIDATION: {
    STRICT_MODE: true,
    SCHEMA_VALIDATION: true,
    REQUIRED_FIELDS: ['id', 'title'],
  },

  // Backup settings for data integrity
  BACKUP: {
    AUTO_BACKUP: true,
    BACKUP_ON_CONFLICT: true,
    RETENTION_DAYS: 30,
  },
};
