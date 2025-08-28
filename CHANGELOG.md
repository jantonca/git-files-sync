# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-08-27

### Added
- **Initial npm package release** - Complete migration from copy-folder approach to proper npm package
- **Universal framework support** - Auto-detects Astro, Next.js, React, Vite, and generic projects
- **Comprehensive CLI tools** - 7 CLI commands available via npx
- **Enhanced setup process** - Interactive configuration with smart defaults
- **Production-ready architecture** - Modular structure with src/core, src/services, src/adapters
- **Zero dependencies** - Uses only Node.js built-ins for maximum compatibility
- **Watch mode functionality** - Monitor repository changes with interactive and auto-update modes
- **Content validation system** - Comprehensive validation with specialized validators
- **Cache management** - Intelligent caching with TTL and invalidation
- **Performance monitoring** - Built-in performance tracking and optimization
- **Backup and recovery** - Automatic backup creation and restoration capabilities
- **Framework adapters** - Dedicated adapters for popular frameworks
- **Git integration** - Full Git workflow integration with sparse checkout
- **GitIgnore management** - Automatic .gitignore updates for managed content
- **Plugin system** - Extensible plugin architecture
- **Configuration management** - Smart config loading with ES modules and CommonJS support
- **Development tools** - Package validation, migration, and testing utilities

### Changed
- **Architecture**: Migrated from monolithic copy-folder to modular npm package structure
- **Installation**: Changed from `git clone` to `npm install @jantonca/git-files-sync`
- **Configuration**: Enhanced config format with framework-specific detection
- **Setup process**: Interactive setup replaces manual configuration
- **CLI interface**: Unified CLI commands replace individual scripts
- **Import paths**: Changed from lib/ structure to src/ modular structure
- **Documentation**: Comprehensive documentation with quick start guides

### Fixed
- **NextJS compatibility** - Universal config loading works across all frameworks
- **Race conditions** - Watch mode duplicate executions prevented with isUpdating checks
- **Debug message spam** - Production output cleaned, debug messages removed
- **Memory leaks** - Enhanced error handling and resource cleanup
- **Cross-platform compatibility** - Windows, macOS, Linux support verified
- **TTY compatibility** - Progress bars and interactive features work in all environments

### Security
- **Input validation** - Comprehensive sanitization of user inputs
- **Path traversal protection** - Safe file operations with path validation
- **Git security** - Secure repository cloning with validation
- **Secret management** - No hardcoded secrets, environment variable support

### Performance
- **Startup optimization** - Lazy loading and efficient module structure
- **Cache improvements** - Intelligent caching reduces redundant operations
- **Memory efficiency** - Optimized memory usage for large content repositories
- **Network optimization** - Efficient Git operations with progress tracking

### Migration Guide
- **From copy-folder approach**: Use `npx content-migrate .` to update existing projects
- **Configuration updates**: New config format with enhanced features
- **Import path changes**: lib/ paths changed to src/ modular structure
- **CLI command updates**: New unified CLI interface

## [Unreleased]

### Planned
- **CI/CD integration** - Automated testing and publishing workflows
- **Enhanced testing** - Cross-platform integration tests
- **Performance benchmarks** - Automated performance monitoring
- **Additional framework support** - Svelte, Vue, and other framework adapters

---

## Version Compatibility

### Node.js Support
- **Minimum**: Node.js 16.0.0
- **Recommended**: Node.js 18.0.0 or later
- **Tested**: Node.js 16.x, 18.x, 20.x

### Framework Compatibility
- **Astro**: 2.0.0+ (ES modules)
- **Next.js**: 12.0.0+ (CommonJS/ES modules)
- **React**: 16.8.0+ (Create React App and Vite)
- **Vite**: 3.0.0+ (ES modules)
- **Generic**: Any Node.js project with package.json

### Breaking Changes Policy
- **Major versions** (x.0.0): May contain breaking changes with migration guide
- **Minor versions** (1.x.0): New features, backward compatible
- **Patch versions** (1.0.x): Bug fixes, security updates, backward compatible

### Deprecation Policy
- **Deprecation warning**: 1 major version before removal
- **Migration guide**: Provided for all breaking changes
- **Support timeline**: Deprecated features supported for 6 months minimum

---

## Release Process

### Version Bumping
```bash
# Patch release (bug fixes)
npm version patch

# Minor release (new features)
npm version minor

# Major release (breaking changes)
npm version major
```

### Release Checklist
- [ ] All tests passing (25/25)
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version bumped in package.json
- [ ] Git tag created
- [ ] npm package published
- [ ] Bitbucket release created
- [ ] Migration guide updated (if needed)

### Support Timeline
- **Current major version**: Full support (new features, bug fixes, security updates)
- **Previous major version**: Security updates for 12 months
- **Older versions**: Community support only

---

## Attribution

This package represents a complete migration and enhancement of the original content management system, with significant architectural improvements, enhanced functionality, and production-ready quality.

**Contributors**: jantonca development team
**License**: MIT
**Repository**: https://github.com/jantonca/git-files-sync (Public)
