# Tests Directory

This directory contains all tests for the content management package, organized by type and purpose.

## Directory Structure

```
tests/
├── adapters/              # Adapter tests (moved from src/adapters/)
│   ├── test-astro.js             # Astro adapter tests
│   ├── test-nextjs.js            # Next.js adapter tests
│   ├── test-react.js             # React adapter tests
│   ├── test-base.js              # Base adapter tests
│   ├── test-index.js             # Adapter index tests
│   └── test-phase3-verification.js # Phase 3 adapter verification
├── services/              # Service tests (moved from src/services/)
│   ├── test-git.js               # Git service tests
│   ├── test-file.js              # File service tests
│   ├── test-cache.js             # Cache service tests
│   ├── test-validation.js        # Validation service tests
│   ├── test-performance.js       # Performance service tests
│   └── test-index.js             # Service index tests
├── utils/                 # Utility tests (Phase 5)
│   ├── test-mapping-validator.js  # Mapping validation tests
│   ├── test-mapping-manager.js    # Mapping manager tests
│   ├── test-mapping-integration.js # Mapping integration tests
│   └── README.md                 # Utils testing documentation
├── integration/           # Integration tests across modules
│   ├── test-services-integration.js     # Test service imports from main package
│   ├── test-three-services.js           # Test multiple services working together
│   └── test-package-import.js           # Test package import functionality
├── verification/          # Phase verification checkpoints
│   ├── test-phase2-verification.js      # Phase 2 services migration verification
│   └── test-phase3-verification.js      # Phase 3 adapters migration verification
└── config/               # Configuration and setup tests
    └── test-config.js                   # Configuration testing
```

## Test Types

### Unit Tests

Organized by module type in dedicated test directories:

- `tests/services/test-*.js` - Service unit tests (Phase 2)
- `tests/adapters/test-*.js` - Adapter unit tests (Phase 3)
- `tests/utils/test-*.js` - Utility unit tests (Phase 5)

### Integration Tests

Located in `tests/integration/`:

- Test how multiple modules work together
- Test package-level imports and exports
- Test cross-module functionality

### Verification Tests

Located in `tests/verification/`:

- Comprehensive phase completion verification
- Migration checkpoint validation
- End-to-end functionality verification

### Configuration Tests

Located in `tests/config/`:

- Configuration file testing
- Setup and environment tests

## Running Tests

### Run individual tests:

```bash
# Unit tests (run from their directories)
cd src/services && node test-git.js
cd src/adapters && node test-base.js

# Integration tests
cd tests/integration && node test-services-integration.js

# Verification tests
cd tests/verification && node test-phase2-verification.js
```

### Test organization principles:

1. **Unit tests** are co-located with their modules for easy maintenance
2. **Integration tests** test cross-module functionality
3. **Verification tests** validate major migration phases
4. **All tests are self-contained** and can run independently

## Migration Notes

These tests were created during the migration process to ensure:

- No functionality is lost during migration
- New structure works correctly
- Backward compatibility is maintained
- Each phase is properly verified before proceeding

Some tests may be cleaned up or consolidated in later migration phases.
