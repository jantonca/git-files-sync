#!/usr/bin/env node

/**
 * Production Content CLI - Advanced command-line interface for content management
 * Full-featured CLI with all Phase 1-3 optimizations integrated
 */

import path from 'path';
import { ContentFetcher } from './src/core/content-fetcher.js';

/**
 * Advanced CLI for content management operations
 */
export class ContentCLI {
  constructor(options = {}) {
    this.manager = new ContentFetcher(options);
    this.fetcher = this.manager;
    this.options = {
      verbose: false,
      json: false,
      ...options,
    };
  }

  /**
   * Initialize CLI
   */
  async initialize() {
    return await this.manager.initialize();
  }

  /**
   * Execute CLI command
   */
  async execute(args = process.argv.slice(2)) {
    const [command, ...commandArgs] = args;

    // Parse global flags
    this.options.verbose = args.includes('--verbose') || args.includes('-v');
    this.options.json = args.includes('--json');
    this.options.force = args.includes('--force');
    this.options.watch = args.includes('--watch');

    try {
      await this.initialize();

      switch (command) {
        case 'fetch':
          return await this.fetch();

        case 'status':
          return await this.status();

        case 'stats':
          return await this.stats();

        case 'cache':
          return await this.cache(commandArgs);

        case 'health':
          return await this.health();

        case 'plugins':
          return await this.plugins(commandArgs);

        case 'performance':
          return await this.performance();

        case 'test':
          return await this.test();

        case 'platform':
          return await this.platform();

        case 'help':
        case '--help':
        case '-h':
          return this.showHelp();

        case 'version':
        case '--version':
          return this.showVersion();

        default:
          if (!command) {
            return this.showHelp();
          }
          throw new Error(`Unknown command: ${command}`);
      }
    } catch (error) {
      this.log(`❌ Error: ${error.message}`, 'error');
      if (this.options.verbose) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  }

  /**
   * Fetch content command
   */
  async fetch() {
    this.log('🚀 Fetching content...', 'info');

    // Handle watch mode
    if (this.options.watch) {
      this.log('👀 Starting repository watcher...', 'info');
      this.log(`📡 Monitoring repository for changes...`, 'info');
      
      // In watch mode, do initial fetch if forced
      if (this.options.force) {
        this.log('📥 Performing initial content fetch due to --force flag...', 'info');
        const startTime = Date.now();
        const result = await this.manager.fetchContent(true);
        const duration = Date.now() - startTime;
        if (result) {
          this.log(`✅ Initial content fetch completed in ${duration}ms`, 'success');
        }
      } else {
        this.log('✅ Watch mode started, monitoring repository for changes...', 'success');
      }

      this.log('👀 Starting repository watcher...', 'info');
      this.log('📝 Press Ctrl+C to stop watching...', 'info');

      // Get initial commit hash for comparison
      let lastKnownCommit;
      try {
        const configPath = path.resolve(process.cwd(), 'content.config.js');
        const { CONFIG } = await import(configPath);
        lastKnownCommit = await this.manager.gitService.getRemoteCommitHash(CONFIG.REPO_URL, CONFIG.BRANCH);
        this.log(`🔍 Monitoring commit: ${lastKnownCommit?.substring(0, 8)}...`, 'info');
      } catch (error) {
        this.log(`❌ Failed to get initial commit hash: ${error.message}`, 'error');
        process.exit(1);
      }

      let isUpdating = false;
      let lastNotifiedCommit = null;
      const pollInterval = 30000; // Check every 30 seconds
      const force = this.options.force; // Capture force flag for polling logic

      const checkForUpdates = async () => {
        if (isUpdating) return;

        try {
          const configPath = path.resolve(process.cwd(), 'content.config.js');
          const { CONFIG } = await import(configPath);
          const currentCommit = await this.manager.gitService.getRemoteCommitHash(CONFIG.REPO_URL, CONFIG.BRANCH);

          // Clear memory cache to ensure fresh data
          this.manager.cacheService.memoryCache?.clear();

          // Check what we last successfully fetched from cache
          const cachedInfo = await this.manager.cacheService.getCachedRepositoryInfo(CONFIG.REPO_URL);
          const lastFetchedCommit = cachedInfo?.commitHash;

          // Only show "new content available" if current differs from last successfully fetched
          if (currentCommit !== lastFetchedCommit) {
            // Only show the message if we haven't already notified about this commit AND not currently updating
            if (currentCommit !== lastNotifiedCommit && !isUpdating) {
              this.log(
                `🔄 New commit detected: ${currentCommit?.substring(0, 8)}... (was ${lastFetchedCommit?.substring(0, 8) || 'unknown'}...)`,
                'info'
              );
              
              if (force) {
                // Auto mode - update automatically
                this.log('🤖 Auto-updating content...', 'info');
                lastNotifiedCommit = currentCommit;
                
                isUpdating = true;
                try {
                  const result = await this.manager.fetchContent(false);
                  if (result) {
                    this.log('✅ Content updated successfully!', 'success');
                    this.log('⏱️  Continuing to monitor for changes...', 'info');
                  }
                } catch (error) {
                  this.log(`❌ Failed to update content: ${error.message}`, 'error');
                } finally {
                  isUpdating = false;
                }
              } else {
                // Interactive mode - ask user for permission
                this.log('📋 New content is available. Would you like to update?', 'info');
                
                // Check if we're in a TTY environment that supports raw mode
                if (process.stdin.isTTY && typeof process.stdin.setRawMode === 'function') {
                  this.log('   Press [y] to update, [n] to skip, or [Ctrl+C] to stop watching', 'info');
                  
                  // Set up one-time key listener
                  process.stdin.setRawMode(true);
                  process.stdin.resume();
                  process.stdin.setEncoding('utf8');
                  
                  const keyHandler = async (key) => {
                    if (key === 'y' || key === 'Y') {
                      // Prevent multiple concurrent updates
                      if (isUpdating) {
                        this.log('⚠️  Update already in progress, please wait...', 'warning');
                        return;
                      }
                      
                      process.stdin.removeListener('data', keyHandler);
                      process.stdin.setRawMode(false);
                      this.log('🤖 Updating content...', 'info');
                      lastNotifiedCommit = currentCommit;
                      
                      isUpdating = true;
                      try {
                        const result = await this.manager.fetchContent(false);
                        if (result) {
                          this.log('✅ Content updated successfully!', 'success');
                          this.log('⏱️  Continuing to monitor for changes...', 'info');
                        }
                      } catch (error) {
                        this.log(`❌ Failed to update content: ${error.message}`, 'error');
                      } finally {
                        isUpdating = false;
                      }
                    } else if (key === 'n' || key === 'N') {
                      process.stdin.removeListener('data', keyHandler);
                      process.stdin.setRawMode(false);
                      this.log('⏭️  Skipping update, continuing to monitor...', 'info');
                      lastNotifiedCommit = currentCommit; // Mark as handled
                    } else if (key === '\u0003') { // Ctrl+C
                      process.stdin.removeListener('data', keyHandler);
                      process.stdin.setRawMode(false);
                      this.log('\n🛑 Shutting down repository watcher...', 'info');
                      clearInterval(pollTimer);
                      this.log('✅ Repository watcher stopped.', 'success');
                      process.exit(0);
                    }
                  };
                  
                  process.stdin.on('data', keyHandler);
                } else {
                  // For non-TTY environments (like dev servers), just notify and provide instructions
                  this.log('📢 Updates available! To apply changes:', 'info');
                  this.log('   • Run: npm run content:fetch', 'info');
                  this.log('   • Or use: npm run dev:watch:force for auto-updates', 'info');
                  this.log('   • Or run watch in a separate terminal for interactive mode', 'info');
                  this.log('⏱️  Continuing to monitor for more changes...', 'info');
                  lastNotifiedCommit = currentCommit; // Mark as handled to avoid spam
                }
              }
            }
          } else {
            // Commits match - check if we just resolved a pending notification
            if (lastNotifiedCommit && lastNotifiedCommit === currentCommit) {
              this.log('✅ Content is now up to date!', 'success');
              lastNotifiedCommit = null;
            }
          }
        } catch (error) {
          this.log(`⚠️  Failed to check for updates: ${error.message}`, 'warn');
        }
      };

      this.log('🎉 Repository watcher started successfully!', 'success');
      if (force) {
        this.log('🤖 Auto-update mode: Changes will be applied automatically', 'info');
      } else {
        this.log('🤔 Interactive mode: You will be prompted before applying changes', 'info');
        if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== 'function') {
          this.log('   💡 Dev environment: Will notify about updates (manual apply required)', 'info');
          this.log('   ⚡ Use --force flag for auto-updates in dev mode', 'info');
        }
      }
      this.log(`⏱️  Checking every ${pollInterval / 1000} seconds for updates...`, 'info');

      // Set up periodic checking
      const pollTimer = setInterval(checkForUpdates, pollInterval);

      // Perform initial check immediately
      await checkForUpdates();

      // Set up signal handlers for graceful shutdown
      process.on('SIGINT', () => {
        this.log('\n� Shutting down repository watcher...', 'info');
        clearInterval(pollTimer);
        this.log('✅ Repository watcher stopped.', 'success');
        process.exit(0);
      });

      // Keep the process alive for watch mode
      process.stdin.resume();
      
      return true;
    }

    // Normal single-run mode
    const startTime = Date.now();
    const result = await this.manager.fetchContent(this.options.force);
    const duration = Date.now() - startTime;

    if (result) {
      this.log(`✅ Content fetched successfully in ${duration}ms`, 'success');

      if (this.options.verbose) {
        const metrics = this.fetcher.getMetrics();
        this.log('📊 Performance Metrics:', 'info');
        this.logObject(metrics.fetcher);
      }
    } else {
      this.log('❌ Content fetch failed', 'error');
    }

    return result;
  }

