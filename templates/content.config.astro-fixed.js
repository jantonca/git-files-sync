/**
 * Astro Data Import Configuration
 *
 * Framework-agnostic data import optimized for Astro projects.
 * Imports data into src/data/ folder where Astro can consume it easily.
 * Compatible with Astro's content collections and data consumption patterns.
 */

export const CONFIG = {
  // Repository settings
  REPO_URL: 'git@github.com:your-org/your-data-repo.git',
  BRANCH: 'main',

  // Astro-compatible directory structure
  TEMP_DIR: '.content-temp',
  BACKUP_DIR: '.content-backup',

  // Data mapping optimized for Astro data consumption
  CONTENT_MAPPING: {
    // Site configuration data
    'src/data/config': {
      type: 'selective',
      source: 'config',
      files: ['site.json', 'navigation.yaml', 'theme.json'],
    },

    // Product/service data
    'src/data/products': {
      type: 'folder',
      source: 'data/products',
      pattern: '**/*.{json,yaml}',
    },

    // Team/people data
    'src/data/team': {
      type: 'folder',
      source: 'data/team',
      pattern: '**/*.{json,yaml}',
    },

    // Media assets (Astro handles these well)
    'src/data/assets': {
      type: 'folder',
      source: 'assets',
      pattern: '**/*.{jpg,jpeg,png,svg,webp}',
    },

    // If using Astro content collections for structured content
    'src/content/collections': {
      type: 'folder',
      source: 'content',
      pattern: '**/*.{md,mdx}',
    },
  },

  // Performance settings optimized for Astro
  PERFORMANCE: {
    ENABLE_CACHE: true,
    CACHE_TTL: 3600000, // 1 hour - Astro builds are fast
    CONCURRENT_OPERATIONS: 8,
    ASTRO_OPTIMIZATIONS: {
      PRERENDER_COMPATIBLE: true,
      STATIC_GENERATION: true,
    },
  },

  // Git settings
  GIT: {
    SPARSE_CHECKOUT: true,
    SHALLOW_CLONE: true,
    DEPTH: 1,
  },

  // Astro-specific features
  ASTRO: {
    CONTENT_COLLECTIONS: true,
    IMAGE_OPTIMIZATION: true,
    STATIC_ASSETS: true,
  },

  // Framework detection
  FRAMEWORK: {
    NAME: 'astro',
    CONFIG_FILE: 'astro.config.mjs',
    PACKAGE_NAME: 'astro',
  },
};
