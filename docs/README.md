# @jantonca/git-files-sync

A production-ready, framework-agnostic content management system for fetching and managing content from remote Git repositories. Available as an npm package for easy installation and integration.

## 🚀 Quick Start

### Installation

```bash
# Install globally for CLI usage
npm install -g @jantonca/git-files-sync

# Or install locally in your project
npm install @jantonca/git-files-sync
```

### Enhanced CLI Setup

```bash
# Initialize content management in your project
npx content-setup

# Interactive setup provides:
# ✅ Repository configuration (URL, branch, mappings)
# ✅ Framework-agnostic core scripts
# ✅ Framework-specific examples (Astro, Next.js, React, Vite)
# ✅ Complete watch modes with force options
# ✅ Copy-paste ready template file

# Generated files:
# - content.config.js with your repository settings
# - package-scripts-template.json with comprehensive scripts
```

**Enhanced setup provides:**
1. **Framework-agnostic core scripts** for any project
2. **Framework-specific examples** with watch modes and force options
3. **Enhanced development workflows** (watch + force, integrated dev servers)
4. **Complete copy-paste template** with all necessary scripts
5. **Clear integration guidance** for immediate use

### Programmatic Usage

```javascript
import { ContentFetcher } from '@jantonca/git-files-sync';

const fetcher = new ContentFetcher();
await fetcher.fetchContent();
```

## 📦 Package Structure

This package provides:

- **CLI Tools**: 7 global commands for content management
- **Programmatic API**: Full JavaScript API for integration
- **Framework Adapters**: Built-in support for Astro, Next.js, React
- **Zero Dependencies**: Uses only Node.js built-ins

## 🛠 CLI Commands

After installation, these commands are available globally:

| Command                | Description                     | Usage                            |
| ---------------------- | ------------------------------- | -------------------------------- |
| `content-cli`          | Main CLI interface              | `npx content-cli --help`         |
| `content-cli-enhanced` | Enhanced CLI with progress bars | `npx content-cli-enhanced stats` |
| `content-setup`        | Interactive project setup       | `npx content-setup`              |
| `content-cleanup`      | Content cleanup and management  | `npx content-cleanup --help`     |
| `content-migrate`      | Migration tools                 | `npx content-migrate .`          |
| `content-validate`     | Package validation              | `npx content-validate .`         |
| `content-test`         | Test runner                     | `npx content-test --help`        |

## 🔧 Universal Configuration

The setup **automatically detects your framework** and generates the correct configuration format:

### **ES Module Projects** (Astro, Vite, projects with `"type": "module"`)
```javascript
export const CONFIG = {
  // Repository settings
  REPO_URL: 'git@github.com:your-org/your-data-repo.git',
  BRANCH: 'main',

  // Data mapping - define what data to import
  CONTENT_MAPPING: {
    'src/data/products': {
      type: 'folder',
      source: 'data/products',
      pattern: '**/*.{json,yaml}',
    },
  },

  // Performance settings
  PERFORMANCE: {
    ENABLE_CACHE: true,
    CACHE_TTL: 3600000, // 1 hour
  },
};
```

### **CommonJS Projects** (Next.js, React CRA, most Node.js projects)
```javascript
const CONFIG = {
  // Repository settings - same structure as above
  REPO_URL: 'git@github.com:your-org/your-data-repo.git',
  BRANCH: 'main',
  
  // Same configuration options...
  CONTENT_MAPPING: { /* ... */ },
  PERFORMANCE: { /* ... */ },
};

module.exports = { CONFIG };
```

