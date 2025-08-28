# Content Management System - Migration Guide

Complete guide for migrating to the npm package and upgrading from legacy copy-folder installations.

## 🎯 Prerequisites

- Node.js 18+ installed
- Git access to content repository
- SSH keys configured (for git@... URLs) or HTTPS access

## 📦 Migration Scenarios

### 1. New Project Setup

For new projects, use the npm package directly:

```bash
# Install the package
npm install @jantonca/git-files-sync

# Run interactive setup
npx content-setup

# Or use enhanced CLI
npx content-cli-enhanced interactive
```

### 2. Migrating from Copy-Folder Approach

If you have an existing `content-management/` folder:

```bash
# Remove old folder-based installation
rm -rf content-management

# Install npm package
npm install @jantonca/git-files-sync

# Migrate existing configuration
npx content-migrate .
```

The migration tool will:

- ✅ Detect existing `content.config.js`
- ✅ Update import paths automatically
- ✅ Preserve your content mappings
- ✅ Update package.json scripts

### 3. Upgrading Package Version

For existing npm package installations:

```bash
# Update to latest version
npm update @jantonca/git-files-sync

# Validate package integrity
npx content-validate .

# Run migration if needed
npx content-migrate .
```

## 🔧 Package.json Configuration

After installing the npm package, add these scripts to your `package.json`:

```json
{
  "scripts": {
    "predev": "npx content-cli fetch",
    "prebuild": "npx content-cli fetch --force",
    "content:fetch": "npx content-cli fetch",
    "content:update": "npx content-cli update",
    "content:stats": "npx content-cli stats",
    "content:cleanup": "npx content-cleanup",
    "content:validate": "npx content-validate .",
    "content:setup": "npx content-setup"
  }
}
```

## 📋 Configuration File Migration

### Automatic Migration

The migration tool updates your `content.config.js` automatically:

```bash
npx content-migrate .
```

**Before (legacy folder approach):**

```javascript
import { contentFetcher } from './content-management/content-fetcher.js';

export const CONFIG = {
  // ... configuration
};
```

**After (npm package):**

```javascript
// No import needed - config is standalone
export const CONFIG = {
  // ... same configuration (preserved)
};
```

### Manual Migration

If automatic migration doesn't work, update manually:

1. **Remove any imports** from the content-management folder
2. **Keep your CONFIG object** exactly the same
3. **Update package.json scripts** to use npx commands

## 📝 Configuration Reference

Your `content.config.js` file structure remains the same:

```javascript
export const CONFIG = {
  // Repository settings
  REPO_URL: 'git@github.com:jantonca/git-files-sync-test-content.git',
  BRANCH: 'main',

  // Directory settings (now handled automatically)
  TEMP_DIR: '.content-temp',
  BACKUP_DIR: '.content-backup',

  // Data mapping configuration
  CONTENT_MAPPING: {
    // Example: Product data
    'src/data/products': {
      type: 'folder',
      source: 'data/products',
      pattern: '**/*.{json,yaml}',
    },

    // Example: Specific files
    'src/data/config': {
      type: 'selective',
      source: 'config',
      files: ['site.json', 'navigation.json'],
    },

    // Example: Single file
    'src/data/featured.json': {
      type: 'single',
      source: 'featured/latest.json',
    },
  },

  // Performance settings
  PERFORMANCE: {
    ENABLE_CACHE: true,
    CACHE_TTL: 3600000, // 1 hour
    ENABLE_GZIP: true,
    MAX_CONCURRENT_OPERATIONS: 5,
  },

  // Git settings
  GIT: {
    SPARSE_CHECKOUT: true,
    SHALLOW_CLONE: true,
    CLONE_DEPTH: 1,
  },
};
```

      destination: 'src/components/templates',
      files: ['hero.mdx', 'footer.mdx', 'nav.mdx'],
    },

    // Example: Single file
    'src/data/config.json': {
      type: 'file',
      source: 'config/site-config.json',
      destination: 'src/data/config.json',
    },

},

// Performance settings
MAX_RETRIES: 3,
RETRY_DELAY: 2000,
CONCURRENT_OPERATIONS: 5,
VALIDATION_ENABLED: true,

// File validation
ALLOWED*EXTENSIONS: ['.json', '.mdx', '.md', '.jsx', '.tsx', '.yaml', '.yml'],
MAX_FILE_SIZE: 5 * 1024 \_ 1024, // 5MB
};

````

### 5. Test and Validate

```bash
# Test configuration
npm run content:test

# Check system health
npm run content:info

# Perform first content fetch
npm run content:fetch
````

## 🎯 Content Mapping Examples

### Folder Import - Import All Files

```javascript
'destination/path': {
  type: 'folder',
  source: 'source-folder',
  destination: 'local/destination'
}
```

**Use case**: Import all data files, assets, or configurations from a folder.

### Selective Import - Specific Files Only

```javascript
'destination/path': {
  type: 'selective',
  source: 'source-folder',
  destination: 'local/destination',
  files: [
    'important-file.mdx',
    'config.json',
    'template.tsx'
  ]
}
```

**Use case**: Import only specific templates, configuration files, or curated content.

### File Import - Single File

```javascript
'destination/file.ext': {
  type: 'file',
  source: 'source/file.ext',
  destination: 'local/file.ext'
}
```

**Use case**: Import single configuration files, schemas, or special documents.

## ⚙️ Framework-Specific Setup

### Astro Projects

The system auto-detects Astro and optimizes paths for content collections:

```javascript
CONTENT_MAPPING: {
  'src/content/blog': {
    type: 'folder',
    source: 'blog-posts',
    destination: 'src/content/blog'
  },
  'src/content/docs': {
    type: 'folder',
    source: 'documentation',
    destination: 'src/content/docs'
  }
}
```

### Next.js Projects

Optimized for Next.js structure:

```javascript
CONTENT_MAPPING: {
  'content/posts': {
    type: 'folder',
    source: 'blog',
    destination: 'content/posts'
  },
  'public/assets': {
    type: 'folder',
    source: 'images',
    destination: 'public/assets'
  }
}
```

### React/Vite Projects

Standard React project structure:

```javascript
CONTENT_MAPPING: {
  'src/data': {
    type: 'folder',
    source: 'data',
    destination: 'src/data'
  },
  'src/content': {
    type: 'folder',
    source: 'content',
    destination: 'src/content'
  }
}
```

## 🔧 Advanced Configuration

### Environment-Specific Settings

Create environment-specific configurations:

```javascript
// content.config.js
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

