/**
 * GitIgnore Manager
 * Main class for handling .gitignore file management for content paths
 * Refactored from lib/managers/gitignore-manager.js with modular architecture
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { GitIgnoreValidator, validatePatterns } from './gitignore-validator.js';
import {
  GitIgnoreTemplateGenerator,
  generateBasic,
} from './gitignore-templates.js';

export class GitIgnoreManager {
  constructor(options = {}) {
    this.projectRoot = options.projectRoot || process.cwd();
    this.gitignorePath = join(this.projectRoot, '.gitignore');
    this.sectionMarker =
      options.sectionMarker || '# Auto-imported content (do not commit)';

    // Initialize helper classes
    this.validator = new GitIgnoreValidator(options.validatorOptions);
    this.templateGenerator = new GitIgnoreTemplateGenerator(
      options.templateOptions
    );
  }

  /**
   * Update .gitignore with content paths
   * @param {object} contentMapping - Content mapping object
   * @returns {Promise<object>} Operation result
   */
  async updateGitignore(contentMapping) {
    try {
      // Read current gitignore content
      let gitignoreContent = '';
      try {
        gitignoreContent = readFileSync(this.gitignorePath, 'utf8');
      } catch {
        // File doesn't exist, that's ok
      }

      // Get all destination paths from current mapping
      const contentPaths = Object.values(contentMapping).sort();

      // Validate paths before adding
      const validation = validatePatterns(contentPaths);
      if (!validation.valid) {
        return {
          success: false,
          error: `Invalid patterns: ${validation.errors.join(', ')}`,
          message: 'Failed to update .gitignore - invalid patterns',
        };
      }

      // Remove existing auto-managed content section if it exists
      const updatedContent = this.removeAutoManagedSection(gitignoreContent);

      // Add new auto-managed content section
      const newContent = this.addAutoManagedSection(
        updatedContent,
        contentPaths
      );

      // Write updated content
      writeFileSync(this.gitignorePath, newContent);

      return {
        success: true,
        pathsAdded: contentPaths.length,
        message: `Updated .gitignore with ${contentPaths.length} content paths`,
        warnings: validation.warnings,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to update .gitignore',
      };
    }
  }

  /**
   * Remove auto-managed section from gitignore content
   * @param {string} content - Current gitignore content
   * @returns {string} Updated content without auto-managed section
   */
  removeAutoManagedSection(content) {
    const sectionStart = content.indexOf(this.sectionMarker);

    if (sectionStart === -1) {
      return content;
    }

    const beforeSection = content.substring(0, sectionStart);
    const afterSectionMatch = content
      .substring(sectionStart)
      .match(/\n\n(?!\/)/);

    const afterSection = afterSectionMatch
      ? content.substring(sectionStart + afterSectionMatch.index + 2)
      : '';

    return (
      beforeSection.trimEnd() + (afterSection ? '\n\n' + afterSection : '')
    );
  }

  /**
   * Add auto-managed section to gitignore content
   * @param {string} content - Current gitignore content
   * @param {string[]} contentPaths - Content paths to add
   * @returns {string} Updated content with auto-managed section
   */
  addAutoManagedSection(content, contentPaths) {
    const contentSection = `\n${this.sectionMarker}\n`;
    
    // Add system directories first
    const systemPaths = [
      '.content-temp/',
      '.content-backup/', 
      '.content-cache/',
      '.cache/'
    ];
    
    // Add content paths
    const contentEntries = contentPaths.map(path => `/${path}`);
    
    // Combine system and content paths
    const allEntries = [...systemPaths, ...contentEntries];
    
    // Only add section if we have entries to add
    if (allEntries.length === 0) {
      return content;
    }
    
    const newEntries = allEntries.join('\n');

    return content + contentSection + newEntries + '\n';
  }

  /**
   * Get current auto-managed paths from .gitignore
   * @returns {string[]} Array of managed paths
   */
  getCurrentManagedPaths() {
    try {
      const content = readFileSync(this.gitignorePath, 'utf8');
      const sectionStart = content.indexOf(this.sectionMarker);

      if (sectionStart === -1) {
        return [];
      }

      const afterMarker = content.substring(
        sectionStart + this.sectionMarker.length
      );
      const sectionEnd = afterMarker.search(/\n\n(?!\/)/);
      const sectionContent =
        sectionEnd === -1 ? afterMarker : afterMarker.substring(0, sectionEnd);

      return sectionContent
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('/'))
        .map(line => line.substring(1)); // Remove leading slash
    } catch {
      return [];
    }
  }

  /**
   * Check if .gitignore exists
   * @returns {boolean} True if .gitignore exists
   */
  exists() {
    try {
      readFileSync(this.gitignorePath, 'utf8');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Create .gitignore if it doesn't exist
   * @param {string[]} initialPaths - Initial paths to add
   * @param {object} options - Creation options
   * @returns {boolean} Success status
   */
  create(initialPaths = [], options = {}) {
    try {
      const { framework, useTemplate = true } = options;

      let content;
      if (useTemplate) {
        if (framework) {
          content = this.templateGenerator.generateForFramework(
            framework,
            initialPaths.map(path => `/${path}`)
          );
        } else {
          content =
            this.templateGenerator.generateForContentManagement(initialPaths);
        }
      } else {
        content = generateBasic();
        if (initialPaths.length > 0) {
          content += this.addAutoManagedSection('', initialPaths);
        }
      }

      writeFileSync(this.gitignorePath, content);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Add custom patterns to .gitignore with validation
   * @param {string[]} patterns - Patterns to add
   * @param {string} sectionName - Section name
   * @returns {object} Operation result
   */
  addCustomPatterns(patterns, sectionName = 'Custom patterns') {
    try {
      // Validate patterns first
      const validation = this.validator.validatePatterns(patterns);
      if (!validation.valid) {
        return {
          success: false,
          error: `Invalid patterns: ${validation.errors.join(', ')}`,
          warnings: validation.warnings,
        };
      }

      let content = '';
      try {
        content = readFileSync(this.gitignorePath, 'utf8');
      } catch {
        // File doesn't exist, create it
        this.create();
        content = readFileSync(this.gitignorePath, 'utf8');
      }

      const customSection = `\n# ${sectionName}\n${patterns.join('\n')}\n`;
      writeFileSync(this.gitignorePath, content + customSection);

      return {
        success: true,
        patternsAdded: patterns.length,
        warnings: validation.warnings,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Remove patterns from .gitignore
   * @param {string[]} patterns - Patterns to remove
   * @returns {object} Operation result
   */
  removePatterns(patterns) {
    try {
      let content = readFileSync(this.gitignorePath, 'utf8');
      let removedCount = 0;

      for (const pattern of patterns) {
        // Remove exact line matches
        const lines = content.split('\n');
        const initialLength = lines.length;
        const filteredLines = lines.filter(line => line.trim() !== pattern);

        if (filteredLines.length < initialLength) {
          removedCount++;
        }

        content = filteredLines.join('\n');
      }

      writeFileSync(this.gitignorePath, content);

      return {
        success: true,
        patternsRemoved: removedCount,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get all patterns from .gitignore with enhanced parsing
   * @returns {object} Parsed gitignore content
   */
  getAllPatterns() {
    try {
      const content = readFileSync(this.gitignorePath, 'utf8');
      const lines = content.split('\n');

      const patterns = [];
      const comments = [];
      const sections = {};
      let currentSection = 'general';

      for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed === '') {
          continue;
        }

        if (trimmed.startsWith('#')) {
          comments.push(trimmed);
          // Check if this is a section header
          if (!trimmed.includes('(') && !trimmed.includes(')')) {
            currentSection = trimmed.substring(1).trim().toLowerCase();
            sections[currentSection] = [];
          }
        } else {
          patterns.push(trimmed);
          if (!sections[currentSection]) {
            sections[currentSection] = [];
          }
          sections[currentSection].push(trimmed);
        }
      }

      return {
        patterns,
        comments,
        sections,
        autoManaged: this.getCurrentManagedPaths(),
        valid: this.validator.validatePatterns(patterns).valid,
      };
    } catch {
      return {
        patterns: [],
        comments: [],
        sections: {},
        autoManaged: [],
        valid: true,
      };
    }
  }

  /**
   * Validate current .gitignore file
   * @returns {object} Validation result
   */
  validateCurrentFile() {
    const { patterns } = this.getAllPatterns();
    return this.validator.validatePatterns(patterns);
  }

  /**
   * Get suggestions for improving current .gitignore
   * @returns {object} Improvement suggestions
   */
  getSuggestions() {
    const { patterns } = this.getAllPatterns();
    return this.validator.suggestCorrections(patterns);
  }
}

/**
 * Export the GitIgnoreManager class as default
 */
export default GitIgnoreManager;
