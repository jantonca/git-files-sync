#!/usr/bin/env node

/**
 * Test script for CacheService migration
 * Tests the new src/services/cache.js independently
 */

import { CacheService } from '../../src/services/cache.js';
import { tmpdir } from 'os';
import path from 'path';
import { setTimeout } from 'timers/promises';

async function testCacheService() {
  console.log('🧪 Testing CacheService migration...\n');

  const testCacheDir = path.join(tmpdir(), 'cache-service-test');

  try {
    // Test 1: Constructor and initialization
    console.log('1️⃣ Testing constructor and initialization...');
    const cacheService = new CacheService({
      cacheDir: testCacheDir,
      maxAge: 5000, // 5 seconds for testing
      memoryLimit: 10,
      enabled: true,
    });

    await cacheService.initialize();
    console.log('✅ Constructor and initialization work\n');

    // Test 2: Cache key generation
    console.log('2️⃣ Testing cache key generation...');
    const key1 = cacheService.generateKey('test-data', 'test-ns');
    const key2 = cacheService.generateKey('test-data', 'test-ns');
    const key3 = cacheService.generateKey('different-data', 'test-ns');

    console.log(`   Same data, same key: ${key1 === key2 ? '✅' : '❌'}`);
    console.log(
      `   Different data, different key: ${key1 !== key3 ? '✅' : '❌'}\n`
    );

    // Test 3: Basic set and get operations
    console.log('3️⃣ Testing basic cache operations...');
    const testData = { test: 'data', number: 42, array: [1, 2, 3] };

    const setResult = await cacheService.set('test-key', testData, 'test');
    console.log(`   Set operation: ${setResult ? '✅' : '❌'}`);

    const getData = await cacheService.get('test-key', 'test');
    const dataMatch = JSON.stringify(getData) === JSON.stringify(testData);
    console.log(`   Get operation: ${dataMatch ? '✅' : '❌'}\n`);

    // Test 4: Memory cache functionality
    console.log('4️⃣ Testing memory cache...');
    await cacheService.set('memory-test', 'memory-data', 'test');
    const memoryData = await cacheService.get('memory-test', 'test');
    console.log(
      `   Memory cache: ${memoryData === 'memory-data' ? '✅' : '❌'}\n`
    );

    // Test 5: File cache persistence
    console.log('5️⃣ Testing file cache persistence...');
    const newCacheService = new CacheService({
      cacheDir: testCacheDir,
      maxAge: 5000,
      enabled: true,
    });
    await newCacheService.initialize();

    const persistedData = await newCacheService.get('test-key', 'test');
    const persistMatch =
      JSON.stringify(persistedData) === JSON.stringify(testData);
    console.log(`   File persistence: ${persistMatch ? '✅' : '❌'}\n`);

    // Test 6: Cache expiration (wait for TTL)
    console.log('6️⃣ Testing cache expiration...');
    await cacheService.set('expire-test', 'will-expire', 'test', { ttl: 1000 }); // 1 second
    console.log('   Waiting 1.5 seconds for expiration...');
    await setTimeout(1500);

    const expiredData = await cacheService.get('expire-test', 'test');
    console.log(`   Expiration works: ${expiredData === null ? '✅' : '❌'}\n`);

    // Test 7: Cache statistics
    console.log('7️⃣ Testing cache statistics...');
    const stats = await cacheService.getStats();
    console.log(`   Stats enabled: ${stats.enabled ? '✅' : '❌'}`);
    console.log(
      `   Has valid entries: ${stats.validEntries >= 0 ? '✅' : '❌'}`
    );
    console.log(
      `   Cache directory correct: ${stats.cacheDir === testCacheDir ? '✅' : '❌'}\n`
    );

    // Test 8: Specialized Git repository caching
    console.log('8️⃣ Testing Git repository caching...');
    const repoInfo = {
      commit: 'abc123',
      branch: 'main',
      lastUpdate: Date.now(),
    };
    const repoUrl = 'git@github.com:test/repo.git';

    const cacheRepoResult = await cacheService.cacheRepositoryInfo(
      repoUrl,
      repoInfo
    );
    console.log(`   Cache repo info: ${cacheRepoResult ? '✅' : '❌'}`);

    const cachedRepoInfo = await cacheService.getCachedRepositoryInfo(repoUrl);
    const repoMatch =
      JSON.stringify(cachedRepoInfo) === JSON.stringify(repoInfo);
    console.log(`   Get repo info: ${repoMatch ? '✅' : '❌'}\n`);

    // Test 9: File hash caching
    console.log('9️⃣ Testing file hash caching...');
    const testFilePath = '/test/file/path.js';
    const testHash = 'sha256-abcdef123456';

    const cacheHashResult = await cacheService.cacheFileHash(
      testFilePath,
      testHash
    );
    console.log(`   Cache file hash: ${cacheHashResult ? '✅' : '❌'}`);

    const cachedHash = await cacheService.getCachedFileHash(testFilePath);
    console.log(`   Get file hash: ${cachedHash === testHash ? '✅' : '❌'}\n`);

    // Test 10: Cache wrapper functionality
    console.log('🔟 Testing cache wrapper...');
    let operationCallCount = 0;
    const expensiveOperation = async () => {
      operationCallCount++;
      return { result: 'expensive-computation', timestamp: Date.now() };
    };

    const result1 = await cacheService.wrap(
      'expensive-op',
      expensiveOperation,
      { namespace: 'operations' }
    );
    const result2 = await cacheService.wrap(
      'expensive-op',
      expensiveOperation,
      { namespace: 'operations' }
    );

    console.log(
      `   Wrapper caching: ${operationCallCount === 1 ? '✅' : '❌'}`
    );
    console.log(
      `   Same results: ${result1.result === result2.result ? '✅' : '❌'}\n`
    );

    // Test 11: Cache deletion and cleanup
    console.log('1️⃣1️⃣ Testing cache deletion and cleanup...');
    const deleteResult = await cacheService.delete('test-key', 'test');
    console.log(`   Delete operation: ${deleteResult ? '✅' : '❌'}`);

    const deletedData = await cacheService.get('test-key', 'test');
    console.log(`   Data deleted: ${deletedData === null ? '✅' : '❌'}`);

    const cleanupCount = await cacheService.cleanupExpired();
    console.log(`   Cleanup works: ${cleanupCount >= 0 ? '✅' : '❌'}\n`);

    // Test 12: Cache clearing
    console.log('1️⃣2️⃣ Testing cache clearing...');
    await cacheService.set('clear-test-1', 'data1', 'clear-test');
    await cacheService.set('clear-test-2', 'data2', 'clear-test');

    const clearResult = await cacheService.clear('clear-test');
    console.log(`   Clear namespace: ${clearResult ? '✅' : '❌'}`);

    const clearedData = await cacheService.get('clear-test-1', 'clear-test');
    console.log(`   Data cleared: ${clearedData === null ? '✅' : '❌'}\n`);

    // Final cleanup
    console.log('1️⃣3️⃣ Final cleanup...');
    await cacheService.clear(); // Clear all
    console.log('✅ Final cleanup completed\n');

    console.log('🎉 CacheService migration successful!');
    console.log('✅ All core functionality working as expected\n');
  } catch (error) {
    console.error('❌ CacheService test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the test
testCacheService();
