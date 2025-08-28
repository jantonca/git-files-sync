import fs from 'fs';
import {
  readFile,
  mkdir,
  rm,
  rename,
  stat,
  copyFile,
  readdir,
} from 'fs/promises';
import path from 'path';

/**
 * File Service - Handles all file system operations
 * Migrated from lib/services/file-service.js
 *
 * @version 2.0.0
 * @package @jantonca/git-files-sync
 */
export class FileService {
  constructor(options = {}) {
    this.maxFileSize = options.maxFileSize || 5 * 1024 * 1024; // 5MB
    this.allowedExtensions = options.allowedExtensions || [
      '.json',
      '.mdx',
      '.md',
    ];
    this.concurrentOperations = options.concurrentOperations || 5;
  }

  /**
   * Check if file exists
   * @param {string} filePath - File path to check
   * @returns {boolean} True if file exists
   */
  exists(filePath) {
    return fs.existsSync(filePath);
  }

  /**
   * Create directory recursively
   * @param {string} dirPath - Directory path
   * @returns {Promise<void>}
   */
  async createDirectory(dirPath) {
    await mkdir(dirPath, { recursive: true });
  }

  /**
   * Remove file or directory
   * @param {string} targetPath - Path to remove
   * @param {object} options - Remove options
   * @returns {Promise<boolean>} Success status
   */
  async remove(targetPath, options = {}) {
    try {
      const removeOptions = {
        recursive: true,
        force: true,
        ...options,
      };

      await rm(targetPath, removeOptions);
      return true;
    } catch (error) {
      console.warn(`Failed to remove ${targetPath}: ${error.message}`);
      return false;
    }
  }

  /**
   * Copy file
   * @param {string} source - Source file path
   * @param {string} destination - Destination file path
   * @returns {Promise<boolean>} Success status
   */
  async copy(source, destination) {
    try {
      // Ensure destination directory exists
      await this.createDirectory(path.dirname(destination));
      
      // Check if source is a directory
      const stats = await stat(source);
      
      if (stats.isDirectory()) {
        // For directories, use recursive copy
        await this.copyDirectory(source, destination);
      } else {
        // For files, use copyFile
        await copyFile(source, destination);
      }
      
      return true;
    } catch (error) {
      console.warn(
        `Failed to copy ${source} to ${destination}: ${error.message}`
      );
      return false;
    }
  }

  /**
   * Copy directory recursively
   * @param {string} source - Source directory
   * @param {string} destination - Destination directory
   * @returns {Promise<void>}
   */
  async copyDirectory(source, destination) {
    // Create destination directory
    await this.createDirectory(destination);
    
    // Read source directory contents
    const entries = await readdir(source, { withFileTypes: true });
    
    // Copy each entry
    for (const entry of entries) {
      const srcPath = path.join(source, entry.name);
      const destPath = path.join(destination, entry.name);
      
      if (entry.isDirectory()) {
        // Recursively copy subdirectories
        await this.copyDirectory(srcPath, destPath);
      } else {
        // Copy files
        await copyFile(srcPath, destPath);
      }
    }
  }

  /**
   * Move/rename file or directory
   * @param {string} source - Source path
   * @param {string} destination - Destination path
   * @returns {Promise<boolean>} Success status
   */
  async move(source, destination) {
    try {
      // Ensure destination directory exists
      await this.createDirectory(path.dirname(destination));
      await rename(source, destination);
      return true;
    } catch (error) {
      console.warn(
        `Failed to move ${source} to ${destination}: ${error.message}`
      );
      return false;
    }
  }

  /**
   * Read file content
   * @param {string} filePath - File path
   * @param {string} encoding - File encoding
   * @returns {Promise<string>} File content
   */
  async read(filePath, encoding = 'utf8') {
    return await readFile(filePath, encoding);
  }

  /**
   * Write file content
   * @param {string} filePath - File path
   * @param {string} content - Content to write
   * @param {string} encoding - File encoding
   * @returns {Promise<void>}
   */
  async write(filePath, content, encoding = 'utf8') {
    // Ensure directory exists
    await this.createDirectory(path.dirname(filePath));
    await fs.promises.writeFile(filePath, content, encoding);
  }

  /**
   * Get file statistics
   * @param {string} filePath - File path
   * @returns {Promise<object>} File stats
   */
  async getStats(filePath) {
    return await stat(filePath);
  }