export const CONFIG = {
  REPO_URL: process.env.CONTENT_REPO_URL || 'git@github.com:org/repo.git',
  BRANCH: process.env.CONTENT_BRANCH || 'main',

  // Performance settings based on environment
  CONCURRENT_OPERATIONS: isProduction ? 10 : 5,
  VALIDATION_ENABLED: isProduction,

  // Content mappings...
};
```

### CloudCannon Integration

For CloudCannon deployments, the system automatically detects the environment and skips data import since content is already available:

```javascript
// Automatic CloudCannon detection - no config needed
// System detects these environment variables:
// - IS_CLOUDCANNON_BUILD
// - CLOUDCANNON_BUILD
// - CLOUDCANNON_SITE_ID
// - CLOUDCANNON_CONFIG_PATH

// During CloudCannon builds: content import is skipped
// During local/other builds: content is imported from external repo

import { ContentFetcher } from '@jantonca/git-files-sync';

const fetcher = new ContentFetcher();
// Automatically handles CloudCannon detection
await fetcher.fetchContent(); // Skips if CloudCannon environment detected
```

**Use Case**: Consumer project has its own CloudCannon project, data source has separate CloudCannon/CMS project. No friction when consumer folders are mounted in CloudCannon.

### Custom Cache Settings

```javascript
export const CONFIG = {
  // ... other settings

  // Custom cache configuration
  CACHE_DIR: '.custom-cache',
  CACHE_TTL: 3600000, // 1 hour in milliseconds
  CACHE_ENABLED: true,
};
```

## 🚀 Production Deployment

### CI/CD Pipeline Integration

```yaml
# .github/workflows/deploy.yml
name: Deploy with Content Management

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Fetch content
        run: npm run content:force
        env:
          CONTENT_REPO_URL: ${{ secrets.CONTENT_REPO_URL }}

      - name: Validate content
        run: npm run content:test

      - name: Build project
        run: npm run build

      - name: Deploy
        run: npm run deploy
```

### Environment Variables

Set these in your deployment environment:

```bash
# Required
CONTENT_REPO_URL=git@github.com:org/content-repo.git
CONTENT_BRANCH=main

# Optional
NODE_ENV=production
CONTENT_CACHE_TTL=3600000
CONTENT_CONCURRENT_OPS=10
```

## 🛠️ Troubleshooting Migration

### Common Issues

**1. Permission Errors**

```bash
# Fix script permissions
chmod +x content-management/*.sh

# Check Git SSH access
ssh -T git@github.com
```

**2. Configuration Errors**

```bash
# Validate configuration
npm run content:test

# Check syntax
node -c content.config.js
```

**3. Repository Access Issues**

```bash
# Test repository access
git ls-remote git@github.com:org/repo.git

# Check branch exists
git ls-remote --heads git@github.com:org/repo.git
```

**4. Framework Detection Issues**

```bash
# Check current working directory
pwd

# Verify framework files exist
ls -la package.json astro.config.* next.config.*
```

### Debug Mode

```bash
# Run with verbose output
node content-management/content-cli.js fetch --verbose

# Get detailed system information
node content-management/content-cli.js stats --json

# Test individual components
node content-management/test-config.js
```

## 📋 Migration Checklist

- [ ] **Copy content-management folder** to new project
- [ ] **Run setup wizard** (`./content-management/setup-simple.sh`)
- [ ] **Add npm scripts** to package.json
- [ ] **Configure content mappings** in content.config.js
- [ ] **Test configuration** (`npm run content:test`)
- [ ] **Perform first fetch** (`npm run content:fetch`)
- [ ] **Verify content** was imported correctly
- [ ] **Test build process** with content
- [ ] **Configure CI/CD** if needed
- [ ] **Document team usage** and commands

## 🔄 Updating Existing Migration

If you need to update an existing content management system:

```bash
# Backup current system
cp -r content-management content-management-backup

# Copy new version
cp -r /source/content-management .

# Restore configuration
cp content-management-backup/content.config.js ./content.config.js

# Test updated system
npm run content:test
npm run content:fetch
```

## 🤝 Team Usage

After migration, inform your team about these key commands:

```bash
# Daily usage
npm run content:fetch    # Get latest content
npm run content:info     # Check system health

# Development
npm run dev:watch        # Monitor content changes with notifications
npm run dev:watch:force  # Auto-fetch content changes while developing

# Troubleshooting
npm run content:test     # Validate configuration
npm run content:stats    # System statistics
```

## 📚 Additional Resources

- **Full Documentation**: `content-management/README.md`
- **Configuration Reference**: Examples in this guide
- **CLI Commands**: `node content-management/content-cli.js --help`
- **Troubleshooting**: Debug commands above

---

**Migration Complete!** Your content management system is now ready to use in the new repository.