**✨ The setup automatically chooses the right format for your project!**
```

## � Development Workflow Integration

### Enhanced npm Scripts Template

After running `npx content-setup`, you'll get `package-scripts-template.json` with comprehensive scripts:

**Core Scripts (Framework-Agnostic):**
```json
{
  "scripts": {
    "predev": "npx content-cli fetch",
    "prebuild": "npx content-cli fetch --force",
    "content:fetch": "npx content-cli fetch",
    "content:force": "npx content-cli fetch --force", 
    "content:watch": "npx content-cli fetch --watch",
    "content:watch:force": "npx content-cli fetch --watch --force",
    "content:stats": "npx content-cli stats",
    "content:cache:clear": "npx content-cli cache clear",
    "content:health": "npx content-cli health"
  }
}
```

**Framework-Specific Integration Examples:**

🚀 **Astro:**
```json
{
  "dev": "astro dev",
  "dev:force": "npx content-cli fetch --force && astro dev",
  "dev:watch": "npx content-cli fetch --watch & astro dev", 
  "dev:watch:force": "npx content-cli fetch --watch --force & astro dev",
  "build": "astro build",
  "predev": "npx content-cli fetch",
  "prebuild": "npx content-cli fetch --force"
}
```

⚡ **Next.js:**
```json
{
  "dev": "next dev",
  "dev:force": "npx content-cli fetch --force && next dev",
  "dev:watch": "npx content-cli fetch --watch & next dev",
  "dev:watch:force": "npx content-cli fetch --watch --force & next dev", 
  "build": "next build",
  "predev": "npx content-cli fetch",
  "prebuild": "npx content-cli fetch --force"
}
```

### Enhanced Script Usage

| Script                   | Purpose                                      | When to Use                           |
| ----------------------- | -------------------------------------------- | ------------------------------------- |
| `npm run predev`        | Smart content sync before development       | Automatic with `npm run dev`         |
| `npm run prebuild`      | Force fresh content before build            | Automatic with `npm run build`       |
| `content:fetch`         | Smart fetch (uses cache)                    | Manual content updates               |
| `content:force`         | Force fetch (bypasses cache)                | When content must be fresh            |
| `content:watch`         | Monitor repository for changes (interactive) | Development with user prompts        |
| `content:watch:force`   | Monitor with automatic updates              | Development requiring auto-sync       |
| `dev:watch`            | Content monitoring + dev server (notifications only) | Dev with manual update control |
| `dev:watch:force`       | Content monitoring + dev server + auto-updates | Full development with auto-sync   |
| `dev:force`            | Force content sync + dev server             | Fresh start development               |
| `content:stats`         | View system statistics                       | Performance monitoring               |
| `content:cache:clear`   | Clear all cached content                    | Troubleshooting cache issues         |
| `content:health`        | System health check                          | Debugging and validation             |

### Enhanced Watch Modes

- **Interactive Watch**: `npm run content:watch`
  - Monitors repository for changes every 30 seconds
  - **Interactive prompts**: Press [y] to update, [n] to skip, [Ctrl+C] to stop
  - Uses smart caching (only fetches if changed)
  - Best for separate terminal usage

- **Auto-Update Watch**: `npm run content:watch:force`
  - Monitors repository for changes every 30 seconds
  - **Automatic updates**: No prompts, applies updates immediately
  - Always bypasses cache (force updates)
  - Perfect for development requiring automatic content sync

- **Dev Environment Watch**: `npm run dev:watch`
  - Content monitoring + development server
  - **Notification only**: Shows update availability with manual apply instructions
  - Provides guidance: "Run: npm run content:fetch" or "Use: npm run dev:watch:force"
  - Perfect for development environments where you want control

- **Dev Environment Auto-Watch**: `npm run dev:watch:force`
  - Content monitoring + development server
  - **Automatic updates**: No prompts, applies updates immediately
  - Force updates + framework dev server running concurrently
  - Ultimate development experience for automatic workflows

- **Watch with Force**: `npx content-cli fetch --watch --force`
  - Does initial forced fetch first
  - Then starts monitoring for changes
  - Use when you need fresh content + monitoring

### Enhanced Development Workflow Examples

**Standard Development (Automatic Content Sync):**
```bash
npm run dev              # Uses predev hook for smart content sync
```

**Force Fresh Content:**
```bash
npm run dev:force        # Force content sync + start dev server
npm run build:force      # Force content sync + production build
```

**Advanced Watch Modes:**
```bash
# Content monitoring with development server
npm run dev:watch        # Content watch + dev server
npm run dev:watch:force  # Content watch + force updates + dev server

# Standalone content monitoring  
npm run content:watch        # Monitor content changes only
npm run content:watch:force  # Monitor with force updates
```

**Content Management Operations:**
```bash
# Manual content operations
npm run content:fetch        # Smart sync (cache-aware)
npm run content:force        # Force update (bypass cache)
npm run content:stats        # View content statistics
npm run content:health       # System health check
npm run content:cache:clear  # Clear content cache
```

**Framework-Specific Examples:**

🚀 **Astro Projects:**
```bash
npm run dev:watch:force  # Content monitoring + Astro dev
npm run dev:force       # Force content + Astro dev
```

⚡ **Next.js Projects:**
```bash  
npm run dev:watch:force  # Content monitoring + Next.js dev
npm run dev:force       # Force content + Next.js dev
```

⚛️ **React Projects:**
```bash
npm run start:watch:force # Content monitoring + React start
npm run start:force      # Force content + React start
```

⚡ **Vite Projects:**
```bash
npm run dev:watch:force  # Content monitoring + Vite dev  
npm run dev:force       # Force content + Vite dev
```

## �📚 API Reference

### Core Classes

```javascript
import {
  ContentFetcher, // Main orchestrator
  ContentManager, // Content state management
  ContentInstaller, // Installation logic
  RepositoryManager, // Git operations
  BackupManager, // Backup & recovery
} from '@jantonca/git-files-sync/core';
```

### Services

```javascript
import {
  GitService, // Git operations
  FileService, // File operations
  CacheService, // Caching
  ValidationService, // Validation
  PerformanceManager, // Performance tracking
} from '@jantonca/git-files-sync/services';
```

### Framework Adapters

```javascript
import {
  createFrameworkAdapter,
  AstroAdapter,
  NextJSAdapter,
  ReactAdapter,
} from '@jantonca/git-files-sync/adapters';

