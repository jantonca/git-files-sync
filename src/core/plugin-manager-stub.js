/**
 * Plugin Manager Stub
 * Temporary stub to maintain compatibility while plugin system is not migrated
 */

export class PluginManager {
  constructor() {
    this.plugins = new Map();
    this.enabled = new Set();
  }

  async executeHook(hookName, data = {}) {
    // Stub: no-op for now
    return data;
  }

  register(name, plugin) {
    this.plugins.set(name, plugin);
    return true;
  }

  async enable(name) {
    this.enabled.add(name);
    return true;
  }

  getStats() {
    return {
      total: this.plugins.size,
      enabled: this.enabled.size,
    };
  }

  listPlugins() {
    const pluginList = [];
    for (const [name, plugin] of this.plugins) {
      pluginList.push({
        name,
        enabled: this.enabled.has(name),
        description: plugin.description || 'No description available',
        version: plugin.version || '1.0.0'
      });
    }
    return pluginList;
  }

  disable(name) {
    this.enabled.delete(name);
    return true;
  }

  get enabledPlugins() {
    return this.enabled;
  }
}

export class PerformancePlugin {
  constructor() {
    // Stub plugin
  }
}

export class LoggingPlugin {
  constructor() {
    // Stub plugin
  }
}
