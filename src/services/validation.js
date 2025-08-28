/**
 * Validation Service - Centralized validation logic
 * Migrated from lib/services/validation-service.js
 *
 * Features:
 * - Repository URL validation
 * - Folder name validation
 * - File path security validation
 * - Content validation (MDX, JSON)
 * - Environment variable validation
 * - Content mapping validation
 *
 * @version 2.0.0
 * @package @jantonca/git-files-sync
 */
export class ValidationService {
  constructor(options = {}) {
    this.allowedExtensions = options.allowedExtensions || [
      '.json',
      '.mdx',
      '.md',
    ];
    this.maxFileSize = options.maxFileSize || 5 * 1024 * 1024; // 5MB
    this.strictMode = options.strictMode || false;
  }

  /**
   * Validate repository URL format
   * @param {string} url - Repository URL
   * @returns {object} Validation result
   */
  validateRepositoryUrl(url) {
    const errors = [];

    if (!url) {
      errors.push('Repository URL is required');
      return { valid: false, errors };
    }

    if (typeof url !== 'string') {
      errors.push('Repository URL must be a string');
      return { valid: false, errors };
    }

    // Allow both SSH and HTTPS git URLs
    const validPatterns = [
      /^git@[\w.-]+:[\w.-]+\/[\w.-]+\.git$/, // SSH: git@host:org/repo.git
      /^https:\/\/[\w.-]+\/[\w.-]+\/[\w.-]+\.git$/, // HTTPS: https://host/org/repo.git
    ];

    const isValid = validPatterns.some(pattern => pattern.test(url));

    if (!isValid) {
      errors.push(`Invalid repository URL format: ${url}`);
      errors.push(
        'Expected format: git@host:org/repo.git or https://host/org/repo.git'
      );
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Validate folder name format
   * @param {string} name - Folder name
   * @returns {object} Validation result
   */
  validateFolderName(name) {
    const errors = [];

    if (!name) {
      errors.push('Folder name is required');
      return { valid: false, errors };
    }

    if (typeof name !== 'string') {
      errors.push('Folder name must be a string');
      return { valid: false, errors };
    }

    // Check pattern
    const validPattern = /^[a-z0-9-]+$/;
    if (!validPattern.test(name)) {
      errors.push(
        'Folder name must contain only lowercase letters, numbers, and hyphens'
      );
    }

    // Check start/end
    if (name.startsWith('-') || name.endsWith('-')) {
      errors.push('Folder name cannot start or end with a hyphen');
    }

    // Check length
    if (name.length < 2) {
      errors.push('Folder name must be at least 2 characters long');
    }

    if (name.length > 50) {
      errors.push('Folder name must be less than 50 characters long');
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Validate destination path
   * @param {string} path - Destination path
   * @returns {object} Validation result
   */
  validateDestinationPath(path) {
    const errors = [];

    if (!path) {
      errors.push('Destination path is required');
      return { valid: false, errors };
    }

    if (typeof path !== 'string') {
      errors.push('Destination path must be a string');
      return { valid: false, errors };
    }

    // Security checks
    if (path.includes('..')) {
      errors.push('Destination path cannot contain ".."');
    }

    if (path.includes('~')) {
      errors.push('Destination path cannot contain "~"');
    }

    // Framework-specific validation
    if (!path.startsWith('src/')) {
      errors.push('Destination path should start with "src/"');
    }

    // Check for dangerous paths
    const dangerousPaths = ['src/../', 'node_modules', '.git', '.env'];

    if (dangerousPaths.some(dangerous => path.includes(dangerous))) {
      errors.push('Destination path contains dangerous components');
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Validate file path for security
   * @param {string} filePath - File path
   * @returns {object} Validation result
   */
  validateFilePath(filePath) {
    const errors = [];

    if (!filePath || typeof filePath !== 'string') {
      errors.push('Invalid file path');
      return { valid: false, errors };
    }

    // Security: Check for path traversal attempts
    if (filePath.includes('..') || filePath.includes('~')) {
      errors.push('Path traversal attempt detected');
    }

    // Check for absolute paths outside project
    if (filePath.startsWith('/') && !filePath.startsWith(process.cwd())) {
      errors.push('Absolute paths outside project are not allowed');
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Validate file extension
   * @param {string} extension - File extension
   * @param {string[]} allowedExtensions - Allowed extensions
   * @returns {object} Validation result
   */
  validateFileExtension(extension, allowedExtensions = this.allowedExtensions) {
    const errors = [];

    if (!extension || typeof extension !== 'string') {
      errors.push('Invalid file extension');
      return { valid: false, errors };
    }

    const normalizedExt = extension.toLowerCase();

    if (!allowedExtensions.includes(normalizedExt)) {
      errors.push(`File extension ${extension} not allowed`);
      errors.push(`Allowed extensions: ${allowedExtensions.join(', ')}`);
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Validate file size
   * @param {number} size - File size in bytes
   * @param {number} maxSize - Maximum size
   * @returns {object} Validation result
   */
  validateFileSize(size, maxSize = this.maxFileSize) {
    const errors = [];

    if (typeof size !== 'number' || size < 0) {
      errors.push('Invalid file size');
      return { valid: false, errors };
    }

    if (size > maxSize) {
      const sizeMB = (size / (1024 * 1024)).toFixed(2);
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
      errors.push(`File size ${sizeMB}MB exceeds maximum ${maxSizeMB}MB`);
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Validate MDX content structure
   * @param {string} content - MDX content
   * @returns {object} Validation result
   */
  validateMdxContent(content) {
    const errors = [];
    const warnings = [];

    if (!content || typeof content !== 'string') {
      errors.push('Invalid MDX content');
      return { valid: false, errors, warnings };
    }

    if (content.trim().length === 0) {
      errors.push('Empty MDX content');
      return { valid: false, errors, warnings };
    }

    // Check for frontmatter
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n/;
    const hasFrontmatter = frontmatterRegex.test(content);

    if (!hasFrontmatter && this.strictMode) {
      warnings.push('MDX file missing frontmatter');
    }

    // Basic JSX syntax validation
    const unclosedTags = this.findUnclosedJsxTags(content);
    if (unclosedTags.length > 0) {
      errors.push(`Unclosed JSX tags found: ${unclosedTags.join(', ')}`);
    }

    // Check for common MDX issues
    if (content.includes('<>') && !content.includes('</>')) {
      warnings.push('React Fragment opened but not closed');
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Find unclosed JSX tags in content
   * @param {string} content - Content to check
   * @returns {string[]} Array of unclosed tag names
   */
  findUnclosedJsxTags(content) {
    const unclosed = [];
    const tagStack = [];

    // Simple regex to find JSX tags (this is basic, not comprehensive)
    const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g;
    let match;

    while ((match = tagRegex.exec(content)) !== null) {
      const [fullMatch, tagName] = match;

      if (fullMatch.startsWith('</')) {
        // Closing tag
        const lastTag = tagStack.pop();
        if (lastTag !== tagName) {
          unclosed.push(tagName);
        }
      } else if (!fullMatch.endsWith('/>')) {
        // Opening tag (not self-closing)
        tagStack.push(tagName);
      }
    }

    // Any remaining tags in stack are unclosed
    unclosed.push(...tagStack);

    return unclosed;
  }

  /**
   * Validate JSON content
   * @param {string} content - JSON content
   * @returns {object} Validation result
   */
  validateJsonContent(content) {
    const errors = [];

    if (!content || typeof content !== 'string') {
      errors.push('Invalid JSON content');
      return { valid: false, errors };
    }

    try {
      JSON.parse(content);
    } catch (error) {
      errors.push(`Invalid JSON: ${error.message}`);
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Validate content mapping configuration
   * @param {object} mapping - Content mapping object
   * @returns {object} Validation result
   */
  validateContentMapping(mapping) {
    const errors = [];
    const warnings = [];

    if (!mapping || typeof mapping !== 'object') {
      errors.push('Content mapping must be an object');
      return { valid: false, errors, warnings };
    }

    const entries = Object.entries(mapping);

    if (entries.length === 0) {
      warnings.push('Content mapping is empty');
    }

    for (const [source, destination] of entries) {
      // Validate source
      const sourceValidation = this.validateDestinationPath(source);
      if (!sourceValidation.valid) {
        errors.push(
          `Invalid source path "${source}": ${sourceValidation.errors.join(', ')}`
        );
      }

      // Validate destination
      if (typeof destination === 'string') {
        const destValidation = this.validateDestinationPath(destination);
        if (!destValidation.valid) {
          errors.push(
            `Invalid destination path "${destination}": ${destValidation.errors.join(', ')}`
          );
        }
      } else if (typeof destination === 'object') {
        // Validate complex mapping object
        const complexValidation = this.validateComplexMapping(destination);
        if (!complexValidation.valid) {
          errors.push(
            `Invalid mapping object for "${source}": ${complexValidation.errors.join(', ')}`
          );
        }
      } else {
        errors.push(
          `Invalid destination type for "${source}": must be string or object`
        );
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate complex mapping object
   * @param {object} mapping - Complex mapping configuration
   * @returns {object} Validation result
   */
  validateComplexMapping(mapping) {
    const errors = [];
    const requiredFields = ['type', 'source', 'destination'];

    for (const field of requiredFields) {
      if (!mapping[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    if (
      mapping.type &&
      !['folder', 'selective', 'file'].includes(mapping.type)
    ) {
      errors.push(`Invalid mapping type: ${mapping.type}`);
    }

    if (mapping.type === 'selective' && !mapping.files) {
      errors.push('Selective mapping requires "files" array');
    }

    if (mapping.files && !Array.isArray(mapping.files)) {
      errors.push('"files" must be an array');
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Validate environment variables
   * @param {object} envVars - Environment variables object
   * @returns {object} Validation result
   */
  validateEnvironment(envVars) {
    const errors = [];
    const warnings = [];

    // Check required environment variables
    const requiredVars = ['CONTENT_REPO_URL'];

    for (const varName of requiredVars) {
      if (!envVars[varName]) {
        errors.push(`Missing required environment variable: ${varName}`);
      }
    }

    // Validate repository URL if present
    if (envVars.CONTENT_REPO_URL) {
      const urlValidation = this.validateRepositoryUrl(
        envVars.CONTENT_REPO_URL
      );
      if (!urlValidation.valid) {
        errors.push(
          `Invalid CONTENT_REPO_URL: ${urlValidation.errors.join(', ')}`
        );
      }
    }

    // Check optional but recommended variables
    const recommendedVars = ['CONTENT_REPO_BRANCH', 'CONTENT_MAPPING'];

    for (const varName of recommendedVars) {
      if (!envVars[varName]) {
        warnings.push(`Consider setting environment variable: ${varName}`);
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }
}
