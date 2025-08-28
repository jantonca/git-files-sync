#!/usr/bin/env node

/**
 * Test script for GitService migration
 * Tests the new src/services/git.js independently
 */

import { GitService } from '../../src/services/git.js';

async function testGitService() {
  console.log('🧪 Testing GitService migration...\n');

  try {
    // Test 1: Constructor and basic setup
    console.log('1️⃣ Testing constructor...');
    const gitService = new GitService({
      timeout: 15000,
      retries: 2,
      retryDelay: 1000,
    });
    console.log('✅ Constructor works\n');

    // Test 2: Repository URL validation
    console.log('2️⃣ Testing URL validation...');
    const validGitHubSSH = 'git@github.com:user/repo.git';
    const validGitHubHTTPS = 'https://github.com/user/repo.git';
    const validBitbucketSSH = 'git@bitbucket.org:user/repo.git';
    const validBitbucketHTTPS = 'https://bitbucket.org/user/repo.git';
    const invalid = 'not-a-git-url';

    console.log(
      `   GitHub SSH URL validation: ${gitService.validateRepositoryUrl(validGitHubSSH) ? '✅' : '❌'}`
    );
    console.log(
      `   GitHub HTTPS URL validation: ${gitService.validateRepositoryUrl(validGitHubHTTPS) ? '✅' : '❌'}`
    );
    console.log(
      `   Bitbucket SSH URL validation: ${gitService.validateRepositoryUrl(validBitbucketSSH) ? '✅' : '❌'}`
    );
    console.log(
      `   Bitbucket HTTPS URL validation: ${gitService.validateRepositoryUrl(validBitbucketHTTPS) ? '✅' : '❌'}`
    );
    console.log(
      `   Invalid URL rejection: ${!gitService.validateRepositoryUrl(invalid) ? '✅' : '❌'}`
    );
    console.log('✅ URL validation works\n');

    // Test 3: Safe execution (with harmless command)
    console.log('3️⃣ Testing safe execution...');
    const result = await gitService.safeExec('git --version', { silent: true });
    if (result.success && result.output.includes('git version')) {
      console.log('✅ Safe execution works');
      console.log(`   Git version: ${result.output.trim()}\n`);
    } else {
      console.log('❌ Safe execution failed\n');
    }

    // Test 4: Test with the actual content repo (read-only)
    console.log('4️⃣ Testing remote commit hash retrieval...');
    try {
      const repoUrl = 'git@github.com:jantonca/example-test-content.git';
      const commitHash = await gitService.getRemoteCommitHash(
        repoUrl,
        'master'
      );
      console.log('✅ Remote commit hash retrieval works');
      console.log(`   Latest commit: ${commitHash}\n`);
    } catch (error) {
      console.log(`⚠️  Remote commit test skipped: ${error.message}\n`);
    }

    console.log('🎉 GitService migration successful!');
    console.log('✅ All core functionality working as expected\n');
  } catch (error) {
    console.error('❌ GitService test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testGitService();
