# Tests Directory Structure

This directory contains all test files organized by category and migration phase.

## Directory Structure

```
tests/
├── config/           # Configuration-related tests
├── integration/      # Integration tests between modules
├── utils/           # Utility function tests (Phase 5)
├── verification/    # Phase verification tests
└── README.md        # This file
```

## Test Categories

### Utils Tests (`tests/utils/`)

Tests for modular utilities created during Phase 5 migration:

- **Mapping Tests**:
  - `test-mapping-validator.js` - Tests for mapping validation logic
  - `test-mapping-manager.js` - Tests for main ContentMappingManager class
  - `test-mapping-integration.js` - Integration tests for all mapping utilities

- **GitIgnore Tests**: (Will be added when created)
  - Tests for GitIgnore utilities (validator, templates, manager)

- **CLI Tests**: (Will be added when created)
  - Tests for CLI utilities

### Integration Tests (`tests/integration/`)

Tests that verify multiple modules work together:

- Service integration tests
- Package import tests
- Multi-module workflow tests

### Verification Tests (`tests/verification/`)

Phase-specific verification tests that ensure migration didn't break functionality:

- `test-phase3-verification.js` - Adapter migration verification
- Phase 4 verification tests (core logic)
- Phase 5 verification tests (utilities)

### Config Tests (`tests/config/`)

Configuration-related testing utilities and test configs.

## Running Tests

To run specific test categories:

```bash
# Run utils tests
node tests/utils/test-mapping-integration.js

# Run verification tests
node tests/verification/test-phase3-verification.js

# Run integration tests
node tests/integration/test-services-integration.js
```

## Test Naming Convention

- Use descriptive names: `test-[module]-[aspect].js`
- Integration tests: `test-[modules]-integration.js`
- Verification tests: `test-phase[X]-verification.js`

## Best Practices

1. **Keep tests focused**: Each test file should test one specific module or integration
2. **Use descriptive output**: Include clear success/failure messages
3. **Test both positive and negative cases**: Validate expected behavior and error handling
4. **Clean up after tests**: Remove temporary files and reset state
5. **Document test purpose**: Include comments explaining what each test validates

## Migration Testing Strategy

During the migration process, we maintain both:

1. **Independent tests**: Verify each module works in isolation
2. **Integration tests**: Verify modules work together
3. **Verification tests**: Verify original functionality is preserved

This ensures we can confidently migrate complex systems while maintaining functionality.
