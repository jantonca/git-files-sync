# @jantonca/git-files-sync

A **universal**, production-ready, framework-agnostic git files synchronization system for fetching and managing content from remote Git repositories.

> **🌟 Universal Framework Support!** Automatically detects and configures for Astro, Next.js, React, Vite, and any Node.js project with zero manual configuration.

> **📦 This is now an npm package!** For complete documentation, see [docs/README.md](./docs/README.md)

## Quick Start

```bash
# Install the package (works with ANY framework)
npm install @jantonca/git-files-sync

# Universal setup - automatically detects your framework and generates correct config
npx content-setup
# ✨ Auto-detects: Astro (ES modules) or Next.js (CommonJS) or React or Vite
# ✨ Auto-generates: Correct configuration format for your project
# ✨ Auto-optimizes: Framework-specific paths and settings

# Setup automatically creates package-scripts-template.json with:
# • Core content management scripts (framework-agnostic)
# • Framework-specific examples (Astro, Next.js, React, Vite)
# • Proper npm lifecycle hooks (predev, prebuild) - NO DOUBLE EXECUTION
# • Watch modes with interactive and auto-update options
# • Development workflow integration

# Copy scripts from template to your package.json, then:
npm run predev              # Smart content sync before dev
npm run content:fetch       # Manual content updates  
npm run content:watch       # Monitor for changes (interactive prompts)
npm run content:watch:force # Monitor with auto-updates

# Framework-specific development:
npm run dev                 # Runs predev automatically, then dev server
npm run build               # Runs prebuild automatically, then builds
npm run dev:watch           # Content watch + dev server (notifications only)
npm run dev:watch:force     # Content watch + dev server + auto-updates
npm run dev:force           # Force content sync + dev server
```

**🎯 Universal Features:**
- ✅ **Zero Configuration**: Auto-detects framework and module system
- ✅ **Universal Compatibility**: Works with Astro, Next.js, React, Vite, any Node.js project  
- ✅ **Smart Config Generation**: ES modules or CommonJS format automatically
- ✅ **Framework Optimization**: Automatic path and settings optimization
- ✅ **Interactive Setup**: Guided repository configuration and content mapping
- ✅ **Enhanced Development**: Complete framework examples with watch modes

## Documentation

- **[Complete README](./docs/README.md)** - Full package documentation
- **[Quick Start Guide](./docs/QUICK_START_GUIDE.md)** - Get running in 5 minutes
- **[API Documentation](./docs/API.md)** - Programmatic usage
- **[Migration Guide](./docs/MIGRATION_GUIDE.md)** - Upgrading from folder-copy approach
- **[CLI Reference](./docs/CLI.md)** - Command line tools

## CLI Commands

After installation, these commands are available:

```bash
npx content-cli --help          # Main CLI
npx content-setup               # Interactive setup
npx content-cleanup --help      # Content management
npx content-validate .          # Package validation
```

## Programmatic Usage

```javascript
import { ContentFetcher } from '@jantonca/git-files-sync';

const fetcher = new ContentFetcher();
await fetcher.fetchContent();
```

---

**Package**: `@jantonca/git-files-sync` v1.0.0
**Dependencies**: Zero (Node.js built-ins only)
**Size**: ~90KB optimized
**Status**: Production-ready, comprehensively tested
type: 'folder',
source: 'blog-posts',
destination: 'src/data/blog'
},
'src/components/templates': {
type: 'selective',
source: 'templates',
destination: 'src/components/templates',
files: ['hero.mdx', 'footer.mdx']
}
}
};

````

### 3. Fetch Content

