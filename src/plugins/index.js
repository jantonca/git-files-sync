/**
 * Plugin System Architecture - Extensible plugin framework
 * Phase 3: Advanced modularity and extensibility
 */
export class PluginManager {
  constructor(options = {}) {
    this.plugins = new Map();
    this.hooks = new Map();
    this.enabledPlugins = new Set();
    this.pluginConfig = options.config || {};
    this.logger = options.logger || console;
    this.enableValidation = options.enableValidation !== false;
  }

  /**
   * Register a plugin
   * @param {string} name - Plugin name
   * @param {object} plugin - Plugin definition
   * @returns {boolean} Success status
   */
  register(name, plugin) {
    try {
      // Validate plugin structure
      if (this.enableValidation && !this.validatePlugin(plugin)) {
        throw new Error(`Invalid plugin structure for ${name}`);
      }

      // Store plugin
      this.plugins.set(name, {
        ...plugin,
        name,
        registered: Date.now(),
        enabled: false,
      });

      return true;
    } catch (error) {
       
      console.error(`Failed to register plugin ${name}: ${error.message}`);
      return false;
    }
  }

  /**
   * Enable a plugin
   * @param {string} name - Plugin name
   * @param {object} config - Plugin configuration
   * @returns {Promise<boolean>} Success status
   */
  async enable(name, config = {}) {
    try {
      const plugin = this.plugins.get(name);
      if (!plugin) {
        throw new Error(`Plugin ${name} not found`);
      }

      if (this.enabledPlugins.has(name)) {
        return true; // Already enabled
      }

      // Check dependencies
      if (plugin.dependencies) {
        for (const dep of plugin.dependencies) {
          if (!this.enabledPlugins.has(dep)) {
            throw new Error(`Dependency ${dep} not enabled for plugin ${name}`);
          }
        }
      }

      // Initialize plugin
      if (plugin.initialize) {
        await plugin.initialize({
          config: { ...this.pluginConfig[name], ...config },
          manager: this,
        });
      }

      // Register hooks
      if (plugin.hooks) {
        this.registerHooks(name, plugin.hooks);
      }

      this.enabledPlugins.add(name);
      plugin.enabled = true;

      return true;
    } catch (error) {
       
      console.error(`Failed to enable plugin ${name}: ${error.message}`);
      return false;
    }
  }

  /**
   * Disable a plugin
   * @param {string} name - Plugin name
   * @returns {Promise<boolean>} Success status
   */
  async disable(name) {
    try {
      const plugin = this.plugins.get(name);
      if (!plugin || !this.enabledPlugins.has(name)) {
        return true; // Already disabled or not found
      }

      // Check for dependents
      const dependents = this.getDependents(name);
      if (dependents.length > 0) {
        throw new Error(
          `Cannot disable ${name}: plugins ${dependents.join(', ')} depend on it`
        );
      }

      // Cleanup plugin
      if (plugin.cleanup) {
        await plugin.cleanup();
      }

      // Unregister hooks
      this.unregisterHooks(name);

      this.enabledPlugins.delete(name);
      plugin.enabled = false;

      return true;
    } catch (error) {
       
      console.error(`Failed to disable plugin ${name}: ${error.message}`);
      return false;
    }
  }

  /**
   * Execute a hook
   * @param {string} hookName - Hook name
   * @param {any} data - Hook data
   * @param {object} options - Hook options
   * @returns {Promise<any>} Hook result
   */
  async executeHook(hookName, data, options = {}) {
    const hookHandlers = this.hooks.get(hookName) || [];
    let result = data;

    for (const handler of hookHandlers) {
      try {
        const pluginName = handler.plugin;
        if (!this.enabledPlugins.has(pluginName)) {
          continue; // Skip disabled plugins
        }

        const newResult = await handler.callback(result, options);

        // Update result for chain hooks (default), keep original for parallel hooks
        if (options.type !== 'parallel') {
          result = newResult !== undefined ? newResult : result;
        }
      } catch (error) {
         
        console.warn(
          `Hook ${hookName} failed for plugin ${handler.plugin}: ${error.message}`
        );

        if (options.stopOnError) {
          throw error;
        }
      }
    }

    return result;
  }

  /**
   * Register hooks for a plugin
   * @param {string} pluginName - Plugin name
   * @param {object} hooks - Plugin hooks
   */
  registerHooks(pluginName, hooks) {
    for (const [hookName, callback] of Object.entries(hooks)) {
      if (!this.hooks.has(hookName)) {
        this.hooks.set(hookName, []);
      }

      this.hooks.get(hookName).push({
        plugin: pluginName,
        callback,
      });
    }
  }

  /**
   * Unregister hooks for a plugin
   * @param {string} pluginName - Plugin name
   */
  unregisterHooks(pluginName) {
    for (const [hookName, handlers] of this.hooks.entries()) {
      const filtered = handlers.filter(h => h.plugin !== pluginName);
      this.hooks.set(hookName, filtered);
    }
  }

