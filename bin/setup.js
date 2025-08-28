#!/usr/bin/env node

/**
 * Content Management Setup Script
 * Faithful JavaScript conversion of setup.sh for cross-platform compatibility
 * Phase 6.1 - Safety First approach preserving 100% functionality
 */

import { CLIInterfaceManager } from '../src/utils/cli.js';
import { writeFileSync, existsSync } from 'fs';
import { createRequire } from 'module';

// Create require function for CommonJS compatibility
const require = createRequire(import.meta.url);

class ContentSetup {
  constructor() {
    this.cli = new CLIInterfaceManager();
    this.repoUrl = '';
    this.branch = 'main';
    this.contentMappings = '';
    this.mappingCount = 0;
  }

  async run() {
    try {
      // Header
      console.log('🚀 Content Management Setup');
      console.log('==========================');
      console.log('');

      // 1. Repository Configuration
      await this.getRepositoryConfig();

      // 2. Content Mappings Setup
      await this.getContentMappings();

      // 3. Generate config file
      await this.generateConfigFile();

      // Enhanced next steps are shown by generateConfigFile()
    } catch (error) {
      console.log(`❌ Setup failed: ${error.message}`);
      process.exit(1);
    }
  }

  async getRepositoryConfig() {
    console.log('📦 Repository Configuration');
    console.log('');

    // Repository URL
    this.repoUrl = await this.cli.prompt(
      'Repository URL (git@... or https://...): '
    );

    if (!this.repoUrl) {
      console.log('❌ Repository URL is required');
      process.exit(1);
    }

    // Branch name
    const branchInput = await this.cli.prompt('Branch name [main]: ');
    this.branch = branchInput || 'main';
  }

  async getContentMappings() {
    console.log('');
    console.log('📋 Content Mappings Setup');
    console.log('========================');
    console.log('');
    console.log('Choose how to configure content mappings:');
    console.log('1) Interactive setup (guided configuration)');
    console.log('2) Skip for now (edit content.config.js manually later)');
    console.log('');

    const setupChoice = await this.cli.prompt('Choose option [1-2]: ');

    if (setupChoice === '1') {
      await this.interactiveSetup();
    } else {
      console.log('⏭️  Skipping content mappings setup');
    }
  }

  async interactiveSetup() {
    console.log('');
    console.log('📁 Interactive Content Mapping Setup');
    console.log('=====================================');
    console.log('');
    console.log('Available mapping types:');
    console.log('  1) FOLDER - Import all files from a folder');
    console.log('  2) SELECTIVE - Import specific files from a folder');
    console.log('  3) SINGLE FILE - Import one specific file');
    console.log('');
    console.log('Press Enter with empty input to finish adding mappings');
    console.log('');

    this.mappingCount = 0;

    while (true) {
      console.log(`--- Mapping #${this.mappingCount + 1} ---`);
      console.log('');

      const mappingType = await this.cli.prompt(
        'Type [1-3] or Enter to finish: '
      );

      if (!mappingType) {
        break;
      }

      switch (mappingType) {
        case '1':
          await this.addFolderMapping();
          break;
        case '2':
          await this.addSelectiveMapping();
          break;
        case '3':
          await this.addSingleFileMapping();
          break;
        default:
          console.log('❌ Invalid option. Please choose 1, 2, or 3.');
          continue;
      }
    }

    if (this.mappingCount > 0) {
      console.log(
        `✅ Configuration complete! Added ${this.mappingCount} mapping(s).`
      );
    } else {
      console.log('⏭️  No mappings configured');
    }
  }

  async addFolderMapping() {
    console.log('');
    console.log('📁 FOLDER IMPORT - Import all files from a folder');

    const sourcePath = await this.cli.prompt(
      'Source folder path (e.g., content/blog): '
    );
    const destPath = await this.cli.prompt(
      'Destination path (e.g., src/content/blog): '
    );

    if (sourcePath && destPath) {
      if (this.contentMappings) {
        this.contentMappings += ',';
      }
      this.contentMappings += `
    '${destPath}': {
      type: 'folder',
      source: '${sourcePath}',
      destination: '${destPath}'
    }`;
      this.mappingCount++;
      console.log(`✅ Added folder mapping: ${sourcePath} → ${destPath}`);
    }
  }

  async addSelectiveMapping() {
    console.log('');
    console.log('📂 SELECTIVE IMPORT - Import specific files from a folder');

    const sourcePath = await this.cli.prompt(
      'Source folder path (e.g., templates): '
    );
    const destPath = await this.cli.prompt(
      'Destination path (e.g., src/components): '
    );

    console.log('');
    console.log(
      'Enter filenames to import (one per line, empty line to finish):'
    );

    const filesList = [];
    while (true) {
      const filename = await this.cli.prompt('Filename: ');
      if (!filename) break;
      filesList.push(filename);
    }

    if (sourcePath && destPath && filesList.length > 0) {
      if (this.contentMappings) {
        this.contentMappings += ',';
      }
      this.contentMappings += `
    '${destPath}': {
      type: 'selective',
      source: '${sourcePath}',
      destination: '${destPath}',
      files: [${filesList.map(f => `'${f}'`).join(', ')}]
    }`;
      this.mappingCount++;
      console.log(`✅ Added selective mapping: ${sourcePath} → ${destPath}`);
    }
  }

