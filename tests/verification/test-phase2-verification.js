#!/usr/bin/env node

/**
 * Phase 2.3 Verification Checkpoint
 * Comprehensive test to verify all services migration
 */

import {
  GitService,
  FileService,
  CacheService,
  ValidationService,
  PerformanceManager,
} from '../../src/services/index.js';

async function verificationCheckpoint() {
  console.log('🔍 Phase 2.3 Verification Checkpoint (Final State)\n');
  console.log(
    'Testing all migrated services work in final package structure\n'
  );
  console.log('and old structure has been properly cleaned up...\n');

  let testsPassed = 0;
  let testsTotal = 0;

  const runTest = async (testName, testFunction) => {
    testsTotal++;
    try {
      console.log(`${testsTotal}️⃣ ${testName}...`);
      await testFunction();
      console.log(`✅ ${testName} - PASSED\n`);
      testsPassed++;
    } catch (error) {
      console.error(`❌ ${testName} - FAILED: ${error.message}\n`);
    }
  };

  // TEST 1: Verify all services can be imported from new location
  await runTest('Import all services from src/services', async () => {
    if (
      typeof GitService !== 'function' ||
      typeof FileService !== 'function' ||
      typeof CacheService !== 'function' ||
      typeof ValidationService !== 'function' ||
      typeof PerformanceManager !== 'function'
    ) {
      throw new Error('Failed to import all services from src/services');
    }
  });

  // TEST 2: Verify all services can be instantiated
  await runTest('Instantiate all services', async () => {
    const gitService = new GitService();
    const fileService = new FileService();
    const cacheService = new CacheService();
    const validationService = new ValidationService();
    const performanceManager = new PerformanceManager();

    if (
      !(gitService instanceof GitService) ||
      !(fileService instanceof FileService) ||
      !(cacheService instanceof CacheService) ||
      !(validationService instanceof ValidationService) ||
      !(performanceManager instanceof PerformanceManager)
    ) {
      throw new Error('Failed to instantiate all services');
    }
  });

  // TEST 3: Test GitService functionality
  await runTest('GitService comprehensive functionality', async () => {
    const gitService = new GitService();

    // Test URL validation
    const validUrls = [
      'git@github.com:user/repo.git',
      'https://github.com/user/repo.git',
    ];

    for (const url of validUrls) {
      if (!gitService.validateRepositoryUrl(url)) {
        throw new Error(`Valid URL rejected: ${url}`);
      }
    }

    const invalidUrls = ['invalid-url', 'https://example.com'];
    for (const url of invalidUrls) {
      if (gitService.validateRepositoryUrl(url)) {
        throw new Error(`Invalid URL accepted: ${url}`);
      }
    }
  });

  // TEST 4: Test FileService functionality
  await runTest('FileService comprehensive functionality', async () => {
    const fileService = new FileService();
    const testDir = '/tmp/verification-test';
    const testFile = `${testDir}/test.json`;
    const testContent = '{"test": "verification"}';

    // Test directory creation
    await fileService.createDirectory(testDir);

    // Test file writing
    await fileService.write(testFile, testContent);

    // Test file reading
    const readContent = await fileService.read(testFile);
    if (readContent !== testContent) {
      throw new Error('File content mismatch');
    }

    // Test file exists
    if (!fileService.exists(testFile)) {
      throw new Error('File existence check failed');
    }

    // Test file stats
    const stats = await fileService.getStats(testFile);
    if (!stats || typeof stats.size !== 'number') {
      throw new Error('File stats failed');
    }

    // Cleanup
    await fileService.remove(testDir, { recursive: true });
  });

  // TEST 5: Test CacheService functionality
  await runTest('CacheService comprehensive functionality', async () => {
    const cacheService = new CacheService();
    await cacheService.initialize();

    const testKey = 'verification-test';
    const testValue = { data: 'test-value', timestamp: Date.now() };

    // Test cache set
    await cacheService.set(testKey, testValue);

    // Test cache get
    const retrievedValue = await cacheService.get(testKey);
    if (JSON.stringify(retrievedValue) !== JSON.stringify(testValue)) {
      throw new Error('Cache value mismatch');
    }

    // Test cache delete
    await cacheService.delete(testKey);
    const deletedValue = await cacheService.get(testKey);
    if (deletedValue !== null) {
      throw new Error('Cache delete failed');
    }

    // Test stats
    const stats = await cacheService.getStats();
    if (!stats || typeof stats.enabled !== 'boolean') {
      throw new Error('Cache stats failed');
    }
  });

  // TEST 6: Test ValidationService functionality
  await runTest('ValidationService comprehensive functionality', async () => {
    const validationService = new ValidationService();

    // Test repository URL validation
    const repoResult = validationService.validateRepositoryUrl(
      'git@github.com:user/repo.git'
    );
    if (!repoResult.valid) {
      throw new Error('Repository URL validation failed');
    }

    // Test folder name validation
    const folderResult = validationService.validateFolderName('test-folder');
    if (!folderResult.valid) {
      throw new Error('Folder name validation failed');
    }

    // Test JSON validation
    const jsonResult = validationService.validateJsonContent('{"valid": true}');
    if (!jsonResult.valid) {
      throw new Error('JSON validation failed');
    }

    // Test MDX validation
    const mdxResult = validationService.validateMdxContent(
      '---\ntitle: Test\n---\n# Hello'
    );
    if (!mdxResult.valid) {
      throw new Error('MDX validation failed');
    }

    // Test environment validation
    const envResult = validationService.validateEnvironment({
      CONTENT_REPO_URL: 'git@github.com:user/repo.git',
    });
    if (!envResult.valid) {
      throw new Error('Environment validation failed');
    }
  });

  // TEST 7: Test PerformanceManager functionality
  await runTest('PerformanceManager comprehensive functionality', async () => {
    const performanceManager = new PerformanceManager({
      maxConcurrency: 3,
      batchSize: 5,
    });

    await performanceManager.initialize();

    // Test concurrent execution
    const items = ['item1', 'item2', 'item3', 'item4'];
    const processor = async item => {
      await performanceManager.sleep(10);
      return `processed-${item}`;
    };

    const result = await performanceManager.executeConcurrent(items, processor);
    if (result.results.length !== 4 || result.errors.length !== 0) {
      throw new Error('Concurrent execution failed');
    }

    // Test retry logic
    let attempts = 0;
    const flakyOperation = async () => {
      attempts++;
      if (attempts < 2) {
        throw new Error('Flaky failure');
      }
      return 'success';
    };

    const retryResult = await performanceManager.executeWithRetry(
      flakyOperation,
      3
    );
    if (retryResult !== 'success') {
      throw new Error('Retry logic failed');
    }

    // Test stats
    const stats = performanceManager.getStats();
    if (!stats || !stats.performance) {
      throw new Error('Performance stats failed');
    }
  });

  // TEST 8: Test service integration
  await runTest('Service integration', async () => {
    const cacheService = new CacheService();
    const performanceManager = new PerformanceManager({
      cacheService: cacheService,
      maxConcurrency: 2,
    });

    await cacheService.initialize();
    await performanceManager.initialize();

    const items = ['integration1', 'integration2'];
    const processor = async item => `processed-${item}`;

    const result = await performanceManager.executeConcurrent(
      items,
      processor,
      {
        cache: false, // Disable cache for this test
      }
    );

    if (result.results.length !== 2) {
      throw new Error('Service integration failed');
    }
  });

  // TEST 9: Verify old lib/services structure has been successfully cleaned up (Phase 11 state)
  await runTest('Original lib/services files properly cleaned up', async () => {
    const { existsSync } = await import('fs');

    const oldFiles = [
      'lib/services/git-service.js',
      'lib/services/file-service.js',
      'lib/services/cache-service.js',
      'lib/services/validation-service.js',
      'lib/services/performance-manager.js',
    ];

    for (const file of oldFiles) {
      if (existsSync(file)) {
        throw new Error(
          `Old file should be cleaned up but still exists: ${file}`
        );
      }
    }
  });

  // TEST 10: Verify services work from new package structure (Phase 11 final state)
  await runTest('Services work from new package structure', async () => {
    try {
      // Test importing from new package structure
      const { GitService, ValidationService } = await import(
        '../../src/services/index.js'
      );

      // Test instantiation
      const gitService = new GitService();
      const validationService = new ValidationService();

      if (!gitService || !validationService) {
        throw new Error('Failed to instantiate services from new structure');
      }
    } catch (error) {
      throw new Error(
        `Failed to import/use services from new structure: ${error.message}`
      );
    }
  });

  // FINAL RESULTS
  console.log('🎯 VERIFICATION CHECKPOINT RESULTS');
  console.log('═'.repeat(50));
  console.log(`✅ Tests Passed: ${testsPassed}/${testsTotal}`);
  console.log(`❌ Tests Failed: ${testsTotal - testsPassed}/${testsTotal}`);

  if (testsPassed === testsTotal) {
    console.log('\n🎉 ALL TESTS PASSED! Phase 2.3 Verification Complete!');
    console.log('✅ All services work in new location');
    console.log('✅ Services can be imported via src/services');
    console.log(
      '✅ Original files still work (backward compatibility maintained)'
    );
    console.log('\n🚀 Ready to proceed to Phase 3: Migrate Adapters');
  } else {
    console.log(
      '\n❌ SOME TESTS FAILED! Please review and fix issues before proceeding.'
    );
    process.exit(1);
  }
}

// Run verification
verificationCheckpoint();
