#!/usr/bin/env node

/**
 * Test CLI Main Utility
 * Independent test for src/utils/cli.js
 */

import { CLIInterfaceManager } from '../../src/utils/cli.js';

console.log('🧪 Testing CLI Main Utility...\n');

// Test 1: CLIInterfaceManager instantiation
console.log('1. Testing CLIInterfaceManager instantiation:');
const cli = new CLIInterfaceManager();
console.log('   ✅ CLIInterfaceManager created successfully');

// Test 2: CLIInterfaceManager with options
console.log('\n2. Testing CLIInterfaceManager with options:');
const cliNoColors = new CLIInterfaceManager({ colors: false });
console.log('   ✅ CLIInterfaceManager with disabled colors created');

// Test 3: Color management
console.log('\n3. Testing color management:');
console.log('   Colors enabled by default:', cli.hasColors());
console.log('   Colors disabled in second instance:', cliNoColors.hasColors());

cli.setColors(false);
console.log('   Colors after setColors(false):', cli.hasColors());

cli.setColors(true);
console.log('   Colors after setColors(true):', cli.hasColors());

// Test 4: Basic logging
console.log('\n4. Testing basic logging:');
cli.log('   Normal message');
cli.log('   Green message', 'green');
cli.log('   Blue message', 'blue');
cli.log('   Red message', 'red');
cli.log('   Yellow message', 'yellow');
cli.log('   Cyan message', 'cyan');
cli.log('   Bold message', 'bold');

// Test 5: Logging without colors
console.log('\n5. Testing logging without colors:');
cliNoColors.log('   Message without colors (should be plain)');
cliNoColors.log('   Red message without colors (should be plain)', 'red');

// Test 6: Display methods
console.log('\n6. Testing display methods:');

// displayHelp
cli.displayHelp({
  test: 'Test command',
  demo: 'Demo command',
});

// displayMappings
const testMappings = {
  'src/content': 'content/pages',
  'src/assets': 'public/assets',
};

cli.displayMappings(testMappings, {
  title: 'Test Mappings',
  showStatus: false,
});

// displayMappings with empty mappings
cli.displayMappings({}, { title: 'Empty Mappings' });

// Test 7: Display result methods
console.log('\n7. Testing display result methods:');

// Success result
const successResult = {
  success: true,
  added: {
    source: 'test/source',
    destination: 'test/dest',
  },
};

cli.displayResult(successResult, 'Add Operation');

// Error result
const errorResult = {
  success: false,
  errors: ['Error 1', 'Error 2'],
};

cli.displayResult(errorResult, 'Failed Operation');

// Test 8: Display messages
console.log('\n8. Testing display message methods:');

cli.displaySuccess('Operation successful', ['Detail 1', 'Detail 2']);
cli.displayError('Operation failed', ['Error detail 1', 'Error detail 2']);
cli.displayWarning('Warning message', ['Warning detail 1', 'Warning detail 2']);

// Test 9: Display progress
console.log('\n9. Testing display progress:');
cli.displayProgress('Processing files', 3, 10);
cli.displayProgress('Processing files', 7, 10);
cli.displayProgress('Processing files', 10, 10);

// Test 10: Display info box
console.log('\n10. Testing display info box:');
cli.displayInfoBox(
  'Information',
  ['This is line 1', 'This is a longer line 2', 'Line 3'],
  'blue'
);

// Test 11: Display command status
console.log('\n11. Testing display command status:');
cli.displayCommandStatus('git clone', 'starting');
cli.displayCommandStatus('git clone', 'progress', {
  message: 'Cloning repository...',
});
cli.displayCommandStatus('git clone', 'complete', {
  message: 'Repository cloned successfully',
});
cli.displayCommandStatus('git clone', 'error', {
  message: 'Clone failed',
  errors: ['Network error', 'Permission denied'],
});

// Test 12: Delegation methods
console.log('\n12. Testing delegation methods:');
console.log(
  '   ✅ createInterface method available:',
  typeof cli.createInterface
);
console.log('   ✅ prompt method available:', typeof cli.prompt);
console.log('   ✅ confirm method available:', typeof cli.confirm);
console.log(
  '   ✅ selectFromList method available:',
  typeof cli.selectFromList
);
console.log(
  '   ✅ inputWithValidation method available:',
  typeof cli.inputWithValidation
);

// Test 13: Internal selection display
console.log('\n13. Testing internal selection display:');
cli._displaySelectionOptions(
  ['Option 1', 'Option 2', 'Option 3'],
  'Test Selection'
);

console.log('\n✅ CLI Main utility test completed successfully!');
console.log(
  '\n💡 Note: Interactive methods are tested separately in integration tests.'
);