  async addSingleFileMapping() {
    console.log('');
    console.log('📄 SINGLE FILE - Import one specific file');

    const sourcePath = await this.cli.prompt(
      'Source folder path (e.g., docs): '
    );
    const filename = await this.cli.prompt('Filename (e.g., README.md): ');
    const destFolder = await this.cli.prompt(
      'Destination folder (e.g., src/docs): '
    );

    if (sourcePath && filename && destFolder) {
      const destFull = `${destFolder}/${filename}`;

      if (this.contentMappings) {
        this.contentMappings += ',';
      }
      this.contentMappings += `
    '${destFull}': {
      type: 'single',
      source: '${sourcePath}/${filename}',
      destination: '${destFull}'
    }`;
      this.mappingCount++;
      console.log(
        `✅ Added single file mapping: ${sourcePath}/${filename} → ${destFull}`
      );
    }
  }

  /**
   * Detect project module type and framework
   */
  detectProjectType() {
    try {
      // Check if package.json exists
      if (existsSync('package.json')) {
        const pkg = JSON.parse(require('fs').readFileSync('package.json', 'utf8'));
        
        // Check module type
        const isESModule = pkg.type === 'module';
        
        // Detect framework
        const dependencies = { ...pkg.dependencies, ...pkg.devDependencies };
        let framework = 'generic';
        
        if (dependencies.astro) framework = 'astro';
        else if (dependencies.next) framework = 'nextjs';
        else if (dependencies.react) framework = 'react';
        else if (dependencies.vite) framework = 'vite';
        
        return { isESModule, framework };
      }
    } catch (error) {
      console.warn(`⚠️  Could not detect project type: ${error.message}`);
    }
    
    // Default fallback
    return { isESModule: false, framework: 'generic' };
  }

  async generateConfigFile() {
    const { isESModule, framework } = this.detectProjectType();
    
    // Choose config file format based on project type
    let configFile, configContent;
    
    if (isESModule) {
      // ES Module projects (Astro, Vite, projects with "type": "module")
      configFile = 'content.config.js';
      configContent = this.generateESModuleConfig();
    } else {
      // CommonJS projects (Next.js, React CRA, most Node.js projects)
      configFile = 'content.config.js';
      configContent = this.generateCommonJSConfig();
    }

    console.log(`📝 Detected: ${framework} project (${isESModule ? 'ES modules' : 'CommonJS'})`);
    console.log(`📄 Generating: ${configFile}`);

    // Check if file exists
    if (existsSync(configFile)) {
      const overwrite = await this.cli.confirm(
        `❓ ${configFile} already exists. Overwrite?`,
        false
      );
      if (!overwrite) {
        console.log('⏹️  Setup cancelled - existing configuration preserved');
        return;
      }
    }

    try {
      writeFileSync(configFile, configContent, 'utf8');
      console.log(`✅ Generated ${configFile} (${isESModule ? 'ES module' : 'CommonJS'} format)`);
      
      // Show next steps with framework-specific guidance
      this.showNextSteps(framework);
    } catch (error) {
      throw new Error(`Failed to write config file: ${error.message}`);
    }
  }

  generateESModuleConfig() {
    return `/**
 * Content Management Configuration (ES Module format)
 * 
 * This format works with:
 * - Astro projects
 * - Vite projects  
 * - Projects with "type": "module" in package.json
 */

export const CONFIG = {
  // Repository settings
  REPO_URL: '${this.repoUrl}',
  BRANCH: '${this.branch}',

  // Directory settings
  TEMP_DIR: '.content-temp',
  BACKUP_DIR: '.content-backup',

  // Content mapping configuration
  CONTENT_MAPPING: {${this.contentMappings}
  },

  // Performance settings
  MAX_RETRIES: 3,
  RETRY_DELAY: 2000,
  CONCURRENT_OPERATIONS: 5,
  VALIDATION_ENABLED: true,

  // File validation
  ALLOWED_EXTENSIONS: ['.json', '.mdx', '.md', '.jsx', '.tsx'],
  MAX_FILE_SIZE: 5 * 1024 * 1024 // 5MB
};
`;
  }

  generateCommonJSConfig() {
    return `/**
 * Content Management Configuration (CommonJS format)
 * 
 * This format works with:
 * - Next.js projects
 * - React (Create React App) projects
 * - Most Node.js projects without "type": "module"
 */

const CONFIG = {
  // Repository settings
  REPO_URL: '${this.repoUrl}',
  BRANCH: '${this.branch}',

  // Directory settings
  TEMP_DIR: '.content-temp',
  BACKUP_DIR: '.content-backup',

  // Content mapping configuration
  CONTENT_MAPPING: {${this.contentMappings}
  },

  // Performance settings
  MAX_RETRIES: 3,
  RETRY_DELAY: 2000,
  CONCURRENT_OPERATIONS: 5,
  VALIDATION_ENABLED: true,

  // File validation
  ALLOWED_EXTENSIONS: ['.json', '.mdx', '.md', '.jsx', '.tsx'],
  MAX_FILE_SIZE: 5 * 1024 * 1024 // 5MB
};

module.exports = { CONFIG };
`;
  }

