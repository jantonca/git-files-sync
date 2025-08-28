#!/usr/bin/env node

/**
 * Test script for ValidationService migration
 * Tests the new src/services/validation.js independently
 */

import { ValidationService } from '../../src/services/validation.js';

async function testValidationService() {
  console.log('🧪 Testing ValidationService migration...\n');

  try {
    // Test 1: Constructor and basic setup
    console.log('1️⃣ Testing constructor...');
    const validationService = new ValidationService({
      allowedExtensions: ['.json', '.mdx', '.md'],
      maxFileSize: 1024 * 1024, // 1MB for testing
      strictMode: true,
    });

    if (validationService.allowedExtensions.length === 3) {
      console.log('✅ Constructor works');
    } else {
      throw new Error('Constructor failed');
    }

    // Test 2: Repository URL validation
    console.log('\n2️⃣ Testing repository URL validation...');

    const validUrls = [
      'git@github.com:user/repo.git',
      'https://github.com/user/repo.git',
      'git@bitbucket.org:user/repo.git',
      'https://bitbucket.org/user/repo.git',
    ];

    const invalidUrls = [
      'not-a-url',
      'https://example.com',
      'git@invalid',
      '',
      null,
    ];

    for (const url of validUrls) {
      const result = validationService.validateRepositoryUrl(url);
      if (!result.valid) {
        throw new Error(`Valid URL rejected: ${url}`);
      }
    }

    for (const url of invalidUrls) {
      const result = validationService.validateRepositoryUrl(url);
      if (result.valid) {
        throw new Error(`Invalid URL accepted: ${url}`);
      }
    }

    console.log('✅ Repository URL validation works');

    // Test 3: Folder name validation
    console.log('\n3️⃣ Testing folder name validation...');

    const validNames = ['my-folder', 'folder123', 'test-folder-name'];
    const invalidNames = ['-invalid', 'invalid-', 'Invalid', 'has spaces', 'x'];

    for (const name of validNames) {
      const result = validationService.validateFolderName(name);
      if (!result.valid) {
        throw new Error(`Valid folder name rejected: ${name}`);
      }
    }

    for (const name of invalidNames) {
      const result = validationService.validateFolderName(name);
      if (result.valid) {
        throw new Error(`Invalid folder name accepted: ${name}`);
      }
    }

    console.log('✅ Folder name validation works');

    // Test 4: File path validation
    console.log('\n4️⃣ Testing file path validation...');

    const validPaths = ['src/content/test.json', 'src/pages/index.mdx'];
    const invalidPaths = ['../outside', '~/home', 'src/../dangerous'];

    for (const path of validPaths) {
      const result = validationService.validateFilePath(path);
      if (!result.valid) {
        throw new Error(`Valid path rejected: ${path}`);
      }
    }

    for (const path of invalidPaths) {
      const result = validationService.validateFilePath(path);
      if (result.valid) {
        throw new Error(`Invalid path accepted: ${path}`);
      }
    }

    console.log('✅ File path validation works');

    // Test 5: File extension validation
    console.log('\n5️⃣ Testing file extension validation...');

    const validExtensions = ['.json', '.mdx', '.md'];
    const invalidExtensions = ['.txt', '.html', '.php'];

    for (const ext of validExtensions) {
      const result = validationService.validateFileExtension(ext);
      if (!result.valid) {
        throw new Error(`Valid extension rejected: ${ext}`);
      }
    }

    for (const ext of invalidExtensions) {
      const result = validationService.validateFileExtension(ext);
      if (result.valid) {
        throw new Error(`Invalid extension accepted: ${ext}`);
      }
    }

    console.log('✅ File extension validation works');

    // Test 6: File size validation
    console.log('\n6️⃣ Testing file size validation...');

    const validSize = 500 * 1024; // 500KB
    const invalidSize = 2 * 1024 * 1024; // 2MB (exceeds 1MB limit)

    const validSizeResult = validationService.validateFileSize(validSize);
    if (!validSizeResult.valid) {
      throw new Error('Valid file size rejected');
    }

    const invalidSizeResult = validationService.validateFileSize(invalidSize);
    if (invalidSizeResult.valid) {
      throw new Error('Invalid file size accepted');
    }

    console.log('✅ File size validation works');

    // Test 7: JSON content validation
    console.log('\n7️⃣ Testing JSON content validation...');

    const validJson = '{"test": "value", "number": 42}';
    const invalidJson = '{"invalid": json}';

    const validJsonResult = validationService.validateJsonContent(validJson);
    if (!validJsonResult.valid) {
      throw new Error('Valid JSON rejected');
    }

    const invalidJsonResult =
      validationService.validateJsonContent(invalidJson);
    if (invalidJsonResult.valid) {
      throw new Error('Invalid JSON accepted');
    }

    console.log('✅ JSON content validation works');

    // Test 8: MDX content validation
    console.log('\n8️⃣ Testing MDX content validation...');

    const validMdx = `---
title: Test
---

# Hello World

<div>Content</div>`;

    const invalidMdx = `<div>Unclosed tag`;

    const validMdxResult = validationService.validateMdxContent(validMdx);
    if (!validMdxResult.valid) {
      throw new Error('Valid MDX rejected');
    }

    const invalidMdxResult = validationService.validateMdxContent(invalidMdx);
    if (invalidMdxResult.valid) {
      throw new Error('Invalid MDX accepted');
    }

    console.log('✅ MDX content validation works');

    // Test 9: Environment validation
    console.log('\n9️⃣ Testing environment validation...');

    const validEnv = {
      CONTENT_REPO_URL: 'git@github.com:user/repo.git',
      CONTENT_REPO_BRANCH: 'main',
    };

    const invalidEnv = {
      CONTENT_REPO_URL: 'invalid-url',
    };

    const validEnvResult = validationService.validateEnvironment(validEnv);
    if (!validEnvResult.valid) {
      throw new Error('Valid environment rejected');
    }

    const invalidEnvResult = validationService.validateEnvironment(invalidEnv);
    if (invalidEnvResult.valid) {
      throw new Error('Invalid environment accepted');
    }

    console.log('✅ Environment validation works');

    // Test 10: Content mapping validation
    console.log('\n🔟 Testing content mapping validation...');

    const validMapping = {
      'src/content/posts': 'src/content/blog',
    };

    const invalidMapping = {
      '../dangerous': 'src/content/test',
    };

    const validMappingResult =
      validationService.validateContentMapping(validMapping);
    if (!validMappingResult.valid) {
      throw new Error('Valid mapping rejected');
    }

    const invalidMappingResult =
      validationService.validateContentMapping(invalidMapping);
    if (invalidMappingResult.valid) {
      throw new Error('Invalid mapping accepted');
    }

    console.log('✅ Content mapping validation works');

    console.log('\n🎉 ValidationService migration successful!');
    console.log('✅ All core functionality working as expected');
  } catch (error) {
    console.error('❌ ValidationService test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testValidationService();
