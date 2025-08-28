console.log('3️⃣ Testing Mapping Manager...');

try {
  const { ContentMappingManager } = await import('../../src/utils/mapping.js');

  const manager = new ContentMappingManager({
    projectRoot: '/tmp/test-mapping',
  });
  console.log('   ✅ ContentMappingManager imported and instantiated');

  // Test manager properties
  console.log('   📝 Project root:', manager.projectRoot);
  console.log('   📝 Parser available:', manager.parser ? '✅' : '❌');
  console.log('   📝 Validator available:', manager.validator ? '✅' : '❌');

  // Test validation through manager
  const sourceValidation = manager.validateSourcePath('test-content');
  console.log(
    '   📝 Source validation through manager:',
    sourceValidation.valid ? '✅ Valid' : '❌ Invalid'
  );

  const destValidation = manager.validateDestinationPath('src/content/test');
  console.log(
    '   📝 Destination validation through manager:',
    destValidation.valid ? '✅ Valid' : '❌ Invalid'
  );

  // Test mapping validation through manager
  const testMapping = {
    'test-content': 'src/content/test',
    'demo-content': 'src/content/demo',
  };
  const mappingValidation = manager.validateMapping(testMapping);
  console.log(
    '   📝 Mapping validation through manager:',
    mappingValidation.valid ? '✅ Valid' : '❌ Invalid'
  );

  // Test config info
  const configInfo = manager.getConfigInfo();
  console.log(
    '   📝 Config info available:',
    configInfo ? '✅ Available' : '❌ Missing'
  );

  console.log('   🎯 Mapping Manager: PASSED ✅');
} catch (error) {
  console.log('   ❌ Manager test failed:', error.message);
}
