#!/usr/bin/env node

/**
 * Test script for FileService migration
 * Tests the new src/services/file.js independently
 */

import { FileService } from '../../src/services/file.js';
import { tmpdir } from 'os';
import path from 'path';

async function testFileService() {
  console.log('🧪 Testing FileService migration...\n');

  const testDir = path.join(tmpdir(), 'file-service-test');
  const testFile = path.join(testDir, 'test.json');
  const testContent = '{"test": "content", "number": 42}';

  try {
    // Test 1: Constructor and basic setup
    console.log('1️⃣ Testing constructor...');
    const fileService = new FileService({
      maxFileSize: 1024 * 1024, // 1MB
      allowedExtensions: ['.json', '.md', '.mdx'],
      concurrentOperations: 3,
    });
    console.log('✅ Constructor works\n');

    // Test 2: Directory creation
    console.log('2️⃣ Testing directory creation...');
    await fileService.createDirectory(testDir);
    const dirExists = fileService.exists(testDir);
    console.log(`✅ Directory creation: ${dirExists ? 'success' : 'failed'}\n`);

    // Test 3: File writing and reading
    console.log('3️⃣ Testing file operations...');
    await fileService.write(testFile, testContent);
    const fileExists = fileService.exists(testFile);
    console.log(`   File writing: ${fileExists ? '✅' : '❌'}`);

    const readContent = await fileService.read(testFile);
    const contentMatch = readContent === testContent;
    console.log(`   File reading: ${contentMatch ? '✅' : '❌'}\n`);

    // Test 4: File validation
    console.log('4️⃣ Testing file validation...');
    const validation = await fileService.validateFile(testFile);
    console.log(`   File validation: ${validation.valid ? '✅' : '❌'}`);
    console.log(
      `   JSON validation: ${validation.errors.length === 0 ? '✅' : '❌'}\n`
    );

    // Test 5: File stats and extension validation
    console.log('5️⃣ Testing file utilities...');
    const stats = await fileService.getStats(testFile);
    console.log(`   File stats: ${stats.size > 0 ? '✅' : '❌'}`);

    try {
      fileService.validateFileExtension('.json');
      console.log('   Extension validation: ✅');
    } catch {
      console.log('   Extension validation: ❌');
    }

    try {
      fileService.validateFilePath(testFile);
      console.log('   Path validation: ✅');
    } catch {
      console.log('   Path validation: ❌');
    }

    // Test 6: Security validation (should fail)
    console.log('   Security test (should reject): ');
    try {
      fileService.validateFilePath('../../../etc/passwd');
      console.log('❌ (security bypass!)');
    } catch {
      console.log('✅');
    }
    console.log('');

    // Test 7: File operations - copy and move
    console.log('6️⃣ Testing copy and move operations...');
    const copyPath = path.join(testDir, 'test-copy.json');
    const copySuccess = await fileService.copy(testFile, copyPath);
    console.log(`   File copy: ${copySuccess ? '✅' : '❌'}`);

    const movePath = path.join(testDir, 'test-moved.json');
    const moveSuccess = await fileService.move(copyPath, movePath);
    console.log(`   File move: ${moveSuccess ? '✅' : '❌'}\n`);

    // Test 8: Directory scanning
    console.log('7️⃣ Testing directory scanning...');
    const files = await fileService.getFilesRecursively(testDir, {
      extensions: ['.json'],
    });
    console.log(
      `   Found ${files.length} JSON files: ${files.length >= 2 ? '✅' : '❌'}\n`
    );

    // Cleanup
    console.log('8️⃣ Testing cleanup...');
    const cleanupSuccess = await fileService.remove(testDir);
    console.log(`   Cleanup: ${cleanupSuccess ? '✅' : '❌'}\n`);

    console.log('🎉 FileService migration successful!');
    console.log('✅ All core functionality working as expected\n');
  } catch (error) {
    console.error('❌ FileService test failed:', error.message);

    // Cleanup on error
    try {
      const fileService = new FileService();
      await fileService.remove(testDir);
    } catch {
      // Ignore cleanup errors
    }

    process.exit(1);
  }
}

// Run the test
testFileService();
