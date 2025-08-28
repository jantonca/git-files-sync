/**
 * Multi-Repository Content Management Configuration
 *
 * For projects that need to fetch content from multiple repositories,
 * such as distributed teams, microservices, or multi-brand sites.
 */

export const CONFIG = {
  // Multi-repository setup
  REPOSITORIES: [
    {
      name: 'main-content',
      REPO_URL: 'git@github.com:your-org/main-content-repo.git',
      BRANCH: 'main',
      priority: 1,
      CONTENT_MAPPING: {
        'src/content/main': {
          type: 'folder',
          source: 'content',
          pattern: '**/*.{md,mdx}',
        },
        'src/data/main': {
          type: 'selective',
          source: 'data',
          files: ['site.json', 'navigation.json'],
        },
      },
    },
    {
      name: 'blog-content',
      REPO_URL: 'git@github.com:your-org/blog-content-repo.git',
      BRANCH: 'main',
      priority: 2,
      CONTENT_MAPPING: {
        'src/content/blog': {
          type: 'folder',
          source: 'posts',
          pattern: '**/*.{md,mdx}',
        },
        'src/data/blog': {
          type: 'selective',
          source: 'config',
          files: ['authors.json', 'categories.json'],
        },
      },
    },
    {
      name: 'media-assets',
      REPO_URL: 'git@github.com:your-org/media-assets-repo.git',
      BRANCH: 'main',
      priority: 3,
      CONTENT_MAPPING: {
        'public/images': {
          type: 'folder',
          source: 'images',
          pattern: '**/*.{jpg,png,svg,webp}',
        },
        'public/videos': {
          type: 'selective',
          source: 'videos',
          files: ['hero-video.mp4', 'demo.mp4'],
        },
      },
    },
  ],

  // Global settings for all repositories
  GLOBAL_SETTINGS: {
    TEMP_DIR: '.content-temp',
    BACKUP_DIR: '.content-backup',
    PARALLEL_FETCH: true,
    MAX_CONCURRENT_REPOS: 3,
    FAIL_ON_REPO_ERROR: false,
    RETRY_FAILED_REPOS: true,
    RETRY_ATTEMPTS: 3,
  },

  // Shared performance settings
  PERFORMANCE: {
    ENABLE_CACHE: true,
    CACHE_TTL: 3600000, // 1 hour
    ENABLE_GZIP: true,
    MAX_CONCURRENT_OPERATIONS: 15,
    REPO_CACHE_STRATEGY: 'shared', // 'shared' or 'isolated'
    DEDUPLICATION: true,
  },

  // Shared Git settings
  GIT: {
    SPARSE_CHECKOUT: true,
    SHALLOW_CLONE: true,
    CLONE_DEPTH: 1,
    SHARED_CREDENTIALS: true,
    SSH_KEY_PATH: '~/.ssh/id_rsa',
  },

  // Multi-repo processing
  PROCESSING: {
    ENABLE_FRONTMATTER_VALIDATION: true,
    ENABLE_MARKDOWN_PROCESSING: true,
    CONFLICT_RESOLUTION: 'priority', // 'priority', 'timestamp', 'manual'
    MERGE_STRATEGY: 'append', // 'append', 'replace', 'merge'
    DUPLICATE_HANDLING: 'skip', // 'skip', 'overwrite', 'rename'
  },

  // Repository synchronization
  SYNC: {
    SYNC_ORDER: 'priority', // 'priority', 'parallel', 'sequential'
    DEPENDENCY_GRAPH: {
      'blog-content': ['main-content'], // blog-content depends on main-content
      'media-assets': [], // no dependencies
    },
    WATCH_MODE: {
      ENABLED: false,
      POLL_INTERVAL: 30000, // 30 seconds
      REPOS_TO_WATCH: ['main-content'],
    },
  },

  // Monitoring and reporting
  MONITORING: {
    ENABLE_REPO_HEALTH_CHECK: true,
    REPORT_SYNC_STATUS: true,
    ALERT_ON_FAILURES: true,
    METRICS_PER_REPO: true,
    CONSOLIDATE_LOGS: true,
  },

  // Backup strategy for multi-repo
  BACKUP: {
    BACKUP_STRATEGY: 'consolidated', // 'consolidated' or 'per-repo'
    AUTO_BACKUP: true,
    BACKUP_RETENTION: 30, // days
    CROSS_REPO_RESTORE: true,
  },

  // Security for multiple repositories
  SECURITY: {
    VALIDATE_REPO_ACCESS: true,
    ALLOWED_REPOS: ['github.com/your-org/*', 'bitbucket.org/your-org/*'],
    AUDIT_REPO_CHANGES: true,
  },
};
