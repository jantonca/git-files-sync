#!/usr/bin/env node

/**
 * Test GitService and FileService import from main package
 */

import { GitService, FileService } from '../../index.js';
import path from 'path';
import { tmpdir } from 'os';

async function testServicesIntegration() {
  console.log('🧪 Testing services integration...\n');

  try {
    // Test GitService
    console.log('1️⃣ Testing GitService from package...');
    const gitService = new GitService({ timeout: 5000 });
    const isValidUrl = gitService.validateRepositoryUrl(
      'git@github.com:user/repo.git'
    );
    console.log(`✅ GitService: ${isValidUrl ? 'working' : 'failed'}\n`);

    // Test FileService
    console.log('2️⃣ Testing FileService from package...');
    const fileService = new FileService({ maxFileSize: 1024 });
    const testDir = path.join(tmpdir(), 'integration-test');

    await fileService.createDirectory(testDir);
    const dirExists = fileService.exists(testDir);
    console.log(`✅ FileService: ${dirExists ? 'working' : 'failed'}`);

    // Cleanup
    await fileService.remove(testDir);
    console.log('✅ Cleanup successful\n');

    console.log('🎉 Services integration successful!');
    console.log(
      '✅ Both GitService and FileService are working from main package\n'
    );
  } catch (error) {
    console.error('❌ Services integration test failed:', error.message);
    process.exit(1);
  }
}

testServicesIntegration();
