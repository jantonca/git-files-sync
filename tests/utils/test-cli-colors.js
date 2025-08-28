#!/usr/bin/env node

/**
 * Test CLI Colors Utility
 * Independent test for src/utils/cli-colors.js
 */

import {
  colors,
  ColorManager,
  defaultColorManager,
  colorize,
} from '../../src/utils/cli-colors.js';

console.log('🧪 Testing CLI Colors Utility...\n');

// Test 1: Basic colors object
console.log('1. Testing colors object:');
console.log('   Colors available:', Object.keys(colors));
console.log('   Red code:', colors.red);
console.log('   Reset code:', colors.reset);

// Test 2: ColorManager class
console.log('\n2. Testing ColorManager class:');
const colorManager = new ColorManager(true);
console.log('   Colors enabled:', colorManager.isEnabled());
console.log(
  '   Colorized text:',
  colorManager.colorize('Hello World', 'green')
);

// Test 3: Disable colors
console.log('\n3. Testing color disabling:');
colorManager.setEnabled(false);
console.log('   Colors enabled:', colorManager.isEnabled());
console.log(
  '   Text without color:',
  colorManager.colorize('Hello World', 'green')
);

// Test 4: Re-enable colors
console.log('\n4. Testing color re-enabling:');
colorManager.setEnabled(true);
console.log('   Colors enabled:', colorManager.isEnabled());
console.log(
  '   Text with color:',
  colorManager.colorize('Hello World', 'blue')
);

// Test 5: Default color manager
console.log('\n5. Testing default color manager:');
console.log('   Default manager enabled:', defaultColorManager.isEnabled());
console.log(
  '   Default colorized text:',
  defaultColorManager.colorize('Test Text', 'cyan')
);

// Test 6: Color helper functions
console.log('\n6. Testing color helper functions:');
console.log('   Red helper:', colorize.red('Red text'));
console.log('   Green helper:', colorize.green('Green text'));
console.log('   Blue helper:', colorize.blue('Blue text'));
console.log('   Yellow helper:', colorize.yellow('Yellow text'));
console.log('   Cyan helper:', colorize.cyan('Cyan text'));
console.log('   Bold helper:', colorize.bold('Bold text'));

// Test 7: Invalid color fallback
console.log('\n7. Testing invalid color fallback:');
console.log('   Invalid color:', colorManager.colorize('Test', 'invalid'));
console.log('   Invalid color code:', colorManager.getColorCode('invalid'));

// Test 8: All colors showcase
console.log('\n8. Colors showcase:');
Object.keys(colors).forEach(colorName => {
  if (colorName !== 'reset') {
    console.log(
      `   ${colorManager.colorize(colorName.padEnd(8), colorName)}: Sample text`
    );
  }
});

console.log('\n✅ CLI Colors utility test completed successfully!');
