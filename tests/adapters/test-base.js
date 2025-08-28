#!/usr/bin/env node

/**
 * Test the base framework adapter
 * Part of Phase 3.1 - Independent adapter testing
 */

import {
  FrameworkAdapter,
  detectFramework,
  createFrameworkAdapter,
} from '../../src/adapters/base.js';

console.log('🧪 Testing Base Framework Adapter...\n');

// Test 1: FrameworkAdapter class instantiation
console.log('1. Testing FrameworkAdapter class instantiation...');
try {
  const adapter = new FrameworkAdapter({ projectRoot: '/tmp/test' });
  console.log('✅ FrameworkAdapter instantiated successfully');
  console.log(`   Project root: ${adapter.getProjectRoot()}`);
} catch (error) {
  console.error('❌ FrameworkAdapter instantiation failed:', error.message);
}

// Test 2: Abstract methods should throw
console.log('\n2. Testing abstract methods throw errors...');
try {
  const adapter = new FrameworkAdapter();

  const abstractMethods = [
    'getContentDir',
    'getBuildDir',
    'getConfigFile',
    'validateProject',
    'setupIntegration',
  ];

  for (const method of abstractMethods) {
    try {
      await adapter[method]();
      console.error(`❌ ${method} should throw error but didn't`);
    } catch (error) {
      console.log(`✅ ${method} throws error correctly: "${error.message}"`);
    }
  }
} catch (error) {
  console.error('❌ Abstract method testing failed:', error.message);
}

// Test 3: Default implementations
console.log('\n3. Testing default implementations...');
try {
  const adapter = new FrameworkAdapter();

  const dataStructure = adapter.getDataDirStructure();
  console.log(
    '✅ getDataDirStructure():',
    JSON.stringify(dataStructure, null, 2)
  );

  const buildCommands = adapter.getBuildCommands();
  console.log('✅ getBuildCommands():', JSON.stringify(buildCommands, null, 2));

  const filePatterns = adapter.getFilePatterns();
  console.log('✅ getFilePatterns():', JSON.stringify(filePatterns, null, 2));

  const envConfig = adapter.getEnvironmentConfig();
  console.log('✅ getEnvironmentConfig():', JSON.stringify(envConfig, null, 2));

  const gitignorePatterns = adapter.getGitignorePatterns();
  console.log('✅ getGitignorePatterns():', gitignorePatterns);

  const packageScripts = adapter.getPackageScripts();
  console.log(
    '✅ getPackageScripts():',
    JSON.stringify(packageScripts, null, 2)
  );

  const transformedPath = adapter.transformContentPath('src/data/test.json');
  console.log(
    `✅ transformContentPath(): "src/data/test.json" → "${transformedPath}"`
  );
} catch (error) {
  console.error('❌ Default implementations testing failed:', error.message);
}

// Test 4: Framework detection
console.log('\n4. Testing framework detection...');
try {
  // Test with current project (should detect nothing or astro)
  const detected = detectFramework(process.cwd());
  console.log(
    `✅ detectFramework() in current directory: ${detected || 'null'}`
  );

  // Test with non-existent directory
  const nonExistent = detectFramework('/non/existent/path');
  console.log(
    `✅ detectFramework() with non-existent path: ${nonExistent || 'null'}`
  );
} catch (error) {
  console.error('❌ Framework detection testing failed:', error.message);
}

// Test 5: Adapter factory with unsupported type
console.log('\n5. Testing adapter factory with unsupported framework...');
try {
  await createFrameworkAdapter('unsupported-framework');
  console.error(
    '❌ Factory should have thrown error for unsupported framework'
  );
} catch (error) {
  console.log(`✅ Factory correctly throws error: "${error.message}"`);
}

console.log('\n🎉 Base Framework Adapter testing completed!');
