import { ColorManager } from './cli-colors.js';
import {
  ErrorHandler,
  InputValidator,
  ConfigValidator,
} from './cli-validation.js';
import {
  InteractiveMenu,
  PathCompleter,
  ConfirmationDialog,
  SmartDefaults,
} from './cli-interactive.js';
import { PerformanceManager, Logger } from './cli-performance.js';

const ICONS = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
  pending: '⏳',
  skipped: '⏭️',
};

const STATUS_COLORS = {
  success: 'green',
  error: 'red',
  warning: 'yellow',
  info: 'blue',
  pending: 'cyan',
  skipped: 'gray',
};

export class ProgressBar {
  constructor(total, options = {}) {
    Object.assign(this, {
      total,
      current: 0,
      startTime: Date.now(),
      width: options.width || 40,
      title: options.title || 'Progress',
      colorManager: new ColorManager(options.colors !== false),
      stream: options.stream || process.stdout,
    });
  }

  update(current, status = '') {
    this.current = current;
    const percentage = Math.round((current / this.total) * 100);
    const filled = Math.round((current / this.total) * this.width);
    const bar =
      '█'.repeat(filled) + '░'.repeat(Math.max(0, this.width - filled));
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);

    const line = `${this.title}: [${this.colorManager.colorize(bar, 'cyan')}] ${percentage}% (${current}/${this.total}) ${elapsed}s ${status}`;

    // Only use clearLine/cursorTo if stream supports it (TTY) and is writable
    if (
      this.stream.isTTY &&
      typeof this.stream.clearLine === 'function' &&
      this.stream.writable
    ) {
      try {
        this.stream.clearLine(0);
        this.stream.cursorTo(0);
        this.stream.write(line);
      } catch (error) {
        // Handle EPIPE and other write errors gracefully
        if (error.code === 'EPIPE' || error.code === 'ECONNRESET') {
          return; // Just stop writing, don't throw
        }
      }
    } else if (this.stream.writable) {
      // For non-TTY environments, just write the line with newline
      try {
        this.stream.write(line + '\n');
      } catch (error) {
        // Handle EPIPE and other write errors gracefully
        if (error.code === 'EPIPE' || error.code === 'ECONNRESET') {
          return; // Just stop writing, don't throw
        }
      }
    }
  }

  complete(message = 'Complete!') {
    this.update(this.total);
    if (this.stream.isTTY && this.stream.writable) {
      try {
        this.stream.write('\n');
      } catch (error) {
        // Handle EPIPE errors gracefully
        if (error.code !== 'EPIPE' && error.code !== 'ECONNRESET') {
          console.error('Error writing to stream:', error.message);
        }
      }
    }
    console.log(this.colorManager.colorize(`✅ ${message}`, 'green'));
  }

  fail(message = 'Failed!') {
    if (this.stream.isTTY && this.stream.writable) {
      try {
        this.stream.write('\n');
      } catch (error) {
        // Handle EPIPE errors gracefully
        if (error.code !== 'EPIPE' && error.code !== 'ECONNRESET') {
          console.error('Error writing to stream:', error.message);
        }
      }
    }
    console.log(this.colorManager.colorize(`❌ ${message}`, 'red'));
  }
}

export class Spinner {
  constructor(text = 'Processing...', options = {}) {
    Object.assign(this, {
      text,
      frameIndex: 0,
      interval: null,
      startTime: Date.now(),
      frames: options.frames || [
        '⠋',
        '⠙',
        '⠹',
        '⠸',
        '⠼',
        '⠴',
        '⠦',
        '⠧',
        '⠇',
        '⠏',
      ],
      colorManager: new ColorManager(options.colors !== false),
      stream: options.stream || process.stdout,
    });
  }

  start() {
    if (this.interval) return;
    this.interval = globalThis.setInterval(() => {
      const frame = this.frames[this.frameIndex];
      const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
      const line = `${this.colorManager.colorize(frame, 'cyan')} ${this.text} (${elapsed}s)`;

      // Only use clearLine/cursorTo if stream supports it (TTY) and is writable
      if (
        this.stream.isTTY &&
        typeof this.stream.clearLine === 'function' &&
        this.stream.writable
      ) {
        try {
          this.stream.clearLine(0);
          this.stream.cursorTo(0);
          this.stream.write(line);
        } catch (error) {
          // Handle EPIPE and other write errors gracefully
          if (error.code === 'EPIPE' || error.code === 'ECONNRESET') {
            this.stop(); // Stop the spinner to prevent further errors
            return;
          }
          // For other errors, just stop silently
          this.stop();
        }
      } else if (this.stream.writable) {
        // For non-TTY environments, just write the line with newline
        try {
          this.stream.write(line + '\n');
        } catch (error) {
          // Handle EPIPE and other write errors gracefully
          if (error.code === 'EPIPE' || error.code === 'ECONNRESET') {
            this.stop();
            return;
          }
          this.stop();
        }
      }

      this.frameIndex = (this.frameIndex + 1) % this.frames.length;
    }, 100);
  }

  setText(text) {
    this.text = text;
  }

  _finish(icon, color, message) {
    this.stop();
    console.log(this.colorManager.colorize(`${icon} ${message}`, color));
  }

  succeed(message = 'Done!') {
    this._finish('✅', 'green', message);
  }
  fail(message = 'Failed!') {
    this._finish('❌', 'red', message);
  }
  warn(message = 'Warning!') {
    this._finish('⚠️', 'yellow', message);
  }
  info(message = 'Info') {
    this._finish('ℹ️', 'blue', message);
  }

