import { ColorManager } from './cli-colors.js';
import { CLIPromptsManager } from './cli-prompts.js';
import { existsSync } from 'fs';

const ERROR_TYPES = {
  FILE_NOT_FOUND: 'file_not_found',
  PERMISSION_DENIED: 'permission_denied',
  INVALID_CONFIG: 'invalid_config',
  NETWORK_ERROR: 'network_error',
  GIT_ERROR: 'git_error',
  VALIDATION_ERROR: 'validation_error',
};

const SUGGESTIONS = {
  [ERROR_TYPES.FILE_NOT_FOUND]:
    'Check if the file path is correct and the file exists',
  [ERROR_TYPES.PERMISSION_DENIED]:
    'Run with appropriate permissions or check file ownership',
  [ERROR_TYPES.INVALID_CONFIG]: 'Run setup again or check configuration format',
  [ERROR_TYPES.NETWORK_ERROR]:
    'Check internet connection and repository access',
  [ERROR_TYPES.GIT_ERROR]:
    'Verify git is installed and repository is accessible',
  [ERROR_TYPES.VALIDATION_ERROR]: 'Review input format and try again',
};

export class ErrorHandler {
  constructor(options = {}) {
    this.colorManager = new ColorManager(options.colors !== false);
    this.verbose = options.verbose || false;
  }

  classify(error) {
    const message = error.message?.toLowerCase() || '';

    if (message.includes('enoent') || message.includes('not found'))
      return ERROR_TYPES.FILE_NOT_FOUND;
    if (message.includes('eacces') || message.includes('permission'))
      return ERROR_TYPES.PERMISSION_DENIED;
    if (message.includes('config') || message.includes('parse'))
      return ERROR_TYPES.INVALID_CONFIG;
    if (message.includes('network') || message.includes('timeout'))
      return ERROR_TYPES.NETWORK_ERROR;
    if (message.includes('git') || message.includes('repository'))
      return ERROR_TYPES.GIT_ERROR;

    return ERROR_TYPES.VALIDATION_ERROR;
  }

  format(error, context = {}) {
    const type = this.classify(error);
    const suggestion = SUGGESTIONS[type];

    return {
      type,
      message: error.message,
      suggestion,
      context,
      stack: this.verbose ? error.stack : null,
    };
  }

  display(error, context = {}) {
    const formatted = this.format(error, context);

    console.log(
      this.colorManager.colorize(`❌ Error: ${formatted.message}`, 'red')
    );
    console.log(
      this.colorManager.colorize(
        `💡 Suggestion: ${formatted.suggestion}`,
        'yellow'
      )
    );

    if (formatted.context.file) {
      console.log(
        this.colorManager.colorize(`📁 File: ${formatted.context.file}`, 'cyan')
      );
    }

    if (this.verbose && formatted.stack) {
      console.log(this.colorManager.colorize('\nStack trace:', 'gray'));
      console.log(formatted.stack);
    }
  }

  async recovery(error, options = {}) {
    const type = this.classify(error);

    switch (type) {
      case ERROR_TYPES.FILE_NOT_FOUND:
        return this._handleFileNotFound(error, options);
      case ERROR_TYPES.INVALID_CONFIG:
        return this._handleInvalidConfig(error, options);
      default:
        return false;
    }
  }

  async _handleFileNotFound(error, options) {
    if (options.createIfMissing && options.defaultContent) {
      console.log(
        this.colorManager.colorize(
          '🔧 Creating missing file with defaults...',
          'blue'
        )
      );
      return { action: 'create', content: options.defaultContent };
    }
    return false;
  }

  async _handleInvalidConfig(error, options) {
    if (options.resetConfig) {
      console.log(
        this.colorManager.colorize('🔄 Resetting configuration...', 'blue')
      );
      return { action: 'reset' };
    }
    return false;
  }
}

export class InputValidator {
  constructor(options = {}) {
    this.colorManager = new ColorManager(options.colors !== false);
    this.prompts = new CLIPromptsManager();
  }

  async validateAndPrompt(value, rules, message, options = {}) {
    while (true) {
      const validation = this.validate(value, rules);

      if (validation.valid) return value;

      console.log(this.colorManager.colorize(`❌ ${validation.error}`, 'red'));
      if (validation.suggestion) {
        console.log(
          this.colorManager.colorize(`💡 ${validation.suggestion}`, 'yellow')
        );
      }

      if (options.allowSkip) {
        console.log(this.colorManager.colorize('Press Enter to skip', 'gray'));
      }

      value = await this.prompts.prompt(message);
      if (!value && options.allowSkip) return null;
    }
  }

