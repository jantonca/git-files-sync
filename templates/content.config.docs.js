/**
 * Documentation Site Configuration
 *
 * Optimized for documentation websites, API docs, and technical guides
 * with search, navigation, and version management.
 */

export const CONFIG = {
  // Repository settings
  REPO_URL: 'git@github.com:your-org/docs-content-repo.git',
  BRANCH: 'main',

  // Directory settings
  TEMP_DIR: '.content-temp',
  BACKUP_DIR: '.content-backup',

  // Content mapping for documentation structure
  CONTENT_MAPPING: {
    // Documentation pages with hierarchy
    'src/content/docs': {
      type: 'folder',
      source: 'docs',
      pattern: '**/*.{md,mdx}',
      transform: {
        frontmatter: true,
        navigation: true,
        hierarchy: true,
        codeBlocks: true,
      },
    },

    // API reference documentation
    'src/content/api': {
      type: 'folder',
      source: 'api-docs',
      pattern: '**/*.{md,json,yaml}',
    },

    // Guides and tutorials
    'src/content/guides': {
      type: 'folder',
      source: 'guides',
      pattern: '**/*.{md,mdx}',
    },

    // Examples and code samples
    'src/content/examples': {
      type: 'folder',
      source: 'examples',
      pattern: '**/*.{md,js,ts,jsx,tsx,py,go,rs}',
    },

    // Documentation configuration
    'src/data/docs': {
      type: 'selective',
      source: 'config',
      files: [
        'navigation.json',
        'sidebar.json',
        'search.json',
        'versions.json',
        'contributors.json',
      ],
    },

    // Documentation assets
    'public/docs': {
      type: 'folder',
      source: 'assets',
      pattern: '**/*.{png,jpg,svg,gif,mp4,pdf}',
    },

    // Documentation components
    'src/components/docs': {
      type: 'folder',
      source: 'components',
      pattern: '**/*.{astro,jsx,tsx,vue}',
    },
  },

  // Performance optimized for documentation
  PERFORMANCE: {
    ENABLE_CACHE: true,
    CACHE_TTL: 3600000, // 1 hour - docs may update frequently
    ENABLE_GZIP: true,
    MAX_CONCURRENT_OPERATIONS: 10,
    DOCS_OPTIMIZATIONS: {
      SEARCH_INDEX: true,
      CODE_HIGHLIGHTING: true,
      LAZY_LOAD_SECTIONS: true,
      PREFETCH_LINKS: true,
      COMPRESS_IMAGES: true,
    },
  },

  // Git settings
  GIT: {
    SPARSE_CHECKOUT: true,
    SHALLOW_CLONE: true,
    CLONE_DEPTH: 1,
  },

  // Documentation-specific processing
  PROCESSING: {
    ENABLE_FRONTMATTER_VALIDATION: true,
    ENABLE_MARKDOWN_PROCESSING: true,
    DOCS_FEATURES: {
      TABLE_OF_CONTENTS: true,
      CODE_HIGHLIGHTING: true,
      MATH_SUPPORT: false,
      MERMAID_DIAGRAMS: true,
      CALLOUTS: true,
      TABS: true,
      COPY_CODE_BUTTON: true,
    },
  },

  // Search and navigation
  SEARCH: {
    ENABLE_SEARCH: true,
    SEARCH_PROVIDER: 'local', // 'local', 'algolia', 'elasticsearch'
    INDEX_CONTENT: true,
    INDEX_HEADINGS: true,
    FACETED_SEARCH: false,
  },

  // Documentation validation
  VALIDATION: {
    REQUIRED_FRONTMATTER: ['title', 'description', 'sidebar_position'],
    LINK_CHECKING: true,
    CODE_BLOCK_SYNTAX: true,
    HEADING_STRUCTURE: true,
    IMAGE_ALT_TEXT: true,
  },

  // Version management
  VERSIONING: {
    ENABLE_VERSIONS: false,
    DEFAULT_VERSION: 'latest',
    VERSION_BRANCHES: [],
    LEGACY_VERSIONS: [],
  },
};
