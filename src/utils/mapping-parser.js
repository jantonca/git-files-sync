/**
 * Mapping Config Parser
 * Handles parsing of complex JavaScript content mapping configuration files
 * Extracted from lib/managers/mapping-manager.js for modular architecture
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const EXTERNAL_CONFIG_FILE = join(process.cwd(), 'content.config.js');

export class MappingConfigParser {
  constructor(options = {}) {
    this.configFile = options.configFile || EXTERNAL_CONFIG_FILE;
    this.projectRoot = options.projectRoot || process.cwd();
  }

  /**
   * Parse current content mapping from config file
   * @returns {object} Current content mapping
   */
  parseCurrentMapping() {
    try {
      const configContent = readFileSync(this.configFile, 'utf-8');

      // Try to extract the DEFAULT_CONTENT_MAPPING using a more robust method
      const mappingMatch = configContent.match(
        /const DEFAULT_CONTENT_MAPPING = (\{[\s\S]*?\});/
      );

      if (!mappingMatch) {
        throw new Error(
          'Could not parse DEFAULT_CONTENT_MAPPING from config file'
        );
      }

      // Use eval to parse the complex object (in a controlled environment)
      // This is safe since we're parsing our own config file
      const mappingText = mappingMatch[1];

      // Create a safe evaluation context
      const evalContext = {};
      const evalFunction = new Function('return ' + mappingText);
      const rawMapping = evalFunction.call(evalContext);

      // Normalize the mapping to simple string format for the CLI
      const mapping = {};
      for (const [key, value] of Object.entries(rawMapping)) {
        if (typeof value === 'string') {
          mapping[key] = value;
        } else if (value && typeof value === 'object' && value.path) {
          // Handle more complex mapping objects with { path: "..." } structure
          mapping[key] = value.path;
        }
      }

      return mapping;
    } catch (error) {
      throw new Error(`Error parsing content mapping: ${error.message}`);
    }
  }

  /**
   * Update content mapping in config file
   * @param {object} newMapping - New mapping object
   * @returns {boolean} Success status
   */
  updateMappingInConfig(newMapping) {
    try {
      let configContent = readFileSync(this.configFile, 'utf-8');

      // Format the new mapping for output
      const mappingEntries = Object.entries(newMapping)
        .map(([key, value]) => `  '${key}': '${value}'`)
        .join(',\n');

      const newMappingText = `const DEFAULT_CONTENT_MAPPING = {
${mappingEntries}
};`;

      // Replace the existing mapping
      configContent = configContent.replace(
        /const DEFAULT_CONTENT_MAPPING = \{[\s\S]*?\};/,
        newMappingText
      );

      writeFileSync(this.configFile, configContent);
      return true;
    } catch (error) {
      console.error('Error updating config file:', error.message);
      return false;
    }
  }

  /**
   * Check if config file exists and is readable
   * @returns {boolean} File accessibility status
   */
  isConfigAccessible() {
    try {
      readFileSync(this.configFile, 'utf-8');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get config file path
   * @returns {string} Config file path
   */
  getConfigPath() {
    return this.configFile;
  }

  /**
   * Extract raw config content for analysis
   * @returns {string} Raw config content
   */
  getRawConfigContent() {
    try {
      return readFileSync(this.configFile, 'utf-8');
    } catch (error) {
      throw new Error(`Error reading config file: ${error.message}`);
    }
  }
}

// Standalone function exports for backwards compatibility
export function parseMapping(configFile = EXTERNAL_CONFIG_FILE) {
  const parser = new MappingConfigParser({ configFile });
  return parser.parseCurrentMapping();
}

export function updateMapping(newMapping, configFile = EXTERNAL_CONFIG_FILE) {
  const parser = new MappingConfigParser({ configFile });
  return parser.updateMappingInConfig(newMapping);
}

export function isConfigAccessible(configFile = EXTERNAL_CONFIG_FILE) {
  const parser = new MappingConfigParser({ configFile });
  return parser.isConfigAccessible();
}
