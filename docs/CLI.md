# CLI Reference

Complete command-line interface reference for `@jantonca/git-files-sync`.

## Installation

```bash
# Install locally in your project
npm install @jantonca/git-files-sync

# Or install globally for CLI access everywhere
npm install -g @jantonca/git-files-sync
```

## Available Commands

| Command                | Description                     | Global Command             |
| ---------------------- | ------------------------------- | -------------------------- |
| `content-cli`          | Main CLI interface              | `npx content-cli`          |
| `content-cli-enhanced` | Enhanced CLI with progress bars | `npx content-cli-enhanced` |
| `content-setup`        | Interactive project setup       | `npx content-setup`        |
| `content-cleanup`      | Content cleanup and management  | `npx content-cleanup`      |
| `content-migrate`      | Migration tools                 | `npx content-migrate`      |
| `content-validate`     | Package validation              | `npx content-validate`     |
| `content-test`         | Test runner                     | `npx content-test`         |

## Main CLI Commands

### Basic Content Operations

```bash
# Fetch content using smart caching
npx content-cli fetch

# Force fetch (bypass cache)
npx content-cli fetch --force

# Watch mode - monitor repository for changes
npx content-cli fetch --watch

# Watch with force updates (monitors + bypasses cache)
npx content-cli fetch --watch --force
```

### Enhanced npm Scripts Integration

After running `npx content-setup`, integrate these patterns:

**Core Content Management:**
```bash
npm run content:fetch        # Smart sync (cache-aware)
npm run content:force        # Force sync (bypass cache)
npm run content:watch        # Background monitoring
npm run content:watch:force  # Background monitoring with force updates
```

**Framework Integration Examples:**
```bash
# Astro
npm run dev:watch:force      # Content watch + force + astro dev
npm run dev:force           # Force content + astro dev

# Next.js  
npm run dev:watch:force      # Content watch + force + next dev
npm run dev:force           # Force content + next dev

# React
npm run start:watch:force    # Content watch + force + react start
npm run start:force         # Force content + react start

# Vite
npm run dev:watch:force      # Content watch + force + vite dev
npm run dev:force           # Force content + vite dev
```

### Information Commands

```bash
# System health check
npx content-cli health

# Detailed statistics
npx content-cli stats

# Cache information
npx content-cli cache stats

# Performance metrics
npx content-cli performance
```

### Cache Management

```bash
# Clear all cache
npx content-cli cache clear

# Cache statistics
npx content-cli cache stats

# Cache information
npx content-cli cache info
```

## Watch Modes Explained

### Interactive Watch Mode
```bash
npx content-cli fetch --watch
```
- **TTY Environment**: Interactive prompts (press [y] to update, [n] to skip, [Ctrl+C] to stop)
- **Dev Environment**: Shows notifications with manual update instructions
- Smart caching (only fetches if changed)
- Perfect for development with control over updates

### Auto-Update Watch Mode
```bash
npx content-cli fetch --watch --force
```
- **Automatic updates**: No prompts, applies updates immediately when detected
- Does initial forced fetch first (bypasses cache)
- Always bypasses cache for guaranteed fresh content
- Ideal for production deployments or automatic workflows

### Environment-Specific Behavior

| Environment                   | `--watch` Behavior | `--watch --force` Behavior |
| ------------------------------ | ------------------ | ------------- |
| **TTY Terminal** (separate terminal)        | Interactive prompts (y/n/Ctrl+C) | Auto-updates |
| **Dev Environment** (with dev server)              | Notifications only + manual instructions   | Auto-updates    |

## Interactive Setup

```bash
# Start universal interactive setup
npx content-setup
```

**The setup provides:**
1. **Automatic framework detection** (Astro, Next.js, React, Vite, etc.)
2. **Module system detection** (ES modules vs CommonJS)
3. **Correct config format generation** (automatic)
4. Repository configuration guidance
5. Content mapping setup
6. Recommended npm scripts generation
7. Next steps instructions

**Setup automatically generates the right configuration format:**
- **ES Module projects** (Astro, Vite): `export const CONFIG = { ... }`
- **CommonJS projects** (Next.js, React): `module.exports = { CONFIG }`

## Enhanced CLI

```bash
# Enhanced CLI with progress bars and better UX
npx content-cli-enhanced stats
npx content-cli-enhanced interactive
npx content-cli-enhanced performance-demo
```

## Validation and Testing

```bash
# Validate package installation and configuration
npx content-validate .

# Run comprehensive tests
npx content-test --all

# Test specific components
npx content-test services
npx content-test adapters
```

## Migration Tools

```bash
# Migrate existing projects from folder-copy to npm package
npx content-migrate .

# Clean up old content management folders
npx content-cleanup --clean
```
- `content-cleanup.js` - Cleanup utilities
- `test-config.js` - Configuration testing
- `src/` - Modular package source code with core, services, adapters, and utilities
- `setup.sh` - Setup script

## Configuration

The system **automatically detects your framework** and generates the appropriate configuration format:

- **ES Module projects** (Astro, Vite): Uses `export const CONFIG`
- **CommonJS projects** (Next.js, React): Uses `module.exports = { CONFIG }`

Configuration files:
- `content.config.js` - Main configuration (format auto-detected)
- `content.config.mjs` - Force ES module format (optional)
- `content.config.json` - JSON format (fallback)

Framework-specific adapters automatically optimize for:
- Astro: Content collections and component paths
- Next.js: Next.js specific optimizations  
- React: Standard React project structure
- Generic: Universal fallback

## Integration

The system integrates with:

- npm scripts (optional)
- Git hooks (optional)
- CI/CD pipelines
- Multiple frameworks (Astro, Next.js, React, etc.)
