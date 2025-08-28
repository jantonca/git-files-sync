#!/usr/bin/env node

import { ColorManager } from './cli-colors.js';

// Centralized constants for performance monitoring
const PERFORMANCE_CONSTANTS = {
  MEMORY_UNITS: { BYTES: 1, KB: 1024, MB: 1024 * 1024, GB: 1024 * 1024 * 1024 },
  LOG_LEVELS: { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 },
  METRIC_TYPES: {
    TIMING: 'timing',
    MEMORY: 'memory',
    CACHE: 'cache',
    OPERATION: 'operation',
  },
  THRESHOLDS: { MEMORY_WARNING: 100, OPERATION_SLOW: 1000, CACHE_HIT_LOW: 0.5 },
};

/**
 * Performance metrics collection and timing utilities
 * Follows DRY principle with centralized metric management
 */
export class PerformanceMonitor {
  constructor(options = {}) {
    this.colorManager = new ColorManager(options.colors !== false);
    this.metrics = new Map();
    this.timers = new Map();
    this.startTime = Date.now();
    this.startMemory = process.memoryUsage();
  }

  // Start timing operation - returns timer ID for stopping
  startTimer(operation) {
    const timerId = `${operation}-${Date.now()}`;
    this.timers.set(timerId, {
      operation,
      startTime: process.hrtime.bigint(),
      startMemory: process.memoryUsage(),
    });
    return timerId;
  }

  // Stop timer and record metrics
  stopTimer(timerId) {
    const timer = this.timers.get(timerId);
    if (!timer) return null;

    const endTime = process.hrtime.bigint();
    const endMemory = process.memoryUsage();
    const duration = Number(endTime - timer.startTime) / 1000000; // Convert to ms

    const metric = {
      operation: timer.operation,
      duration,
      memoryDelta: endMemory.heapUsed - timer.startMemory.heapUsed,
      timestamp: Date.now(),
    };

    this._recordMetric(PERFORMANCE_CONSTANTS.METRIC_TYPES.TIMING, metric);
    this.timers.delete(timerId);
    return metric;
  }

  // Record custom metric
  recordMetric(type, data) {
    this._recordMetric(type, { ...data, timestamp: Date.now() });
  }

  // Get current memory usage formatted
  getMemoryUsage() {
    const usage = process.memoryUsage();
    return {
      heap: this._formatBytes(usage.heapUsed),
      external: this._formatBytes(usage.external),
      rss: this._formatBytes(usage.rss),
      raw: usage,
    };
  }

  // Get performance summary
  getSummary() {
    const totalTime = Date.now() - this.startTime;
    const currentMemory = process.memoryUsage();
    const memoryDelta = currentMemory.heapUsed - this.startMemory.heapUsed;

    return {
      totalTime,
      memoryDelta: this._formatBytes(memoryDelta),
      currentMemory: this.getMemoryUsage(),
      metricsCount: this.metrics.size,
      timersActive: this.timers.size,
    };
  }

  // Get metrics by type
  getMetrics(type) {
    return this.metrics.get(type) || [];
  }

  // Private methods
  _recordMetric(type, data) {
    if (!this.metrics.has(type)) {
      this.metrics.set(type, []);
    }
    this.metrics.get(type).push(data);
  }

  _formatBytes(bytes) {
    const { MEMORY_UNITS } = PERFORMANCE_CONSTANTS;
    if (bytes >= MEMORY_UNITS.GB)
      return `${(bytes / MEMORY_UNITS.GB).toFixed(2)}GB`;
    if (bytes >= MEMORY_UNITS.MB)
      return `${(bytes / MEMORY_UNITS.MB).toFixed(2)}MB`;
    if (bytes >= MEMORY_UNITS.KB)
      return `${(bytes / MEMORY_UNITS.KB).toFixed(2)}KB`;
    return `${bytes}B`;
  }
}

/**
 * Advanced logging system with levels and formatting
 * Size-conscious implementation with minimal overhead
 */
export class Logger {
  constructor(options = {}) {
    this.colorManager = new ColorManager(options.colors !== false);
    this.level = options.level || PERFORMANCE_CONSTANTS.LOG_LEVELS.INFO;
    this.showTimestamps = options.timestamps !== false;
    this.logHistory = [];
    this.maxHistory = options.maxHistory || 1000;
  }

  debug(message, data = null) {
    this._log(
      PERFORMANCE_CONSTANTS.LOG_LEVELS.DEBUG,
      '🐛',
      'gray',
      message,
      data
    );
  }

  info(message, data = null) {
    this._log(
      PERFORMANCE_CONSTANTS.LOG_LEVELS.INFO,
      'ℹ️',
      'blue',
      message,
      data
    );
  }

  warn(message, data = null) {
    this._log(
      PERFORMANCE_CONSTANTS.LOG_LEVELS.WARN,
      '⚠️',
      'yellow',
      message,
      data
    );
  }

  error(message, data = null) {
    this._log(
      PERFORMANCE_CONSTANTS.LOG_LEVELS.ERROR,
      '❌',
      'red',
      message,
      data
    );
  }

  // Log performance metrics with automatic formatting
  performance(metric) {
    const duration = metric.duration ? `${metric.duration.toFixed(2)}ms` : '';
    const memory = metric.memoryDelta
      ? `(${this._formatBytes(metric.memoryDelta)})`
      : '';
    this.info(`Performance: ${metric.operation} ${duration} ${memory}`.trim());
  }

  // Get log history
  getHistory(level = null) {
    return level !== null
      ? this.logHistory.filter(log => log.level >= level)
      : this.logHistory;
  }

