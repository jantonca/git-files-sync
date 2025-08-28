#!/usr/bin/env node

/**
 * Test the Astro adapter
 * Part of Phase 3.1 - Independent adapter testing
 */

import { AstroAdapter } from '../../src/adapters/astro.js';

console.log('🧪 Testing Astro Adapter...\n');

// Test 1: AstroAdapter instantiation
console.log('1. Testing AstroAdapter instantiation...');
try {
  const adapter = new AstroAdapter({ projectRoot: process.cwd() });
  console.log('✅ AstroAdapter instantiated successfully');
  console.log(`   Framework: ${adapter.framework}`);
  console.log(`   Project root: ${adapter.getProjectRoot()}`);
} catch (error) {
  console.error('❌ AstroAdapter instantiation failed:', error.message);
}

// Test 2: Astro-specific methods
console.log('\n2. Testing Astro-specific methods...');
try {
  const adapter = new AstroAdapter();

  console.log(`✅ getContentDir(): "${adapter.getContentDir()}"`);
  console.log(`✅ getBuildDir(): "${adapter.getBuildDir()}"`);
  console.log(`✅ getConfigFile(): "${adapter.getConfigFile()}"`);

  const dataStructure = adapter.getDataDirStructure();
  console.log(
    '✅ getDataDirStructure():',
    JSON.stringify(dataStructure, null, 2)
  );

  const buildCommands = adapter.getBuildCommands();
  console.log('✅ getBuildCommands():', JSON.stringify(buildCommands, null, 2));
} catch (error) {
  console.error('❌ Astro-specific methods testing failed:', error.message);
}

// Test 3: Validate project (should return false since this isn't an Astro project)
console.log('\n3. Testing project validation...');
try {
  const adapter = new AstroAdapter({ projectRoot: process.cwd() });
  const isValid = adapter.validateProject();
  console.log(
    `✅ validateProject(): ${isValid} (expected false for non-Astro project)`
  );
} catch (error) {
  console.error('❌ Project validation testing failed:', error.message);
}

// Test 4: File patterns
console.log('\n4. Testing file patterns...');
try {
  const adapter = new AstroAdapter();
  const patterns = adapter.getFilePatterns();
  console.log('✅ getFilePatterns():', JSON.stringify(patterns, null, 2));
} catch (error) {
  console.error('❌ File patterns testing failed:', error.message);
}

// Test 5: Environment and package configuration
console.log('\n5. Testing environment and package configuration...');
try {
  const adapter = new AstroAdapter();

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
  const adapter = new AstroAdapter();

  const testPaths = [
    'src/data/toyota/models.json',
    'src/data/shared-components/header.json',
    'src/data/disclaimers/legal.md',
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

// Test 7: Setup integration (should not fail even without Astro)
console.log('\n7. Testing setup integration...');
try {
  const adapter = new AstroAdapter({ projectRoot: '/tmp' });
  await adapter.setupIntegration();
  console.log('✅ setupIntegration() completed without errors');
} catch (error) {
  console.error('❌ Setup integration testing failed:', error.message);
}

console.log('\n🎉 Astro Adapter testing completed!');
