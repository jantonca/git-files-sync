# Data Import Templates

This directory contains configuration and script templates for importing data from external repositories (like CloudCannon, headless CMS, or any data source) into your projects.

## 🎯 Purpose

This is a **framework-agnostic data synchronization tool** that:

- Imports curated data from external repositories
- Places data in configurable folders (typically `src/data/` or `src/content/`)
- Supports any framework (Astro, Next.js, React, Vue, etc.)
- Works with any data source (CloudCannon, headless CMS, Git repositories)

## Templates Available

### Basic Configuration Templates

- **`content.config.basic.js`** - Basic data import for simple projects
- **`content.config.advanced.js`** - Advanced configuration with performance tuning
- **`content.config.multi-repo.js`** - Multi-repository data import setup

### Framework-Optimized Templates

- **`content.config.astro.js`** - Data import optimized for Astro projects
- **`content.config.nextjs.js`** - Data import optimized for Next.js projects
- **`content.config.react.js`** - Data import optimized for React projects

### Project Type Templates

- **`content.config.blog.js`** - Blog/content site configuration
- **`content.config.docs.js`** - Documentation site configuration
- **`content.config.ecommerce.js`** - E-commerce/product site configuration

### Package.json Script Templates

- **`package-scripts.json`** - npm scripts for package.json integration

## Usage

```bash
# Copy a template to your project
cp templates/content.config.astro.js content.config.js

# Or use the migration tool to apply templates
npx content-migrate . --template=astro

# Generate from setup tool
npx content-setup
```

## Template Structure

Each template follows this structure:

```javascript
export const CONFIG = {
  // Repository settings
  REPO_URL: '', // Your repository URL
  BRANCH: 'main',

  // Content mappings (framework-optimized)
  CONTENT_MAPPING: {
    // Template-specific mappings
  },

  // Performance settings (optimized per template)
  PERFORMANCE: {
    // Template-specific performance settings
  },
};
```

## Customization

After copying a template:

1. **Update REPO_URL** with your content repository
2. **Modify CONTENT_MAPPING** to match your content structure
3. **Adjust paths** to match your project structure
4. **Test configuration** with `npx content-validate .`
