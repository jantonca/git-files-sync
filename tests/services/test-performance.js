#!/usr/bin/env node

/**
 * Test script for PerformanceManager migration
 * Tests the new src/services/performance.js independently
 */

import { PerformanceManager } from '../../src/services/performance.js';

async function testPerformanceManager() {
  console.log('🧪 Testing PerformanceManager migration...\n');

  try {
    // Test 1: Constructor and basic setup
    console.log('1️⃣ Testing constructor...');
    const perfManager = new PerformanceManager({
      maxConcurrency: 5,
      batchSize: 10,
      timeout: 5000,
      retryAttempts: 2,
      retryDelay: 500,
      enableMetrics: true,
    });

    if (perfManager.maxConcurrency === 5 && perfManager.batchSize === 10) {
      console.log('✅ Constructor works');
    } else {
      throw new Error('Constructor failed');
    }

    // Test 2: Initialize with cache service
    console.log('\n2️⃣ Testing initialization...');
    await perfManager.initialize();
    console.log('✅ Initialization works');

    // Test 3: Basic concurrent execution
    console.log('\n3️⃣ Testing basic concurrent execution...');

    const testItems = ['item1', 'item2', 'item3', 'item4', 'item5'];
    const simpleProcessor = async (item, index) => {
      await perfManager.sleep(50); // Small delay
      return `processed-${item}-${index}`;
    };

    const result = await perfManager.executeConcurrent(
      testItems,
      simpleProcessor,
      {
        concurrency: 3,
        cache: false, // Disable cache for this test
      }
    );

    if (result.results.length === 5 && result.errors.length === 0) {
      console.log('✅ Basic concurrent execution works');
    } else {
      throw new Error(
        `Expected 5 results, got ${result.results.length}, errors: ${result.errors.length}`
      );
    }

    // Test 4: Retry logic
    console.log('\n4️⃣ Testing retry logic...');

    let attemptCount = 0;
    const flakyProcessor = async item => {
      attemptCount++;
      if (attemptCount < 3) {
        throw new Error('Simulated failure');
      }
      return `success-${item}`;
    };

    try {
      const retryResult = await perfManager.executeWithRetry(
        () => flakyProcessor('test'),
        3,
        100
      );

      if (retryResult === 'success-test') {
        console.log('✅ Retry logic works');
      } else {
        throw new Error('Retry logic failed');
      }
    } catch (error) {
      throw new Error(`Retry test failed: ${error.message}`);
    }

    // Test 5: Cache key generation
    console.log('\n5️⃣ Testing cache key generation...');

    const stringKey = perfManager.generateItemKey('test-string');
    const objectWithId = perfManager.generateItemKey({
      id: 'test-id',
      data: 'value',
    });
    const objectWithPath = perfManager.generateItemKey({
      path: '/test/path',
      data: 'value',
    });
    const genericObject = perfManager.generateItemKey({ data: 'value' });

    if (
      stringKey === 'test-string' &&
      objectWithId === 'test-id' &&
      objectWithPath === '/test/path' &&
      typeof genericObject === 'string'
    ) {
      console.log('✅ Cache key generation works');
    } else {
      throw new Error('Cache key generation failed');
    }

    // Test 6: Metrics tracking
    console.log('\n6️⃣ Testing metrics tracking...');

    perfManager.resetMetrics();
    const initialStats = perfManager.getStats();

    if (initialStats.performance.operations === 0) {
      console.log('✅ Metrics reset works');
    } else {
      throw new Error('Metrics reset failed');
    }

    // Test 7: Batch processing with metrics
    console.log('\n7️⃣ Testing batch processing with metrics...');

    const batchItems = Array.from({ length: 15 }, (_, i) => `batch-item-${i}`);
    const metricsProcessor = async item => {
      await perfManager.sleep(10);
      return `processed-${item}`;
    };

    const batchResult = await perfManager.executeConcurrent(
      batchItems,
      metricsProcessor,
      {
        concurrency: 3,
        batchSize: 5,
        cache: false,
      }
    );

    const finalStats = perfManager.getStats();

    if (
      batchResult.results.length === 15 &&
      finalStats.performance.operations > 0 &&
      parseFloat(finalStats.performance.successRate) === 100
    ) {
      console.log('✅ Batch processing with metrics works');
    } else {
      throw new Error('Batch processing or metrics failed');
    }

    // Test 8: File processor creation
    console.log('\n8️⃣ Testing file processor creation...');

    const fileProcessor = perfManager.createFileProcessor({
      validateContent: true,
      transformContent: async content => ({
        ...content,
        transformed: true,
      }),
    });

    const fileResult = await fileProcessor('/test/file.json', 0);

    if (
      fileResult.path === '/test/file.json' &&
      fileResult.processed === true &&
      fileResult.transformed === true &&
      typeof fileResult.processingTime === 'string'
    ) {
      console.log('✅ File processor creation works');
    } else {
      throw new Error('File processor creation failed');
    }

    // Test 9: Error handling in file processor
    console.log('\n9️⃣ Testing error handling...');

    const strictFileProcessor = perfManager.createFileProcessor({
      validateContent: true,
    });

    try {
      await strictFileProcessor(null, 0);
      throw new Error('Should have thrown an error');
    } catch (error) {
      if (error.message.includes('Invalid file path')) {
        console.log('✅ Error handling works');
      } else {
        throw new Error('Wrong error thrown');
      }
    }

    // Test 10: Performance statistics
    console.log('\n🔟 Testing performance statistics...');

    const stats = perfManager.getStats();

    if (
      typeof stats.performance === 'object' &&
      typeof stats.performance.successRate === 'string' &&
      typeof stats.performance.averageTimeMs === 'string' &&
      stats.performance.operations > 0
    ) {
      console.log('✅ Performance statistics work');
      console.log(`   Operations: ${stats.performance.operations}`);
      console.log(`   Success Rate: ${stats.performance.successRate}`);
      console.log(`   Average Time: ${stats.performance.averageTimeMs}ms`);
    } else {
      throw new Error('Performance statistics failed');
    }

    console.log('\n🎉 PerformanceManager migration successful!');
    console.log('✅ All core functionality working as expected');
  } catch (error) {
    console.error('❌ PerformanceManager test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testPerformanceManager();
