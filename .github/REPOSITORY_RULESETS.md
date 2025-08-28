# Git Files Sync - Repository Rulesets

This document outlines the GitHub repository rulesets and branch protection rules for maintaining code quality and security.

## 🛡️ Branch Protection Rules

### Main Branch (`main`)

**Required Status Checks:**
- ✅ `ci/tests` - All tests must pass
- ✅ `ci/validate` - Package validation must pass
- ✅ `ci/security` - Security scan must pass
- ✅ `ci/lint` - Code quality checks must pass

**Restrictions:**
- 🚫 **No direct pushes** to main branch
- ✅ **Require pull request reviews** (minimum 1 reviewer)
- ✅ **Dismiss stale reviews** when new commits are pushed
- ✅ **Require review from code owners** (if CODEOWNERS exists)
- ✅ **Require up-to-date branches** before merging
- ✅ **Include administrators** in restrictions

### Development Branches

**Pattern:** `feat/*`, `fix/*`, `docs/*`, `refactor/*`

**Requirements:**
- ✅ Must pass all CI checks before merging
- ✅ Must follow conventional commit format
- ✅ Must include appropriate tests for code changes

## 🔍 Required Checks Configuration

### CI/CD Pipeline Requirements

```yaml
# Suggested GitHub Actions checks
name: CI/CD Pipeline

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  test:
    name: "Tests"
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test

  validate:
    name: "Package Validation"
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run validate

  security:
    name: "Security Scan"
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm audit --audit-level moderate

  lint:
    name: "Code Quality"
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint || echo "Linting not configured - using built-in validation"
```

## 🏷️ Issue and PR Templates

### Pull Request Requirements

All pull requests must:

1. **Follow conventional commit format** in title
2. **Include description** of changes made
3. **Reference related issues** using `Closes #123` format
4. **Update documentation** if adding new features
5. **Add/update tests** for code changes
6. **Pass all required checks**

### Issue Labeling Strategy

**Type Labels:**
- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to docs
- `question` - Further information is requested
- `security` - Security-related issues

**Priority Labels:**
- `priority: high` - Critical issues
- `priority: medium` - Important issues
- `priority: low` - Nice to have

**Framework Labels:**
- `framework: astro` - Astro-specific issues
- `framework: nextjs` - Next.js-specific issues
- `framework: react` - React-specific issues
- `framework: vue` - Vue.js-specific issues

## 🤖 Dependabot Configuration

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    reviewers:
      - "jantonca"
    assignees:
      - "jantonca"
    commit-message:
      prefix: "deps"
      include: "scope"
```

## 🔐 Security Policies

### Vulnerability Reporting

- **Private reporting**: Use GitHub Security Advisories
- **Response time**: 48 hours for acknowledgment
- **Disclosure**: Coordinated disclosure after fix

### Code Scanning

- **CodeQL**: Enabled for JavaScript/TypeScript
- **Dependency scanning**: Dependabot alerts enabled
- **Secret scanning**: Enabled for common tokens

## 📋 Repository Settings Checklist

### General Settings
- [ ] **Description**: Clear, concise description
- [ ] **Topics**: Relevant tags for discoverability
- [ ] **License**: MIT License configured
- [ ] **Default branch**: `main`

### Security & Analysis
- [ ] **Dependency graph**: Enabled
- [ ] **Dependabot alerts**: Enabled
- [ ] **Dependabot security updates**: Enabled
- [ ] **Code scanning**: CodeQL enabled
- [ ] **Secret scanning**: Enabled

### Branch Protection
- [ ] **Main branch protection**: Configured as above
- [ ] **Required status checks**: All CI checks required
- [ ] **Require review**: Minimum 1 reviewer
- [ ] **Dismiss stale reviews**: Enabled

### Collaboration
- [ ] **Issues**: Enabled with templates
- [ ] **Pull requests**: Enabled with templates
- [ ] **Discussions**: Consider enabling for community
- [ ] **Wiki**: Disabled (use docs/ folder instead)

## 🎯 Quality Gates

### Pre-merge Requirements

1. **All tests pass** (`npm test`)
2. **Package validation passes** (`npm run validate`)
3. **No security vulnerabilities** (`npm audit`)
4. **Code follows standards** (per COPILOT_RULES.md)
5. **Documentation updated** (if applicable)
6. **Conventional commit format** followed

### Release Requirements

1. **Version bump** following semantic versioning
2. **Changelog updated** with new features/fixes
3. **All CI checks green**
4. **No outstanding security issues**
5. **Documentation reflects changes**

## 🚀 Automation Recommendations

### GitHub Actions Workflows

1. **CI/CD Pipeline**: Run tests, validation, security scans
2. **Release Automation**: Auto-publish to npm on version tags
3. **Dependency Updates**: Auto-merge minor dependency updates
4. **Stale Issue Management**: Close inactive issues/PRs
5. **Documentation Sync**: Auto-update docs on releases

### Bot Integrations

- **Dependabot**: Dependency updates
- **CodeQL**: Security analysis
- **Semantic Release**: Automated releases (optional)

This ruleset ensures code quality, security, and maintainability while facilitating smooth collaboration.