```bash
# Smart fetch (uses cache)
npm run content:fetch

# Force fetch (ignores cache)
npm run content:force
````

## 📋 Complete Feature Reference

### Content Management CLI

| Command               | Purpose                                           | Usage                                                                     |
| -------------------- | ------------------------------------------------- | ------------------------------------------------------------------------- |
| `content-cli fetch` | **Main fetcher** - Smart caching & watch modes  | `npx content-cli fetch [--force] [--watch]` |
| `content-cli health` | **Health checks** - Validate system status | `npx content-cli health`             |
| `content-cli stats`     | **Performance monitoring** - System statistics               | `npx content-cli stats [--json]`              |
| `content-cli cache clear` | **Cache management** - Clear cached content      | `npx content-cli cache clear`            |

### Setup & Configuration

| Command            | Purpose                                           | Usage                                    |
| ----------------- | ------------------------------------------------- | ---------------------------------------- |
| `content-setup` | **Interactive setup** - Framework-agnostic configuration with npm scripts templates          | `npx content-setup`   |

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
npm run content:watch           # Interactive watch (prompts for updates)
npm run content:watch:force     # Auto-update watch (no prompts)

# Development with Watch Modes
npm run dev:watch              # Dev server + notifications only
npm run dev:watch:force        # Dev server + auto-updates
npm run dev:force              # Force sync + dev server

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

### Direct CLI Commands

```bash
# New CLI (Recommended)
npx content-cli fetch                    # Basic fetch
npx content-cli fetch --force            # Force fetch
npx content-cli fetch --watch            # Interactive watch mode
npx content-cli fetch --watch --force    # Auto-update watch mode

# Status & Health
npx content-cli health                   # Health check
npx content-cli stats                    # Performance statistics
npx content-cli cache clear              # Clear cache
```

## 🔧 Migration to New Repository

### 1. Copy Content Management System

```bash
# Copy the entire git-files-sync folder
cp -r /source/project/git-files-sync /target/project/

# Navigate to target project
cd /target/project
```

### 2. Run Setup

```bash
# Quick setup (recommended)
./git-files-sync/setup-simple.sh

# Or full interactive setup
./git-files-sync/setup.sh
```

### 3. Update Package.json

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "predev": "npx content-cli fetch",
    "prebuild": "npx content-cli fetch --force",
    "content:fetch": "npx content-cli fetch",
    "content:force": "npx content-cli fetch --force",
    "content:info": "npx content-cli health",
    "content:stats": "npx content-cli stats",
    "content:cache:clear": "npx content-cli cache clear",
    "content:test": "npx content-validate .",
    "content:cleanup": "npx content-cleanup --list"
  }
}
```

### 4. Configure Content Repository

Edit `content.config.js` with your repository details:

```javascript
export const CONFIG = {
  REPO_URL: 'git@github.com:your-org/your-content-repo.git',
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
npx content-cli test --verbose
```

### Configuration Validation

```bash
# Validate current configuration
npx content-validate .

# Test specific mapping
npx content-cli test --mapping="blog-posts"
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
npx content-cli test --repo
```

**Cache Issues**

```bash
# Clear all cache
npm run content:cache:clear

# Check cache statistics
npx content-cli cache stats
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
npx content-cli fetch --verbose

# JSON output for parsing
npx content-cli stats --json
```

## 📁 Directory Structure

```
git-files-sync/
├── README.md                   # This comprehensive guide
├── content-fetcher.js          # Main content fetcher (production-ready)
├── content-manager.js          # Management interface & health checks
├── content-cli.js              # Advanced CLI with full features
├── content-cleanup.js          # Content cleanup utilities
├── setup-simple.sh            # Quick setup script
├── setup.sh                   # Interactive setup script
├── setup.js                   # Programmatic setup
├── test-config.js              # Configuration validation
└── lib/                        # Core library components
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

When adding new features to the git files sync system:

1. **Add to the appropriate `src/` subdirectory**
2. **Update this README.md with new commands/features**
3. **Add tests to the relevant file in `tests/`**
4. **Update CLI help in `content-cli.js`**
5. **Document configuration options**

## 📄 License

This project is licensed under the [MIT License](./LICENSE).

`@jantonca/git-files-sync` is designed to be portable and reusable across projects. Copy and modify as needed for your use case.
