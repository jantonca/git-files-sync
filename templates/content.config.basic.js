/**
 * Basic Data Import Configuration
 *
 * Framework-agnostic setup for importing curated data from external repositories.
 * Commonly used with CloudCannon, headless CMS, or any data source repository.
 * Data is imported into configurable folders (typically src/data/ or src/content/).
 */

export const CONFIG = {
  // Repository settings - REQUIRED
  REPO_URL: 'git@github.com:your-org/your-data-repo.git',
  BRANCH: 'main',

  // Directory settings (optional - uses defaults if not specified)
  TEMP_DIR: '.content-temp',
  BACKUP_DIR: '.content-backup',

  // Data mapping - define what data to import and where
  CONTENT_MAPPING: {
    // Example: Import site configuration data
    'src/data/site': {
      type: 'selective',
      source: 'config',
      files: ['site.json', 'navigation.json', 'settings.yaml'],
    },

    // Example: Import all product data (common CloudCannon pattern)
    'src/data/products': {
      type: 'folder',
      source: 'data/products',
      pattern: '**/*.{json,yaml,yml}',
    },

    // Example: Import assets (images, documents)
    'src/data/assets': {
      type: 'folder',
      source: 'assets',
      pattern: '**/*.{jpg,jpeg,png,svg,pdf}',
    },
  },

  // Basic performance settings
  PERFORMANCE: {
    ENABLE_CACHE: true,
    CACHE_TTL: 3600000, // 1 hour
  },

  // Git settings
  GIT: {
    SPARSE_CHECKOUT: true,
    SHALLOW_CLONE: true,
  },
};
