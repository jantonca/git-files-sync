/**
 * Astro Framework Adapter
 * Handles Astro-specific configurations and integrations
 *
 * Part of the Content Management Package
 * Migrated from lib/adapters/astro-adapter.js
 */

import fs from 'fs';
import path from 'path';
import { FrameworkAdapter } from './base.js';

export class AstroAdapter extends FrameworkAdapter {
  constructor(options = {}) {
    super(options);
    this.framework = 'astro';
  }

  /**
   * Get Astro content directory
   */
  getContentDir() {
    return 'src/content';
  }

  /**
   * Get Astro build directory
   */
  getBuildDir() {
    return 'dist';
  }

  /**
   * Get Astro configuration file
   */
  getConfigFile() {
    const configFiles = [
      'astro.config.mjs',
      'astro.config.js',
      'astro.config.ts',
    ];

    for (const configFile of configFiles) {
      if (fs.existsSync(path.join(this.projectRoot, configFile))) {
        return configFile;
      }
    }

    return 'astro.config.mjs'; // Default
  }

  /**
   * Get Astro-specific data directory structure
   */
  getDataDirStructure() {
    return {
      base: 'src/data',
      content: 'src/content',
      public: 'public',
      assets: 'src/assets',
      components: 'src/components',
      layouts: 'src/layouts',
      pages: 'src/pages',
    };
  }

  /**
   * Validate Astro project
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

      // Check for Astro dependency
      return !!dependencies.astro;
    } catch {
      return false;
    }
  }

  /**
   * Get Astro-specific build commands
   */
  getBuildCommands() {
    return {
      dev: 'astro dev',
      build: 'astro build',
      preview: 'astro preview',
      check: 'astro check',
    };
  }

  /**
   * Transform content path for Astro conventions
   */
  transformContentPath(sourcePath) {
    // Astro prefers src/content for content collections
    // but src/data for static data imports
    if (
      sourcePath.includes('shared-components') ||
      sourcePath.includes('disclaimers')
    ) {
      return sourcePath.replace('src/data/toyota', 'src/data/toyota');
    }

    return sourcePath;
  }

  /**
   * Get Astro-specific file patterns
   */
  getFilePatterns() {
    return {
      content: ['**/*.mdx', '**/*.md', '**/*.json'],
      ignore: [
        'node_modules/**',
        '.git/**',
        'dist/**',
        '.astro/**',
        '.vercel/**',
        '.netlify/**',
      ],
      watch: ['src/**', 'public/**'],
    };
  }

  /**
   * Setup Astro-specific integration
   */
  async setupIntegration() {
    // Check if content config exists
    const contentConfigPath = path.join(
      this.projectRoot,
      'src/content/config.ts'
    );

    if (!fs.existsSync(contentConfigPath)) {
      // Create basic content config for Astro content collections
      const contentConfig = `import { defineCollection, z } from 'astro:content';

// Define content collections schema if needed
// This is optional - remove if not using Astro content collections

export const collections = {
  // Add your content collections here
  // Example:
  // 'blog': defineCollection({
  //   type: 'content',
  //   schema: z.object({
  //     title: z.string(),
  //     description: z.string(),
  //     publishDate: z.date(),
  //   }),
  // }),
};
`;

      const contentDir = path.dirname(contentConfigPath);
      if (!fs.existsSync(contentDir)) {
        fs.mkdirSync(contentDir, { recursive: true });
      }

      fs.writeFileSync(contentConfigPath, contentConfig);
    }

    // Check astro.config for MDX integration
    const configFile = this.getConfigFile();
    const configPath = path.join(this.projectRoot, configFile);

    if (fs.existsSync(configPath)) {
      const configContent = fs.readFileSync(configPath, 'utf8');

      // Basic check if MDX integration is present
      if (!configContent.includes('@astrojs/mdx')) {
        console.warn(
          '📝 Consider adding @astrojs/mdx integration to your Astro config for MDX support'
        );
      }
    }
  }

  /**
   * Get Astro-specific package scripts
   */
  getPackageScripts() {
    return {
      ...super.getPackageScripts(),
      predev: 'node git-files-sync/content-fetcher.js',
      prebuild: 'node git-files-sync/content-fetcher.js --force',
      'dev:content':
        'node git-files-sync/content-fetcher.js --watch & astro dev',
      astro: 'astro',
    };
  }

  /**
   * Get Astro-specific environment variables
   */
  getEnvironmentConfig() {
    return {
      ...super.getEnvironmentConfig(),
      astroOutput: 'ASTRO_OUTPUT', // 'static' | 'server' | 'hybrid'
      astroAdapter: 'ASTRO_ADAPTER', // deployment adapter
    };
  }

  /**
   * Get Astro-specific gitignore patterns
   */
  getGitignorePatterns() {
    return [
      ...super.getGitignorePatterns(),
      '/.astro/',
      '/dist/',
      '/.vercel/',
      '/.netlify/',
    ];
  }
}
