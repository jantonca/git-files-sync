#!/usr/bin/env node

/**
 * Test script for external configuration loader
 */

import { CONFIG } from '../../src/utils/config.js';

async function testConfig() {
  try {
    console.log('🧪 Testing external configuration loader...\n');

    console.log('📋 Configuration loaded:');
    console.log('- Repository URL:', CONFIG.REPO_URL);
    console.log('- Branch:', CONFIG.BRANCH);
    console.log('- Temp Directory:', CONFIG.TEMP_DIR);
    console.log('- Backup Directory:', CONFIG.BACKUP_DIR);
    console.log(
      '- Content Mappings:',
      Object.keys(CONFIG.CONTENT_MAPPING || {}).length,
      'configured'
    );
    console.log('- Max Retries:', CONFIG.MAX_RETRIES);
    console.log('- Concurrent Operations:', CONFIG.CONCURRENT_OPERATIONS);

    console.log('\n✅ Configuration test passed!');
  } catch (error) {
    console.error('❌ Configuration test failed:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  testConfig();
}