  /**
   * Status command
   */
  async status() {
    const status = await this.manager.getStatus();

    if (this.options.json) {
      console.log(JSON.stringify(status, null, 2));
      return status;
    }

    this.log('📊 Content Status', 'info');
    console.log(
      `   Cache: ${status.cache.enabled ? '✅ Enabled' : '❌ Disabled'}`
    );
    console.log(`   Last Update: ${status.lastUpdate}`);

    if (status.performance) {
      console.log('   Performance:');
      Object.entries(status.performance).forEach(([key, value]) => {
        console.log(`     ${key}: ${value}`);
      });
    }

    if (status.recommendations.length > 0) {
      this.log('💡 Recommendations:', 'info');
      status.recommendations.forEach(rec => console.log(`   - ${rec}`));
    }

    return status;
  }

  /**
   * Detailed statistics command
   */
  async stats() {
    const cacheStats = await this.fetcher.getCacheStats();
    const performance = this.fetcher.getPerformanceReport();
    const metrics = this.fetcher.getMetrics();

    if (this.options.json) {
      console.log(
        JSON.stringify({ cache: cacheStats, performance, metrics }, null, 2)
      );
      return;
    }

    this.log('📈 Detailed Statistics', 'info');

    // Cache statistics
    console.log('\n🗄️  Cache Statistics:');
    console.log(`   Enabled: ${cacheStats.enabled ? 'Yes' : 'No'}`);
    if (cacheStats.enabled) {
      console.log(`   Size: ${cacheStats.size || 0} entries`);
      console.log(`   Hit Rate: ${cacheStats.hitRate || 'N/A'}`);
      console.log(`   Last Cleanup: ${cacheStats.lastCleanup || 'Never'}`);
    }

    // Performance statistics
    console.log('\n⚡ Performance Statistics:');
    console.log(`   Total Operations: ${metrics.fetcher.operationsCount}`);
    console.log(`   Average Fetch Time: ${metrics.fetcher.fetchTime || 0}ms`);
    console.log(`   Files Processed: ${metrics.fetcher.filesProcessed}`);
    console.log(`   Cache Hits: ${metrics.fetcher.cacheHits}`);
    console.log(`   Cache Misses: ${metrics.fetcher.cacheMisses}`);

    // Plugin statistics
    if (metrics.plugins) {
      console.log('\n🔌 Plugin Statistics:');
      console.log(`   Enabled Plugins: ${metrics.plugins.enabled}`);
      console.log(`   Total Plugins: ${metrics.plugins.total}`);
    }

    return { cache: cacheStats, performance, metrics };
  }

