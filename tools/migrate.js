#!/usr/bin/env node

/**
 * Package Migration Tool
 * Helps upgrade existing projects to use the new content-management package structure
 */

import { readFile, writeFile, readdir } from 'fs/promises';
import { join, extname } from 'path';

// Migration mapping rules for external projects
const IMPORT_MIGRATIONS = {
  // Legacy copy-folder approach → npm package
  './content-management/content-fetcher.js': '@rotor/content-management',
  './content-management/content-manager.js': '@rotor/content-management',
  './content-management/lib/services/git-service.js':
    '@rotor/content-management/services',
  './content-management/lib/services/file-service.js':
    '@rotor/content-management/services',
  './content-management/lib/services/cache-service.js':
    '@rotor/content-management/services',
  './content-management/lib/adapters/': '@rotor/content-management/adapters',
  './content-management/lib/config-loader.js':
    '@rotor/content-management/utils',

  // Old relative imports within copy-folder → npm package
  '../content-management/content-fetcher.js': '@rotor/content-management',
  '../../content-management/content-fetcher.js': '@rotor/content-management',
  './lib/services/git-service.js': '@rotor/content-management/services',
  './lib/services/file-service.js': '@rotor/content-management/services',
  './lib/services/cache-service.js': '@rotor/content-management/services',
  './lib/adapters/': '@rotor/content-management/adapters',
  './lib/config-loader.js': '@rotor/content-management/utils',
};

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

async function findJSFiles(dir) {
  const files = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.')) {
      files.push(...(await findJSFiles(fullPath)));
    } else if (
      entry.isFile() &&
      ['.js', '.mjs', '.ts'].includes(extname(entry.name))
    ) {
      files.push(fullPath);
    }
  }
  return files;
}

async function migrateFile(filePath) {
  const content = await readFile(filePath, 'utf8');
  let updated = content;
  let changes = 0;

  // Update import statements
  for (const [oldPath, newPath] of Object.entries(IMPORT_MIGRATIONS)) {
    const importRegex = new RegExp(
      `import\\s+.*?from\\s+['"]${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`,
      'g'
    );
    const requireRegex = new RegExp(
      `require\\(['"]${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]\\)`,
      'g'
    );

    if (importRegex.test(updated) || requireRegex.test(updated)) {
      updated = updated.replace(importRegex, match =>
        match.replace(oldPath, newPath)
      );
      updated = updated.replace(requireRegex, match =>
        match.replace(oldPath, newPath)
      );
      changes++;
    }
  }

  if (changes > 0) {
    await writeFile(filePath, updated);
    log(`  ✅ Updated ${filePath} (${changes} changes)`, 'green');
    return true;
  }
  return false;
}

function showHelp() {
  log('🔄 Content Management Package Migration Tool', 'bold');
  log('═'.repeat(50), 'cyan');
  log('\n📝 Usage:', 'blue');
  log('  node tools/migrate.js [directory]', 'cyan');
  log('  npx content-migrate [directory]', 'cyan');
  log('\n📋 Options:', 'blue');
  log('  directory    Project directory to migrate (default: current)', 'cyan');
  log('  --help       Show this help message', 'cyan');
  log('\n💡 Examples:', 'blue');
  log('  node tools/migrate.js .          # Migrate current directory', 'cyan');
  log(
    '  npx content-migrate /path/proj   # Migrate specific directory',
    'cyan'
  );
  log('\n🔧 What it does:', 'blue');
  log('  • Scans JavaScript/TypeScript files for old import paths', 'cyan');
  log('  • Updates imports to use new package structure', 'cyan');
  log('  • Preserves existing code and functionality', 'cyan');
}

async function main() {
  const arg = process.argv[2];

  if (arg === '--help' || arg === '-h') {
    showHelp();
    return;
  }

  const projectDir = arg || process.cwd();

  log('🔄 Content Management Package Migration Tool', 'bold');
  log('═'.repeat(50), 'cyan');
  log(`📁 Scanning project: ${projectDir}`, 'blue');

  try {
    const jsFiles = await findJSFiles(projectDir);
    log(`📄 Found ${jsFiles.length} JavaScript/TypeScript files`, 'blue');

    let updatedFiles = 0;
    for (const file of jsFiles) {
      if (await migrateFile(file)) updatedFiles++;
    }

    log('\n📊 Migration Results:', 'bold');
    log(`  • Files scanned: ${jsFiles.length}`, 'blue');
    log(`  • Files updated: ${updatedFiles}`, 'green');
    log(`  • Files unchanged: ${jsFiles.length - updatedFiles}`, 'yellow');

    if (updatedFiles > 0) {
      log('\n✅ Migration completed successfully!', 'green');
      log('💡 Next steps:', 'cyan');
      log(
        '  1. Install the new package: npm install @rotor/content-management',
        'blue'
      );
      log('  2. Test your application', 'blue');
      log('  3. Remove old content-management files', 'blue');
    } else {
      log('\n⚡ No migration needed - project already up to date!', 'yellow');
    }
  } catch (error) {
    log(`❌ Migration failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { migrateFile, IMPORT_MIGRATIONS };
