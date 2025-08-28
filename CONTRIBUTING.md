# Contributing to @jantonca/git-files-sync

Thank you for considering contributing to this project! This guide will help you understand our development process and coding standards.

## 🚀 Quick Start for Contributors

1. **Fork the repository** and clone your fork
2. **Install dependencies**: `npm install`
3. **Run tests**: `npm test`
4. **Validate package**: `npm run validate`

## 📋 Development Guidelines

### Code Quality Standards

We follow strict coding guidelines outlined in [COPILOT_RULES.md](./COPILOT_RULES.md):

- **DRY Principle**: No code repetition, abstract common logic
- **Self-documenting code**: Descriptive variable/function names
- **Error handling**: Comprehensive try-catch blocks
- **Security-first**: No hardcoded secrets, validate all inputs
- **Performance**: Optimize for size and efficiency

### Project Structure

```
src/
├── core/           # Main content management classes
├── services/       # Infrastructure services (git, file, cache)
├── adapters/       # Framework-specific integrations
├── utils/          # Helper utilities and CLI tools
└── plugins/        # Plugin system

bin/                # CLI executables
tools/              # Development and migration tools
tests/              # Comprehensive test suite
templates/          # Framework configuration templates
```

### Testing Requirements

- **All new features** must include comprehensive tests
- **Run the test suite**: `npm test`
- **Test coverage**: Cover happy path, edge cases, and error conditions
- **Framework compatibility**: Test across supported frameworks (Astro, Next.js, React)

### Commit Message Format

Follow [Conventional Commits](https://conventionalcommits.org/):

```
feat: add support for Vue.js framework detection
fix: resolve cache invalidation issue in watch mode
docs: update CLI command documentation
refactor: extract git operations into separate service
test: add integration tests for content mapping
```

## 🔧 Development Workflow

### 1. Feature Development

1. **Create a feature branch**: `git checkout -b feat/your-feature-name`
2. **Implement your changes** following coding guidelines
3. **Add/update tests** for your changes
4. **Run validation**: `npm run validate && npm test`
5. **Update documentation** if needed

### 2. Pull Request Process

1. **Ensure all tests pass**
2. **Update README.md** if adding new features
3. **Add/update JSDoc comments** for public APIs
4. **Follow the PR template** (if available)

### 3. Code Review Checklist

- [ ] Follows DRY principle and coding standards
- [ ] Includes comprehensive error handling
- [ ] Has appropriate test coverage
- [ ] Updates documentation where necessary
- [ ] No hardcoded secrets or sensitive data
- [ ] Performance optimizations applied
- [ ] Cross-platform compatibility maintained

## 🛡️ Security Guidelines

- **Never commit secrets**: Use environment variables
- **Validate all inputs**: Assume all input is untrusted
- **Principle of least privilege**: Default to restrictive permissions
- **No sensitive data in logs**: Sanitize logging output

## 🎯 Framework Support

When adding framework support:

1. **Create adapter**: Add to `src/adapters/`
2. **Update detection logic**: Modify framework detection in base adapter
3. **Add templates**: Create framework-specific templates
4. **Test thoroughly**: Ensure compatibility across environments
5. **Document integration**: Update framework documentation

## 📊 Performance Considerations

- **Zero dependencies**: Package uses only Node.js built-ins
- **Async operations**: Use async/await for all I/O operations
- **Memory efficiency**: Clean up resources properly
- **Cache optimization**: Implement intelligent caching strategies

## 🐛 Bug Reports

When reporting bugs:

1. **Use the issue template**
2. **Provide minimal reproduction**
3. **Include environment details** (Node.js version, OS, framework)
4. **Add relevant logs** (sanitized of sensitive data)

## 💡 Feature Requests

For new features:

1. **Check existing issues** to avoid duplicates
2. **Describe the use case** and expected behavior
3. **Consider backward compatibility**
4. **Propose implementation approach** if possible

## 📚 Resources

- [Main Documentation](./docs/README.md)
- [API Reference](./docs/API.md)
- [CLI Reference](./docs/CLI.md)
- [Migration Guide](./docs/MIGRATION_GUIDE.md)

## 🤝 Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help newcomers get started
- Maintain professional communication

## 📄 License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
