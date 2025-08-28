console.log('2️⃣ Testing Mapping Validator...');

try {
  const { MappingValidator } = await import(
    '../../src/utils/mapping-validator.js'
  );

  const validator = new MappingValidator();
  console.log('   ✅ MappingValidator imported and instantiated');

  // Test source validation
  const sourceValid = validator.validateSourcePath('toyota-content');
  console.log(
    '   📝 Source validation (toyota-content):',
    sourceValid.valid ? '✅ Valid' : '❌ Invalid'
  );

  const sourceBad = validator.validateSourcePath('Toyota_Content!');
  console.log(
    '   📝 Bad source validation:',
    sourceBad.valid === false ? '✅ Correctly invalid' : '❌ Should be invalid'
  );

  // Test destination validation
  const destValid = validator.validateDestinationPath('src/content/toyota');
  console.log(
    '   📝 Destination validation (src/content/toyota):',
    destValid.valid ? '✅ Valid' : '❌ Invalid'
  );

  const destBad = validator.validateDestinationPath('../dangerous/path');
  console.log(
    '   📝 Bad destination validation:',
    destBad.valid === false ? '✅ Correctly invalid' : '❌ Should be invalid'
  );

  // Test mapping validation
  const testMapping = {
    'toyota-content': 'src/content/toyota',
    'honda-content': 'src/content/honda',
  };
  const mappingValid = validator.validateMapping(testMapping);
  console.log(
    '   📝 Mapping validation (2 entries):',
    mappingValid.valid ? '✅ Valid' : '❌ Invalid'
  );

  // Test conflict detection
  const conflicts = validator.checkMappingConflicts(
    testMapping,
    'toyota-content',
    'src/content/new'
  );
  console.log(
    '   📝 Conflict detection:',
    conflicts.hasConflicts ? '✅ Detected' : '❌ Missed'
  );

  console.log('   🎯 Mapping Validator: PASSED ✅');
} catch (error) {
  console.log('   ❌ Validator test failed:', error.message);
}
