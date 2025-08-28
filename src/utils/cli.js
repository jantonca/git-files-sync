/**
 * CLI Interface Manager
 * Main CLI interface with display methods and user interaction coordination
 * Extracted from cli-interface.js for modularity
 */

import fs from 'fs';
import path from 'path';
import { ColorManager, colors } from './cli-colors.js';
import { CLIPromptsManager } from './cli-prompts.js';

/**
 * Main CLI Interface Manager
 * Coordinates display methods, logging, and user interaction
 */
export class CLIInterfaceManager {
  constructor(options = {}) {
    this.colorManager = new ColorManager(options.colors !== false);
    this.promptsManager = new CLIPromptsManager();
  }

  /**
   * Log message with color
   * @param {string} message - Message to log
   * @param {string} color - Color name
   */
  log(message, color = 'reset') {
    if (this.colorManager.isEnabled()) {
      console.log(`${colors[color]}${message}${colors.reset}`);
    } else {
      console.log(message);
    }
  }

  /**
   * Create readline interface (delegated to prompts manager)
   * @returns {readline.Interface} Readline interface
   */
  createInterface() {
    return this.promptsManager.createInterface();
  }

  /**
   * Prompt user for input (delegated to prompts manager)
   * @param {string} question - Question to ask
   * @returns {Promise<string>} User input
   */
  prompt(question) {
    return this.promptsManager.prompt(question);
  }

  /**
   * Confirm action with user (delegated to prompts manager)
   * @param {string} message - Confirmation message
   * @param {boolean} defaultValue - Default value (true = Y, false = N)
   * @returns {Promise<boolean>} User confirmation
   */
  async confirm(message, defaultValue = false) {
    return this.promptsManager.confirm(message, defaultValue);
  }

  /**
   * Select from list of options (delegated to prompts manager)
   * @param {string[]} options - List of options
   * @param {string} message - Selection message
   * @returns {Promise<number|null>} Selected index or null if cancelled
   */
  async selectFromList(options, message = 'Select an option') {
    return this.promptsManager.selectFromList(options, message, (opts, msg) =>
      this._displaySelectionOptions(opts, msg)
    );
  }

  /**
   * Input validation with retry (delegated to prompts manager)
   * @param {string} question - Question to ask
   * @param {Function} validator - Validation function
   * @param {string} errorMessage - Error message for invalid input
   * @returns {Promise<string>} Valid input
   */
  async inputWithValidation(
    question,
    validator,
    errorMessage = 'Invalid input'
  ) {
    return this.promptsManager.inputWithValidation(
      question,
      validator,
      errorMessage
    );
  }

  /**
   * Display selection options (helper for selectFromList)
   * @param {string[]} options - List of options
   * @param {string} message - Selection message
   * @private
   */
  _displaySelectionOptions(options, message) {
    this.log(`\n${message}:`, 'blue');
    options.forEach((option, index) => {
      this.log(`   ${index + 1}. ${option}`, 'cyan');
    });
  }

  /**
   * Display help information
   * @param {object} commands - Available commands
   */
  displayHelp(commands = {}) {
    this.log('\n📋 Available commands:', 'blue');

    const defaultCommands = {
      add: 'Add new content folder mapping',
      remove: 'Remove content folder mapping',
      list: 'Show current content mappings',
      ...commands,
    };

    Object.entries(defaultCommands).forEach(([command, description]) => {
      this.log(`   ${command.padEnd(10)} - ${description}`, 'cyan');
    });

    this.log('\n💡 Examples:', 'yellow');
    this.log('   node git-files-sync/content-manager.js add', 'cyan');
    this.log('   node git-files-sync/content-manager.js remove', 'cyan');
    this.log('   node git-files-sync/content-manager.js list', 'cyan');
  }

  /**
   * Display current mappings with formatting
   * @param {object} mappings - Content mappings
   * @param {object} options - Display options
   */
  displayMappings(mappings, options = {}) {
    const {
      title = 'Current Content Mappings',
      showStatus = false,
      projectRoot = process.cwd(),
    } = options;

    this.log(`\n📋 ${title}`, 'bold');
    this.log('═'.repeat(Math.max(50, title.length + 10)), 'cyan');

    const entries = Object.entries(mappings);

    if (entries.length === 0) {
      this.log('❌ No content mappings found', 'red');
      return;
    }

    this.log('\n📁 Source → Destination:', 'blue');
    entries.forEach(([source, dest], index) => {
      let statusIcon = '';

      if (showStatus) {
        const exists = fs.existsSync(path.join(projectRoot, dest));
        statusIcon = exists ? '✅ ' : '❌ ';
      }

      this.log(`   ${index + 1}. ${statusIcon}${source} → ${dest}`, 'cyan');
    });

    if (showStatus) {
      this.log('\n💡 Legend:', 'yellow');
      this.log('   ✅ = Local folder exists', 'green');
      this.log(
        '   ❌ = Local folder missing (run "npm run content:fetch")',
        'red'
      );
    }
  }

