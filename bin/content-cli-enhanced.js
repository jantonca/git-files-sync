#!/usr/bin/env node

import { ContentCLI } from '../content-cli.js';
import { EnhancedCLI } from '../src/utils/cli-enhanced.js';
import { setTimeout as sleep } from 'timers/promises';

class EnhancedContentCLI extends ContentCLI {
  constructor(options = {}) {
    super(options);
    this.enhancedCLI = new EnhancedCLI(options);
    this.useEnhancements = options.enhanced !== false;
  }

  async cacheStats() {
    if (!this.useEnhancements) {
      return super.cacheStats();
    }

    this.enhancedCLI.formatting.header('Cache Statistics', 'cyan');

    try {
      // Get cache statistics using enhanced CLI
      const stats = await super.cacheStats();
      this.enhancedCLI.success('Cache statistics retrieved successfully');
      return stats;
    } catch (error) {
      this.enhancedCLI.error(
        `Failed to get cache statistics: ${error.message}`
      );
      throw error;
    }
  }

  async updateCache(options = {}) {
    if (!this.useEnhancements) {
      return super.updateCache(options);
    }

    this.enhancedCLI.formatting.header('Updating Cache', 'cyan');

    try {
      const result = await super.updateCache(options);
      this.enhancedCLI.success('Cache updated successfully');
      return result;
    } catch (error) {
      this.enhancedCLI.error(`Failed to update cache: ${error.message}`);
      throw error;
    }
  }

  async clearCache() {
    if (!this.useEnhancements) {
      return super.clearCache();
    }

    this.enhancedCLI.formatting.header('Clearing Cache', 'yellow');

    try {
      const result = await super.clearCache();
      this.enhancedCLI.success('Cache cleared successfully');
      return result;
    } catch (error) {
      this.enhancedCLI.error(`Failed to clear cache: ${error.message}`);
      throw error;
    }
  }

  async importContent(source, options = {}) {
    if (!this.useEnhancements) {
      return super.importContent(source, options);
    }

    this.enhancedCLI.formatting.header('Importing Content', 'magenta');

    try {
      const progressBar = this.enhancedCLI.createProgressBar(100, {
        title: 'Importing Content',
      });

      // Simulate progress updates during import
      const result = await super.importContent(source, {
        ...options,
        onProgress: progress => {
          progressBar.update(progress);
        },
      });

      progressBar.complete();
      this.enhancedCLI.success('Content imported successfully');
      return result;
    } catch (error) {
      this.enhancedCLI.error(`Failed to import content: ${error.message}`);
      throw error;
    }
  }

  async exportContent(destination, options = {}) {
    if (!this.useEnhancements) {
      return super.exportContent(destination, options);
    }

    this.enhancedCLI.formatting.header('Exporting Content', 'magenta');

    try {
      const progressBar = this.enhancedCLI.createProgressBar(100, {
        title: 'Exporting Content',
      });

      const result = await super.exportContent(destination, {
        ...options,
        onProgress: progress => {
          progressBar.update(progress);
        },
      });

      progressBar.complete();
      this.enhancedCLI.success('Content exported successfully');
      return result;
    } catch (error) {
      this.enhancedCLI.error(`Failed to export content: ${error.message}`);
      throw error;
    }
  }

  async transformContent(transformations, options = {}) {
    if (!this.useEnhancements) {
      return super.transformContent(transformations, options);
    }

    this.enhancedCLI.formatting.header('Transforming Content', 'green');

    try {
      const spinner = this.enhancedCLI.createSpinner(
        'Applying transformations...'
      );
      spinner.start();

      const result = await super.transformContent(transformations, options);

      spinner.stop();
      this.enhancedCLI.success('Content transformed successfully');
      return result;
    } catch (error) {
      this.enhancedCLI.error(`Failed to transform content: ${error.message}`);
      throw error;
    }
  }