  /**
   * Get files recursively from directory
   * @param {string} dirPath - Directory path
   * @param {object} options - Search options
   * @returns {Promise<string[]>} Array of file paths
   */
  async getFilesRecursively(dirPath, options = {}) {
    const {
      extensions = this.allowedExtensions,
      exclude = [],
      includeDirectories = false,
    } = options;

    const files = [];

    if (!this.exists(dirPath)) {
      return files;
    }

    // Check if it's actually a directory, not a file
    const stats = await this.getStats(dirPath);
    if (!stats.isDirectory()) {
      // If it's a file and matches criteria, return it
      const ext = path.extname(dirPath).toLowerCase();
      if (extensions.length === 0 || extensions.includes(ext)) {
        return [dirPath];
      }
      return [];
    }

    try {
      const items = await readdir(dirPath, { withFileTypes: true });

      for (const item of items) {
        const fullPath = path.join(dirPath, item.name);
        const relativePath = path.relative(process.cwd(), fullPath);

        // Skip excluded paths
        if (exclude.some(excludePath => relativePath.includes(excludePath))) {
          continue;
        }

        if (item.isDirectory()) {
          if (includeDirectories) {
            files.push(fullPath);
          }
          // Recursively get files from subdirectory
          files.push(...(await this.getFilesRecursively(fullPath, options)));
        } else {
          const ext = path.extname(item.name).toLowerCase();
          if (extensions.length === 0 || extensions.includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    } catch {
      // If we can't read the directory, skip it silently
      // This handles cases where a file is passed instead of directory
    }

    return files;
  }

  /**
   * Validate file path for security
   * @param {string} filePath - File path to validate
   * @throws {Error} If path is invalid
   */
  validateFilePath(filePath) {
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('Invalid file path');
    }

    // Check for path traversal attempts
    if (filePath.includes('..') || filePath.includes('~')) {
      throw new Error('Path traversal attempt detected');
    }

    return filePath;
  }

  /**
   * Validate file extension
   * @param {string} extension - File extension
   * @param {string[]} allowedExtensions - Allowed extensions
   * @throws {Error} If extension is not allowed
   */
  validateFileExtension(extension, allowedExtensions = this.allowedExtensions) {
    if (!extension || typeof extension !== 'string') {
      throw new Error('Invalid file extension');
    }

    if (!allowedExtensions.includes(extension.toLowerCase())) {
      throw new Error(`File extension ${extension} not allowed`);
    }

    return extension;
  }

  /**
   * Validate file size
   * @param {number} size - File size in bytes
   * @param {number} maxSize - Maximum allowed size
   * @throws {Error} If file is too large
   */
  validateFileSize(size, maxSize = this.maxFileSize) {
    if (typeof size !== 'number' || size < 0) {
      throw new Error('Invalid file size');
    }

    if (size > maxSize) {
      throw new Error(`File size ${size} exceeds maximum ${maxSize}`);
    }

    return size;
  }

  /**
   * Validate file content and structure
   * @param {string} filePath - File path
   * @returns {Promise<object>} Validation result
   */
  async validateFile(filePath) {
    const errors = [];
    const warnings = [];

    try {
      // Security validation
      this.validateFilePath(filePath);

      // Check if file exists
      if (!this.exists(filePath)) {
        errors.push(`File does not exist: ${filePath}`);
        return { valid: false, errors, warnings };
      }

      // File extension validation
      const ext = path.extname(filePath).toLowerCase();
      this.validateFileExtension(ext);

      // File size validation
      const stats = await this.getStats(filePath);
      this.validateFileSize(stats.size);

      // Content validation for specific file types
      if (ext === '.json') {
        await this.validateJsonFile(filePath);
      } else if (ext === '.mdx' || ext === '.md') {
        await this.validateMarkdownFile(filePath);
      }
    } catch (error) {
      errors.push(error.message);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate JSON file content
   * @param {string} filePath - JSON file path
   * @throws {Error} If JSON is invalid
   */
  async validateJsonFile(filePath) {
    const content = await this.read(filePath);

    try {
      JSON.parse(content);
    } catch (error) {
      throw new Error(`Invalid JSON in ${filePath}: ${error.message}`);
    }
  }

  /**
   * Validate Markdown/MDX file content
   * @param {string} filePath - Markdown file path
   * @throws {Error} If markdown is invalid
   */
  async validateMarkdownFile(filePath) {
    const content = await this.read(filePath);

    if (!content || content.trim().length === 0) {
      throw new Error(`Empty markdown file: ${filePath}`);
    }

    // Basic validation - could be expanded with proper markdown parser
    return true;
  }

  /**
   * Create backup of files
   * @param {string[]} filePaths - Files to backup
   * @param {string} backupDir - Backup directory
   * @returns {Promise<boolean>} Success status
   */
  async createBackup(filePaths, backupDir) {
    try {
      await this.createDirectory(backupDir);

      for (const filePath of filePaths) {
        if (this.exists(filePath)) {
          const relativePath = path.relative(process.cwd(), filePath);
          const backupPath = path.join(backupDir, relativePath);
          await this.copy(filePath, backupPath);
        }
      }

      return true;
    } catch (error) {
      console.warn(`Backup creation failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Restore files from backup
   * @param {string} backupDir - Backup directory
   * @param {string} targetDir - Target directory
   * @returns {Promise<boolean>} Success status
   */
  async restoreBackup(backupDir, targetDir) {
    try {
      if (!this.exists(backupDir)) {
        throw new Error('Backup directory does not exist');
      }

      const backupFiles = await this.getFilesRecursively(backupDir);

      for (const backupFile of backupFiles) {
        const relativePath = path.relative(backupDir, backupFile);
        const targetPath = path.join(targetDir, relativePath);
        await this.copy(backupFile, targetPath);
      }

      return true;
    } catch (error) {
      console.warn(`Backup restoration failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Process files concurrently with limit
   * @param {string[]} filePaths - Files to process
   * @param {Function} processor - Processing function
   * @param {number} concurrency - Max concurrent operations
   * @returns {Promise<object[]>} Processing results
   */
  async processFilesConcurrently(
    filePaths,
    processor,
    concurrency = this.concurrentOperations
  ) {
    const results = [];
    const processing = [];

    for (const filePath of filePaths) {
      const operation = processor(filePath)
        .then(result => ({
          filePath,
          success: true,
          result,
        }))
        .catch(error => ({
          filePath,
          success: false,
          error: error.message,
        }));

      processing.push(operation);

      if (processing.length >= concurrency) {
        const completed = await Promise.race(processing);
        results.push(completed);
        processing.splice(processing.indexOf(completed), 1);
      }
    }

    // Wait for remaining operations
    const remaining = await Promise.all(processing);
    results.push(...remaining);

    return results;
  }
}
