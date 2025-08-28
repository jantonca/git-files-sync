/**
 * Logger Utility
 * Centralized logging with color support and different levels
 * Extracted from various logging patterns across the codebase
 */

// ANSI colors for console output
const COLORS = {
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  underline: '\x1b[4m',
};

// Log level icons
const ICONS = {
  info: 'ℹ️',
  success: '✅',
  warning: '⚠️',
  error: '❌',
  debug: '🔍',
  progress: '🔄',
  config: '📋',
  file: '📁',
  git: '🔗',
  cache: '💾',
  performance: '⚡',
  framework: '🎯',
};

/**
 * Logger class with color support and different log levels
 */
export class Logger {
  constructor(options = {}) {
    this.enableColors = options.enableColors !== false; // Colors enabled by default
    this.enableIcons = options.enableIcons !== false; // Icons enabled by default
    this.logLevel = options.logLevel || 'info'; // Default log level
    this.prefix = options.prefix || ''; // Optional prefix for all messages
  }

  /**
   * Apply color to text if colors are enabled
   * @param {string} text - Text to colorize
   * @param {string} color - Color name
   * @returns {string} Colorized text
   */
  colorize(text, color = 'reset') {
    if (!this.enableColors) return text;
    return `${COLORS[color]}${text}${COLORS.reset}`;
  }

  /**
   * Get icon for message type
   * @param {string} type - Message type
   * @returns {string} Icon or empty string
   */
  getIcon(type) {
    if (!this.enableIcons) return '';
    return ICONS[type] ? `${ICONS[type]} ` : '';
  }

  /**
   * Format message with prefix, icon, and color
   * @param {string} message - Message to format
   * @param {string} type - Message type
   * @param {string} color - Color name
   * @returns {string} Formatted message
   */
  formatMessage(message, type = 'info', color = 'reset') {
    const icon = this.getIcon(type);
    const prefix = this.prefix ? `[${this.prefix}] ` : '';
    const coloredMessage = this.colorize(message, color);
    return `${prefix}${icon}${coloredMessage}`;
  }

  /**
   * Generic log method
   * @param {string} message - Message to log
   * @param {string} type - Message type
   * @param {string} color - Color name
   */
  log(message, type = 'info', color = 'reset') {
    const formattedMessage = this.formatMessage(message, type, color);
    console.log(formattedMessage);
  }

  /**
   * Info log (blue)
   * @param {string} message - Message to log
   */
  info(message) {
    this.log(message, 'info', 'blue');
  }

  /**
   * Success log (green)
   * @param {string} message - Message to log
   */
  success(message) {
    this.log(message, 'success', 'green');
  }

  /**
   * Warning log (yellow)
   * @param {string} message - Message to log
   */
  warn(message) {
    this.log(message, 'warning', 'yellow');
  }

  /**
   * Error log (red)
   * @param {string} message - Message to log
   */
  error(message) {
    this.log(message, 'error', 'red');
  }

  /**
   * Debug log (gray)
   * @param {string} message - Message to log
   */
  debug(message) {
    if (this.logLevel === 'debug') {
      this.log(message, 'debug', 'gray');
    }
  }

  /**
   * Progress log (cyan)
   * @param {string} message - Message to log
   */
  progress(message) {
    this.log(message, 'progress', 'cyan');
  }

  /**
   * Configuration log (magenta)
   * @param {string} message - Message to log
   */
  config(message) {
    this.log(message, 'config', 'magenta');
  }

  /**
   * Framework detection log (bold green)
   * @param {string} framework - Framework name
   */
  framework(framework) {
    this.log(`Detected framework: ${framework}`, 'framework', 'bold');
  }

  /**
   * Performance log (yellow)
   * @param {string} message - Message to log
   */
  performance(message) {
    this.log(message, 'performance', 'yellow');
  }

  /**
   * Create a new logger instance with prefix
   * @param {string} prefix - Prefix for the new logger
   * @returns {Logger} New logger instance
   */
  withPrefix(prefix) {
    return new Logger({
      enableColors: this.enableColors,
      enableIcons: this.enableIcons,
      logLevel: this.logLevel,
      prefix: this.prefix ? `${this.prefix}:${prefix}` : prefix,
    });
  }
}

/**
 * Default logger instance
 */
export const logger = new Logger();

/**
 * Export individual logging functions for convenience
 */
export const info = (...args) => logger.info(...args);
export const success = (...args) => logger.success(...args);
export const warn = (...args) => logger.warn(...args);
export const error = (...args) => logger.error(...args);
export const debug = (...args) => logger.debug(...args);
export const progress = (...args) => logger.progress(...args);
export const config = (...args) => logger.config(...args);
export const framework = (...args) => logger.framework(...args);
export const performance = (...args) => logger.performance(...args);

/**
 * Export colors for direct use
 */
export { COLORS, ICONS };
