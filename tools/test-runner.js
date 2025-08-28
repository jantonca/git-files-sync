#!/usr/bin/env node

/**
 * Test Runner for Content Management System
 * Organizes and runs tests by category
 */

import { execSync } from 'child_process';
import { readdirSync } from 'fs';
import { join } from 'path';

const TESTS_DIR = 'tests';

// Colors for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function runTest(testPath) {
  try {
    execSync(`node ${testPath}`, { stdio: 'inherit', cwd: process.cwd() });
    return true;
  } catch {
    return false;
  }
}

function runTestsInDirectory(dir) {
  const fullPath = join(TESTS_DIR, dir);

  try {
    const files = readdirSync(fullPath)
      .filter(file => file.startsWith('test-') && file.endsWith('.js'))
      .sort();

    if (files.length === 0) {
      log(`  No test files found in ${dir}/`, colors.yellow);
      return { passed: 0, failed: 0 };
    }

    let passed = 0;
    let failed = 0;

    for (const file of files) {
      const testPath = join(fullPath, file);
      log(`\n  🧪 Running ${file}...`, colors.blue);

      const success = runTest(testPath);
      if (success) {
        passed++;
        log(`  ✅ ${file} passed`, colors.green);
      } else {
        failed++;
        log(`  ❌ ${file} failed`, colors.red);
      }
    }

    return { passed, failed };
  } catch (error) {
    log(`  Error reading directory ${dir}: ${error.message}`, colors.red);
    return { passed: 0, failed: 1 };
  }
}

function main() {
  const args = process.argv.slice(2);
  const category = args[0];

  log(`${colors.bold}Content Management Test Runner${colors.reset}\n`);

  if (category && category !== 'all') {
    // Run specific category
    log(`Running ${category} tests:`, colors.bold);
    const results = runTestsInDirectory(category);
    log(`\n${colors.bold}Results for ${category}:${colors.reset}`);
    log(`  ✅ Passed: ${results.passed}`, colors.green);
    log(`  ❌ Failed: ${results.failed}`, colors.red);
    process.exit(results.failed > 0 ? 1 : 0);
  } else {
    // Run all categories
    const categories = [
      'services',
      'adapters',
      'utils',
      'integration',
      'verification',
    ];
    const totalResults = { passed: 0, failed: 0 };

    for (const cat of categories) {
      log(`\n${colors.bold}=== ${cat.toUpperCase()} TESTS ===${colors.reset}`);
      const results = runTestsInDirectory(cat);
      totalResults.passed += results.passed;
      totalResults.failed += results.failed;
    }

    log(`\n${colors.bold}=== FINAL RESULTS ===${colors.reset}`);
    log(`  ✅ Total Passed: ${totalResults.passed}`, colors.green);
    log(`  ❌ Total Failed: ${totalResults.failed}`, colors.red);
    log(
      `  📊 Success Rate: ${Math.round((totalResults.passed / (totalResults.passed + totalResults.failed)) * 100)}%`,
      totalResults.failed === 0 ? colors.green : colors.yellow
    );

    process.exit(totalResults.failed > 0 ? 1 : 0);
  }
}

// Help message
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Usage: node test-runner.js [category]

Categories:
  services      Run service tests (Phase 2)
  adapters      Run adapter tests (Phase 3)
  utils         Run utility tests (Phase 5)
  integration   Run integration tests
  verification  Run verification tests
  all           Run all tests (default)

Examples:
  node test-runner.js utils          # Run only utility tests
  node test-runner.js all            # Run all test categories
  node test-runner.js                # Run all test categories (default)
`);
  process.exit(0);
}

main();
