/**
 * Next.js Data Import Configuration
 *
 * Framework-agnostic data import optimized for Next.js projects.
 * Imports data where Next.js can easily consume it (typically src/data/ or data/).
 * Compatible with Next.js App Router, API routes, and data fetching patterns.
 */

export const CONFIG = {
  // Repository settings
  REPO_URL: 'git@github.com:your-org/your-data-repo.git',
  BRANCH: 'main',

  // Next.js-compatible directory structure
  TEMP_DIR: '.content-temp',
  BACKUP_DIR: '.content-backup',

  // Content mapping optimized for Next.js App Router
  CONTENT_MAPPING: {
    // Blog posts for Next.js content
    'content/blog': {
      type: 'folder',
      source: 'content/blog',
      pattern: '**/*.{md,mdx}',
      transform: {
        frontmatter: true,
        nextjsComponents: true,
      },
    },

    // App Router pages
    'app/content': {
      type: 'folder',
      source: 'pages',
      pattern: '**/*.{md,mdx}',
    },

    // API data for Next.js API routes
    'data/api': {
      type: 'selective',
      source: 'api-data',
      files: ['products.json', 'categories.json', 'users.json'],
    },

    // React components
    'components/content': {
      type: 'folder',
      source: 'components',
      pattern: '**/*.{jsx,tsx}',
    },

    // Public assets optimized for Next.js Image component
    'public/content': {
      type: 'folder',
      source: 'assets',
      pattern: '**/*.{jpg,png,svg,webp,gif}',
    },

    // Configuration for Next.js
    config: {
      type: 'selective',
      source: 'config',
      files: ['site.json', 'navigation.json', 'seo.json', 'features.json'],
    },
  },

  // Performance settings optimized for Next.js
  PERFORMANCE: {
    ENABLE_CACHE: true,
    CACHE_TTL: 1800000, // 30 minutes - Next.js has good caching
    ENABLE_GZIP: true,
    MAX_CONCURRENT_OPERATIONS: 12,
    NEXTJS_OPTIMIZATIONS: {
      ISR_REVALIDATE: 3600, // 1 hour ISR revalidation
      IMAGE_OPTIMIZATION: true,
      BUNDLE_ANALYZER: false,
      COMPRESS_IMAGES: true,
    },
  },

  // Git settings
  GIT: {
    SPARSE_CHECKOUT: true,
    SHALLOW_CLONE: true,
    CLONE_DEPTH: 1,
  },

  // Next.js-specific processing
  PROCESSING: {
    ENABLE_FRONTMATTER_VALIDATION: true,
    ENABLE_MARKDOWN_PROCESSING: true,
    NEXTJS_FEATURES: {
      APP_ROUTER: true,
      MDX_SUPPORT: true,
      IMAGE_OPTIMIZATION: true,
      API_ROUTES: true,
      MIDDLEWARE: false,
      EDGE_RUNTIME: false,
    },
  },

  // Framework detection override
  FRAMEWORK: {
    NAME: 'nextjs',
    VERSION: 'auto-detect',
    CONFIG_FILE: 'next.config.js',
    ROUTER: 'app', // 'app' or 'pages'
  },

  // Next.js build settings
  BUILD: {
    OUTPUT: 'static', // 'static' or 'server'
    TRAILING_SLASH: false,
    COMPRESS: true,
    POWEREDBY_HEADER: false,
  },
};