  /**
   * Display operation result
   * @param {object} result - Operation result
   * @param {string} operation - Operation type
   */
  displayResult(result, operation = 'Operation') {
    if (result.success) {
      this.log(`\n✅ ${operation} completed successfully!`, 'green');

      if (result.added) {
        this.log(
          `📁 Added: ${result.added.source} → ${result.added.destination}`,
          'cyan'
        );
      }

      if (result.removed) {
        this.log(
          `🗑️  Removed: ${result.removed.source} → ${result.removed.destination}`,
          'cyan'
        );
      }
    } else {
      this.log(`\n❌ ${operation} failed:`, 'red');
      if (result.errors) {
        result.errors.forEach(error => {
          this.log(`   • ${error}`, 'red');
        });
      }
    }
  }

  /**
   * Display progress information
   * @param {string} message - Progress message
   * @param {number} current - Current progress
   * @param {number} total - Total items
   */
  displayProgress(message, current, total) {
    const percentage = Math.round((current / total) * 100);
    const progressBar =
      '█'.repeat(Math.floor(percentage / 5)) +
      '░'.repeat(20 - Math.floor(percentage / 5));

    this.log(
      `\r🔄 ${message}: [${progressBar}] ${percentage}% (${current}/${total})`,
      'blue'
    );
  }

  /**
   * Display warning message
   * @param {string} message - Warning message
   * @param {string[]} details - Additional details
   */
  displayWarning(message, details = []) {
    this.log(`\n⚠️  ${message}`, 'yellow');
    details.forEach(detail => {
      this.log(`   ${detail}`, 'cyan');
    });
  }

  /**
   * Display error message
   * @param {string} message - Error message
   * @param {string[]} details - Additional details
   */
  displayError(message, details = []) {
    this.log(`\n❌ ${message}`, 'red');
    details.forEach(detail => {
      this.log(`   ${detail}`, 'red');
    });
  }

  /**
   * Display success message
   * @param {string} message - Success message
   * @param {string[]} details - Additional details
   */
  displaySuccess(message, details = []) {
    this.log(`\n✅ ${message}`, 'green');
    details.forEach(detail => {
      this.log(`   ${detail}`, 'cyan');
    });
  }

  /**
   * Display information box
   * @param {string} title - Box title
   * @param {string[]} lines - Content lines
   * @param {string} color - Box color
   */
  displayInfoBox(title, lines, color = 'blue') {
    const maxLength = Math.max(title.length, ...lines.map(line => line.length));
    const width = Math.max(maxLength + 4, 40);
    const border = '═'.repeat(width);

    this.log(`\n╔${border}╗`, color);
    this.log(`║ ${title.padEnd(width - 2)} ║`, color);
    this.log(`╠${border}╣`, color);

    lines.forEach(line => {
      this.log(`║ ${line.padEnd(width - 2)} ║`, 'cyan');
    });

    this.log(`╚${border}╝`, color);
  }

  /**
   * Display command execution status
   * @param {string} command - Command being executed
   * @param {string} status - Status (starting, progress, complete, error)
   * @param {object} details - Additional details
   */
  displayCommandStatus(command, status, details = {}) {
    const statusIcons = {
      starting: '🚀',
      progress: '🔄',
      complete: '✅',
      error: '❌',
      warning: '⚠️',
    };

    const icon = statusIcons[status] || '📋';
    const timestamp = new Date().toLocaleTimeString();

    this.log(
      `${icon} [${timestamp}] ${command}`,
      status === 'error' ? 'red' : 'blue'
    );

    if (details.message) {
      this.log(`   ${details.message}`, 'cyan');
    }

    if (details.errors && details.errors.length > 0) {
      details.errors.forEach(error => {
        this.log(`   • ${error}`, 'red');
      });
    }
  }

  /**
   * Enable or disable colors
   * @param {boolean} enable - Whether to enable colors
   */
  setColors(enable) {
    this.colorManager.setEnabled(enable);
  }

  /**
   * Check if colors are enabled
   * @returns {boolean} Whether colors are enabled
   */
  hasColors() {
    return this.colorManager.isEnabled();
  }
}
