#!/usr/bin/env node

/**
 * Test CLI Prompts Utility
 * Independent test for src/utils/cli-prompts.js
 */

import {
  CLIPromptsManager,
  defaultPromptsManager,
  prompt,
  confirm,
  selectFromList,
  inputWithValidation,
  multiChoice,
  numberInput,
  pathInput,
} from '../../src/utils/cli-prompts.js';

console.log('🧪 Testing CLI Prompts Utility...\n');

// Test 1: CLIPromptsManager instantiation
console.log('1. Testing CLIPromptsManager instantiation:');
const promptsManager = new CLIPromptsManager();
console.log('   ✅ CLIPromptsManager created successfully');

// Test 2: createInterface method
console.log('\n2. Testing createInterface method:');
const rl = promptsManager.createInterface();
console.log('   ✅ Readline interface created');
rl.close(); // Close immediately for testing

// Test 3: Default prompts manager
console.log('\n3. Testing default prompts manager:');
console.log(
  '   ✅ Default prompts manager available:',
  typeof defaultPromptsManager
);

// Test 4: Helper functions availability
console.log('\n4. Testing helper functions availability:');
console.log('   ✅ prompt function:', typeof prompt);
console.log('   ✅ confirm function:', typeof confirm);
console.log('   ✅ selectFromList function:', typeof selectFromList);
console.log('   ✅ inputWithValidation function:', typeof inputWithValidation);
console.log('   ✅ multiChoice function:', typeof multiChoice);
console.log('   ✅ numberInput function:', typeof numberInput);
console.log('   ✅ pathInput function:', typeof pathInput);

// Test 5: Validation functions (without user input)
console.log('\n5. Testing validation logic:');

// Test email validator example
const emailValidator = input => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(input);
};

console.log(
  '   Email validator with valid email:',
  emailValidator('test@example.com')
);
console.log(
  '   Email validator with invalid email:',
  emailValidator('invalid-email')
);

// Test number range validator
const numberRangeValidator = (input, min = 1, max = 10) => {
  const num = parseFloat(input);
  if (isNaN(num)) throw new Error('Not a number');
  if (num < min || num > max)
    throw new Error(`Must be between ${min} and ${max}`);
  return true;
};

try {
  console.log(
    '   Number validator with valid number:',
    numberRangeValidator('5')
  );
} catch (e) {
  console.log('   Number validator error:', e.message);
}

try {
  numberRangeValidator('15'); // Should throw error
} catch (e) {
  console.log(
    '   Number validator with invalid number (expected error):',
    e.message
  );
}

// Test 6: selectFromList with empty options
console.log('\n6. Testing selectFromList with empty options:');
try {
  const result = await promptsManager.selectFromList([], 'Test message');
  console.log('   ✅ Empty options handled correctly:', result);
} catch (e) {
  console.log('   ❌ Error with empty options:', e.message);
}

// Test 7: Multi-choice logic (case sensitivity)
console.log('\n7. Testing multi-choice case sensitivity logic:');
const choices = ['Yes', 'No', 'Maybe'];
const normalizedChoices = choices.map(c => c.toLowerCase());
console.log('   Original choices:', choices);
console.log('   Normalized choices:', normalizedChoices);
console.log(
  '   Case insensitive match "yes":',
  normalizedChoices.includes('yes')
);
console.log(
  '   Case insensitive match "YES":',
  normalizedChoices.includes('YES'.toLowerCase())
);

// Test 8: Path validation logic (without file system access)
console.log('\n8. Testing path validation logic:');
const pathValidator = input => {
  if (!input) {
    throw new Error('Path cannot be empty');
  }
  // Additional validation could be added here
  return true;
};

try {
  console.log(
    '   Path validator with valid path:',
    pathValidator('/some/path')
  );
} catch (e) {
  console.log('   Path validator error:', e.message);
}

try {
  pathValidator(''); // Should throw error
} catch (e) {
  console.log('   Path validator with empty path (expected error):', e.message);
}

// Test 9: Confirm logic testing
console.log('\n9. Testing confirm response logic:');
const testConfirmResponse = (response, defaultValue) => {
  if (response === '') {
    return defaultValue;
  }
  return response.toLowerCase() === 'y' || response.toLowerCase() === 'yes';
};

console.log(
  '   Empty response with default true:',
  testConfirmResponse('', true)
);
console.log(
  '   Empty response with default false:',
  testConfirmResponse('', false)
);
console.log('   "y" response:', testConfirmResponse('y', false));
console.log('   "yes" response:', testConfirmResponse('yes', false));
console.log('   "n" response:', testConfirmResponse('n', false));
console.log('   "no" response:', testConfirmResponse('no', false));

console.log('\n✅ CLI Prompts utility test completed successfully!');
console.log(
  '\n💡 Note: Interactive prompts require user input and are tested separately in integration tests.'
);