  /**
   * Cache management command
   */
  async cache(args) {
    const [subcommand, namespace] = args;

    switch (subcommand) {
      case 'clear': {
        await this.manager.clearCache(namespace);
        this.log('✅ Cache cleared', 'success');
        break;
      }

      case 'stats': {
        const stats = await this.fetcher.getCacheStats();
        if (this.options.json) {
          console.log(JSON.stringify(stats, null, 2));
        } else {
          this.logObject(stats, 'Cache Statistics');
        }
        break;
      }

      case 'info': {
        const info = await this.fetcher.getCacheStats();
        this.log('🗄️  Cache Information', 'info');
        console.log(`   Directory: ${info.directory || 'N/A'}`);
        console.log(`   Max Age: ${info.maxAge || 'N/A'}ms`);
        console.log(`   Enabled: ${info.enabled ? 'Yes' : 'No'}`);
        break;
      }

      default:
        this.log(
          'Usage: content-cli cache [clear|stats|info] [namespace]',
          'info'
        );
        break;
    }
  }

  /**
   * Health check command
   */
  async health() {
    const health = await this.manager.healthCheck();

    if (this.options.json) {
      console.log(JSON.stringify(health, null, 2));
      return health;
    }

    const statusIcon = health.overall === 'healthy' ? '✅' : '❌';
    this.log(
      `${statusIcon} System Health: ${health.overall}`,
      health.overall === 'healthy' ? 'success' : 'error'
    );

    console.log(`   Timestamp: ${health.timestamp}`);
    
    // Display individual check results
    if (health.checks) {
      Object.entries(health.checks).forEach(([checkName, result]) => {
        const icon = result.status === 'ok' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
        console.log(`   ${checkName}: ${icon} ${result.message}`);
      });
    }

    return health;
  }

