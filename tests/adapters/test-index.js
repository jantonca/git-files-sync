#!/usr/bin/env node

/**
 * Test the adapter index file
 * Part of Phase 3.2 - Testing adapter factory
 */

import * as adapters from '../../src/adapters/index.js';

console.log('🧪 Testing Adapter Index...\n');

// Test 1: Check all exports are available
console.log('1. Testing adapter exports...');
try {
  const exportedNames = Object.keys(adapters);
  console.log('✅ Available exports:', exportedNames);

  // Check for required exports
  const requiredExports = [
    'FrameworkAdapter',
    'detectFramework',
    'createFrameworkAdapter',
    'AstroAdapter',
    'NextJSAdapter',
    'ReactAdapter',
    'getSupportedFrameworks',
    'createAdapter',
    'createAdapterFor',
    'default',
  ];

  const missingExports = requiredExports.filter(
    name => !exportedNames.includes(name)
  );
  if (missingExports.length > 0) {
    console.error('❌ Missing exports:', missingExports);
  } else {
    console.log('✅ All required exports are available');
  }
} catch (error) {
  console.error('❌ Export testing failed:', error.message);
}

// Test 2: Test framework detection
console.log('\n2. Testing framework detection...');
try {
  const detected = adapters.detectFramework();
  console.log(`✅ detectFramework(): ${detected || 'null'}`);
} catch (error) {
  console.error('❌ Framework detection failed:', error.message);
}

// Test 3: Test supported frameworks list
console.log('\n3. Testing supported frameworks...');
try {
  const supported = adapters.getSupportedFrameworks();
  console.log('✅ getSupportedFrameworks():', supported);
} catch (error) {
  console.error('❌ Supported frameworks testing failed:', error.message);
}

// Test 4: Test individual adapter creation
console.log('\n4. Testing individual adapter creation...');
try {
  const astroAdapter = new adapters.AstroAdapter();
  console.log(`✅ AstroAdapter created: ${astroAdapter.framework}`);

  const nextjsAdapter = new adapters.NextJSAdapter();
  console.log(`✅ NextJSAdapter created: ${nextjsAdapter.framework}`);

  const reactAdapter = new adapters.ReactAdapter();
  console.log(`✅ ReactAdapter created: ${reactAdapter.framework}`);
} catch (error) {
  console.error('❌ Individual adapter creation failed:', error.message);
}

// Test 5: Test factory functions with known framework
console.log('\n5. Testing factory functions...');
try {
  // Test createAdapterFor with specific framework
  const astroFromFactory = await adapters.createAdapterFor('astro');
  console.log(`✅ createAdapterFor('astro'): ${astroFromFactory.framework}`);

  const nextjsFromFactory = await adapters.createAdapterFor('nextjs');
  console.log(`✅ createAdapterFor('nextjs'): ${nextjsFromFactory.framework}`);

  const reactFromFactory = await adapters.createAdapterFor('react');
  console.log(`✅ createAdapterFor('react'): ${reactFromFactory.framework}`);
} catch (error) {
  console.error('❌ Factory function testing failed:', error.message);
}

// Test 6: Test error handling for unsupported framework
console.log('\n6. Testing error handling...');
try {
  await adapters.createAdapterFor('unsupported');
  console.error('❌ Should have thrown error for unsupported framework');
} catch (error) {
  console.log(`✅ Correctly throws error: "${error.message}"`);
}

// Test 7: Test default export
console.log('\n7. Testing default export...');
try {
  const defaultFactory = adapters.default;
  const adapterFromDefault = await defaultFactory('astro');
  console.log(`✅ Default export works: ${adapterFromDefault.framework}`);
} catch (error) {
  console.error('❌ Default export testing failed:', error.message);
}

console.log('\n🎉 Adapter Index testing completed!');