// Auto-detect framework
const adapter = createFrameworkAdapter();

// Or use specific adapter
const astro = new AstroAdapter();
```

### Utilities

```javascript
import {
  CONFIG, // Configuration loader
  Logger, // Logging utilities
  CONSTANTS, // Framework constants
  GitIgnoreManager, // .gitignore management
  ContentMappingManager, // Content mapping
  CLIInterfaceManager, // CLI utilities
} from '@jantonca/git-files-sync/utils';
```

## 🚀 Examples

### Basic Content Fetching

```javascript
import { ContentFetcher } from '@jantonca/git-files-sync';

const fetcher = new ContentFetcher();

// Fetch content using config file
await fetcher.fetchContent();

// Update content safely
await fetcher.updateContentSafely();

// Check if update is needed
const needsUpdate = await fetcher.checkForUpdates();
```

### Custom Configuration

```javascript
import { ContentFetcher } from '@jantonca/git-files-sync';

const fetcher = new ContentFetcher({
  REPO_URL: 'https://github.com/example/content.git',
  BRANCH: 'main',
  CONTENT_MAPPING: {
    'src/content': {
      type: 'folder',
      source: 'docs',
      pattern: '**/*.md',
    },
  },
});

await fetcher.fetchContent();
```

### Framework Integration

```javascript
import { createFrameworkAdapter } from '@jantonca/git-files-sync/adapters';

// Auto-detect and configure for your framework
const adapter = createFrameworkAdapter();
console.log('Framework:', adapter.framework); // 'astro', 'nextjs', etc.

// Get framework-specific paths
const paths = adapter.getContentPaths();
```

## 🔄 Migration from Copy-Folder Approach

If you're upgrading from the old copy-folder method:

```bash
# Remove old content-management folder
rm -rf content-management

# Install npm package
npm install @jantonca/git-files-sync

# Migrate configuration
npx content-migrate .
```

## 📖 Documentation

- [CLI Guide](./CLI.md) - Complete CLI documentation
- [Migration Guide](./MIGRATION_GUIDE.md) - Upgrading from older versions
- [Content Cleanup](./CONTENT_CLEANUP.md) - Content management best practices
- [Performance Monitoring](./PERFORMANCE_MONITORING.md) - Performance optimization
- [Interactive Features](./INTERACTIVE_FEATURES.md) - Enhanced CLI features

## 🏗 Universal Framework Support

The content management package **automatically detects and adapts** to your framework:

| Framework   | Module System | Auto-Detection | Config Format | Status |
| ----------- | ------------- | -------------- | ------------- | ------ |
| **Astro**   | ES modules    | ✅ `astro` dependency | `export const CONFIG` | ✅ Full support |
| **Next.js** | CommonJS      | ✅ `next` dependency  | `module.exports = { CONFIG }` | ✅ Full support |
| **React**   | CommonJS      | ✅ `react` dependency | `module.exports = { CONFIG }` | ✅ Full support |
| **Vite**    | ES modules    | ✅ `vite` dependency  | `export const CONFIG` | ✅ Full support |
| **Generic** | Auto-detect   | ✅ `package.json` analysis | Auto-generated | ✅ Full support |

### **Zero Configuration Required**
- ✅ **Framework detection**: Automatic based on dependencies
- ✅ **Module system detection**: Automatic based on `package.json`
- ✅ **Config format generation**: Automatic ES modules vs CommonJS
- ✅ **Path optimization**: Framework-specific content paths

### **Universal Setup Experience**
```bash
# Works identically across ALL frameworks:
npm install @jantonca/git-files-sync
npx content-setup  # Auto-detects framework & generates correct config
npm run content:fetch  # Works immediately
```

## 🔧 Development

### Running Tests

```bash
# Run all tests
npm test

# Run specific test categories
npm run test:services
npm run test:adapters
npm run test:utils
npm run test:integration
```

### Development Tools

```bash
# Content cleanup
npm run cleanup

# Package validation
npm run validate

# Migration tools
npm run migrate
```

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Install package locally: `npm install`
2. Run tests: `npm test`
3. Validate changes: `npm run validate`
4. Submit pull request

---

## Package Information

- **Name**: `@jantonca/git-files-sync`
- **Version**: 1.0.0
- **Dependencies**: Zero (Node.js built-ins only)
- **Size**: ~435KB
- **Node.js**: >= 16.0.0

**Status**: Production-ready, comprehensively tested

### Recent Fixes (v1.0.0)
- ✅ **Race condition fix**: Watch mode now prevents duplicate executions when user presses 'y' multiple times
- ✅ **Debug message cleanup**: Removed development debug messages for clean production output
- ✅ **Universal framework support**: Auto-detects and works with Astro, NextJS, React, Vite, and more