  /**
   * Get plugins that depend on a given plugin
   * @param {string} pluginName - Plugin name
   * @returns {string[]} Dependent plugin names
   */
  getDependents(pluginName) {
    const dependents = [];

    for (const [name, plugin] of this.plugins.entries()) {
      if (plugin.dependencies && plugin.dependencies.includes(pluginName)) {
        dependents.push(name);
      }
    }

    return dependents;
  }

  /**
   * Validate plugin structure
   * @param {object} plugin - Plugin to validate
   * @returns {boolean} True if valid
   */
  validatePlugin(plugin) {
    // Check required properties
    if (!plugin.version) return false;

    // Check hook structure
    if (plugin.hooks) {
      for (const [, callback] of Object.entries(plugin.hooks)) {
        if (typeof callback !== 'function') {
          return false;
        }
      }
    }

    // Check dependencies format
    if (plugin.dependencies && !Array.isArray(plugin.dependencies)) {
      return false;
    }

    return true;
  }

  /**
   * Get plugin information
   * @param {string} name - Plugin name
   * @returns {object|null} Plugin info
   */
  getPlugin(name) {
    return this.plugins.get(name) || null;
  }

  /**
   * List all plugins
   * @param {object} options - Filter options
   * @returns {object[]} Plugin list
   */
  listPlugins(options = {}) {
    const plugins = Array.from(this.plugins.values());

    if (options.enabled !== undefined) {
      return plugins.filter(p => p.enabled === options.enabled);
    }

    return plugins;
  }

  /**
   * Get plugin statistics
   * @returns {object} Plugin statistics
   */
  getStats() {
    const total = this.plugins.size;
    const enabled = this.enabledPlugins.size;
    const hooks = this.hooks.size;

    return {
      total,
      enabled,
      disabled: total - enabled,
      hooks,
      enabledPlugins: Array.from(this.enabledPlugins),
      availableHooks: Array.from(this.hooks.keys()),
    };
  }
}

/**
 * Base Plugin Class
 */
export class BasePlugin {
  constructor(name, version = '1.0.0') {
    this.name = name;
    this.version = version;
    this.dependencies = [];
    this.hooks = {};
  }

  /**
   * Initialize plugin
   * @param {object} context - Plugin context
   */
  async initialize(context) {
    this.config = context.config;
    this.manager = context.manager;
  }

  /**
   * Cleanup plugin
   */
  async cleanup() {
    // Override in subclasses
  }

  /**
   * Add a hook
   * @param {string} hookName - Hook name
   * @param {Function} callback - Hook callback
   */
  addHook(hookName, callback) {
    this.hooks[hookName] = callback;
  }

  /**
   * Add a dependency
   * @param {string} pluginName - Dependency plugin name
   */
  addDependency(pluginName) {
    if (!this.dependencies.includes(pluginName)) {
      this.dependencies.push(pluginName);
    }
  }
}

/**
 * Built-in Performance Plugin
 */
export class PerformancePlugin extends BasePlugin {
  constructor() {
    super('performance', '1.0.0');
    this.metrics = {
      hookCalls: 0,
      totalTime: 0,
      averageTime: 0,
    };

    this.addHook('before-operation', this.beforeOperation.bind(this));
    this.addHook('after-operation', this.afterOperation.bind(this));
  }

  async beforeOperation(data) {
    this.startTime = Date.now();
    return data;
  }

  async afterOperation(data) {
    if (this.startTime) {
      const duration = Date.now() - this.startTime;
      this.metrics.hookCalls++;
      this.metrics.totalTime += duration;
      this.metrics.averageTime =
        this.metrics.totalTime / this.metrics.hookCalls;
    }
    return data;
  }

  getMetrics() {
    return { ...this.metrics };
  }
}

/**
 * Built-in Logging Plugin
 */
export class LoggingPlugin extends BasePlugin {
  constructor() {
    super('logging', '1.0.0');
    this.logs = [];

    this.addHook('before-operation', this.logBefore.bind(this));
    this.addHook('after-operation', this.logAfter.bind(this));
    this.addHook('error', this.logError.bind(this));
  }

  async logBefore(data) {
    this.logs.push({
      type: 'info',
      message: 'Operation started',
      timestamp: new Date().toISOString(),
      data: data,
    });
    return data;
  }

  async logAfter(data) {
    this.logs.push({
      type: 'info',
      message: 'Operation completed',
      timestamp: new Date().toISOString(),
      data: data,
    });
    return data;
  }

  async logError(error) {
    this.logs.push({
      type: 'error',
      message: error.message,
      timestamp: new Date().toISOString(),
      error: error,
    });
    return error;
  }

  getLogs() {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }
}
