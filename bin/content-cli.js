#!/usr/bin/env node

/**
 * Content CLI Wrapper
 * Simple delegation to existing content-cli.js to preserve 100% functionality
 * Phase 6.1 - Safety First approach
 */

import { ContentCLI } from '../content-cli.js';

// Execute the CLI
const cli = new ContentCLI();
cli.execute().catch(error => {
  console.error('❌ CLI Error:', error.message);
  process.exit(1);
});
