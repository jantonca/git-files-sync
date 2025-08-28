#!/usr/bin/env node

/**
 * Test script for Services Index
 * Tests that all services can be imported from single entry point src/services
 */

import {
  GitService,
  FileService,
  CacheService,
  ValidationService,
  PerformanceManager,
} from '../../src/services/index.js';

async function testServicesIndex() {
  console.log('🧪 Testing Services Index (src/services)...\n');

  try {
    // Test 1: Verify all service classes are importable
    console.log('1️⃣ Testing service imports...');

    if (
      typeof GitService === 'function' &&
      typeof FileService === 'function' &&
      typeof CacheService === 'function' &&
      typeof ValidationService === 'function' &&
      typeof PerformanceManager === 'function'
    ) {
      console.log('✅ All services imported successfully');
    } else {
      throw new Error('Failed to import all services');
    }

    // Test 2: Verify services can be instantiated
    console.log('\n2️⃣ Testing service instantiation...');

    const gitService = new GitService();
    const fileService = new FileService();
    const cacheService = new CacheService();
    const validationService = new ValidationService();
    const performanceManager = new PerformanceManager();

    if (
      gitService instanceof GitService &&
      fileService instanceof FileService &&
      cacheService instanceof CacheService &&
      validationService instanceof ValidationService &&
      performanceManager instanceof PerformanceManager
    ) {
      console.log('✅ All services can be instantiated');
    } else {
      throw new Error('Failed to instantiate services');
    }

    // Test 3: Verify service methods exist
    console.log('\n3️⃣ Testing service methods...');

    // GitService methods
    if (
      typeof gitService.validateRepositoryUrl === 'function' &&
      typeof gitService.getRemoteCommitHash === 'function'
    ) {
      console.log('   GitService methods: ✅');
    } else {
      throw new Error('GitService methods missing');
    }

    // FileService methods
    if (
      typeof fileService.createDirectory === 'function' &&
      typeof fileService.write === 'function' &&
      typeof fileService.read === 'function'
    ) {
      console.log('   FileService methods: ✅');
    } else {
      throw new Error('FileService methods missing');
    }

    // CacheService methods
    if (
      typeof cacheService.initialize === 'function' &&
      typeof cacheService.get === 'function' &&
      typeof cacheService.set === 'function'
    ) {
      console.log('   CacheService methods: ✅');
    } else {
      throw new Error('CacheService methods missing');
    }

    // ValidationService methods
    if (
      typeof validationService.validateRepositoryUrl === 'function' &&
      typeof validationService.validateFolderName === 'function' &&
      typeof validationService.validateJsonContent === 'function'
    ) {
      console.log('   ValidationService methods: ✅');
    } else {
      throw new Error('ValidationService methods missing');
    }

    // PerformanceManager methods
    if (
      typeof performanceManager.initialize === 'function' &&
      typeof performanceManager.executeConcurrent === 'function' &&
      typeof performanceManager.getStats === 'function'
    ) {
      console.log('   PerformanceManager methods: ✅');
    } else {
      throw new Error('PerformanceManager methods missing');
    }

    // Test 4: Verify basic service functionality
    console.log('\n4️⃣ Testing basic service functionality...');

    // Test GitService
    const repoUrlResult = gitService.validateRepositoryUrl(
      'git@github.com:user/repo.git'
    );
    if (repoUrlResult === true) {
      console.log('   GitService functionality: ✅');
    } else {
      throw new Error('GitService functionality failed');
    }

    // Test ValidationService
    const folderResult = validationService.validateFolderName('test-folder');
    if (folderResult.valid) {
      console.log('   ValidationService functionality: ✅');
    } else {
      throw new Error('ValidationService functionality failed');
    }

    // Test CacheService
    await cacheService.initialize();
    console.log('   CacheService functionality: ✅');

    // Test PerformanceManager
    await performanceManager.initialize();
    const stats = performanceManager.getStats();
    if (typeof stats === 'object') {
      console.log('   PerformanceManager functionality: ✅');
    } else {
      throw new Error('PerformanceManager functionality failed');
    }

    // Test FileService
    const testPath = '/tmp/test-services-index';
    await fileService.createDirectory(testPath);
    console.log('   FileService functionality: ✅');

    // Test 5: Verify service integration
    console.log('\n5️⃣ Testing service integration...');

    // Test PerformanceManager with CacheService integration
    const perfManager = new PerformanceManager({
      cacheService: cacheService,
      maxConcurrency: 2,
    });

    await perfManager.initialize();

    const testItems = ['item1', 'item2'];
    const simpleProcessor = async item => `processed-${item}`;

    const result = await perfManager.executeConcurrent(
      testItems,
      simpleProcessor,
      {
        cache: false,
      }
    );

    if (result.results.length === 2) {
      console.log('   Service integration: ✅');
    } else {
      throw new Error('Service integration failed');
    }

    console.log('\n🎉 Services Index test successful!');
    console.log('✅ All services can be imported from single entry point');
    console.log('✅ All services work independently and together');
  } catch (error) {
    console.error('❌ Services Index test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testServicesIndex();