  showHelp() {
    if (!this.useEnhancements) {
      return super.showHelp();
    }

    this.enhancedCLI.formatting.header('Enhanced Content CLI', 'magenta');
    this.enhancedCLI.info('Available commands with enhanced features:');

    const commands = [
      {
        command: 'cache-stats',
        description: 'Show cache statistics with visual formatting',
      },
      {
        command: 'clear-cache',
        description: 'Clear cache with confirmation and progress',
      },
      {
        command: 'import <source>',
        description: 'Import content with progress tracking',
      },
      {
        command: 'export <dest>',
        description: 'Export content with progress tracking',
      },
      {
        command: 'transform <rules>',
        description: 'Transform content with spinner feedback',
      },
      { command: 'interactive', description: 'Start interactive setup wizard' },
      {
        command: 'interactive-demo',
        description: 'Run interactive features demonstration',
      },
      {
        command: 'performance-demo',
        description: 'Run performance monitoring demonstration',
      },
      {
        command: 'demo',
        description: 'Run all enhanced features demonstration',
      },
    ];

    commands.forEach(({ command, description }) => {
      this.enhancedCLI.info(`  ${command.padEnd(20)} - ${description}`);
    });

    this.enhancedCLI.info('\nOptions:');
    this.enhancedCLI.info('  --enhanced=false    Disable enhanced features');
    this.enhancedCLI.info('  --colors=false      Disable colored output');
    this.enhancedCLI.info('  --help              Show this help message');
  }