  /**
   * Plugin management command
   */
  async plugins(args) {
    const [subcommand, pluginName] = args;
    const pluginManager = this.manager.getPluginManager();

    switch (subcommand) {
      case 'list': {
        const plugins = pluginManager.listPlugins();
        if (this.options.json) {
          console.log(JSON.stringify(plugins, null, 2));
        } else {
          this.log('🔌 Available Plugins:', 'info');
          plugins.forEach(plugin => {
            const status = plugin.enabled ? '✅' : '❌';
            console.log(
              `   ${status} ${plugin.name}: ${plugin.description || 'No description'}`
            );
          });
        }
        break;
      }

      case 'stats': {
        const stats = pluginManager.getStats();
        this.logObject(stats, 'Plugin Statistics');
        break;
      }

      case 'enable': {
        if (!pluginName) {
          this.log('Please specify a plugin name', 'error');
          return;
        }
        const enabled = await pluginManager.enable(pluginName);
        if (enabled) {
          this.log(`✅ Plugin '${pluginName}' enabled`, 'success');
        } else {
          this.log(`❌ Failed to enable plugin '${pluginName}'`, 'error');
        }
        break;
      }

      case 'disable': {
        if (!pluginName) {
          this.log('Please specify a plugin name', 'error');
          return;
        }
        const disabled = await pluginManager.disable(pluginName);
        if (disabled) {
          this.log(`✅ Plugin '${pluginName}' disabled`, 'success');
        } else {
          this.log(`❌ Failed to disable plugin '${pluginName}'`, 'error');
        }
        break;
      }

      default:
        this.log(
          'Usage: content-cli plugins [list|stats|enable|disable] [plugin-name]',
          'info'
        );
        break;
    }
  }

