/**
 * CLI Colors Utility
 * ANSI color codes and color management for terminal output
 * Extracted from cli-interface.js for modularity
 */

// ANSI colors for better UX
export const colors = {
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

/**
 * Color utility class for managing terminal colors
 */
export class ColorManager {
  constructor(enableColors = true) {
    this.enabled = enableColors;
  }

  /**
   * Apply color to text
   * @param {string} text - Text to colorize
   * @param {string} color - Color name
   * @returns {string} Colorized text
   */
  colorize(text, color = 'reset') {
    if (!this.enabled) {
      return text;
    }

    const colorCode = colors[color] || colors.reset;
    return `${colorCode}${text}${colors.reset}`;
  }

  /**
   * Get color code
   * @param {string} color - Color name
   * @returns {string} ANSI color code
   */
  getColorCode(color) {
    return this.enabled ? colors[color] || colors.reset : '';
  }

  /**
   * Enable or disable colors
   * @param {boolean} enable - Whether to enable colors
   */
  setEnabled(enable) {
    this.enabled = enable;
  }

  /**
   * Check if colors are enabled
   * @returns {boolean} Whether colors are enabled
   */
  isEnabled() {
    return this.enabled;
  }
}

/**
 * Default color manager instance
 */
export const defaultColorManager = new ColorManager();

/**
 * Quick color helper functions
 */
export const colorize = {
  red: text => defaultColorManager.colorize(text, 'red'),
  green: text => defaultColorManager.colorize(text, 'green'),
  blue: text => defaultColorManager.colorize(text, 'blue'),
  yellow: text => defaultColorManager.colorize(text, 'yellow'),
  cyan: text => defaultColorManager.colorize(text, 'cyan'),
  bold: text => defaultColorManager.colorize(text, 'bold'),
  reset: text => defaultColorManager.colorize(text, 'reset'),
};
