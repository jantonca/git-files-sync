# Content Management System

A production-ready, framework-agnostic content management system for fetching and managing content from remote Git repositories. This folder contains everything needed to manage external content in your project.

## 🚀 Quick Start

### 1. Copy to New Project

```bash
# Copy entire content-management folder to your project
cp -r content-management /path/to/your/project/

# Run setup in your project root
cd /path/to/your/project
./content-management/setup-simple.sh
```

### 2. Configure Your Content

Edit the generated `content.config.js` in your project root:

```javascript
export const CONFIG = {
  // Repository settings
  REPO_URL: 'git@github.com:jantonca/git-files-sync-test-content.git',
  BRANCH: 'main',

  // Content mapping - define what to import
  CONTENT_MAPPING: {
    'src/data/blog': {
      type: 'folder',
      source: 'blog-posts',
      destination: 'src/data/blog',
    },
    'src/components/templates': {
      type: 'selective',
      source: 'templates',
      destination: 'src/components/templates',
      files: ['hero.mdx', 'footer.mdx'],
    },
  },
};
```

### 3. Fetch Content

```bash
# Smart fetch (uses cache)
npm run content:fetch

# Force fetch (ignores cache)
npm run content:force
```

## 📋 Complete Feature Reference

### Content Fetching Scripts

| Script               | Purpose                                           | Usage                                                                     |
| -------------------- | ------------------------------------------------- | ------------------------------------------------------------------------- |
| `content-fetcher.js` | **Main fetcher** - Production-ready with caching  | `node content-management/content-fetcher.js [--force] [--watch] [--auto]` |
| `content-manager.js` | **Management interface** - Status & health checks | `node content-management/content-manager.js [health\|status]`             |
| `content-cli.js`     | **Advanced CLI** - Full feature set               | `node content-management/content-cli.js [command] [options]`              |
| `content-cleanup.js` | **Cleanup utility** - Remove unmanaged files      | `node content-management/content-cleanup.js [--list\|--clean]`            |

### Setup & Configuration Scripts

| Script            | Purpose                                           | Usage                                    |
| ----------------- | ------------------------------------------------- | ---------------------------------------- |
| `setup-simple.sh` | **Quick setup** - Auto-detects framework          | `./content-management/setup-simple.sh`   |
| `setup.sh`        | **Interactive setup** - Full configuration wizard | `./content-management/setup.sh`          |
| `setup.js`        | **Programmatic setup** - For automation           | `node content-management/setup.js`       |
| `test-config.js`  | **Configuration validation** - Test your config   | `node content-management/test-config.js` |

## 🎯 Content Mapping Types

### Folder Import

Import all files from a directory:

```javascript
'destination/path': {
  type: 'folder',
  source: 'source/directory',
  destination: 'local/destination'
}
```

### Selective Import

Import specific files only:

```javascript
'destination/path': {
  type: 'selective',
  source: 'source/directory',
  destination: 'local/destination',
  files: ['file1.mdx', 'file2.mdx']
}
```

### File Import

Import single file:

```javascript
'destination/file.mdx': {
  type: 'file',
  source: 'source/file.mdx',
  destination: 'local/file.mdx'
}
```

## 🛠️ Command Reference

### Basic Commands

```bash
# Content Operations
npm run content:fetch           # Smart fetch with caching
npm run content:force           # Force fetch, bypass cache
npm run content:watch           # Watch for changes
npm run content:watch-auto      # Watch + auto-update

# Status & Health
npm run content:info            # System health check
npm run content:stats           # Detailed statistics
npm run content:test            # Validate configuration

# Cache Management
npm run content:cache:clear     # Clear all cache
npm run content:performance     # Performance analysis

# Advanced
npm run content:plugins         # List available plugins
npm run content:cleanup         # List unmanaged files
```

### Direct Node Commands

