/**
 * GitIgnore Pattern Validator
 * Extracted from GitIgnoreManager for focused validation logic
 * Handles pattern validation, safety checks, and rule validation
 */

/**
 * GitIgnore pattern validator class
 */
export class GitIgnoreValidator {
  constructor(options = {}) {
    this.strictMode = options.strictMode !== false; // Strict validation by default
  }

  /**
   * Validate gitignore patterns
   * @param {string[]} patterns - Patterns to validate
   * @returns {object} Validation result
   */
  validatePatterns(patterns) {
    const errors = [];
    const warnings = [];

    for (const pattern of patterns) {
      // Check for dangerous patterns
      if (pattern === '*' || pattern === '/*') {
        errors.push(`Dangerous pattern: ${pattern} (would ignore everything)`);
        continue;
      }

      // Check for common mistakes
      if (pattern.includes('//')) {
        warnings.push(`Double slash in pattern: ${pattern}`);
      }

      if (pattern.endsWith('/') && !pattern.endsWith('*/')) {
        // This is actually valid for directories
      }

      // Check for absolute paths outside project
      if (pattern.startsWith('/') && pattern.includes('..')) {
        errors.push(`Path traversal in pattern: ${pattern}`);
      }

      // Check for empty patterns
      if (pattern.trim() === '') {
        warnings.push('Empty pattern found');
      }

      // Check for potentially problematic patterns
      if (this.strictMode) {
        this._validateStrictMode(pattern, warnings);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate a single pattern
   * @param {string} pattern - Pattern to validate
   * @returns {object} Validation result for single pattern
   */
  validateSinglePattern(pattern) {
    return this.validatePatterns([pattern]);
  }

  /**
   * Check if pattern is safe to use
   * @param {string} pattern - Pattern to check
   * @returns {boolean} True if pattern is safe
   */
  isSafePattern(pattern) {
    const validation = this.validateSinglePattern(pattern);
    return validation.valid && validation.warnings.length === 0;
  }

  /**
   * Get dangerous patterns from an array
   * @param {string[]} patterns - Patterns to check
   * @returns {string[]} Array of dangerous patterns
   */
  getDangerousPatterns(patterns) {
    const dangerous = [];
    for (const pattern of patterns) {
      if (!this.isSafePattern(pattern)) {
        dangerous.push(pattern);
      }
    }
    return dangerous;
  }

  /**
   * Validate patterns in strict mode
   * @param {string} pattern - Pattern to validate
   * @param {string[]} warnings - Array to add warnings to
   * @private
   */
  _validateStrictMode(pattern, warnings) {
    // Check for overly broad patterns
    if (pattern === '*.js' || pattern === '*.json') {
      warnings.push(
        `Overly broad pattern: ${pattern} (might ignore important files)`
      );
    }

    // Check for patterns that might ignore important config files
    const importantFiles = [
      'package.json',
      'package-lock.json',
      'yarn.lock',
      'pnpm-lock.yaml',
      '.gitignore',
      'README.md',
      'LICENSE',
    ];

    for (const file of importantFiles) {
      if (pattern === file || pattern === `/${file}`) {
        warnings.push(`Pattern ignores important file: ${pattern}`);
      }
    }

    // Check for patterns that might ignore source directories
    const importantDirs = ['src/', 'lib/', 'components/', 'pages/'];
    for (const dir of importantDirs) {
      if (pattern === dir || pattern === `/${dir}`) {
        warnings.push(`Pattern ignores important directory: ${pattern}`);
      }
    }
  }

  /**
   * Suggest corrections for invalid patterns
   * @param {string[]} patterns - Patterns to check
   * @returns {object} Suggestions for corrections
   */
  suggestCorrections(patterns) {
    const suggestions = {};

    for (const pattern of patterns) {
      const validation = this.validateSinglePattern(pattern);

      if (!validation.valid || validation.warnings.length > 0) {
        const patternSuggestions = [];

        // Suggest corrections for common issues
        if (pattern.includes('//')) {
          patternSuggestions.push(pattern.replace(/\/+/g, '/'));
        }

        if (pattern === '*') {
          patternSuggestions.push('**/temp/**', '*.tmp', '*.log');
        }

        if (pattern.includes('..')) {
          patternSuggestions.push(pattern.replace(/\.\./g, ''));
        }

        if (patternSuggestions.length > 0) {
          suggestions[pattern] = patternSuggestions;
        }
      }
    }

    return suggestions;
  }

  /**
   * Filter out invalid patterns from an array
   * @param {string[]} patterns - Patterns to filter
   * @returns {object} Filtered patterns and removed patterns
   */
  filterValidPatterns(patterns) {
    const valid = [];
    const invalid = [];

    for (const pattern of patterns) {
      if (this.validateSinglePattern(pattern).valid) {
        valid.push(pattern);
      } else {
        invalid.push(pattern);
      }
    }

    return { valid, invalid };
  }
}

/**
 * Default validator instance
 */
export const gitIgnoreValidator = new GitIgnoreValidator();

/**
 * Export convenience functions
 */
export const validatePatterns = (...args) =>
  gitIgnoreValidator.validatePatterns(...args);
export const validateSinglePattern = (...args) =>
  gitIgnoreValidator.validateSinglePattern(...args);
export const isSafePattern = (...args) =>
  gitIgnoreValidator.isSafePattern(...args);
export const getDangerousPatterns = (...args) =>
  gitIgnoreValidator.getDangerousPatterns(...args);
export const suggestCorrections = (...args) =>
  gitIgnoreValidator.suggestCorrections(...args);
export const filterValidPatterns = (...args) =>
  gitIgnoreValidator.filterValidPatterns(...args);