  validate(value, rules) {
    for (const rule of rules) {
      const result = this._applyRule(value, rule);
      if (!result.valid) return result;
    }
    return { valid: true };
  }

  _applyRule(value, rule) {
    switch (rule.type) {
      case 'required':
        return value
          ? { valid: true }
          : {
              valid: false,
              error: rule.message || 'This field is required',
              suggestion: 'Please provide a value',
            };

      case 'url':
        return this._validateUrl(value, rule);

      case 'path':
        return this._validatePath(value, rule);

      case 'pattern':
        return rule.pattern.test(value)
          ? { valid: true }
          : {
              valid: false,
              error: rule.message || 'Invalid format',
              suggestion: rule.suggestion,
            };

      default:
        return { valid: true };
    }
  }

  _validateUrl(value, rule) {
    try {
      const url = new globalThis.URL(value);
      const allowedProtocols = rule.protocols || ['http:', 'https:', 'git:'];

      if (!allowedProtocols.includes(url.protocol)) {
        return {
          valid: false,
          error: `Invalid protocol: ${url.protocol}`,
          suggestion: `Use one of: ${allowedProtocols.join(', ')}`,
        };
      }

      return { valid: true };
    } catch {
      return {
        valid: false,
        error: 'Invalid URL format',
        suggestion:
          'Use format: https://example.com or git@bitbucket.org:user/repo.git',
      };
    }
  }

  _validatePath(value, rule) {
    if (rule.mustExist && !existsSync(value)) {
      return {
        valid: false,
        error: `Path does not exist: ${value}`,
        suggestion: 'Check the path and try again',
      };
    }

    return { valid: true };
  }
}

export class ConfigValidator {
  constructor(options = {}) {
    this.colorManager = new ColorManager(options.colors !== false);
  }

  async validateConfig(config, schema) {
    const errors = [];
    await this._validateObject(config, schema, '', errors);

    return {
      valid: errors.length === 0,
      errors,
      summary: this._formatSummary(errors),
    };
  }

  async _validateObject(obj, schema, path, errors) {
    for (const [key, rules] of Object.entries(schema)) {
      const currentPath = path ? `${path}.${key}` : key;
      const value = obj?.[key];

      if (rules.required && (value === undefined || value === null)) {
        errors.push({
          path: currentPath,
          error: `Required field missing: ${key}`,
          suggestion: rules.suggestion || `Add ${key} to configuration`,
        });
        continue;
      }

      if (value !== undefined && rules.type) {
        const typeValid = this._validateType(value, rules.type);
        if (!typeValid.valid) {
          errors.push({
            path: currentPath,
            error: typeValid.error,
            suggestion: typeValid.suggestion,
          });
        }
      }

      if (rules.validate && typeof rules.validate === 'function') {
        try {
          const customResult = await rules.validate(value);
          if (!customResult.valid) {
            errors.push({
              path: currentPath,
              error: customResult.error,
              suggestion: customResult.suggestion,
            });
          }
        } catch (error) {
          errors.push({
            path: currentPath,
            error: `Validation failed: ${error.message}`,
            suggestion: 'Check validation logic',
          });
        }
      }
    }
  }

  _validateType(value, expectedType) {
    const actualType = Array.isArray(value) ? 'array' : typeof value;

    if (actualType !== expectedType) {
      return {
        valid: false,
        error: `Expected ${expectedType}, got ${actualType}`,
        suggestion: `Convert value to ${expectedType}`,
      };
    }

    return { valid: true };
  }

  _formatSummary(errors) {
    if (errors.length === 0) return 'Configuration is valid';

    return `Found ${errors.length} error(s) in configuration`;
  }

  displayErrors(errors) {
    if (errors.length === 0) {
      console.log(
        this.colorManager.colorize('✅ Configuration is valid', 'green')
      );
      return;
    }

    console.log(
      this.colorManager.colorize(
        `❌ Configuration has ${errors.length} error(s):`,
        'red'
      )
    );
    console.log('');

    errors.forEach((error, index) => {
      console.log(
        this.colorManager.colorize(`${index + 1}. ${error.path}:`, 'cyan')
      );
      console.log(`   ${this.colorManager.colorize(error.error, 'red')}`);
      console.log(
        `   ${this.colorManager.colorize(`💡 ${error.suggestion}`, 'yellow')}`
      );
      console.log('');
    });
  }
}
