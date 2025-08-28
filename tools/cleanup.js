#!/usr/bin/env node

/**
 * Content Cleanup CLI - Remove unmanaged content and update gitignore
 *
 * This tool helps manage imported content by:
 * 1. Reading your content configuration from content-config.js
 * 2. Identifying which files are "managed" (should be kept)
 * 3. Finding "unmanaged" files (can be safely removed)
 * 4. Providing safe cleanup options with confirmation
 * 5. Updating .gitignore to exclude managed content from git
 *
 * How it determines managed vs unmanaged files:
 * - FOLDER imports: All .mdx files in the folder are managed
 * - SELECTIVE imports: Only specified files in the config are managed
 * - FILE imports: Only the single specified file is managed
 *
 * Example: If config has selective import for global-accessories with
 * files: ['PZQ8500A00.mdx', 'PZQ8533270.mdx'], then only these 2 files
 * are managed. Any other .mdx files in global-accessories/ are unmanaged.
 */

import { readFile, writeFile, rm, readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');

// ANSI colors for better UX
const colors = {
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Get managed paths from current configuration
async function getManagedPaths() {
  try {
    // Import the config module
    const configModule = await import('../src/utils/config.js');
    const normalizedMapping = configModule.CONFIG.CONTENT_MAPPING;

    const managedPaths = new Set();

    log('📋 Reading content configuration...', 'blue');

    // Add paths based on mapping configuration
    for (const [, config] of Object.entries(normalizedMapping)) {
      const categoryPath = config.destination;

      if (config.type === 'folder') {
        // Add entire folder
        managedPaths.add(categoryPath);
        log(`  ✅ FOLDER: All files in ${categoryPath} are managed`, 'green');
      } else if (config.type === 'selective' && config.files) {
        // Add specific files within the destination folder
        config.files.forEach(file => {
          managedPaths.add(join(categoryPath, file));
        });
        log(
          `  🎯 SELECTIVE: ${config.files.length} specific files in ${categoryPath}`,
          'yellow'
        );
        config.files.forEach(file => log(`     - ${file}`, 'cyan'));
      } else if (config.type === 'file') {
        // Add the specific file path
        managedPaths.add(categoryPath);
        log(`  📄 FILE: Single file ${categoryPath} is managed`, 'blue');
      }
    }

    log(`\n📊 Total managed paths: ${managedPaths.size}`, 'bold');
    return managedPaths;
  } catch (error) {
    log(`Error getting managed paths: ${error.message}`, 'red');
    return new Set();
  }
}

// Get all existing content files
async function getAllContentFiles() {
  const allFiles = [];
  const toyotaDataPath = join(PROJECT_ROOT, 'src/data/toyota');

  try {
    const categories = await readdir(toyotaDataPath);

    for (const category of categories) {
      const categoryPath = join(toyotaDataPath, category);
      try {
        const files = await readdir(categoryPath);
        files.forEach(file => {
          if (file.endsWith('.mdx')) {
            allFiles.push(join('src/data/toyota', category, file));
          }
        });
      } catch {
        // Skip if not a directory
      }
    }
  } catch (error) {
    log(`Error reading content files: ${error.message}`, 'red');
  }

  return allFiles;
}

// Find unmanaged files
async function findUnmanagedFiles() {
  const managedPaths = await getManagedPaths();
  const allFiles = await getAllContentFiles();

  log(`\n🔍 Scanning ${allFiles.length} content files...`, 'blue');

  const unmanagedFiles = [];

  for (const file of allFiles) {
    let isManaged = false;

    for (const managedPath of managedPaths) {
      // Check if file is managed (exact match or within managed folder)
      if (file === managedPath || file.startsWith(managedPath + '/')) {
        isManaged = true;
        break;
      }
    }

    if (!isManaged) {
      unmanagedFiles.push(file);
    }
  }

  log(`📊 Analysis complete:`, 'bold');
  log(`  • Managed files: ${allFiles.length - unmanagedFiles.length}`, 'green');
  log(
    `  • Unmanaged files: ${unmanagedFiles.length}`,
    unmanagedFiles.length > 0 ? 'yellow' : 'green'
  );

  return unmanagedFiles;
}

// Interactive confirmation
async function askConfirmation(message) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => {
    rl.question(`${message} (y/N): `, answer => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

// Remove unmanaged files
async function removeUnmanagedFiles(files) {
  if (files.length === 0) {
    log('✅ No unmanaged files found!', 'green');
    return;
  }

  log(`\n📋 Found ${files.length} unmanaged files:`, 'yellow');
  files.forEach(file => log(`  - ${file}`, 'cyan'));

  const confirm = await askConfirmation('\n❓ Remove these unmanaged files?');

  if (!confirm) {
    log('❌ Operation cancelled', 'yellow');
    return;
  }

  let removed = 0;
  for (const file of files) {
    try {
      const fullPath = join(PROJECT_ROOT, file);
      await rm(fullPath);
      log(`✅ Removed: ${file}`, 'green');
      removed++;
    } catch (error) {
      log(`❌ Failed to remove ${file}: ${error.message}`, 'red');
    }
  }

  log(
    `\n🎉 Successfully removed ${removed}/${files.length} unmanaged files`,
    'green'
  );
}

// Update gitignore with managed content paths
async function updateGitignore() {
  const gitignorePath = join(PROJECT_ROOT, '.gitignore');
  const managedPaths = await getManagedPaths();

  try {
    let gitignoreContent = '';
    try {
      gitignoreContent = await readFile(gitignorePath, 'utf8');
    } catch {
      // File doesn't exist, that's ok
    }

    const contentSection = '\n# Auto-imported content (do not commit)\n';
    const managedPathsArray = Array.from(managedPaths).sort();
    const newEntries = managedPathsArray.map(path => `/${path}`).join('\n');

    // Remove existing auto-imported content section if it exists
    const sectionStart = gitignoreContent.indexOf(
      '# Auto-imported content (do not commit)'
    );
    if (sectionStart !== -1) {
      const beforeSection = gitignoreContent.substring(0, sectionStart);
      const afterSectionMatch = gitignoreContent
        .substring(sectionStart)
        .match(/\n\n(?!\/)/);
      const afterSection = afterSectionMatch
        ? gitignoreContent.substring(sectionStart + afterSectionMatch.index + 2)
        : '';
      gitignoreContent =
        beforeSection.trimEnd() + (afterSection ? '\n\n' + afterSection : '');
    }

    // Add new section
    const updatedContent =
      gitignoreContent + contentSection + newEntries + '\n';

    await writeFile(gitignorePath, updatedContent);
    log('✅ Updated .gitignore with managed content paths', 'green');
    log(`📝 Added ${managedPathsArray.length} paths to gitignore`, 'blue');
  } catch (error) {
    log(`❌ Failed to update .gitignore: ${error.message}`, 'red');
  }
}

// Main CLI function
async function main() {
  const args = process.argv.slice(2);

  log('🧹 Content Cleanup CLI', 'bold');
  log('════════════════════════', 'blue');

  if (args.includes('--help') || args.includes('-h')) {
    log(
      `
📚 CONTENT CLEANUP CLI - Help Guide
═══════════════════════════════════

🎯 PURPOSE:
This tool manages imported content based on your content-config.js settings.
It identifies "managed" vs "unmanaged" files and helps clean up orphaned content.

🔍 HOW IT WORKS:
• Reads your content configuration to understand what should be kept
• Scans src/data/toyota/ for all .mdx files
• Compares actual files vs configured "managed" files
• Identifies unmanaged files that can be safely removed

📝 MANAGED vs UNMANAGED FILES:
• FOLDER import (disclaimers): ALL .mdx files in folder are managed
• SELECTIVE import (global-accessories): ONLY specified files are managed
• FILE import (templates): ONLY the single file is managed

🛠️  USAGE:
  node content-management/content-cleanup.js [options]

OPTIONS:
  --list, -l       📋 List unmanaged files (safe preview, no changes)
  --gitignore, -g  📝 Update .gitignore with managed paths only
  --help, -h       ❓ Show this help guide

  (no options)     🧹 Interactive cleanup with confirmation prompts

📋 EXAMPLES:
  npm run content:cleanup          # Safe preview - list unmanaged files
  npm run content:clean            # Interactive cleanup with prompts
  npm run content:gitignore        # Update .gitignore only

⚠️  SAFETY FEATURES:
• Always shows what will be removed before acting
• Requires explicit confirmation for deletions
• List mode is completely safe (no file changes)
• Validates configuration before proceeding

🎯 TYPICAL WORKFLOW:
1. Run 'npm run content:cleanup' to see what would be removed
2. Review the list to ensure it's correct
3. Run 'npm run content:clean' to interactively remove unmanaged files
4. Optionally update .gitignore with managed paths
`,
      'cyan'
    );
    return;
  }

  try {
    if (args.includes('--gitignore') || args.includes('-g')) {
      await updateGitignore();
      return;
    }

    const unmanagedFiles = await findUnmanagedFiles();

    if (args.includes('--list') || args.includes('-l')) {
      if (unmanagedFiles.length === 0) {
        log('✅ No unmanaged files found!', 'green');
      } else {
        log(`📋 Found ${unmanagedFiles.length} unmanaged files:`, 'yellow');
        unmanagedFiles.forEach(file => log(`  - ${file}`, 'cyan'));
      }
      return;
    }

    // Interactive mode
    await removeUnmanagedFiles(unmanagedFiles);

    // Ask if user wants to update gitignore
    if (unmanagedFiles.length > 0) {
      const updateGit = await askConfirmation(
        '\n❓ Update .gitignore with current managed paths?'
      );
      if (updateGit) {
        await updateGitignore();
      }
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run the CLI
main().catch(error => {
  log(`❌ Unexpected error: ${error.message}`, 'red');
  process.exit(1);
});
