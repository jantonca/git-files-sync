# API Documentation

Complete API reference for `@jantonca/git-files-sync` programmatic usage.

## Installation

```bash
npm install @jantonca/git-files-sync
```

## Core API

### ContentFetcher

Main orchestrator class for content operations.

```javascript
import { ContentFetcher } from '@jantonca/git-files-sync';

const fetcher = new ContentFetcher(config?);
```

#### Methods

**`fetchContent(options?)`**

- Fetches content from remote repository
- Returns: `Promise<Object>` - Operation results
- Options: `{ force?: boolean, skipCache?: boolean }`

**`updateContentSafely(options?)`**

- Updates content with backup and validation
- Returns: `Promise<Object>` - Update results
- Options: `{ createBackup?: boolean, validateContent?: boolean }`

**`checkForUpdates()`**

- Checks if remote content has updates
- Returns: `Promise<boolean>` - Whether updates are available

**`createBackup(label?)`**

- Creates backup of current content
- Returns: `Promise<string>` - Backup ID

**`restoreFromBackup(backupId)`**

- Restores content from backup
- Returns: `Promise<Object>` - Restore results

#### Example

```javascript
import { ContentFetcher } from '@jantonca/git-files-sync';

const fetcher = new ContentFetcher({
  REPO_URL: 'git@github.com:example/content.git',
  BRANCH: 'main',
  CONTENT_MAPPING: {
    'src/content': {
      type: 'folder',
      source: 'docs',
      pattern: '**/*.md',
    },
  },
});

// Fetch content
const result = await fetcher.fetchContent();
console.log('Files processed:', result.processedFiles);

// Check for updates
const hasUpdates = await fetcher.checkForUpdates();
if (hasUpdates) {
  await fetcher.updateContentSafely();
}
```

### ContentManager

Content state management and validation.

```javascript
import { ContentManager } from '@jantonca/git-files-sync/core';

const manager = new ContentManager(config);
```

#### Methods

**`validateContent(paths)`**

- Validates content integrity
- Returns: `Promise<Object>` - Validation results

**`getCacheStatus()`**

- Gets current cache status
- Returns: `Object` - Cache statistics

**`clearCache(pattern?)`**

- Clears cache (all or matching pattern)
- Returns: `Promise<number>` - Files cleared

#### Example

```javascript
import { ContentManager } from '@jantonca/git-files-sync/core';

const manager = new ContentManager(config);

// Validate content
const validation = await manager.validateContent(['src/content']);
console.log('Valid files:', validation.validFiles);

// Check cache
const cacheStatus = manager.getCacheStatus();
console.log('Cache size:', cacheStatus.totalSize);
```

### RepositoryManager

Git repository operations.

```javascript
import { RepositoryManager } from '@jantonca/git-files-sync/core';

const repoManager = new RepositoryManager(config);
```

#### Methods

**`cloneRepository(url, branch?)`**

- Clones repository to local cache
- Returns: `Promise<string>` - Local path

**`updateRepository()`**

- Updates local repository
- Returns: `Promise<Object>` - Update results

**`getCommitInfo()`**

- Gets current commit information
- Returns: `Promise<Object>` - Commit details

#### Example

```javascript
import { RepositoryManager } from '@jantonca/git-files-sync/core';

const repoManager = new RepositoryManager(config);

// Clone repository
const localPath = await repoManager.cloneRepository(
  'git@github.com:example/content.git',
  'main'
);

// Get commit info
const commit = await repoManager.getCommitInfo();
console.log('Current commit:', commit.hash);
```

## Services API

### GitService

Low-level Git operations.

```javascript
import { GitService } from '@jantonca/git-files-sync/services';

const git = new GitService();
```

#### Methods

**`clone(url, destination, options?)`**

- Clones repository
- Returns: `Promise<Object>` - Clone results

**`pull(repoPath)`**

- Pulls latest changes
- Returns: `Promise<Object>` - Pull results

**`getCurrentCommit(repoPath)`**

- Gets current commit hash
- Returns: `Promise<string>` - Commit hash

### FileService

File system operations.

```javascript
import { FileService } from '@jantonca/git-files-sync/services';

const files = new FileService();
```

#### Methods

**`copyFiles(source, destination, pattern?)`**

- Copies files with optional pattern matching
- Returns: `Promise<Array>` - Copied files

**`ensureDirectory(path)`**

- Ensures directory exists
- Returns: `Promise<void>`

