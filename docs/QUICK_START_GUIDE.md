# Quick Start Guide

Get up and running with `@jantonca/git-files-sync` in under 5 minutes.

## 🚀 Installation

```ba## 🎯 Test Your Setup

```bash
# Test basic functionality
npx content-cli fetch    # Import content
npx content-cli stats    # View system info
npx content-cli health   # Health check

# Test enhanced development workflow
npm run predev               # Auto-sync before dev
npm run content:fetch        # Smart content sync
npm run content:force        # Force content update
npm run content:watch        # Monitor for changes
npm run content:watch:force  # Monitor with force updates
```

## 🚀 Enhanced Development Workflows

### Standard Development
```bash
npm run dev              # Uses predev hook (auto-sync)
```

### Force Fresh Content
```bash
npm run dev:force        # Force content sync + dev server
```

### Watch Mode Development
```bash
npm run dev:watch        # Content monitoring + dev server
npm run dev:watch:force  # Content monitoring with force + dev server
```

### Content Management
```bash
npm run content:fetch        # Smart sync (only if changed)
npm run content:force        # Force update (ignore cache)
npm run content:watch        # Background monitoring
npm run content:watch:force  # Background monitoring with force updates
npm run content:stats        # View content statistics
npm run content:health       # Health check all systems
npm run content:cache:clear  # Clear content cache
```ackage
npm install @jantonca/git-files-sync

# Or install globally for CLI access
npm install -g @jantonca/git-files-sync
```

## ⚡ Quick Setup

```bash
# Universal installation - works with ANY framework
npm install @jantonca/git-files-sync

# Universal setup - auto-detects your framework
npx content-setup
```

**✨ What happens automatically:**
- 🔍 **Framework Detection**: Detects Astro, Next.js, React, Vite, etc.
- 📦 **Module System Detection**: Determines ES modules vs CommonJS
- 📝 **Config Generation**: Creates the correct format for your project
- 🚀 **Optimization**: Applies framework-specific optimizations

**The setup will guide you through:**
1. **Repository Configuration** - Enter your Git repository URL and branch
2. **Content Mapping** - Define what content to import and where
3. **Framework-Optimized Template Generation** - Creates the right format automatically
4. **File Generation** - Creates `content.config.js` in the correct format for your framework

**After setup, you'll have:**
- ✅ **Correct config format** for your framework (ES modules or CommonJS)
- ✅ Framework-agnostic core scripts for all projects
- ✅ Framework-specific examples (Astro, Next.js, React, Vite)
- ✅ Complete watch modes with force options
- ✅ Copy-paste ready template file
- ✅ Step-by-step integration guidance

## 🎯 Universal Framework Support

### **Automatic Framework Detection**

The package automatically detects and configures for your framework:

```bash
# Same command works for ANY framework:
npx content-setup

# Astro project detected:
# 📝 Detected: astro project (ES modules)
# 📄 Generating: content.config.js
# ✅ Generated content.config.js (ES module format)

# Next.js project detected:  
# 📝 Detected: nextjs project (CommonJS)
# 📄 Generating: content.config.js
# ✅ Generated content.config.js (CommonJS format)
```

### **Generated Config Examples**

**For Astro/Vite (ES Modules):**
```javascript
export const CONFIG = {
  REPO_URL: 'git@github.com:org/repo.git',
  BRANCH: 'main',
  CONTENT_MAPPING: { /* ... */ }
};
```

**For Next.js/React (CommonJS):**
```javascript  
const CONFIG = {
  REPO_URL: 'git@github.com:org/repo.git',
  BRANCH: 'main', 
  CONTENT_MAPPING: { /* ... */ }
};

module.exports = { CONFIG };
```

**✨ No manual configuration needed - works perfectly with your framework!**

## 📦 Enhanced Scripts Template

The setup creates `package-scripts-template.json` with comprehensive scripts:

**Core Scripts (Add to your package.json):**
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

**Framework-Specific Examples (choose your framework):**

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

⚛️ **React:**
```json
{
  "start": "react-scripts start",
  "start:force": "npx content-cli fetch --force && react-scripts start", 
  "start:watch": "npx content-cli fetch --watch & react-scripts start",
  "start:watch:force": "npx content-cli fetch --watch --force & react-scripts start",
  "build": "react-scripts build",
  "prestart": "npx content-cli fetch",
  "prebuild": "npx content-cli fetch --force"
}
```

⚡ **Vite:**
```json
{
  "dev": "vite",
  "dev:force": "npx content-cli fetch --force && vite",
  "dev:watch": "npx content-cli fetch --watch & vite", 
  "dev:watch:force": "npx content-cli fetch --watch --force & vite",
  "build": "vite build",
  "predev": "npx content-cli fetch",
  "prebuild": "npx content-cli fetch --force"
}
```

> **🔄 Important: npm Lifecycle Hooks**
> 
> The `predev` and `prebuild` scripts use npm's automatic lifecycle hooks:
> - `npm run dev` automatically runs `predev` first, then `dev`
> - `npm run build` automatically runs `prebuild` first, then `build`
> 
> **❌ DON'T do this:** `"build": "npm run prebuild && astro build"` (runs content fetch twice!)
> **✅ DO this:** `"build": "astro build"` + `"prebuild": "npx content-cli fetch --force"`

## 📝 Manual Configuration

Create `content.config.js` in your project root:

```javascript
export const CONFIG = {
  REPO_URL: 'git@github.com:your-org/content-repo.git',
  BRANCH: 'main',
  CONTENT_MAPPING: {
    'src/content': {
      type: 'folder',
      source: 'docs',
      pattern: '**/*.md',
    },
  },
};
```

## 🎯 Test Your Setup

```bash
# Test basic functionality
npx content-cli fetch    # Import content
npx content-cli stats    # View system info
npx content-cli health   # Health check

# Test development workflow
npm run predev          # Auto-sync before dev
npm run content:fetch   # Smart content sync
npm run content:force   # Force content update
npm run content:watch   # Monitor for changes
```

## � Development Workflow

### Daily Development
```bash
# Start development (auto-syncs content)
npm run dev

# Or manually sync content when needed
npm run content:fetch
```

### Production Builds
```bash
# Build with fresh content (auto-forces update)
npm run build

# Or manually force fresh content
npm run content:force
```

### Watch Mode for Active Development
```bash
# Monitor repository for changes
npm run content:watch

# Watch with initial forced update
npx content-cli fetch --watch --force
```

## 📝 Manual Configuration (Alternative)

```json
{
  "scripts": {
    "predev": "npx content-cli fetch",
    "prebuild": "npx content-cli fetch --force",
    "content:update": "npx content-cli update"
  }
}
```

## ✅ Verify Setup

```bash
# Check package integrity
npx content-validate .

# View help for all commands
npx content-cli --help
```

That's it! Your content management is ready to use.
