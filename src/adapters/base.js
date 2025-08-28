/**
 * Framework Adapter Interface
 * Provides framework-agnostic abstractions for content management
 * across Astro, React, and Next.js projects
 *
 * Part of the Content Management Package
 * Migrated from lib/adapters/framework-adapter.js
 */

import fs from 'fs';
import path from 'path';

export class FrameworkAdapter {
  constructor(options = {}) {
    this.projectRoot = options.projectRoot || process.cwd();
    this.options = options;
  }

  /**
   * Get the project root directory
   * @returns {string} Absolute path to project root
   */
  getProjectRoot() {
    return this.projectRoot;
  }

  /**
   * Get the content directory path
   * @returns {string} Relative path to content directory
   */
  getContentDir() {
    throw new Error('getContentDir() must be implemented by framework adapter');
  }

  /**
   * Get the build output directory
   * @returns {string} Relative path to build directory
   */
  getBuildDir() {
    throw new Error('getBuildDir() must be implemented by framework adapter');
  }

  /**
   * Get the main configuration file path
   * @returns {string} Relative path to config file
   */
  getConfigFile() {
    throw new Error('getConfigFile() must be implemented by framework adapter');
  }

  /**
   * Get framework-specific data directory structure
   * @returns {object} Directory structure mapping
   */
  getDataDirStructure() {
    return {
      base: 'src/data',
      content: 'src/content',
      public: 'public',
      assets: 'src/assets',
    };
  }

  /**
   * Validate that this is a valid project for this framework
   * @returns {boolean} True if project is valid
   */
  validateProject() {
    throw new Error(
      'validateProject() must be implemented by framework adapter'
    );
  }

  /**
   * Get framework-specific build commands
   * @returns {object} Build command configuration
   */
  getBuildCommands() {
    return {
      dev: 'npm run dev',
      build: 'npm run build',
      preview: 'npm run preview',
    };
  }

  /**
   * Setup framework-specific integration
   * @returns {Promise<void>}
   */
  async setupIntegration() {
    throw new Error(
      'setupIntegration() must be implemented by framework adapter'
    );
  }

  /**
   * Get framework-specific file patterns for content
   * @returns {object} File pattern configuration
   */
  getFilePatterns() {
    return {
      content: ['**/*.mdx', '**/*.md', '**/*.json'],
      ignore: ['node_modules/**', '.git/**', 'dist/**', '.astro/**'],
      watch: ['src/**'],
    };
  }

  /**
   * Transform content path based on framework conventions
   * @param {string} sourcePath - Source path from content repo
   * @returns {string} Framework-specific destination path
   */
  transformContentPath(sourcePath) {
    // Default implementation - frameworks can override
    return sourcePath;
  }

  /**
   * Get framework-specific environment variables
   * @returns {object} Environment variable configuration
   */
  getEnvironmentConfig() {
    return {
      contentRepo: 'CONTENT_REPO_URL',
      contentBranch: 'CONTENT_REPO_BRANCH',
      contentMapping: 'CONTENT_MAPPING',
    };
  }

  /**
   * Get framework-specific gitignore patterns
   * @returns {string[]} Array of gitignore patterns
   */
  getGitignorePatterns() {
    const structure = this.getDataDirStructure();
    return [
      `/${structure.base}/toyota/**`,
      '/.content-state.json',
      '/.content-backup/**',
      '/.tmp-content/**',
    ];
  }

  /**
   * Setup package.json scripts for content management
   * @returns {object} Scripts to add to package.json
   */
  getPackageScripts() {
    return {
      'content:fetch': 'node git-files-sync/content-fetcher.js',
      'content:watch': 'node git-files-sync/content-fetcher.js --watch',
      'content:add': 'node git-files-sync/content-manager.js add',
      'content:remove': 'node git-files-sync/content-manager.js remove',
      'content:list': 'node git-files-sync/content-manager.js list',
    };
  }
}

/**
 * Auto-detect the framework type based on project files
 * @param {string} projectRoot - Project root directory
 * @returns {string|null} Detected framework type or null
 */
export function detectFramework(projectRoot = process.cwd()) {
  const packageJsonPath = path.join(projectRoot, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    return null;
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    // Check for framework-specific dependencies
    if (dependencies.astro) {
      return 'astro';
    }

    if (dependencies.next) {
      return 'nextjs';
    }

    if (dependencies.react && !dependencies.next && !dependencies.astro) {
      // Check for specific React build tools
      if (dependencies.vite || dependencies['@vitejs/plugin-react']) {
        return 'react-vite';
      }
      if (dependencies['create-react-app'] || dependencies['react-scripts']) {
        return 'react-cra';
      }
      return 'react';
    }

    return null;
  } catch {
    // Silent error handling for framework detection
    return null;
  }
}

/**
 * Factory function to create appropriate framework adapter
 * @param {string} frameworkType - Type of framework
 * @param {object} options - Adapter options
 * @returns {FrameworkAdapter} Framework-specific adapter instance
 */
export async function createFrameworkAdapter(
  frameworkType = null,
  options = {}
) {
  const type = frameworkType || detectFramework(options.projectRoot);

  if (!type) {
    throw new Error(
      'Could not detect framework type. Please specify manually.'
    );
  }

  switch (type) {
    case 'astro': {
      const { AstroAdapter } = await import('./astro.js');
      return new AstroAdapter(options);
    }

    case 'nextjs': {
      const { NextJSAdapter } = await import('./nextjs.js');
      return new NextJSAdapter(options);
    }

    case 'react':
    case 'react-vite':
    case 'react-cra': {
      const { ReactAdapter } = await import('./react.js');
      return new ReactAdapter(options);
    }

    default:
      throw new Error(`Unsupported framework type: ${type}`);
  }
}