  /**
   * Performance analysis command
   */
  async performance() {
    const report = this.fetcher.getPerformanceReport();

    if (this.options.json) {
      console.log(JSON.stringify(report, null, 2));
      return report;
    }

    this.log('⚡ Performance Report', 'info');

    // Summary
    console.log('\n📊 Summary:');
    Object.entries(report.summary).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`);
    });

    // Recommendations
    if (report.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      report.recommendations.forEach(rec => console.log(`   - ${rec}`));
    }

    // Detailed metrics if verbose
    if (this.options.verbose) {
      console.log('\n🔍 Detailed Metrics:');
      this.logObject(report.performance);
    }

    return report;
  }

  /**
   * Test command - run system tests
   */
  async test() {
    this.log('🧪 Running system tests...', 'info');

    const tests = [
      {
        name: 'Framework Detection',
        test: async () => {
          const adapter = this.fetcher.frameworkAdapter;
          return adapter && adapter.framework;
        },
      },
      {
        name: 'Cache Service',
        test: async () => {
          const stats = await this.fetcher.getCacheStats();
          return stats && typeof stats.enabled === 'boolean';
        },
      },
      {
        name: 'Plugin System',
        test: async () => {
          const manager = this.fetcher.getPluginManager();
          return manager && typeof manager.listPlugins === 'function';
        },
      },
      {
        name: 'Performance Manager',
        test: async () => {
          const report = this.fetcher.getPerformanceReport();
          return report && report.summary;
        },
      },
      {
        name: 'Health Check',
        test: async () => {
          const health = await this.manager.healthCheck();
          return health && health.overall;
        },
      },
    ];

    let passed = 0;
    for (const test of tests) {
      try {
        const result = await test.test();
        if (result) {
          console.log(`   ✅ ${test.name}`);
          passed++;
        } else {
          console.log(`   ❌ ${test.name} - Failed`);
        }
      } catch (error) {
        console.log(`   ❌ ${test.name} - Error: ${error.message}`);
      }
    }

    const successRate = ((passed / tests.length) * 100).toFixed(1);
    this.log(
      `\n📈 Test Results: ${passed}/${tests.length} passed (${successRate}%)`,
      passed === tests.length ? 'success' : 'warning'
    );

    return { passed, total: tests.length, successRate };
  }

  /**
   * Platform compatibility command
   */
  async platform() {
    // Import platform utilities
    const { getCompatibilityReport } = await import('./src/utils/platform.js');
    const report = getCompatibilityReport();

    if (this.options.json) {
      console.log(JSON.stringify(report, null, 2));
      return report;
    }

    this.log('🖥️  Platform Compatibility Report', 'info');
    
    // Platform info
    console.log(`   OS: ${report.platform.osType} ${report.platform.osRelease}`);
    console.log(`   Platform: ${report.platform.platform} (${report.platform.architecture})`);
    console.log(`   Node.js: ${report.node.version}`);
    
    // Git availability
    if (report.git.available) {
      console.log(`   Git: ✅ ${report.git.version}`);
      console.log(`   Git Command: ${report.git.command}`);
    } else {
      console.log(`   Git: ❌ ${report.git.error || 'Not available'}`);
    }
    
    // File system info
    console.log(`   Case Sensitive FS: ${report.filesystem.caseSensitive ? 'Yes' : 'No'}`);
    
    // Compatibility status
    const compatible = report.git.available && report.node.compatible;
    const status = compatible ? '✅ Compatible' : '❌ Issues Detected';
    console.log(`\n   Overall: ${status}`);
    
    if (!compatible) {
      console.log('\n💡 Recommendations:');
      if (!report.git.available) {
        console.log('   - Install Git and ensure it\'s in your PATH');
      }
    }

    return report;
  }

  /**
   * Show help
   */
  showHelp() {
    console.log(`
🚀 Content CLI - Advanced Content Management Tool

USAGE:
  content-cli <command> [options]

COMMANDS:
  fetch          Fetch content from remote repository
  status         Show content status and cache information
  stats          Show detailed statistics
  cache          Manage cache (clear, stats, info)
  health         Run health check
  plugins        Manage plugins (list, enable, disable, stats)
  performance    Show performance analysis
  platform       Show platform compatibility information
  test           Run system tests
  help           Show this help message
  version        Show version information

OPTIONS:
  --force        Force operation (bypass cache)
  --watch        Watch mode - monitor repository for changes
  --verbose, -v  Verbose output
  --json         Output in JSON format

EXAMPLES:
  content-cli fetch --force
  content-cli fetch --watch
  content-cli fetch --watch --force
  content-cli status --json
  content-cli cache clear
  content-cli plugins list
  content-cli test --verbose

For more information, visit: https://github.com/jantonca/git-files-sync
`);
  }

  /**
   * Show version
   */
  showVersion() {
    console.log('Content CLI v1.0.0 - Production Ready');
    console.log('Built with Phase 1-3 optimizations');
  }

  /**
   * Utility: Log with colors
   */
  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m', // Cyan
      success: '\x1b[32m', // Green
      warning: '\x1b[33m', // Yellow
      error: '\x1b[31m', // Red
      reset: '\x1b[0m', // Reset
    };

    const color = colors[type] || colors.info;
    console.log(`${color}${message}${colors.reset}`);
  }

  /**
   * Utility: Log object with formatting
   */
  logObject(obj, title = null) {
    if (title) {
      this.log(title, 'info');
    }

    if (this.options.json) {
      console.log(JSON.stringify(obj, null, 2));
    } else {
      Object.entries(obj).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
      });
    }
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const cli = new ContentCLI();
  cli.execute().catch(error => {
    console.error('❌ CLI Error:', error.message);
    process.exit(1);
  });
}
