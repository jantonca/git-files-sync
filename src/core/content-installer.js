/**
 * Content Installer - Handles content installation and mapping logic
 * Extracted from content-fetcher.js for better separation of concerns
 */

import path from 'path';
import { CONFIG } from '../utils/config.js';

export class ContentInstaller {
  constructor(options = {}) {
    this.fileService = options.fileService;
    this.cacheService = options.cacheService;
    this.performanceManager = options.performanceManager;
    this.frameworkAdapter = options.frameworkAdapter;
  }

  /**
   * Install content with concurrent processing (Phase 3)
   */
  async installContentConcurrent() {
    console.log('📦 Installing content with enhanced performance...');

    const mappings = Object.entries(CONFIG.CONTENT_MAPPING);

    // Process mappings concurrently
    const results = await this.performanceManager.executeConcurrent(
      mappings,
      async ([key, mapping]) => {
        await this.installSingleMappingEnhanced(key, mapping);
        return { key, mapping, success: true };
      },
      {
        concurrency: 5,
        cache: true,
        cacheNamespace: 'content-mappings',
        onProgress: progress => {
          if (progress.percentage % 20 === 0) {
            console.log(`📊 Installation progress: ${progress.percentage}%`);
          }
        },
      }
    );

    console.log(`✅ Installed ${results.results.length} content mappings`);

    if (results.errors.length > 0) {
      console.warn(`⚠️  ${results.errors.length} installation errors occurred`);
    }

    return {
      success: results.errors.length === 0,
      results: results.results,
      errors: results.errors,
      filesProcessed: results.results.length,
    };
  }

  /**
   * Enhanced single mapping installation with caching
   */
  async installSingleMappingEnhanced(key, mapping) {
    const normalizedMapping = this.normalizeMapping(mapping);
    const sourcePath = `${CONFIG.TEMP_DIR}/${normalizedMapping.source}`;
    const destinationPath = this.frameworkAdapter.transformContentPath(
      normalizedMapping.destination
    );

    // Check cache for content changes
    const cacheKey = `mapping-${key}-${normalizedMapping.source}`;
    const cached = await this.cacheService.get(cacheKey, 'content-hashes');

    // Generate content hash for change detection
    const contentHash = await this.generateContentHash(sourcePath);

    // Only skip if cache matches AND destination actually exists with content
    if (cached === contentHash && this.fileService.exists(destinationPath)) {
      try {
        const destFiles =
          await this.fileService.getFilesRecursively(destinationPath);
        if (destFiles && destFiles.length > 0) {
          console.log(`💾 Skipping unchanged mapping: ${key}`);
          return;
        }
      } catch {
        // If we can't read the destination, assume it needs to be installed
      }
    }

    // Install mapping with validation
    await this.installSingleMapping(key, mapping);

    // Cache content hash
    await this.cacheService.set(cacheKey, contentHash, 'content-hashes');
  }

  /**
   * Install single content mapping
   */
  async installSingleMapping(key, mapping) {
    const normalizedMapping = this.normalizeMapping(mapping);
    const sourcePath = `${CONFIG.TEMP_DIR}/${normalizedMapping.source}`;
    const destinationPath = this.frameworkAdapter.transformContentPath(
      normalizedMapping.destination
    );

    if (!this.fileService.exists(sourcePath)) {
      // Create empty placeholder
      await this.fileService.createDirectory(destinationPath);
      return { success: false, description: key, destinationPath };
    }

    // Process based on mapping type
    switch (normalizedMapping.type) {
      case 'folder':
        // Move contents of source directory to destination directory
        await this.installFolderContents(sourcePath, destinationPath);
        break;

      case 'selective':
        await this.installSelectiveFiles(
          sourcePath,
          destinationPath,
          normalizedMapping.files
        );
        break;

      case 'file':
        await this.fileService.copy(sourcePath, destinationPath);
        break;

      default:
        throw new Error(`Unknown mapping type: ${normalizedMapping.type}`);
    }

    return { success: true, description: key, destinationPath };
  }

  /**
   * Install folder contents (move all files from source to destination)
   */
  async installFolderContents(sourcePath, destinationPath) {
    // Create destination directory
    await this.fileService.createDirectory(destinationPath);

    // Get all files from source directory
    const files = await this.fileService.getFilesRecursively(sourcePath);

    // Process files concurrently
    await this.fileService.processFilesConcurrently(files, async sourceFile => {
      // Calculate relative path from source directory
      const relativePath = path.relative(sourcePath, sourceFile);
      const destFile = path.join(destinationPath, relativePath);

      // Ensure destination directory exists
      await this.fileService.createDirectory(path.dirname(destFile));

      // Copy the file
      return await this.fileService.copy(sourceFile, destFile);
    });
  }

  /**
   * Install selective files
   */
  async installSelectiveFiles(sourcePath, destinationPath, fileList) {
    await this.fileService.createDirectory(destinationPath);

    // Process files concurrently
    await this.fileService.processFilesConcurrently(
      fileList,
      async fileName => {
        const sourceFile = `${sourcePath}/${fileName}`;
        const destFile = `${destinationPath}/${fileName}`;

        if (this.fileService.exists(sourceFile)) {
          return await this.fileService.copy(sourceFile, destFile);
        }
        return false;
      }
    );
  }

  /**
   * Normalize mapping to unified format
   */
  normalizeMapping(mapping) {
    if (typeof mapping === 'string') {
      return {
        type: 'folder',
        source: mapping,
        destination: mapping,
      };
    }

    return {
      type: mapping.type || 'folder',
      source: mapping.source || mapping.destination,
      destination: mapping.destination,
      files: mapping.files || [],
    };
  }

  /**
   * Generate content hash for change detection
   */
  async generateContentHash(sourcePath) {
    if (!this.fileService.exists(sourcePath)) {
      return null;
    }

    const files = await this.fileService.getFilesRecursively(sourcePath);
    const hashes = await Promise.all(
      files.map(async file => {
        const content = await this.fileService.read(file);
        return this.cacheService.generateKey(content, 'file-content');
      })
    );

    return this.cacheService.generateKey(hashes.join(''), 'content-mapping');
  }

  /**
   * Validate mapping configuration
   */
  validateMapping(mapping) {
    const normalized = this.normalizeMapping(mapping);

    if (!normalized.source) {
      throw new Error('Mapping source is required');
    }

    if (!normalized.destination) {
      throw new Error('Mapping destination is required');
    }

    if (
      normalized.type === 'selective' &&
      (!normalized.files || normalized.files.length === 0)
    ) {
      throw new Error('Selective mapping requires files array');
    }

    return true;
  }

  /**
   * Get installation statistics
   */
  getInstallationStats() {
    const mappingCount = Object.keys(CONFIG.CONTENT_MAPPING).length;
    return {
      totalMappings: mappingCount,
      types: this.getMappingTypes(),
      destinations: this.getDestinationPaths(),
    };
  }

  /**
   * Get mapping types summary
   */
  getMappingTypes() {
    const types = {};
    Object.values(CONFIG.CONTENT_MAPPING).forEach(mapping => {
      const normalized = this.normalizeMapping(mapping);
      types[normalized.type] = (types[normalized.type] || 0) + 1;
    });
    return types;
  }

  /**
   * Get destination paths
   */
  getDestinationPaths() {
    return Object.values(CONFIG.CONTENT_MAPPING).map(mapping => {
      const normalized = this.normalizeMapping(mapping);
      return this.frameworkAdapter.transformContentPath(normalized.destination);
    });
  }
}
