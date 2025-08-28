/**
 * React Framework Adapter
 * Handles React-specific configurations and integrations
 * Supports Vite, Create React App, and custom React setups
 *
 * Part of the Content Management Package
 * Migrated from lib/adapters/react-adapter.js
 */

import fs from 'fs';
import path from 'path';
import { FrameworkAdapter } from './base.js';

export class ReactAdapter extends FrameworkAdapter {
  constructor(options = {}) {
    super(options);
    this.framework = 'react';
    this.buildTool = this.detectBuildTool();
  }

  /**
   * Detect React build tool (Vite, CRA, etc.)
   */
  detectBuildTool() {
    const packageJsonPath = path.join(this.projectRoot, 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
      return 'unknown';
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      if (dependencies.vite || dependencies['@vitejs/plugin-react']) {
        return 'vite';
      }

      if (dependencies['react-scripts'] || dependencies['create-react-app']) {
        return 'cra';
      }

      if (dependencies.webpack) {
        return 'webpack';
      }

      return 'custom';
    } catch {
      return 'unknown';
    }
  }

  /**
   * Get React content directory
   */
  getContentDir() {
    // React doesn't have a standard content directory
    // Use src/content as convention
    return 'src/content';
  }

  /**
   * Get React build directory
   */
  getBuildDir() {
    switch (this.buildTool) {
      case 'vite':
        return 'dist';
      case 'cra':
        return 'build';
      default:
        return 'build';
    }
  }

  /**
   * Get React configuration file
   */
  getConfigFile() {
    const configFiles = {
      vite: ['vite.config.js', 'vite.config.ts', 'vite.config.mjs'],
      cra: ['package.json'], // CRA config is in package.json
      webpack: ['webpack.config.js', 'webpack.config.ts'],
      custom: ['package.json'],
    };

    const files = configFiles[this.buildTool] || configFiles.custom;

    for (const configFile of files) {
      if (fs.existsSync(path.join(this.projectRoot, configFile))) {
        return configFile;
      }
    }

    return 'package.json'; // Fallback
  }

  /**
   * Get React-specific data directory structure
   */
  getDataDirStructure() {
    return {
      base: 'src/data',
      content: 'src/content',
      public: 'public',
      assets: 'src/assets',
      components: 'src/components',
      hooks: 'src/hooks',
      utils: 'src/utils',
      styles: 'src/styles',
    };
  }

  /**
   * Validate React project
   */
  validateProject() {
    const packageJsonPath = path.join(this.projectRoot, 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
      return false;
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      // Check for React dependency
      return !!dependencies.react;
    } catch {
      return false;
    }
  }

  /**
   * Get React-specific build commands
   */
  getBuildCommands() {
    const commands = {
      vite: {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview',
      },
      cra: {
        dev: 'react-scripts start',
        build: 'react-scripts build',
        preview: 'serve -s build',
      },
      webpack: {
        dev: 'webpack serve',
        build: 'webpack --mode production',
        preview: 'serve dist',
      },
      custom: {
        dev: 'npm start',
        build: 'npm run build',
        preview: 'npm run preview',
      },
    };

    return commands[this.buildTool] || commands.custom;
  }

  /**
   * Transform content path for React conventions
   */
  transformContentPath(sourcePath) {
    // React typically keeps data in src/data
    return sourcePath;
  }

  /**
   * Get React-specific file patterns
   */
  getFilePatterns() {
    const basePatterns = {
      content: ['**/*.mdx', '**/*.md', '**/*.json'],
      ignore: ['node_modules/**', '.git/**', 'build/**', 'dist/**', '.vite/**'],
      watch: ['src/**', 'public/**'],
    };

    // Add build tool specific patterns
    if (this.buildTool === 'cra') {
      basePatterns.ignore.push('build/**');
    } else if (this.buildTool === 'vite') {
      basePatterns.ignore.push('dist/**', '.vite/**');
    }

    return basePatterns;
  }

