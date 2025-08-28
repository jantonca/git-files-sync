/**
 * Git Files Sync Configuration
 *
 * Edit this file to customize your git files synchronization settings.
 * Re-run setup: ./git-files-sync/setup.sh
 */

export const CONFIG = {
  // Repository settings
  REPO_URL: 'git@github.com:jantonca/your-content-repo.git',
  BRANCH: 'master',

  // Directory settings
  TEMP_DIR: '.content-temp',
  BACKUP_DIR: '.content-backup',

  // Content mapping configuration
  CONTENT_MAPPING: {
  },

  // Performance settings
  MAX_RETRIES: 3,
  RETRY_DELAY: 2000,
  CONCURRENT_OPERATIONS: 5,
  VALIDATION_ENABLED: true,

  // File validation
  ALLOWED_EXTENSIONS: ['.json', '.mdx', '.md', '.jsx', '.tsx'],
  MAX_FILE_SIZE: 5 * 1024 * 1024 // 5MB
};
