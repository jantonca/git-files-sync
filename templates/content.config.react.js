/**
 * React Content Management Configuration
 *
 * Optimized for React applications (CRA, Vite, or custom setups)
 * with component-based content and state management.
 */

export const CONFIG = {
  // Repository settings
  REPO_URL: 'git@github.com:jantonca/git-files-sync-test-content.git',
  BRANCH: 'main',

  // React-specific directory structure
  TEMP_DIR: '.content-temp',
  BACKUP_DIR: '.content-backup',

  // Content mapping optimized for React applications
  CONTENT_MAPPING: {
    // Content data for React components
    'src/data/content': {
      type: 'folder',
      source: 'content',
      pattern: '**/*.{md,mdx,json}',
      transform: {
        frontmatter: true,
        reactComponents: true,
      },
    },

    // React components
    'src/components/content': {
      type: 'folder',
      source: 'components',
      pattern: '**/*.{jsx,tsx}',
    },

    // Hooks and utilities
    'src/hooks/content': {
      type: 'folder',
      source: 'hooks',
      pattern: '**/*.{js,ts,jsx,tsx}',
    },

    // Static assets for React
    'public/content': {
      type: 'folder',
      source: 'assets',
      pattern: '**/*.{jpg,png,svg,webp,ico}',
    },

    // Application data
    'src/data': {
      type: 'selective',
      source: 'data',
      files: [
        'app-config.json',
        'navigation.json',
        'features.json',
        'testimonials.json',
      ],
    },

    // Styles and themes
    'src/styles/content': {
      type: 'folder',
      source: 'styles',
      pattern: '**/*.{css,scss,module.css}',
    },
  },

  // Performance settings optimized for React
  PERFORMANCE: {
    ENABLE_CACHE: true,
    CACHE_TTL: 2700000, // 45 minutes
    ENABLE_GZIP: true,
    MAX_CONCURRENT_OPERATIONS: 8,
    REACT_OPTIMIZATIONS: {
      LAZY_LOADING: true,
      CODE_SPLITTING: true,
      BUNDLE_OPTIMIZATION: true,
      TREE_SHAKING: true,
    },
  },

  // Git settings
  GIT: {
    SPARSE_CHECKOUT: true,
    SHALLOW_CLONE: true,
    CLONE_DEPTH: 1,
  },

  // React-specific processing
  PROCESSING: {
    ENABLE_FRONTMATTER_VALIDATION: true,
    ENABLE_MARKDOWN_PROCESSING: true,
    REACT_FEATURES: {
      JSX_PROCESSING: true,
      TYPESCRIPT_SUPPORT: true,
      MDX_SUPPORT: true,
      COMPONENT_IMPORTS: true,
      HOOK_GENERATION: false,
    },
  },

  // Framework detection override
  FRAMEWORK: {
    NAME: 'react',
    VERSION: 'auto-detect',
    BUILD_TOOL: 'auto-detect', // 'vite', 'webpack', 'cra'
    TYPESCRIPT: 'auto-detect',
  },

  // React build settings
  BUILD: {
    SOURCE_MAPS: false,
    MINIFY: true,
    ANALYZE_BUNDLE: false,
    PUBLIC_PATH: '/',
    ENVIRONMENT: 'production',
  },

  // State management (if using)
  STATE_MANAGEMENT: {
    PROVIDER: null, // 'redux', 'zustand', 'context', null
    PERSIST_CONTENT: false,
    CACHE_STRATEGY: 'memory', // 'memory', 'localStorage', 'sessionStorage'
  },
};
