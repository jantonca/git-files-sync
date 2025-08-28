/**
 * Content Mapping Manager
 * Main class for handling content mapping configuration and operations
 * Refactored from lib/managers/mapping-manager.js with modular architecture
 */

import {
  MappingConfigParser,
  parseMapping,
  updateMapping,
} from './mapping-parser.js';
import {
  MappingValidator,
  validateMapping,
  validateSourcePath,
  validateDestinationPath,
} from './mapping-validator.js';

export class ContentMappingManager {
  constructor(options = {}) {
    this.projectRoot = options.projectRoot || process.cwd();
    this.configFile = options.configFile;

    // Initialize helper classes
    this.parser = new MappingConfigParser({
      configFile: this.configFile,
      projectRoot: this.projectRoot,
      ...options.parserOptions,
    });

    this.validator = new MappingValidator({
      ...options.validatorOptions,
    });
  }

  /**
   * Parse current content mapping from config file
   * @returns {object} Current content mapping
   */
  getCurrentMapping() {
    return this.parser.parseCurrentMapping();
  }

  /**
   * Update content mapping in config file
   * @param {object} newMapping - New mapping object
   * @returns {boolean} Success status
   */
  updateContentMapping(newMapping) {
    return this.parser.updateMappingInConfig(newMapping);
  }

  /**
   * Validate content mapping structure
   * @param {object} mapping - Content mapping to validate
   * @returns {object} Validation result
   */
  validateMapping(mapping) {
    return this.validator.validateMapping(mapping);
  }

  /**
   * Validate source path
   * @param {string} path - Source path to validate
   * @returns {object} Validation result
   */
  validateSourcePath(path) {
    return this.validator.validateSourcePath(path);
  }

  /**
   * Validate destination path
   * @param {string} path - Destination path to validate
   * @returns {object} Validation result
   */
  validateDestinationPath(path) {
    return this.validator.validateDestinationPath(path);
  }

  /**
   * Add new content mapping
   * @param {string} source - Source folder name
   * @param {string} destination - Destination path
   * @returns {object} Operation result
   */
  addMapping(source, destination) {
    try {
      const currentMapping = this.getCurrentMapping();

      // Validate new mapping entry
      const entryValidation = this.validator.validateMappingEntry(
        source,
        destination
      );
      if (!entryValidation.valid) {
        return {
          success: false,
          errors: entryValidation.errors,
        };
      }

      // Check for conflicts
      const conflictCheck = this.validator.checkMappingConflicts(
        currentMapping,
        source,
        destination
      );
      if (conflictCheck.hasConflicts) {
        return {
          success: false,
          errors: conflictCheck.conflicts.map(c => c.message),
        };
      }

      // Add new mapping
      const newMapping = { ...currentMapping, [source]: destination };
      const updateSuccess = this.updateContentMapping(newMapping);

      if (updateSuccess) {
        return {
          success: true,
          mapping: newMapping,
          added: { source, destination },
        };
      } else {
        return {
          success: false,
          errors: ['Failed to update configuration file'],
        };
      }
    } catch (error) {
      return {
        success: false,
        errors: [error.message],
      };
    }
  }

  /**
   * Remove content mapping
   * @param {string} source - Source folder name to remove
   * @returns {object} Operation result
   */
  removeMapping(source) {
    try {
      const currentMapping = this.getCurrentMapping();

      if (!currentMapping[source]) {
        return {
          success: false,
          errors: [`Source folder "${source}" does not exist`],
        };
      }

      const destination = currentMapping[source];
      const newMapping = { ...currentMapping };
      delete newMapping[source];

      const updateSuccess = this.updateContentMapping(newMapping);

      if (updateSuccess) {
        return {
          success: true,
          mapping: newMapping,
          removed: { source, destination },
        };
      } else {
        return {
          success: false,
          errors: ['Failed to update configuration file'],
        };
      }
    } catch (error) {
      return {
        success: false,
        errors: [error.message],
      };
    }
  }

  /**
   * Get mapping statistics
   * @returns {object} Mapping statistics
   */
  getStatistics() {
    try {
      const mapping = this.getCurrentMapping();
      const entries = Object.entries(mapping);

      return {
        totalMappings: entries.length,
        sources: entries.map(([source]) => source),
        destinations: entries.map(([, dest]) => dest),
        uniqueDestinations: [...new Set(entries.map(([, dest]) => dest))]
          .length,
        duplicateDestinations:
          entries.length - [...new Set(entries.map(([, dest]) => dest))].length,
      };
    } catch (error) {
      return {
        totalMappings: 0,
        error: error.message,
      };
    }
  }

  /**
   * Get config file information
   * @returns {object} Config file details
   */
  getConfigInfo() {
    return {
      configPath: this.parser.getConfigPath(),
      accessible: this.parser.isConfigAccessible(),
      validationConfig: this.validator.getValidationConfig(),
    };
  }

  /**
   * Validate current mapping from config file
   * @returns {object} Validation result for current mapping
   */
  validateCurrentMapping() {
    try {
      const currentMapping = this.getCurrentMapping();
      return this.validateMapping(currentMapping);
    } catch (error) {
      return {
        valid: false,
        errors: [error.message],
        warnings: [],
      };
    }
  }
}

// Standalone function exports for backwards compatibility
export {
  parseMapping,
  updateMapping,
  validateMapping,
  validateSourcePath,
  validateDestinationPath,
};