```bash
# Content Fetcher
node content-management/content-fetcher.js                # Basic fetch
node content-management/content-fetcher.js --force        # Force fetch
node content-management/content-fetcher.js --watch        # Watch mode
node content-management/content-fetcher.js --watch --auto # Auto-update

# Content Manager
node content-management/content-manager.js health         # Health check
node content-management/content-manager.js status         # Content status

# Advanced CLI
node content-management/content-cli.js cache clear        # Clear cache
node content-management/content-cli.js cache stats        # Cache statistics
node content-management/content-cli.js stats --json       # JSON statistics
node content-management/content-cli.js performance        # Performance report
node content-management/content-cli.js plugins list       # Available plugins

# Cleanup Utilities
node content-management/content-cleanup.js --list         # List unmanaged files
node content-management/content-cleanup.js --clean        # Interactive cleanup
node content-management/content-cleanup.js --gitignore    # Update .gitignore

# Configuration & Testing
node content-management/test-config.js                    # Test configuration
node content-management/setup.js                          # Programmatic setup
```

## 🔧 Migration to New Repository

### 1. Copy Content Management System

```bash
# Copy the entire content-management folder
cp -r /source/project/content-management /target/project/

# Navigate to target project
cd /target/project
```

### 2. Run Setup

```bash
# Quick setup (recommended)
./content-management/setup-simple.sh

# Or full interactive setup
./content-management/setup.sh
```

### 3. Update Package.json

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "predev": "node content-management/content-fetcher.js",
    "prebuild": "node content-management/content-fetcher.js --force",
    "content:fetch": "node content-management/content-fetcher.js",
    "content:force": "node content-management/content-fetcher.js --force",
    "content:info": "node content-management/content-manager.js health",
    "content:stats": "node content-management/content-cli.js stats",
    "content:cache:clear": "node content-management/content-cli.js cache clear",
    "content:test": "node content-management/test-config.js",
    "content:cleanup": "node content-management/content-cleanup.js --list"
  }
}
```

### 4. Configure Content Repository

Edit `content.config.js` with your repository details:

```javascript
export const CONFIG = {
  REPO_URL: 'git@github.com:jantonca/git-files-sync-test-content.git',
  BRANCH: 'main', // or 'master'

  CONTENT_MAPPING: {
    // Define your content mappings here
  },
};
```

### 5. Test & Validate

```bash
# Test configuration
npm run content:test

# Health check
npm run content:info

# First fetch
npm run content:fetch
```

## ⚙️ Configuration Options

### Repository Settings

```javascript
{
  REPO_URL: 'git@github.com:org/repo.git',    // Git repository URL
  BRANCH: 'main',                              // Branch to fetch from
  TEMP_DIR: '.content-temp',                   // Temporary clone directory
  BACKUP_DIR: '.content-backup'                // Backup directory
}
```

### Performance Settings

```javascript
{
  MAX_RETRIES: 3,                              // Git operation retries
  RETRY_DELAY: 2000,                           // Retry delay (ms)
  CONCURRENT_OPERATIONS: 5,                    // Parallel operations
  VALIDATION_ENABLED: true                     // File validation
}
```

### File Validation

```javascript
{
  ALLOWED_EXTENSIONS: ['.json', '.mdx', '.md', '.jsx', '.tsx'],
  MAX_FILE_SIZE: 5 * 1024 * 1024              // 5MB limit
}
```

## 🎯 Framework Support

The system automatically detects and optimizes for:

- **Astro** - Content collections and component paths
- **React** - Standard React project structure
- **Next.js** - Next.js specific optimizations
- **Generic** - Fallback for other frameworks

## 🔌 Plugin System

### Built-in Plugins

- **Performance Plugin** - Tracks metrics and performance
- **Logging Plugin** - Enhanced logging with hooks

### Custom Plugin Development

```javascript
class CustomPlugin {
  constructor(config = {}) {
    this.config = config;
  }

  async onBeforeFetch(context) {
    // Execute before content fetch
  }

  async onAfterFetch(context) {
    // Execute after content fetch
  }

  async onError(error) {
    // Handle errors
  }
}

// Register and use
const fetcher = new ContentFetcher();
await fetcher.initialize();
await fetcher.registerPlugin('custom', new CustomPlugin());
```

## 📊 Performance Features

### Smart Caching

- **Repository Validation** - Checks remote commit hash before fetching
- **Content Hashing** - Detects changes in individual files
- **TTL Management** - Automatic cache expiration
- **Namespace Support** - Organize cache by context

### Concurrent Processing

- **Parallel Operations** - Process multiple mappings simultaneously
- **Batch Processing** - Optimize file operations in batches
- **Resource Management** - Limit concurrent operations

### Performance Monitoring

```bash
# Get detailed performance report
npm run content:performance

