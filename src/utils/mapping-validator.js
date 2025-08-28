/**
 * Mapping Validator
 * Handles validation of content mapping entries, source paths, and destination paths
 * Extracted from lib/managers/mapping-manager.js for modular architecture
 */

export class MappingValidator {
  constructor(options = {}) {
    this.strictMode = options.strictMode || false;
    this.allowedDestinationPrefixes = options.allowedDestinationPrefixes || [
      'src/',
    ];
    this.maxSourceLength = options.maxSourceLength || 50;
    this.minSourceLength = options.minSourceLength || 2;
  }

  /**
   * Validate entire content mapping structure
   * @param {object} mapping - Content mapping to validate
   * @returns {object} Validation result
   */
  validateMapping(mapping) {
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

    // Check for duplicate destinations
    const destinations = entries.map(([, dest]) => dest);
    const duplicateDestinations = destinations.filter(
      (dest, index) => destinations.indexOf(dest) !== index
    );

    if (duplicateDestinations.length > 0) {
      errors.push(
        `Duplicate destinations found: ${duplicateDestinations.join(', ')}`
      );
    }

    // Validate each mapping entry
    for (const [source, destination] of entries) {
      const sourceValidation = this.validateSourcePath(source);
      const destValidation = this.validateDestinationPath(destination);

      if (!sourceValidation.valid) {
        errors.push(
          `Invalid source "${source}": ${sourceValidation.errors.join(', ')}`
        );
      }

      if (!destValidation.valid) {
        errors.push(
          `Invalid destination "${destination}": ${destValidation.errors.join(', ')}`
        );
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate source path
   * @param {string} path - Source path to validate
   * @returns {object} Validation result
   */
  validateSourcePath(path) {
    const errors = [];

    if (!path || typeof path !== 'string') {
      errors.push('Source path is required and must be a string');
      return { valid: false, errors };
    }

    // Check for valid folder name pattern
    const validPattern = /^[a-z0-9-]+$/;
    if (!validPattern.test(path)) {
      errors.push(
        'Source path must contain only lowercase letters, numbers, and hyphens'
      );
    }

    // Check start/end
    if (path.startsWith('-') || path.endsWith('-')) {
      errors.push('Source path cannot start or end with a hyphen');
    }

    // Check length
    if (path.length < this.minSourceLength) {
      errors.push(
        `Source path must be at least ${this.minSourceLength} characters long`
      );
    }

    if (path.length > this.maxSourceLength) {
      errors.push(
        `Source path must be less than ${this.maxSourceLength} characters long`
      );
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Validate destination path
   * @param {string} path - Destination path to validate
   * @returns {object} Validation result
   */
  validateDestinationPath(path) {
    const errors = [];

    if (!path || typeof path !== 'string') {
      errors.push('Destination path is required and must be a string');
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
    const hasValidPrefix = this.allowedDestinationPrefixes.some(prefix =>
      path.startsWith(prefix)
    );

    if (!hasValidPrefix) {
      errors.push(
        `Destination path should start with one of: ${this.allowedDestinationPrefixes.join(', ')}`
      );
    }

    // Check for dangerous paths
    const dangerousPaths = ['src/../', 'node_modules', '.git', '.env'];

    if (dangerousPaths.some(dangerous => path.includes(dangerous))) {
      errors.push('Destination path contains dangerous components');
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Check for mapping conflicts
   * @param {object} currentMapping - Current mapping
   * @param {string} newSource - New source to add
   * @param {string} newDestination - New destination to add
   * @returns {object} Conflict check result
   */
  checkMappingConflicts(currentMapping, newSource, newDestination) {
    const conflicts = [];

    // Check for existing source
    if (currentMapping[newSource]) {
      conflicts.push({
        type: 'source_exists',
        message: `Source folder "${newSource}" already exists`,
        existing: { source: newSource, destination: currentMapping[newSource] },
      });
    }

    // Check for existing destination
    const existingSource = Object.entries(currentMapping).find(
      ([, dest]) => dest === newDestination
    );
    if (existingSource) {
      conflicts.push({
        type: 'destination_exists',
        message: `Destination "${newDestination}" is already used by "${existingSource[0]}"`,
        existing: { source: existingSource[0], destination: newDestination },
      });
    }

    return {
      hasConflicts: conflicts.length > 0,
      conflicts,
    };
  }

  /**
   * Validate a single mapping entry
   * @param {string} source - Source path
   * @param {string} destination - Destination path
   * @returns {object} Validation result
   */
  validateMappingEntry(source, destination) {
    const sourceValidation = this.validateSourcePath(source);
    const destValidation = this.validateDestinationPath(destination);

    const errors = [...sourceValidation.errors, ...destValidation.errors];

    return {
      valid: errors.length === 0,
      errors,
      sourceValid: sourceValidation.valid,
      destinationValid: destValidation.valid,
    };
  }

  /**
   * Get validation configuration
   * @returns {object} Current validation settings
   */
  getValidationConfig() {
    return {
      strictMode: this.strictMode,
      allowedDestinationPrefixes: this.allowedDestinationPrefixes,
      maxSourceLength: this.maxSourceLength,
      minSourceLength: this.minSourceLength,
    };
  }
}

// Standalone function exports for backwards compatibility
export function validateMapping(mapping, options = {}) {
  const validator = new MappingValidator(options);
  return validator.validateMapping(mapping);
}

export function validateSourcePath(path, options = {}) {
  const validator = new MappingValidator(options);
  return validator.validateSourcePath(path);
}

export function validateDestinationPath(path, options = {}) {
  const validator = new MappingValidator(options);
  return validator.validateDestinationPath(path);
}

export function checkMappingConflicts(
  currentMapping,
  newSource,
  newDestination,
  options = {}
) {
  const validator = new MappingValidator(options);
  return validator.checkMappingConflicts(
    currentMapping,
    newSource,
    newDestination
  );
}