  // Private methods
  _log(level, icon, color, message, data) {
    if (level < this.level) return;

    const timestamp = this.showTimestamps
      ? `[${new Date().toISOString()}] `
      : '';
    const formattedMessage = this.colorManager.colorize(
      `${timestamp}${icon} ${message}`,
      color
    );

    console.log(formattedMessage);
    if (data) console.log(data);

    // Store in history (memory-efficient circular buffer)
    this.logHistory.push({ level, message, data, timestamp: Date.now() });
    if (this.logHistory.length > this.maxHistory) {
      this.logHistory.shift();
    }
  }

  _formatBytes(bytes) {
    const { MEMORY_UNITS } = PERFORMANCE_CONSTANTS;
    if (bytes >= MEMORY_UNITS.MB)
      return `${(bytes / MEMORY_UNITS.MB).toFixed(1)}MB`;
    if (bytes >= MEMORY_UNITS.KB)
      return `${(bytes / MEMORY_UNITS.KB).toFixed(1)}KB`;
    return `${bytes}B`;
  }
}

/**
 * Cache statistics and optimization analyzer
 * Modular design for different cache types
 */
export class CacheAnalyzer {
  constructor(options = {}) {
    this.colorManager = new ColorManager(options.colors !== false);
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      operations: [],
    };
  }

  // Record cache operation
  recordOperation(type, key, hit = false) {
    const operation = { type, key, hit, timestamp: Date.now() };

    this.stats.operations.push(operation);
    this.stats[type]++;

    if (type === 'get') {
      hit ? this.stats.hits++ : this.stats.misses++;
    }
  }

  // Get cache statistics
  getStats() {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? this.stats.hits / total : 0;

    return {
      hitRate: (hitRate * 100).toFixed(1),
      totalOperations: total,
      ...this.stats,
      analysis: this._analyzePerformance(hitRate),
    };
  }

  // Generate optimization suggestions
  getOptimizationSuggestions() {
    const stats = this.getStats();
    const suggestions = [];

    if (
      parseFloat(stats.hitRate) <
      PERFORMANCE_CONSTANTS.THRESHOLDS.CACHE_HIT_LOW * 100
    ) {
      suggestions.push({
        type: 'warning',
        message: 'Low cache hit rate detected',
        suggestion: 'Consider adjusting cache key strategy or TTL settings',
      });
    }

    if (this.stats.operations.length > 1000) {
      suggestions.push({
        type: 'info',
        message: 'High cache operation volume',
        suggestion:
          'Consider implementing cache partitioning or cleanup strategies',
      });
    }

    return suggestions;
  }

  // Private methods
  _analyzePerformance(hitRate) {
    if (hitRate >= 0.8) return 'excellent';
    if (hitRate >= 0.6) return 'good';
    if (hitRate >= 0.4) return 'fair';
    return 'poor';
  }
}

/**
 * Main performance and monitoring coordinator
 * Integrates all monitoring components following DRY principles
 */
export class PerformanceManager {
  constructor(options = {}) {
    this.monitor = new PerformanceMonitor(options);
    this.logger = new Logger(options);
    this.cacheAnalyzer = new CacheAnalyzer(options);
    this.colorManager = new ColorManager(options.colors !== false);
    this.reportingEnabled = options.reporting !== false;
  }

  // Convenient wrapper for timed operations
  async timeOperation(operation, fn) {
    const timerId = this.monitor.startTimer(operation);
    this.logger.debug(`Starting operation: ${operation}`);

    try {
      const result = await fn();
      const metric = this.monitor.stopTimer(timerId);
      this.logger.performance(metric);

      // Auto-warn on slow operations
      if (metric.duration > PERFORMANCE_CONSTANTS.THRESHOLDS.OPERATION_SLOW) {
        this.logger.warn(
          `Slow operation detected: ${operation} took ${metric.duration.toFixed(2)}ms`
        );
      }

      return result;
    } catch (error) {
      this.monitor.stopTimer(timerId);
      this.logger.error(`Operation failed: ${operation}`, error.message);
      throw error;
    }
  }

  // Generate comprehensive performance report
  generateReport() {
    const summary = this.monitor.getSummary();
    const cacheStats = this.cacheAnalyzer.getStats();
    const suggestions = this.cacheAnalyzer.getOptimizationSuggestions();

    const report = {
      timestamp: new Date().toISOString(),
      summary,
      cache: cacheStats,
      suggestions,
      metrics: {
        timing: this.monitor.getMetrics(
          PERFORMANCE_CONSTANTS.METRIC_TYPES.TIMING
        ),
        memory: this.monitor.getMetrics(
          PERFORMANCE_CONSTANTS.METRIC_TYPES.MEMORY
        ),
      },
    };

    if (this.reportingEnabled) {
      this._displayReport(report);
    }

    return report;
  }

  // Private methods
  _displayReport(report) {
    console.log(this.colorManager.colorize('\n📊 Performance Report', 'cyan'));
    console.log(this.colorManager.colorize('═'.repeat(50), 'cyan'));

    console.log(`\n⏱️  Total Runtime: ${report.summary.totalTime}ms`);
    console.log(`💾 Memory Delta: ${report.summary.memoryDelta}`);
    console.log(`📈 Cache Hit Rate: ${report.cache.hitRate}%`);
    console.log(`🔄 Active Timers: ${report.summary.timersActive}`);

    if (report.suggestions.length > 0) {
      console.log(
        this.colorManager.colorize('\n💡 Optimization Suggestions:', 'yellow')
      );
      report.suggestions.forEach(suggestion => {
        const icon = suggestion.type === 'warning' ? '⚠️' : 'ℹ️';
        console.log(`  ${icon} ${suggestion.message}`);
        console.log(`     ${suggestion.suggestion}`);
      });
    }
  }
}

export { PERFORMANCE_CONSTANTS };
