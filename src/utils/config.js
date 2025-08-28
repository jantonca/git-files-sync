/**
 * Configuration Loader
 * Universal configuration loading with dual format support (CommonJS + ES modules)
 * Automatically detects and loads the correct format for any framework
 */

import { existsSync } from 'fs';
import { resolve } from 'path';
import { createRequire } from 'module';

// Create require function for CommonJS compatibility in ES modules
const require = createRequire(import.meta.url);

/**
 * Default configuration when no config file is found
 */
const DEFAULT_CONFIG = {
  // Repository settings
  REPO_URL: '',
  BRANCH: 'main',

  // Directory settings
  TEMP_DIR: '.content-temp',
  BACKUP_DIR: '.content-backup',

  // Content mapping configuration (empty by default)
  CONTENT_MAPPING: {},

  // Framework settings
  framework: 'astro',
  outputPath: './src/content',
  cacheEnabled: true,
  validationEnabled: true,
  performance: {
    enabled: true,
    maxConcurrency: 10,
  },
};

/**
 * Detect if project uses ES modules
 */
function isESModuleProject(projectRoot) {
  const packageJsonPath = resolve(projectRoot, 'package.json');
  if (existsSync(packageJsonPath)) {
    try {
      const pkg = JSON.parse(require('fs').readFileSync(packageJsonPath, 'utf8'));
      return pkg.type === 'module';
    } catch (error) {
      return false;
    }
  }
  return false;
}

/**
 * Load configuration with dual format support
 */
async function loadConfiguration() {
  // Find project root by looking for key project files
  let projectRoot = process.cwd();

  // If we're running from within git-files-sync package, go up to find the real project root
  if (projectRoot.endsWith('/git-files-sync') || projectRoot.endsWith('\\git-files-sync')) {
    projectRoot = resolve(projectRoot, '..');
  }

  // Try different config file formats in order of preference
  const configVariants = [
    'content.config.mjs',  // ES module format (universal)
    'content.config.js',   // Auto-detect format
    'content.config.json'  // JSON format (fallback)
  ];

  for (const configFile of configVariants) {
    const configPath = resolve(projectRoot, configFile);
    
    if (existsSync(configPath)) {
      try {
        if (configFile.endsWith('.json')) {
          // JSON configuration
          const configData = JSON.parse(require('fs').readFileSync(configPath, 'utf8'));
          return configData.CONFIG || configData;
        } else if (configFile.endsWith('.mjs')) {
          // ES module format (always use dynamic import)
          const configModule = await import(`file://${configPath}`);
          return configModule.default || configModule.CONFIG;
        } else {
          // .js file - detect project module type
          const isESModule = isESModuleProject(projectRoot);
          
          if (isESModule) {
            // Project uses ES modules
            const configModule = await import(`file://${configPath}`);
            return configModule.default || configModule.CONFIG;
          } else {
            // Project uses CommonJS - use require
            try {
              delete require.cache[configPath]; // Clear cache for fresh reload
              const configModule = require(configPath);
              return configModule.default || configModule.CONFIG || configModule;
            } catch (requireError) {
              // Fallback to dynamic import for CommonJS files
              try {
                const configModule = await import(`file://${configPath}`);
                return configModule.default || configModule.CONFIG;
              } catch (importError) {
                throw requireError; // Throw original require error
              }
            }
          }
        }
      } catch (error) {
        console.warn(`⚠️  Failed to load ${configFile}: ${error.message}`);
        continue; // Try next config variant
      }
    }
  }

  // No config found - use default and warn
  console.warn('⚠️  No content configuration found!');
  console.warn('Using default configuration. To set up content management:');
  console.warn('  npx content-setup');
  console.warn('');

  return DEFAULT_CONFIG;
}

/**
 * Cache for configuration to avoid repeated loading
 */
let _configCache = null;

/**
 * Get configuration with lazy loading
 */
export async function getConfig() {
  if (!_configCache) {
    _configCache = await loadConfiguration();
  }
  return _configCache;
}

/**
 * Synchronous config loading for backward compatibility
 * This blocks at module loading time to maintain compatibility
 */
export const CONFIG = await loadConfiguration();

/**
 * Get sparse checkout paths from content mapping
 */
export async function getSparseCheckoutPaths() {
  const config = await getConfig();
  return Object.values(config.CONTENT_MAPPING).map(
    mapping => mapping.source || mapping
  );
}

/**
 * Export loadConfiguration for direct use
 */
export { loadConfiguration };

/**
 * Validate configuration
 */
export async function validateConfig() {
  const config = await getConfig();
  const errors = [];

  if (!config.REPO_URL) {
    errors.push('REPO_URL is required');
  }

  if (
    !config.CONTENT_MAPPING ||
    Object.keys(config.CONTENT_MAPPING).length === 0
  ) {
    errors.push('At least one content mapping is required');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }

  return true;
}