  async showNextSteps() {
    console.log('');
    console.log('🎉 Setup Complete! Next Steps:');
    console.log('');
    console.log('1️⃣ Add these scripts to your package.json:');
    console.log('');
    
    const recommendedScripts = {
      "predev": "npx content-cli fetch",
      "prebuild": "npx content-cli fetch --force",
      "content:fetch": "npx content-cli fetch",
      "content:force": "npx content-cli fetch --force",
      "content:watch": "npx content-cli fetch --watch",
      "content:watch:force": "npx content-cli fetch --watch --force",
      "content:stats": "npx content-cli stats",
      "content:cache:clear": "npx content-cli cache clear",
      "content:health": "npx content-cli health"
    };

    console.log('   Add this to your package.json "scripts" section:');
    console.log('');
    console.log('   {');
    console.log('     "scripts": {');
    Object.entries(recommendedScripts).forEach(([script, command], index, arr) => {
      const comma = index < arr.length - 1 ? ',' : '';
      console.log(`       "${script}": "${command}"${comma}`);
    });
    console.log('       // ... your existing scripts');
    console.log('     }');
    console.log('   }');
    console.log('');
    
    console.log('2️⃣ Test your setup:');
    console.log('');
    console.log('   npx content-cli fetch    # Import content');
    console.log('   npx content-cli stats    # View system info');
    console.log('   npx content-cli health   # Health check');
    console.log('');
    
    console.log('3️⃣ Development workflow:');
    console.log('');
    console.log('   npm run predev               # Auto-sync before dev');
    console.log('   npm run content:fetch        # Smart content sync');
    console.log('   npm run content:force        # Force content update');
    console.log('   npm run content:watch        # Monitor for changes');
    console.log('   npm run content:watch:force  # Monitor with force updates');
    console.log('');
    console.log('   Framework-specific examples in template file:');
    console.log('   • Astro: dev:watch:force, dev:force');
    console.log('   • Next.js: dev:watch:force, dev:force');
    console.log('   • React: start:watch:force, start:force');
    console.log('   • Vite: dev:watch:force, dev:force');
    console.log('');
    
    console.log('4️⃣ Learn more:');
    console.log('');
    console.log('   npx content-cli --help           # Full CLI reference');
    console.log('   npx content-validate .           # Validate your setup');
    console.log('');
    
    // Automatically create scripts template without asking
    await this.createScriptsTemplate(recommendedScripts);
  }

  async createScriptsTemplate(scripts) {
    const scriptsFile = 'package-scripts-template.json';
    
    const template = {
      "// Add these to your package.json scripts section": "",
      scripts,
      "// Framework-specific examples": {
        "astro": {
          "dev": "npm run predev && astro dev",
          "dev:force": "npx content-cli fetch --force && astro dev", 
          "dev:watch": "npx content-cli fetch --watch & astro dev",
          "dev:watch:force": "npx content-cli fetch --watch --force & astro dev",
          "build": "npm run prebuild && astro build"
        },
        "nextjs": {
          "dev": "npm run predev && next dev",
          "dev:force": "npx content-cli fetch --force && next dev",
          "dev:watch": "npx content-cli fetch --watch & next dev", 
          "dev:watch:force": "npx content-cli fetch --watch --force & next dev",
          "build": "npm run prebuild && next build"
        },
        "react": {
          "start": "npm run predev && react-scripts start",
          "start:force": "npx content-cli fetch --force && react-scripts start",
          "start:watch": "npx content-cli fetch --watch & react-scripts start",
          "start:watch:force": "npx content-cli fetch --watch --force & react-scripts start", 
          "build": "npm run prebuild && react-scripts build"
        },
        "vite": {
          "dev": "npm run predev && vite",
          "dev:force": "npx content-cli fetch --force && vite",
          "dev:watch": "npx content-cli fetch --watch & vite",
          "dev:watch:force": "npx content-cli fetch --watch --force & vite",
          "build": "npm run prebuild && vite build"
        }
      }
    };

    try {
      writeFileSync(scriptsFile, JSON.stringify(template, null, 2), 'utf8');
      console.log(`✅ Created ${scriptsFile} for easy copy-paste`);
      console.log(`   Copy scripts from this file to your package.json`);
      console.log('');
      console.log('🎯 Setup complete! You can now:');
      console.log('   1. Copy scripts from package-scripts-template.json');
      console.log('   2. Run: npm run content:fetch');
      console.log('   3. Start developing with auto-sync!');
    } catch (error) {
      console.log(`⚠️  Could not create scripts template: ${error.message}`);
    }
  }
}

// Run setup if called directly
const setup = new ContentSetup();
setup.run().catch(error => {
  console.error('❌ Setup Error:', error.message);
  if (error.stack) {
    console.error('Stack trace:', error.stack);
  }
  process.exit(1);
});

export { ContentSetup };
