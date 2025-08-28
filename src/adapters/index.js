/**
 * Adapter Index - Centralized exports for all framework adapters
 * Part of the Content Management Package
 *
 * This file provides a single entry point for importing all adapters
 * and includes the factory function for creating adapters
 */

// Import and re-export everything from base
import {
  FrameworkAdapter,
  detectFramework,
  createFrameworkAdapter,
} from './base.js';

// Export base adapter and utilities
export { FrameworkAdapter, detectFramework, createFrameworkAdapter };

// Export specific adapters
export { AstroAdapter } from './astro.js';
export { NextJSAdapter } from './nextjs.js';
export { ReactAdapter } from './react.js';

// Re-export the factory function as default for convenience
export { createFrameworkAdapter as default };

/**
 * Get all available adapter types
 * @returns {string[]} Array of supported framework types
 */
export function getSupportedFrameworks() {
  return ['astro', 'nextjs', 'react', 'react-vite', 'react-cra'];
}

/**
 * Create adapter by auto-detection
 * @param {object} options - Adapter options
 * @returns {Promise<FrameworkAdapter>} Framework-specific adapter instance
 */
export async function createAdapter(options = {}) {
  return createFrameworkAdapter(null, options);
}

/**
 * Create adapter for specific framework
 * @param {string} framework - Framework type
 * @param {object} options - Adapter options
 * @returns {Promise<FrameworkAdapter>} Framework-specific adapter instance
 */
export async function createAdapterFor(framework, options = {}) {
  return createFrameworkAdapter(framework, options);
}