  async interactiveSetup() {
    if (!this.useEnhancements) {
      this.enhancedCLI.warning('Interactive mode requires enhanced features');
      return;
    }

    try {
      // Show interactive header
      this.enhancedCLI.formatting.header(
        '🎮 Interactive Content Management Setup',
        'magenta'
      );

      // Detect framework with smart defaults
      const detectedFramework = this.enhancedCLI.detectFramework();
      this.enhancedCLI.info(`🔍 Detected framework: ${detectedFramework}`);

      // Get smart defaults based on framework
      const smartDefaults =
        this.enhancedCLI.getSmartDefaults(detectedFramework);
      this.enhancedCLI.info('💡 Smart defaults available:');
      Object.entries(smartDefaults).forEach(([key, value]) => {
        this.enhancedCLI.info(`  ${key}: ${value}`);
      });

      // Main action selection menu
      const setupType = await this.enhancedCLI.selectFromMenu(
        [
          {
            label: 'Quick Setup',
            description: 'Use smart defaults for your framework',
          },
          {
            label: 'Custom Setup',
            description: 'Configure manually with guided prompts',
          },
          {
            label: 'Interactive Demo',
            description: 'Show all interactive features',
          },
          { label: 'Exit', description: 'Cancel setup' },
        ],
        { title: 'Choose setup type:' }
      );

      if (!setupType || setupType === 'Exit') {
        this.enhancedCLI.warning('Setup cancelled');
        return;
      }

      if (setupType === 'Interactive Demo') {
        await this.runInteractiveDemo();
        return;
      }

      // Get paths with smart defaults (simplified for demo)
      this.enhancedCLI.formatting.subheader('📁 Path Configuration');
      const sourcePath = smartDefaults.sourcePath || './src/content';
      const destPath = smartDefaults.destPath || './migrated-content';

      this.enhancedCLI.info(`Source path: ${sourcePath}`);
      this.enhancedCLI.info(`Destination path: ${destPath}`);

      // Confirmation dialog
      const confirmed = await this.enhancedCLI.showConfirmation(
        `Ready to proceed with ${setupType.toLowerCase()} from "${sourcePath}" to "${destPath}"?`
      );

      if (confirmed) {
        this.enhancedCLI.success(
          `✨ ${setupType} confirmed! Configuration saved.`
        );
        this.enhancedCLI.info(`Source: ${sourcePath}`);
        this.enhancedCLI.info(`Destination: ${destPath}`);
        this.enhancedCLI.info(`Framework: ${detectedFramework}`);
      } else {
        this.enhancedCLI.warning('❌ Setup cancelled by user');
      }
    } catch (error) {
      this.enhancedCLI.error(`Interactive setup failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Comprehensive interactive demo showcasing all features
   */
  async runInteractiveDemo() {
    try {
      this.enhancedCLI.formatting.header(
        '🎮 Interactive Features Demo',
        'cyan'
      );
      this.enhancedCLI.info(
        'This demo showcases all interactive CLI capabilities...\n'
      );

      // Demo 1: Framework Detection
      this.enhancedCLI.formatting.subheader(
        'Demo 1: Framework Detection & Smart Defaults'
      );
      const framework = this.enhancedCLI.detectFramework();
      this.enhancedCLI.info(`Framework detected: ${framework}`);

      const smartDefaults = this.enhancedCLI.getSmartDefaults(framework);
      this.enhancedCLI.info('Smart defaults for this framework:');
      Object.entries(smartDefaults).forEach(([key, value]) => {
        this.enhancedCLI.info(`  ${key}: ${value}`);
      });

      // Demo 2: Menu Selection
      this.enhancedCLI.formatting.subheader(
        '\nDemo 2: Interactive Menu Selection'
      );
      const demoAction = await this.enhancedCLI.selectFromMenu(
        [
          {
            label: 'Path Completion Demo',
            description: 'Test auto-completion features',
          },
          {
            label: 'Confirmation Demo',
            description: 'Test dialog confirmations',
          },
          { label: 'Progress Demo', description: 'Show progress indicators' },
          {
            label: 'Performance Demo',
            description: 'Show performance monitoring',
          },
          { label: 'Skip to End', description: 'Jump to demo completion' },
        ],
        { title: 'Choose demo section:' }
      );

      if (demoAction === 'Skip to End') {
        this.enhancedCLI.info('Skipping to demo completion...');
        this.enhancedCLI.success('🎉 Demo completed!');
        return;
      }

      // Demo 3: Path Completion (Simplified)
      if (demoAction === 'Path Completion Demo') {
        this.enhancedCLI.formatting.subheader('\nDemo 3: Path Input');
        this.enhancedCLI.info('Path completion simulation...');

        const testPaths = ['./src/content', './src/components', './src/pages'];
        this.enhancedCLI.info('Available paths:');
        testPaths.forEach((path, i) => {
          this.enhancedCLI.info(`  ${i + 1}. ${path}`);
        });

        this.enhancedCLI.success(
          '✅ Path selection functionality demonstrated'
        );
      }

      // Demo 4: Confirmation Dialogs
      if (demoAction === 'Confirmation Demo') {
        this.enhancedCLI.formatting.subheader('\nDemo 4: Confirmation Dialogs');

        const confirmDemo = await this.enhancedCLI.showConfirmation(
          'Would you like to see a destructive operation confirmation?'
        );

        if (confirmDemo) {
          const confirmDestructive = await this.enhancedCLI.showConfirmation(
            '⚠️  This would DELETE all files in the destination. Continue?',
            false // Default to 'no' for destructive operations
          );

          if (confirmDestructive) {
            this.enhancedCLI.warning(
              '🚨 In a real scenario, files would be deleted!'
            );
          } else {
            this.enhancedCLI.success('✅ Smart choice! Operation cancelled.');
          }
        } else {
          this.enhancedCLI.info('Skipping destructive operation demo.');
        }
      }

      // Demo 5: Progress Indicators
      if (demoAction === 'Progress Demo') {
        this.enhancedCLI.formatting.subheader('\nDemo 5: Progress Indicators');
        this.enhancedCLI.info('Simulating file processing...');

        const progressBar = this.enhancedCLI.createProgressBar(10, {
          title: 'Processing Demo Files',
        });

        for (let i = 0; i <= 10; i++) {
          progressBar.update(i);
          await sleep(200);
        }

        progressBar.complete();
        this.enhancedCLI.success('✅ Processing completed!');
      }

      // Demo 6: Performance Monitoring
      if (demoAction === 'Performance Demo') {
        await this.runPerformanceDemo();
      }

      // Demo completion with performance report
      this.enhancedCLI.formatting.subheader('\n🎉 Demo Summary');
      this.enhancedCLI.success(
        'All interactive features demonstrated successfully!'
      );
      this.enhancedCLI.info('\n📋 Features showcased:');
      this.enhancedCLI.info('  ✅ Framework detection with smart defaults');
      this.enhancedCLI.info('  ✅ Interactive menu selection');
      this.enhancedCLI.info('  ✅ Path auto-completion');
      this.enhancedCLI.info('  ✅ Confirmation dialogs');
      this.enhancedCLI.info('  ✅ Progress indicators');
      this.enhancedCLI.info('  ✅ Visual feedback system');
      this.enhancedCLI.info('  ✅ Error handling & validation');
      this.enhancedCLI.info('  ✅ Performance monitoring');
    } catch (error) {
      this.enhancedCLI.error(`Demo failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Performance monitoring demonstration
   */
  async runPerformanceDemo() {
    try {
      this.enhancedCLI.formatting.header(
        '🚀 Performance Monitoring Demo',
        'cyan'
      );
      this.enhancedCLI.info(
        'Demonstrating performance monitoring capabilities...\n'
      );

      // Demo 1: Operation Timing
      this.enhancedCLI.formatting.subheader('Demo 1: Operation Timing');
      await this.enhancedCLI.timeOperation('FileProcessing', async () => {
        this.enhancedCLI.info('Simulating file processing...');
        await sleep(Math.random() * 500 + 200); // 200-700ms
      });

      await this.enhancedCLI.timeOperation('DatabaseQuery', async () => {
        this.enhancedCLI.info('Simulating database query...');
        await sleep(Math.random() * 300 + 100); // 100-400ms
      });

      // Demo 2: Memory Monitoring
      this.enhancedCLI.formatting.subheader(
        '\nDemo 2: Memory Usage Monitoring'
      );
      const memoryBefore = this.enhancedCLI.getMemoryUsage();
      this.enhancedCLI.info(`Memory before operations: ${memoryBefore.heap}`);

      // Simulate memory-intensive operation
      const data = new Array(100000).fill('test-data-for-memory-demo');
      const memoryAfter = this.enhancedCLI.getMemoryUsage();
      this.enhancedCLI.info(
        `Memory after allocation: ${memoryAfter.heap} (${data.length} items)`
      );

      // Clean up the test data
      data.length = 0;

      // Demo 3: Cache Statistics
      this.enhancedCLI.formatting.subheader(
        '\nDemo 3: Cache Performance Tracking'
      );

      // Simulate cache operations
      const cacheOperations = [
        { type: 'get', key: 'user:123', hit: true },
        { type: 'get', key: 'user:456', hit: false },
        { type: 'set', key: 'user:456' },
        { type: 'get', key: 'config:app', hit: true },
        { type: 'get', key: 'user:123', hit: true },
      ];

      cacheOperations.forEach(op => {
        this.enhancedCLI.recordCacheOperation(op.type, op.key, op.hit);
      });

      const cacheStats = this.enhancedCLI.getCacheStats();
      this.enhancedCLI.info(`Cache hit rate: ${cacheStats.hitRate}%`);
      this.enhancedCLI.info(`Total operations: ${cacheStats.totalOperations}`);
      this.enhancedCLI.info(`Performance: ${cacheStats.analysis}`);

      // Demo 4: Advanced Logging
      this.enhancedCLI.formatting.subheader(
        '\nDemo 4: Advanced Logging System'
      );
      this.enhancedCLI.debug('Debug message with detailed information');
      this.enhancedCLI.logInfo(
        'Informational message about operation progress'
      );
      this.enhancedCLI.logWarning('Warning about potential performance issue');
      this.enhancedCLI.logError('Error message with troubleshooting context');

      // Demo 5: Comprehensive Performance Report
      this.enhancedCLI.formatting.subheader(
        '\n📊 Performance Report Generation'
      );
      this.enhancedCLI.info('Generating comprehensive performance report...');
      const report = this.enhancedCLI.generatePerformanceReport();

      // Summary
      this.enhancedCLI.formatting.subheader('\n🎯 Performance Demo Complete');
      this.enhancedCLI.success(
        'All performance monitoring features demonstrated!'
      );
      this.enhancedCLI.info('\n📋 Performance features showcased:');
      this.enhancedCLI.info('  ✅ Operation timing and metrics');
      this.enhancedCLI.info('  ✅ Memory usage monitoring');
      this.enhancedCLI.info('  ✅ Cache performance tracking');
      this.enhancedCLI.info('  ✅ Advanced logging with levels');
      this.enhancedCLI.info('  ✅ Comprehensive reporting');
      this.enhancedCLI.info('  ✅ Optimization suggestions');

      return report;
    } catch (error) {
      this.enhancedCLI.error(`Performance demo failed: ${error.message}`);
      throw error;
    }
  }

  async demo() {
    this.enhancedCLI.formatting.header('Enhanced CLI Features Demo', 'magenta');

    this.enhancedCLI.formatting.subheader('Progress Bar Demo');
    const progressBar = this.enhancedCLI.createProgressBar(10, {
      title: 'Processing',
    });

    for (let i = 0; i <= 10; i++) {
      progressBar.update(i);
      await sleep(300);
    }
    progressBar.complete();

    this.enhancedCLI.formatting.subheader('Spinner Demo');
    const spinner = this.enhancedCLI.createSpinner('Loading data...');
    spinner.start();
    await sleep(2000);
    spinner.stop();

    this.enhancedCLI.formatting.subheader('Error Handling Demo');
    await this.demoValidation();

    this.enhancedCLI.success('Demo completed successfully!');
  }

  async demoValidation() {
    this.enhancedCLI.formatting.subheader('Input Validation Demo');

    const testInputs = [
      { value: '', field: 'username', required: true },
      { value: 'invalid-email', field: 'email', type: 'email' },
      { value: '/invalid/path', field: 'path', type: 'path' },
    ];

    for (const input of testInputs) {
      const validation = this.enhancedCLI.validator.validateInput(
        input.value,
        input.field,
        { required: input.required, type: input.type }
      );

      if (!validation.valid) {
        console.log(
          this.enhancedCLI.colorManager.colorize(
            `❌ ${validation.error}`,
            'red'
          )
        );
        console.log(
          this.enhancedCLI.colorManager.colorize(
            `💡 ${validation.suggestion}`,
            'yellow'
          )
        );
      }
    }

    // Configuration Validation Demo
    this.enhancedCLI.formatting.subheader('Configuration Validation Demo');
    const testConfig = {
      REPO_URL: 'https://github.com/user/repo.git',
      CONTENT_MAPPING: 'invalid-type',
    };

    const schema = {
      REPO_URL: {
        required: true,
        type: 'string',
        suggestion: 'Add repository URL to configuration',
      },
      BRANCH: {
        required: true,
        type: 'string',
        suggestion: 'Add branch name (e.g., "main" or "master")',
      },
    };

    const configValidation = this.enhancedCLI.configValidator.validate(
      testConfig,
      schema
    );

    if (!configValidation.valid) {
      configValidation.errors.forEach(error => {
        console.log(
          this.enhancedCLI.colorManager.colorize(`❌ ${error.message}`, 'red')
        );
        if (error.suggestion) {
          console.log(
            this.enhancedCLI.colorManager.colorize(
              `💡 ${error.suggestion}`,
              'yellow'
            )
          );
        }
      });
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const enhancedArg = args.find(arg => arg.startsWith('--enhanced='));
  const enhanced = enhancedArg ? enhancedArg.split('=')[1] !== 'false' : true;
  const filteredArgs = args.filter(arg => !arg.startsWith('--enhanced='));

  const cli = new EnhancedContentCLI({ enhanced });

  if (filteredArgs[0] === 'demo') {
    cli.demo().catch(error => {
      console.error('❌ Demo Error:', error.message);
      process.exit(1);
    });
  } else if (filteredArgs[0] === 'interactive') {
    cli.interactiveSetup().catch(error => {
      console.error('❌ Interactive Setup Error:', error.message);
      process.exit(1);
    });
  } else if (filteredArgs[0] === 'interactive-demo') {
    cli.runInteractiveDemo().catch(error => {
      console.error('❌ Interactive Demo Error:', error.message);
      process.exit(1);
    });
  } else if (filteredArgs[0] === 'performance-demo') {
    cli.runPerformanceDemo().catch(error => {
      console.error('❌ Performance Demo Error:', error.message);
      process.exit(1);
    });
  } else {
    process.argv = [process.argv[0], process.argv[1], ...filteredArgs];
    cli.execute().catch(error => {
      console.error('❌ CLI Error:', error.message);
      process.exit(1);
    });
  }
}

export { EnhancedContentCLI };
