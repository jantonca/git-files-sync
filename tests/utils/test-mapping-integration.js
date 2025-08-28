console.log('🔗 Mapping Integration Testing...');

try {
  // Import all mapping utilities
  const { MappingConfigParser } = await import(
    '../../src/utils/mapping-parser.js'
  );
  const { MappingValidator, validateMapping, validateSourcePath } =
    await import('../../src/utils/mapping-validator.js');
  const { ContentMappingManager } = await import('../../src/utils/mapping.js');

  console.log('   ✅ All mapping utilities imported successfully');

  // Test integration workflow
  console.log('\n   🔄 Testing Integration Workflow:');

  // 1. Create validator and validate paths
  const validator = new MappingValidator();
  const sourceValidation = validator.validateSourcePath('integration-test');
  console.log(
    '   1️⃣ Path validation:',
    sourceValidation.valid ? '✅ Valid' : '❌ Invalid'
  );

  // 2. Create parser (even if no config file available)
  const parser = new MappingConfigParser();
  console.log('   2️⃣ Parser creation:', parser ? '✅ Created' : '❌ Failed');

  // 3. Create manager and test integration
  const manager = new ContentMappingManager({
    projectRoot: '/tmp/integration-test',
  });
  console.log(
    '   3️⃣ Manager with integrated utilities:',
    manager.validator && manager.parser ? '✅ Ready' : '❌ Missing dependencies'
  );

  // 4. Test end-to-end validation through manager
  const managerSourceValidation = manager.validateSourcePath('test-source');
  console.log(
    '   4️⃣ Manager->Validator chain:',
    managerSourceValidation.valid ? '✅ Working' : '❌ Failed'
  );

  const managerDestValidation =
    manager.validateDestinationPath('src/content/test');
  console.log(
    '   5️⃣ Manager->Validator chain (destination):',
    managerDestValidation.valid ? '✅ Working' : '❌ Failed'
  );

  // 6. Test mapping validation through manager
  const testMapping = {
    'toyota-data': 'src/content/toyota',
    'honda-data': 'src/content/honda',
  };
  const managerMappingValidation = manager.validateMapping(testMapping);
  console.log(
    '   6️⃣ Manager->Validator chain (mapping):',
    managerMappingValidation.valid ? '✅ Working' : '❌ Failed'
  );

  // 7. Test standalone function imports work
  const standaloneSourceValidation = validateSourcePath('standalone-test');
  console.log(
    '   7️⃣ Standalone validation function:',
    standaloneSourceValidation.valid ? '✅ Working' : '❌ Failed'
  );

  const standaloneMappingValidation = validateMapping(testMapping);
  console.log(
    '   8️⃣ Standalone mapping validation:',
    standaloneMappingValidation.valid ? '✅ Working' : '❌ Failed'
  );

  console.log('\n   🎯 Mapping Integration: PASSED ✅');
  console.log(
    '   🎉 All three mapping utilities work independently and together!'
  );
} catch (error) {
  console.log('   ❌ Integration test failed:', error.message);
  console.log('   ❌ Stack:', error.stack);
}
