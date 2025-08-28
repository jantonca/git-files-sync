# Content Cleanup CLI

A powerful tool to manage imported content by identifying and safely removing unmanaged files based on your content configuration.

## 🎯 What It Does

The Content Cleanup CLI helps you maintain a clean content structure by:

1. **Reading your content configuration** from `content.config.js` in your project root
2. **Identifying managed files** that should be kept based on your import settings
3. **Finding unmanaged files** that can be safely removed
4. **Providing safe cleanup options** with confirmation prompts
5. **Updating .gitignore** to exclude managed content from version control

## 🔍 How It Determines Managed vs Unmanaged Files

The tool reads your content configuration and applies different rules based on import type:

### FOLDER Import (e.g., disclaimers)

```javascript
'src/data/content/disclaimers': 'src/data/content/disclaimers'
```

- **Managed**: ALL `.mdx` files in the folder
- **Unmanaged**: None (all files are kept)

### SELECTIVE Import (e.g., global-accessories)

```javascript
'src/data/content/global-accessories': {
  type: 'selective',
  files: ['PZQ8500A00.mdx', 'PZQ8533270.mdx']
}
```

- **Managed**: ONLY the specified files (`PZQ8500A00.mdx`, `PZQ8533270.mdx`)
- **Unmanaged**: Any other `.mdx` files in the folder

### FILE Import (e.g., templates)

```javascript
'src/data/content/shared-components/test-drive-forms/new-test-drive-template.mdx': {
  type: 'file',
  source: '...',
  destination: '...'
}
```

- **Managed**: ONLY the single specified file
- **Unmanaged**: Any other files in the directory

## 📋 Available Commands

### NPM Scripts (Recommended)

```bash
# Safe preview - list unmanaged files without making changes
npm run content:cleanup

# Interactive cleanup with confirmation prompts
npm run content:clean

# Update .gitignore with managed content paths
npm run content:gitignore
```

### Direct Node Commands

```bash
# Show detailed help guide
node content-management/content-cleanup.js --help

# List unmanaged files (safe preview)
node content-management/content-cleanup.js --list

# Interactive cleanup
node content-management/content-cleanup.js

# Update .gitignore only
node content-management/content-cleanup.js --gitignore
```

## 🛡️ Safety Features

- **Preview Mode**: `--list` shows what would be removed without making changes
- **Interactive Confirmation**: Always asks before deleting files
- **Detailed Logging**: Shows exactly which files are managed/unmanaged and why
- **Configuration Validation**: Checks your config before proceeding
- **No Surprises**: Clear output explaining all decisions

## 🎯 Typical Workflow

1. **Preview First**: Run `npm run content:cleanup` to see what would be removed
2. **Review the List**: Ensure the unmanaged files are correct
3. **Clean Safely**: Run `npm run content:clean` for interactive cleanup
4. **Update Git**: Optionally update `.gitignore` with managed paths

## 📊 Example Output

```
🧹 Content Cleanup CLI
════════════════════════

📋 Reading content configuration...
  ✅ FOLDER: All files in src/data/content/disclaimers are managed
  🎯 SELECTIVE: 2 specific files in src/data/content/global-accessories
     - PZQ8500A00.mdx
     - PZQ8533270.mdx
  📄 FILE: Single file src/data/content/shared-components/test-drive-forms/new-test-drive-template.mdx is managed

📊 Total managed paths: 3

🔍 Scanning 25 content files...

📊 Analysis complete:
  • Managed files: 20
  • Unmanaged files: 5

📋 Found 5 unmanaged files:
  - src/data/content/global-accessories/PZQ3100020.mdx
  - src/data/content/global-accessories/PZQ8533270-old.mdx
  - src/data/content/shared-components/old-template.mdx
  - src/data/content/shared-components/backup-template.mdx
  - src/data/content/disclaimers/DEPRECATED.mdx

❓ Remove these unmanaged files? (y/N):
```

## ⚙️ Configuration

The cleanup tool reads from `content.config.js` in your project root. Make sure your content mapping is properly configured with the correct import types:

- Use `type: 'folder'` for importing entire directories
- Use `type: 'selective'` with `files: [...]` for specific file lists
- Use `type: 'file'` for single file imports

## 🔧 Troubleshooting

### "No unmanaged files found"

This is good! It means your content exactly matches your configuration.

### "Error getting managed paths"

Check that `content.config.js` exists in your project root and has valid configuration.

### Files showing as unmanaged when they shouldn't be

Verify your content configuration includes the correct import type and file paths.

## 🤝 Integration

This tool integrates with:

- **Content Fetcher**: Works with the modular content fetching system
- **Git Workflow**: Updates `.gitignore` to exclude managed content
- **Development Workflow**: Safe to run during development without disrupting active work
