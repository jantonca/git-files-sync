#!/usr/bin/env node

/**
 * Package Validator Tool
 * Ensures package structure integrity and validates exports
 */

import { readFile, access, readdir } from 'fs/promises';
import { join } from 'path';

const colors = {
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

const log = (msg, color = 'reset') =>
  console.log(`${colors[color]}${msg}${colors.reset}`);

// Expected package structure
const REQUIRED_STRUCTURE = {
  'package.json': 'file',
  'index.js': 'file',
  'src/': 'directory',
  'src/core/': 'directory',
  'src/services/': 'directory',
  'src/adapters/': 'directory',
  'src/utils/': 'directory',
  'bin/': 'directory',
  'tools/': 'directory',
};

const REQUIRED_EXPORTS = [
  'src/core/index.js',
  'src/services/index.js',
  'src/adapters/index.js',
  'src/utils/index.js',
];

async function checkPath(basePath, relativePath, expectedType) {
  try {
    const fullPath = join(basePath, relativePath);
    await access(fullPath);

    if (expectedType === 'directory') {
      const stat = await readdir(fullPath);
      return { exists: true, isEmpty: stat.length === 0 };
    }
    return { exists: true, isEmpty: false };
  } catch {
    return { exists: false, isEmpty: true };
  }
}

async function validateStructure(packagePath) {
  log('📁 Validating package structure...', 'blue');
  let errors = 0;

  for (const [path, type] of Object.entries(REQUIRED_STRUCTURE)) {
    const result = await checkPath(packagePath, path, type);

    if (!result.exists) {
      log(`  ❌ Missing ${type}: ${path}`, 'red');
      errors++;
    } else if (result.isEmpty && type === 'directory') {
      log(`  ⚠️  Empty ${type}: ${path}`, 'yellow');
    } else {
      log(`  ✅ Found ${type}: ${path}`, 'green');
    }
  }

  return errors;
}

async function validateExports(packagePath) {
  log('\n📦 Validating export files...', 'blue');
  let errors = 0;

  for (const exportPath of REQUIRED_EXPORTS) {
    try {
      const fullPath = join(packagePath, exportPath);
      const content = await readFile(fullPath, 'utf8');

      if (content.includes('export') || content.includes('module.exports')) {
        log(`  ✅ Export file valid: ${exportPath}`, 'green');
      } else {
        log(`  ⚠️  No exports found: ${exportPath}`, 'yellow');
      }
    } catch {
      log(`  ❌ Missing export file: ${exportPath}`, 'red');
      errors++;
    }
  }

  return errors;
}

async function validatePackageJson(packagePath) {
  log('\n📋 Validating package.json...', 'blue');
  let errors = 0;

  try {
    const pkgPath = join(packagePath, 'package.json');
    const content = await readFile(pkgPath, 'utf8');
    const pkg = JSON.parse(content);

    // Check required fields
    const requiredFields = ['name', 'version', 'main', 'bin', 'exports'];
    for (const field of requiredFields) {
      if (pkg[field]) {
        log(
          `  ✅ Has ${field}: ${typeof pkg[field] === 'object' ? 'configured' : pkg[field]}`,
          'green'
        );
      } else {
        log(`  ❌ Missing field: ${field}`, 'red');
        errors++;
      }
    }

    // Check bin entries
    if (pkg.bin && typeof pkg.bin === 'object') {
      for (const [cmd, path] of Object.entries(pkg.bin)) {
        const binExists = await checkPath(packagePath, path, 'file');
        if (binExists.exists) {
          log(`  ✅ Bin command '${cmd}' → ${path}`, 'green');
        } else {
          log(`  ❌ Missing bin file: ${path}`, 'red');
          errors++;
        }
      }
    }
  } catch (error) {
    log(`  ❌ Invalid package.json: ${error.message}`, 'red');
    errors++;
  }

  return errors;
}

async function testCLICommands(packagePath) {
  log('\n🧪 Testing CLI commands...', 'blue');

  try {
    const { execSync } = await import('child_process');
    const commands = [
      'bin/content-cli.js --version',
      'bin/content-cli-enhanced.js --help',
    ];

    for (const cmd of commands) {
      try {
        execSync(`node ${cmd}`, { cwd: packagePath, stdio: 'pipe' });
        log(`  ✅ CLI command works: ${cmd}`, 'green');
      } catch {
        log(`  ❌ CLI command failed: ${cmd}`, 'red');
      }
    }
  } catch {
    log('  ⚠️  Cannot test CLI commands (child_process unavailable)', 'yellow');
  }
}

function showHelp() {
  log('🔍 Content Management Package Validator', 'bold');
  log('═'.repeat(50), 'cyan');
  log('\n📝 Usage:', 'blue');
  log('  node tools/package-validator.js [directory]', 'cyan');
  log('  npx content-validate [directory]', 'cyan');
  log('\n📋 Options:', 'blue');
  log(
    '  directory    Package directory to validate (default: current)',
    'cyan'
  );
  log('  --help       Show this help message', 'cyan');
  log('\n💡 Examples:', 'blue');
  log(
    '  node tools/package-validator.js .        # Validate current directory',
    'cyan'
  );
  log(
    '  npx content-validate /path/package       # Validate specific package',
    'cyan'
  );
  log('\n🔧 What it validates:', 'blue');
  log('  • Package structure integrity (src/, bin/, tools/)', 'cyan');
  log('  • Export files exist and are accessible', 'cyan');
  log('  • package.json configuration', 'cyan');
  log('  • CLI commands functionality', 'cyan');
}

async function main() {
  const arg = process.argv[2];

  if (arg === '--help' || arg === '-h') {
    showHelp();
    return;
  }

  const packagePath = arg || process.cwd();

  log('🔍 Content Management Package Validator', 'bold');
  log('═'.repeat(50), 'cyan');
  log(`📁 Validating package: ${packagePath}`, 'blue');

  try {
    let totalErrors = 0;

    totalErrors += await validateStructure(packagePath);
    totalErrors += await validateExports(packagePath);
    totalErrors += await validatePackageJson(packagePath);
    await testCLICommands(packagePath);

    log('\n📊 Validation Results:', 'bold');
    if (totalErrors === 0) {
      log('✅ Package validation passed!', 'green');
      log('🎉 Package is ready for distribution', 'cyan');
    } else {
      log(`❌ Validation failed with ${totalErrors} error(s)`, 'red');
      log('🔧 Please fix the issues above before publishing', 'yellow');
      process.exit(1);
    }
  } catch (error) {
    log(`💥 Validation error: ${error.message}`, 'red');
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { validateStructure, validateExports, validatePackageJson };