# Cache hit rates and statistics
npm run content:stats --json
```

## 🧪 Testing & Validation

### System Tests

```bash
# Run all system tests
npm run content:test

# Test with verbose output
node content-management/content-cli.js test --verbose
```

### Configuration Validation

```bash
# Validate current configuration
node content-management/test-config.js

# Test specific mapping
node content-management/content-cli.js test --mapping="blog-posts"
```

## 🛡️ Safety Features

### Backup & Recovery

- **Automatic Backups** - Created before destructive operations
- **Error Recovery** - Automatic restoration on failures
- **Safe Updates** - Preserves existing content when adding new dependencies

### Content Validation

- **File Type Validation** - Ensures only allowed file types
- **Size Limits** - Prevents importing oversized files
- **Path Validation** - Validates source and destination paths

### Git Integration

- **Automatic .gitignore** - Excludes managed content from version control
- **Sparse Checkout** - Only downloads needed directories
- **Branch Switching** - Supports different content branches

## 🔧 Troubleshooting

### Common Issues

**Configuration Errors**

```bash
# Validate configuration
npm run content:test

# Check repository access
node content-management/content-cli.js test --repo
```

**Cache Issues**

```bash
# Clear all cache
npm run content:cache:clear

# Check cache statistics
node content-management/content-cli.js cache stats
```

**Performance Problems**

```bash
# Performance analysis
npm run content:performance

# Adjust concurrency in content.config.js
CONCURRENT_OPERATIONS: 3  // Reduce for slower systems
```

### Debug Mode

```bash
# Verbose output for debugging
node content-management/content-cli.js fetch --verbose

# JSON output for parsing
node content-management/content-cli.js stats --json
```

## 📁 Directory Structure

```
content-management/
├── README.md                   # This comprehensive guide
├── content-fetcher.js          # Main content fetcher (production-ready)
├── content-manager.js          # Management interface & health checks
├── content-cli.js              # Advanced CLI with full features
├── content-cleanup.js          # Content cleanup utilities
├── setup-simple.sh            # Quick setup script
├── setup.sh                   # Interactive setup script
├── setup.js                   # Programmatic setup
├── test-config.js              # Configuration validation
└── src/                        # Modular package source code
    ├── config-loader.js        # Configuration management
    ├── adapters/               # Framework-specific adapters
    │   ├── astro-adapter.js
    │   ├── framework-adapter.js
    │   ├── nextjs-adapter.js
    │   └── react-adapter.js
    ├── core/
    │   └── plugin-system.js    # Plugin architecture
    ├── managers/
    │   ├── cli-interface.js    # CLI utilities
    │   ├── gitignore-manager.js # .gitignore management
    │   └── mapping-manager.js  # Content mapping logic
    └── services/
        ├── cache-service.js    # Caching system
        ├── file-service.js     # File operations
        ├── git-service.js      # Git operations
        ├── performance-manager.js # Performance tracking
        └── validation-service.js  # Content validation
```

## 🚀 Production Deployment

### CI/CD Integration

```yaml
# Example GitHub Actions
name: Content Management
on: [push]

jobs:
  content:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Fetch content
        run: npm run content:force
      - name: Test content
        run: npm run content:test
      - name: Build
        run: npm run build
```

### Production Optimization

```javascript
// production.config.js
export const CONFIG = {
  // ... your config

  // Production optimizations
  CONCURRENT_OPERATIONS: 10, // Higher for production servers
  CACHE_TTL: 3600000, // 1 hour cache in production
  VALIDATION_ENABLED: true, // Always validate in production
  PERFORMANCE_TRACKING: true, // Enable metrics
};
```

## 📝 Contributing

When adding new features to the content management system:

1. **Add to appropriate src/ subdirectory**
2. **Update this README.md with new commands/features**
3. **Add tests to test-config.js**
4. **Update CLI help in content-cli.js**
5. **Document configuration options**

## 📄 License

This content management system is designed to be portable and reusable across projects. Copy and modify as needed for your use case.