**`findFiles(directory, pattern)`**

- Finds files matching pattern
- Returns: `Promise<Array>` - Found files

### CacheService

Content caching operations.

```javascript
import { CacheService } from '@jantonca/git-files-sync/services';

const cache = new CacheService(config);
```

#### Methods

**`get(key)`**

- Gets cached value
- Returns: `any` - Cached value or null

**`set(key, value, ttl?)`**

- Sets cached value
- Returns: `void`

**`clear(pattern?)`**

- Clears cache
- Returns: `number` - Items cleared

## Framework Adapters

### Auto-Detection

```javascript
import { createFrameworkAdapter } from '@jantonca/git-files-sync/adapters';

// Auto-detect current framework
const adapter = createFrameworkAdapter();
console.log('Detected framework:', adapter.framework);
```

### Specific Adapters

```javascript
import {
  AstroAdapter,
  NextJSAdapter,
  ReactAdapter,
} from '@jantonca/git-files-sync/adapters';

// Use specific adapter
const astro = new AstroAdapter();
const paths = astro.getContentPaths();
```

#### Common Adapter Methods

**`getContentPaths()`**

- Gets framework-specific content paths
- Returns: `Object` - Path configuration

**`validateConfig(config)`**

- Validates configuration for framework
- Returns: `Object` - Validation results

**`getOptimalMapping(contentType)`**

- Gets optimal content mapping for framework
- Returns: `Object` - Mapping configuration

## Utilities

### Configuration

```javascript
import { CONFIG } from '@jantonca/git-files-sync/utils';

// Load configuration
const config = CONFIG.load('./content.config.js');
```

### Logging

```javascript
import { Logger } from '@jantonca/git-files-sync/utils';

const logger = new Logger('MyApp');

logger.info('Operation started');
logger.error('Operation failed', error);
logger.debug('Debug information', data);
```

### Constants

```javascript
import { CONSTANTS } from '@jantonca/git-files-sync/utils';

console.log('Supported frameworks:', CONSTANTS.SUPPORTED_FRAMEWORKS);
console.log('Default patterns:', CONSTANTS.DEFAULT_PATTERNS);
```

## Error Handling

All async methods can throw errors. Use try-catch blocks:

```javascript
import { ContentFetcher } from '@jantonca/git-files-sync';

const fetcher = new ContentFetcher();

try {
  await fetcher.fetchContent();
} catch (error) {
  if (error.code === 'REPO_NOT_FOUND') {
    console.error('Repository not found:', error.message);
  } else if (error.code === 'AUTH_FAILED') {
    console.error('Authentication failed:', error.message);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Common Error Codes

- `REPO_NOT_FOUND` - Repository URL is invalid
- `AUTH_FAILED` - Git authentication failed
- `INVALID_CONFIG` - Configuration validation failed
- `CACHE_ERROR` - Cache operation failed
- `FILE_SYSTEM_ERROR` - File system operation failed
- `GIT_ERROR` - Git operation failed

## Performance Optimization

### Caching

```javascript
const fetcher = new ContentFetcher({
  PERFORMANCE: {
    ENABLE_CACHE: true,
    CACHE_TTL: 3600000, // 1 hour
    CACHE_MAX_SIZE: 100 * 1024 * 1024, // 100MB
  },
});
```

### Selective Data Import

```javascript
const config = {
  CONTENT_MAPPING: {
    'src/data/config': {
      type: 'selective',
      source: 'config',
      files: ['site.json', 'navigation.yaml'], // Only specific files
    },
  },
};
```

### Monitoring

```javascript
import { PerformanceManager } from '@jantonca/git-files-sync/services';

const perf = new PerformanceManager();

perf.startTimer('content-fetch');
await fetcher.fetchContent();
const duration = perf.endTimer('content-fetch');

console.log('Fetch took:', duration, 'ms');
```

## TypeScript Support

While the package is written in JavaScript, TypeScript definitions are available:

```typescript
import { ContentFetcher, ConfigOptions } from '@jantonca/git-files-sync';

const config: ConfigOptions = {
  REPO_URL: 'git@github.com:example/content.git',
  BRANCH: 'main',
  CONTENT_MAPPING: {
    'src/content': {
      type: 'folder',
      source: 'docs',
      pattern: '**/*.md',
    },
  },
};

const fetcher = new ContentFetcher(config);
```

## Examples Repository

For complete examples and use cases, see the [examples repository](https://github.com/jantonca/git-files-sync-examples).
