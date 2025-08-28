/**
 * CLI Prompts Utility
 * User interaction, prompts, confirmations, and input validation
 * Extracted from cli-interface.js for modularity
 */

import readline from 'readline';

/**
 * CLI Prompts Manager for user interaction
 */
export class CLIPromptsManager {
  constructor() {
    this.rl = null;
  }

  /**
   * Create readline interface
   * @returns {readline.Interface} Readline interface
   */
  createInterface() {
    return readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  /**
   * Prompt user for input
   * @param {string} question - Question to ask
   * @returns {Promise<string>} User input
   */
  prompt(question) {
    const rl = this.createInterface();
    return new Promise(resolve => {
      rl.question(question, answer => {
        rl.close();
        resolve(answer.trim());
      });
    });
  }

  /**
   * Confirm action with user
   * @param {string} message - Confirmation message
   * @param {boolean} defaultValue - Default value (true = Y, false = N)
   * @returns {Promise<boolean>} User confirmation
   */
  async confirm(message, defaultValue = false) {
    const defaultText = defaultValue ? '[Y/n]' : '[y/N]';
    const response = await this.prompt(`${message} ${defaultText}: `);

    if (response === '') {
      return defaultValue;
    }

    return response.toLowerCase() === 'y' || response.toLowerCase() === 'yes';
  }

  /**
   * Select from list of options
   * @param {string[]} options - List of options
   * @param {string} message - Selection message
   * @param {Function} displayCallback - Callback to display options (optional)
   * @returns {Promise<number|null>} Selected index or null if cancelled
   */
  async selectFromList(
    options,
    message = 'Select an option',
    displayCallback = null
  ) {
    if (options.length === 0) {
      console.log('❌ No options available');
      return null;
    }

    // Display options using callback or default display
    if (displayCallback) {
      displayCallback(options, message);
    } else {
      console.log(`\n${message}:`);
      options.forEach((option, index) => {
        console.log(`   ${index + 1}. ${option}`);
      });
    }

    while (true) {
      const input = await this.prompt(
        `\n🔢 Select option [1-${options.length}] or 'cancel': `
      );

      if (input.toLowerCase() === 'cancel') {
        return null;
      }

      const num = parseInt(input);
      if (isNaN(num) || num < 1 || num > options.length) {
        console.log(`❌ Please enter a number between 1 and ${options.length}`);
        continue;
      }

      return num - 1; // Return 0-based index
    }
  }

  /**
   * Input validation with retry
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
    while (true) {
      const input = await this.prompt(question);

      try {
        if (validator(input)) {
          return input;
        }
      } catch (error) {
        console.log(`❌ ${error.message}`);
        continue;
      }

      console.log(`❌ ${errorMessage}`);
    }
  }

  /**
   * Multi-choice selection with validation
   * @param {string} question - Question to ask
   * @param {string[]} choices - Valid choices
   * @param {boolean} caseSensitive - Whether choices are case-sensitive
   * @returns {Promise<string>} Selected choice
   */
  async multiChoice(question, choices, caseSensitive = false) {
    const validator = input => {
      const normalizedInput = caseSensitive ? input : input.toLowerCase();
      const normalizedChoices = caseSensitive
        ? choices
        : choices.map(c => c.toLowerCase());
      return normalizedChoices.includes(normalizedInput);
    };

    const choicesDisplay = choices.join(', ');
    const fullQuestion = `${question} (${choicesDisplay}): `;
    const errorMessage = `Please enter one of: ${choicesDisplay}`;

    const result = await this.inputWithValidation(
      fullQuestion,
      validator,
      errorMessage
    );
    return caseSensitive ? result : result.toLowerCase();
  }

  /**
   * Number input with range validation
   * @param {string} question - Question to ask
   * @param {number} min - Minimum value (optional)
   * @param {number} max - Maximum value (optional)
   * @returns {Promise<number>} Valid number
   */
  async numberInput(question, min = null, max = null) {
    const validator = input => {
      const num = parseFloat(input);
      if (isNaN(num)) {
        throw new Error('Please enter a valid number');
      }
      if (min !== null && num < min) {
        throw new Error(`Number must be at least ${min}`);
      }
      if (max !== null && num > max) {
        throw new Error(`Number must be at most ${max}`);
      }
      return true;
    };

    let rangeText = '';
    if (min !== null && max !== null) {
      rangeText = ` (${min}-${max})`;
    } else if (min !== null) {
      rangeText = ` (min: ${min})`;
    } else if (max !== null) {
      rangeText = ` (max: ${max})`;
    }

    const fullQuestion = `${question}${rangeText}: `;
    const result = await this.inputWithValidation(fullQuestion, validator);
    return parseFloat(result);
  }

  /**
   * Path input with existence validation
   * @param {string} question - Question to ask
   * @param {boolean} mustExist - Whether path must exist
   * @param {string} type - Type of path ('file', 'directory', 'any')
   * @returns {Promise<string>} Valid path
   */
  async pathInput(question, mustExist = false, type = 'any') {
    const fs = await import('fs');

    const validator = input => {
      if (!input) {
        throw new Error('Path cannot be empty');
      }

      if (mustExist) {
        if (!fs.existsSync(input)) {
          throw new Error('Path does not exist');
        }

        const stats = fs.statSync(input);
        if (type === 'file' && !stats.isFile()) {
          throw new Error('Path must be a file');
        }
        if (type === 'directory' && !stats.isDirectory()) {
          throw new Error('Path must be a directory');
        }
      }

      return true;
    };

    return await this.inputWithValidation(`${question}: `, validator);
  }
}

/**
 * Default prompts manager instance
 */
export const defaultPromptsManager = new CLIPromptsManager();

/**
 * Quick prompt helper functions
 */
export const prompt = question => defaultPromptsManager.prompt(question);
export const confirm = (message, defaultValue) =>
  defaultPromptsManager.confirm(message, defaultValue);
export const selectFromList = (options, message, displayCallback) =>
  defaultPromptsManager.selectFromList(options, message, displayCallback);
export const inputWithValidation = (question, validator, errorMessage) =>
  defaultPromptsManager.inputWithValidation(question, validator, errorMessage);
export const multiChoice = (question, choices, caseSensitive) =>
  defaultPromptsManager.multiChoice(question, choices, caseSensitive);
export const numberInput = (question, min, max) =>
  defaultPromptsManager.numberInput(question, min, max);
export const pathInput = (question, mustExist, type) =>
  defaultPromptsManager.pathInput(question, mustExist, type);