  stop() {
    if (this.interval) {
      globalThis.clearInterval(this.interval);
      this.interval = null;

      // Only use clearLine/cursorTo if stream supports it (TTY) and is writable
      if (
        this.stream.isTTY &&
        typeof this.stream.clearLine === 'function' &&
        this.stream.writable
      ) {
        try {
          this.stream.clearLine(0);
          this.stream.cursorTo(0);
        } catch (error) {
          // Handle EPIPE errors gracefully - just ignore them on cleanup
          if (error.code !== 'EPIPE' && error.code !== 'ECONNRESET') {
            console.error('Error clearing line:', error.message);
          }
        }
      }
    }
  }
}

export class FormattingUtils {
  constructor(options = {}) {
    this.colorManager = new ColorManager(options.colors !== false);
  }

  header(title, color = 'cyan') {
    const line = '='.repeat(title.length + 4);
    console.log(this.colorManager.colorize(line, color));
    console.log(this.colorManager.colorize(`  ${title}  `, color));
    console.log(this.colorManager.colorize(line, color));
    console.log('');
  }

  subheader(title, color = 'blue') {
    console.log(this.colorManager.colorize(`\n📋 ${title}`, color));
    console.log(
      this.colorManager.colorize('-'.repeat(title.length + 4), color)
    );
  }

  table(items, options = {}) {
    const maxLabelLength = Math.max(...items.map(item => item.label.length));
    const separator = options.separator || ': ';
    items.forEach(item => {
      const paddedLabel = item.label.padEnd(maxLabelLength);
      console.log(
        `${this.colorManager.colorize(paddedLabel, 'cyan')}${separator}${item.value}`
      );
    });
  }

  statusList(items) {
    items.forEach(item => {
      const icon = ICONS[item.status] || ICONS.info;
      const color = STATUS_COLORS[item.status] || 'reset';
      console.log(`${this.colorManager.colorize(icon, color)} ${item.message}`);
    });
  }
}

export class EnhancedCLI {
  constructor(options = {}) {
    this.colorManager = new ColorManager(options.colors !== false);
    this.formatting = new FormattingUtils(options);
    this.errorHandler = new ErrorHandler(options);
    this.validator = new InputValidator(options);
    this.configValidator = new ConfigValidator(options);
    this.menu = new InteractiveMenu(options);
    this.pathCompleter = new PathCompleter(options);
    this.confirmation = new ConfirmationDialog(options);
    this.smartDefaults = new SmartDefaults(options);
    this.performance = new PerformanceManager(options);
    this.logger = new Logger(options);
  }

  createProgressBar(total, options = {}) {
    return new ProgressBar(total, {
      ...options,
      colors: this.colorManager.enabled,
    });
  }

  createSpinner(text, options = {}) {
    return new Spinner(text, { ...options, colors: this.colorManager.enabled });
  }

  async handleError(error, context = {}, recoveryOptions = {}) {
    this.errorHandler.display(error, context);

    if (recoveryOptions.allowRecovery) {
      const recovery = await this.errorHandler.recovery(error, recoveryOptions);
      return recovery;
    }

    return false;
  }

  async validateInput(value, rules, message, options = {}) {
    return this.validator.validateAndPrompt(value, rules, message, options);
  }

  async validateConfig(config, schema) {
    const result = await this.configValidator.validateConfig(config, schema);
    this.configValidator.displayErrors(result.errors);
    return result;
  }

  async selectFromMenu(items, options = {}) {
    return this.menu.selectFromMenu(items, options);
  }

  async multiSelect(items, options = {}) {
    return this.menu.multiSelect(items, options);
  }

  async promptPath(message, options = {}) {
    return this.pathCompleter.promptWithCompletion(message, options);
  }

  async confirm(message, options = {}) {
    return this.confirmation.confirm(message, options);
  }

  async confirmMultiple(actions, options = {}) {
    return this.confirmation.confirmMultiple(actions, options);
  }

  detectFramework() {
    return this.smartDefaults.detectFramework();
  }

  getSmartDefaults(framework) {
    return this.smartDefaults.getDefaultPaths(framework);
  }

  // Interactive path completion
  async getPathWithCompletion(prompt, defaultPath = '') {
    return this.pathCompleter.promptWithCompletion(prompt, {
      defaultValue: defaultPath,
    });
  }

  // Confirmation dialogs
  async showConfirmation(message, defaultValue = true) {
    return this.confirmation.confirm(message, defaultValue);
  }

  _message(icon, color, message) {
    console.log(this.colorManager.colorize(`${icon} ${message}`, color));
  }

  success(message) {
    this._message('✅', 'green', message);
  }
  error(message) {
    this._message('❌', 'red', message);
  }
  warning(message) {
    this._message('⚠️', 'yellow', message);
  }
  info(message) {
    this._message('ℹ️', 'blue', message);
  }

  // Performance monitoring methods
  async timeOperation(operation, fn) {
    return this.performance.timeOperation(operation, fn);
  }

  generatePerformanceReport() {
    return this.performance.generateReport();
  }

  getMemoryUsage() {
    return this.performance.monitor.getMemoryUsage();
  }

  recordCacheOperation(type, key, hit = false) {
    this.performance.cacheAnalyzer.recordOperation(type, key, hit);
  }

  getCacheStats() {
    return this.performance.cacheAnalyzer.getStats();
  }

  // Advanced logging methods
  debug(message, data = null) {
    this.logger.debug(message, data);
  }

  logInfo(message, data = null) {
    this.logger.info(message, data);
  }

  logWarning(message, data = null) {
    this.logger.warn(message, data);
  }

  logError(message, data = null) {
    this.logger.error(message, data);
  }

  getLogHistory(level = null) {
    return this.logger.getHistory(level);
  }
}
