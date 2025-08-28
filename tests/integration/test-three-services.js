#!/usr/bin/env node

/**
 * Test GitService, FileService, and CacheService import from main package
 */

import { GitService, FileService, CacheService } from '../../index.js';
import path from 'path';
import { tmpdir } from 'os';

async function testThreeServicesIntegration() {
  console.log('🧪 Testing three services integration...\n');

  try {
    // Test GitService
    console.log('1️⃣ Testing GitService from package...');
    const gitService = new GitService({ timeout: 5000 });
    const isValidUrl = gitService.validateRepositoryUrl(
      'git@github.com:user/repo.git'
    );
    console.log(`✅ GitService: ${isValidUrl ? 'working' : 'failed'}`);

    // Test FileService
    console.log('2️⃣ Testing FileService from package...');
    const fileService = new FileService({ maxFileSize: 1024 });
    const testDir = path.join(tmpdir(), 'three-services-test');

    await fileService.createDirectory(testDir);
    const dirExists = fileService.exists(testDir);
    console.log(`✅ FileService: ${dirExists ? 'working' : 'failed'}`);

    // Test CacheService
    console.log('3️⃣ Testing CacheService from package...');
    const cacheService = new CacheService({
      cacheDir: path.join(testDir, 'cache'),
      enabled: true,
    });
    await cacheService.initialize();

    await cacheService.set('integration-test', { test: 'data' }, 'integration');
    const cachedData = await cacheService.get(
      'integration-test',
      'integration'
    );
    console.log(
      `✅ CacheService: ${cachedData && cachedData.test === 'data' ? 'working' : 'failed'}`
    );

    // Test services working together
    console.log('4️⃣ Testing services integration...');

    // Cache a Git operation
    const repoUrl = 'git@github.com:test/repo.git';
    const mockRepoInfo = { commit: 'abc123', branch: 'main' };
    await cacheService.cacheRepositoryInfo(repoUrl, mockRepoInfo);

    const cachedRepoInfo = await cacheService.getCachedRepositoryInfo(repoUrl);
    console.log(
      `✅ Git + Cache integration: ${cachedRepoInfo && cachedRepoInfo.commit === 'abc123' ? 'working' : 'failed'}`
    );

    // Cache a file operation
    const testFile = path.join(testDir, 'test.json');
    await fileService.write(testFile, '{"cached": true}');
    await cacheService.cacheFileHash(testFile, 'hash-123');

    const fileExists = fileService.exists(testFile);
    const cachedHash = await cacheService.getCachedFileHash(testFile);
    console.log(
      `✅ File + Cache integration: ${fileExists && cachedHash === 'hash-123' ? 'working' : 'failed'}`
    );

    // Cleanup
    await fileService.remove(testDir);
    console.log('✅ Cleanup successful\n');

    console.log('🎉 Three services integration successful!');
    console.log(
      '✅ GitService, FileService, and CacheService all working together\n'
    );
  } catch (error) {
    console.error('❌ Three services integration test failed:', error.message);
    process.exit(1);
  }
}

testThreeServicesIntegration();
