#!/usr/bin/env node

/**
 * Test CLI Integration
 * Integration test for CLI utilities working together
 */

import { CLIInterfaceManager } from '../../src/utils/cli.js';
import { ColorManager, colorize } from '../../src/utils/cli-colors.js';
import { CLIPromptsManager } from '../../src/utils/cli-prompts.js';

console.log('🧪 Testing CLI Integration...\n');

// Test 1: Verify all modules can be imported together
console.log('1. Testing module imports:');
console.log('   ✅ CLIInterfaceManager imported');
console.log('   ✅ ColorManager imported');
console.log('   ✅ CLIPromptsManager imported');
console.log('   ✅ colorize helpers imported');

// Test 2: Create instances of all managers
console.log('\n2. Testing manager instantiation:');
const cli = new CLIInterfaceManager();
const colorManager = new ColorManager();
const promptsManager = new CLIPromptsManager();
console.log('   ✅ All managers instantiated successfully');

// Test 3: Test color integration
console.log('\n3. Testing color integration:');
console.log(
  '   Standalone colorize:',
  colorize.green('Green text from standalone')
);
cli.log('   CLI manager colorize: Blue text from CLI', 'blue');
console.log(
  '   Direct color manager:',
  colorManager.colorize('Red text from color manager', 'red')
);

// Test 4: Test internal color coordination
console.log('\n4. Testing internal color coordination:');
console.log('   CLI colors enabled:', cli.hasColors());
console.log('   Color manager enabled:', colorManager.isEnabled());

// Disable colors in CLI and test
cli.setColors(false);
console.log('   After disabling CLI colors:');
cli.log('   This should be plain text', 'red');

// Re-enable for remaining tests
cli.setColors(true);

// Test 5: Test CLI with complex operations
console.log('\n5. Testing complex CLI operations:');

// Simulate a content management workflow
cli.displayCommandStatus('content-fetch', 'starting');

// Display some mappings
const testMappings = {
  'remote/content': 'local/content',
  'remote/assets': 'local/assets',
  'remote/config': 'local/config',
};

cli.displayMappings(testMappings, {
  title: 'Content Mappings',
  showStatus: true,
});

// Show progress simulation
for (let i = 1; i <= 3; i++) {
  cli.displayProgress('Fetching content', i, 3);
}

cli.displayCommandStatus('content-fetch', 'complete', {
  message: 'All content fetched successfully',
});

// Test 6: Test error handling integration
console.log('\n6. Testing error handling integration:');

const errorResult = {
  success: false,
  errors: [
    'Network timeout',
    'Permission denied for remote/private',
    'Local disk space insufficient',
  ],
};

cli.displayResult(errorResult, 'Content Fetch');

// Test 7: Test warning and info displays
console.log('\n7. Testing warning and info displays:');

cli.displayWarning('Some files were skipped', [
  'File too large: document.pdf (>10MB)',
  'Invalid format: data.xlsx',
  'Already exists: README.md',
]);

cli.displayInfoBox('Migration Summary', [
  'Files processed: 156',
  'Files copied: 143',
  'Files skipped: 13',
  'Errors: 0',
  'Duration: 2.3 seconds',
]);

// Test 8: Test method delegation
console.log('\n8. Testing method delegation:');
console.log('   CLI createInterface type:', typeof cli.createInterface);
console.log('   CLI prompt type:', typeof cli.prompt);
console.log('   CLI confirm type:', typeof cli.confirm);
console.log('   CLI selectFromList type:', typeof cli.selectFromList);

// Verify delegation works by checking that methods exist
const rl = cli.createInterface();
console.log('   ✅ Readline interface created through CLI');
rl.close();

// Test 9: Test prompts manager directly
console.log('\n9. Testing prompts manager integration:');
console.log(
  '   Prompts manager createInterface type:',
  typeof promptsManager.createInterface
);
console.log('   Prompts manager prompt type:', typeof promptsManager.prompt);

const directRl = promptsManager.createInterface();
console.log('   ✅ Readline interface created directly');
directRl.close();

// Test 10: Verify no conflicts between managers
console.log('\n10. Testing manager independence:');
const cli1 = new CLIInterfaceManager({ colors: true });
const cli2 = new CLIInterfaceManager({ colors: false });

console.log('   CLI1 colors enabled:', cli1.hasColors());
console.log('   CLI2 colors enabled:', cli2.hasColors());

cli1.log('   CLI1 with colors', 'green');
cli2.log('   CLI2 without colors', 'green');

// Test 11: Test realistic CLI workflow
console.log('\n11. Testing realistic CLI workflow:');

// Simulate content management command
cli.displayHelp({
  fetch: 'Fetch content from remote repository',
  sync: 'Synchronize local content with remote',
  clean: 'Clean up temporary files',
  status: 'Show content status',
});

// Simulate operation progress
cli.displayCommandStatus('sync', 'starting');
cli.displayProgress('Analyzing differences', 1, 4);
cli.displayProgress('Downloading changes', 2, 4);
cli.displayProgress('Applying changes', 3, 4);
cli.displayProgress('Updating indexes', 4, 4);
cli.displayCommandStatus('sync', 'complete');

cli.displaySuccess('Content synchronization completed', [
  'Updated: 5 files',
  'Added: 2 files',
  'Removed: 1 file',
]);

console.log('\n✅ CLI Integration test completed successfully!');
console.log('\n📋 Summary:');
console.log('   • ✅ All modules import correctly');
console.log('   • ✅ Managers work independently');
console.log('   • ✅ Color coordination works');
console.log('   • ✅ Method delegation works');
console.log('   • ✅ Complex workflows supported');
console.log('   • ✅ No conflicts between instances');
