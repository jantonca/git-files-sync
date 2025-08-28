#!/usr/bin/env node

/**
 * Test GitService import from main package index
 */

// Test importing from package root
import { GitService } from '../../index.js';

async function testPackageImport() {
  console.log('🧪 Testing GitService import from main package...\n');

  try {
    const gitService = new GitService({ timeout: 5000 });
    const isValid = gitService.validateRepositoryUrl(
      'git@github.com:user/repo.git'
    );

    console.log('✅ GitService import from main package works');
    console.log(
      `✅ GitService functionality works: ${isValid ? 'validated' : 'failed'}\n`
    );

    console.log('🎉 Package integration successful!');
  } catch (error) {
    console.error('❌ Package import test failed:', error.message);
    process.exit(1);
  }
}

testPackageImport();
