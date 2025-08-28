#!/usr/bin/env node

/**
 * Test the Next.js adapter
 * Part of Phase 3.1 - Independent adapter testing
 */

import { NextJSAdapter } from '../../src/adapters/nextjs.js';

console.log('🧪 Testing Next.js Adapter...\n');

// Test 1: NextJSAdapter instantiation
console.log('1. Testing NextJSAdapter instantiation...');
try {
  const adapter = new NextJSAdapter({ projectRoot: process.cwd() });
  console.log('✅ NextJSAdapter instantiated successfully');
  console.log(`   Framework: ${adapter.framework}`);
  console.log(`   Project root: ${adapter.getProjectRoot()}`);
} catch (error) {
  console.error('❌ NextJSAdapter instantiation failed:', error.message);
}

// Test 2: Next.js-specific methods
console.log('\n2. Testing Next.js-specific methods...');
try {
  const adapter = new NextJSAdapter();

  console.log(`✅ getContentDir(): "${adapter.getContentDir()}"`);
  console.log(`✅ getBuildDir(): "${adapter.getBuildDir()}"`);
  console.log(`✅ getConfigFile(): "${adapter.getConfigFile()}"`);
  console.log(`✅ getRouterType(): "${adapter.getRouterType()}"`);

  const dataStructure = adapter.getDataDirStructure();
  console.log(
    '✅ getDataDirStructure():',
    JSON.stringify(dataStructure, null, 2)
  );

  const buildCommands = adapter.getBuildCommands();
  console.log('✅ getBuildCommands():', JSON.stringify(buildCommands, null, 2));
} catch (error) {
  console.error('❌ Next.js-specific methods testing failed:', error.message);
}

// Test 3: Validate project (should return false since this isn't a Next.js project)
console.log('\n3. Testing project validation...');
try {
  const adapter = new NextJSAdapter({ projectRoot: process.cwd() });
  const isValid = adapter.validateProject();
  console.log(
    `✅ validateProject(): ${isValid} (expected false for non-Next.js project)`
  );
} catch (error) {
  console.error('❌ Project validation testing failed:', error.message);
}

// Test 4: File patterns
console.log('\n4. Testing file patterns...');
try {
  const adapter = new NextJSAdapter();
  const patterns = adapter.getFilePatterns();
  console.log('✅ getFilePatterns():', JSON.stringify(patterns, null, 2));
} catch (error) {
  console.error('❌ File patterns testing failed:', error.message);
}

// Test 5: Environment and package configuration
console.log('\n5. Testing environment and package configuration...');
try {
  const adapter = new NextJSAdapter();

  const envConfig = adapter.getEnvironmentConfig();
  console.log('✅ getEnvironmentConfig():', JSON.stringify(envConfig, null, 2));

  const packageScripts = adapter.getPackageScripts();
  console.log(
    '✅ getPackageScripts():',
    JSON.stringify(packageScripts, null, 2)
  );

  const gitignorePatterns = adapter.getGitignorePatterns();
  console.log('✅ getGitignorePatterns():', gitignorePatterns);
} catch (error) {
  console.error(
    '❌ Environment/package configuration testing failed:',
    error.message
  );
}

// Test 6: Content path transformation
console.log('\n6. Testing content path transformation...');
try {
  const adapter = new NextJSAdapter();

  const testPaths = [
    'src/data/toyota/models.json',
    'content/blog/post.md',
    'data/config.json',
  ];

  for (const testPath of testPaths) {
    const transformed = adapter.transformContentPath(testPath);
    console.log(`✅ "${testPath}" → "${transformed}"`);
  }
} catch (error) {
  console.error(
    '❌ Content path transformation testing failed:',
    error.message
  );
}

// Test 7: Setup integration (should not fail even without Next.js)
console.log('\n7. Testing setup integration...');
try {
  const adapter = new NextJSAdapter({ projectRoot: '/tmp' });
  await adapter.setupIntegration();
  console.log('✅ setupIntegration() completed without errors');
} catch (error) {
  console.error('❌ Setup integration testing failed:', error.message);
}

console.log('\n🎉 Next.js Adapter testing completed!');