  /**
   * Setup React-specific integration
   */
  async setupIntegration() {
    // Check for MDX support
    const packageJsonPath = path.join(this.projectRoot, 'package.json');

    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      // Suggest MDX packages if not present
      const mdxPackages = ['@mdx-js/react', '@mdx-js/rollup', '@mdx-js/loader'];
      const hasMdxSupport = mdxPackages.some(pkg => dependencies[pkg]);

      if (!hasMdxSupport) {
        console.warn(
          '📝 Consider adding MDX support for better content handling:'
        );

        console.warn('   npm install @mdx-js/react @mdx-js/rollup');
      }
    }

    // Create content utilities if they don't exist
    const utilsDir = path.join(this.projectRoot, 'src/utils');
    const contentUtilsPath = path.join(utilsDir, 'content-utils.js');

    if (!fs.existsSync(contentUtilsPath)) {
      if (!fs.existsSync(utilsDir)) {
        fs.mkdirSync(utilsDir, { recursive: true });
      }

      const contentUtils = `// Content utilities for React applications
// Auto-generated by content management system

/**
 * Load content data from the data directory
 * @param {string} path - Path to content file (relative to src/data)
 * @returns {Promise<any>} Parsed content data
 */
export async function loadContent(path) {
  try {
    const module = await import(\`../data/\${path}\`);
    return module.default || module;
  } catch (error) {
    console.warn(\`Failed to load content: \${path}\`, error);
    return null;
  }
}

/**
 * Get all files in a content directory
 * @param {string} directory - Directory path
 * @returns {Promise<string[]>} Array of file paths
 */
export async function getContentFiles(directory) {
  // This would need to be implemented based on your build tool
  // For now, return empty array
  console.warn('getContentFiles not implemented - please implement based on your build setup');
  return [];
}

/**
 * Parse frontmatter from markdown content
 * @param {string} content - Raw markdown content
 * @returns {object} Parsed frontmatter and content
 */
export function parseFrontmatter(content) {
  const frontmatterRegex = /^---\\n([\\s\\S]*?)\\n---\\n([\\s\\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { data: {}, content };
  }

  try {
    // Simple YAML parsing - consider using a proper YAML parser
    const frontmatter = match[1];
    const body = match[2];

    const data = {};
    frontmatter.split('\\n').forEach(line => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0) {
        data[key.trim()] = valueParts.join(':').trim().replace(/['"]/g, '');
      }
    });

    return { data, content: body };
  } catch (error) {
    console.warn('Failed to parse frontmatter:', error);
    return { data: {}, content };
  }
}
`;

      fs.writeFileSync(contentUtilsPath, contentUtils);
    }
  }

  /**
   * Get React-specific package scripts
   */
  getPackageScripts() {
    const baseScripts = super.getPackageScripts();

    const buildToolScripts = {
      vite: {
        'dev:content':
          'node git-files-sync/content-fetcher.js --watch & vite',
        'build:content':
          'node git-files-sync/content-fetcher.js --force && vite build',
      },
      cra: {
        'dev:content':
          'node git-files-sync/content-fetcher.js --watch & react-scripts start',
        'build:content':
          'node git-files-sync/content-fetcher.js --force && react-scripts build',
      },
      custom: {
        'dev:content':
          'node git-files-sync/content-fetcher.js --watch & npm start',
        'build:content':
          'node git-files-sync/content-fetcher.js --force && npm run build',
      },
    };

    return {
      ...baseScripts,
      ...(buildToolScripts[this.buildTool] || buildToolScripts.custom),
    };
  }

  /**
   * Get React-specific gitignore patterns
   */
  getGitignorePatterns() {
    const basePatterns = super.getGitignorePatterns();
    const buildToolPatterns = {
      vite: ['/dist/', '/.vite/'],
      cra: ['/build/'],
      webpack: ['/dist/', '/build/'],
    };

    return [
      ...basePatterns,
      ...(buildToolPatterns[this.buildTool] || buildToolPatterns.cra),
    ];
  }
}
