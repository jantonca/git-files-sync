/**
 * GitIgnore Templates
 * Default gitignore templates and patterns for different frameworks and use cases
 * Extracted from GitIgnoreManager for focused template management
 */

/**
 * Basic gitignore template for most projects
 */
export const BASIC_GITIGNORE = `# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Production builds
build/
dist/
.next/
.astro/

# Environment variables
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
`;

/**
 * Framework-specific gitignore patterns
 */
export const FRAMEWORK_PATTERNS = {
  astro: [
    '.astro/',
    'dist/',
    '.env',
    '.env.local',
    '.env.production.local',
    '.env.development.local',
  ],
  nextjs: [
    '.next/',
    'out/',
    '.env',
    '.env.local',
    '.env.production.local',
    '.env.development.local',
    '.vercel',
  ],
  react: [
    'build/',
    '.env',
    '.env.local',
    '.env.production.local',
    '.env.development.local',
  ],
  vue: [
    'dist/',
    '.env',
    '.env.local',
    '.env.production.local',
    '.env.development.local',
  ],
  svelte: [
    '.svelte-kit/',
    'build/',
    '.env',
    '.env.local',
    '.env.production.local',
    '.env.development.local',
  ],
};

/**
 * Content management specific patterns
 */
export const CONTENT_PATTERNS = [
  '.content-temp/',
  '.content-backup/',
  '.content-cache/',
  '*.content.json',
  'content-lock.json',
];

/**
 * Common development patterns
 */
export const DEVELOPMENT_PATTERNS = [
  '*.log',
  '*.tmp',
  '.cache/',
  '.temp/',
  'temp/',
  'tmp/',
  '*.backup',
  '*.bak',
  '.debug/',
];

/**
 * GitIgnore template generator class
 */
export class GitIgnoreTemplateGenerator {
  constructor(options = {}) {
    this.includeComments = options.includeComments !== false; // Include comments by default
  }

  /**
   * Generate basic gitignore content
   * @param {string[]} additionalPatterns - Additional patterns to include
   * @returns {string} Generated gitignore content
   */
  generateBasic(additionalPatterns = []) {
    let content = BASIC_GITIGNORE;

    if (additionalPatterns.length > 0) {
      content += this._formatSection('Additional patterns', additionalPatterns);
    }

    return content;
  }

  /**
   * Generate framework-specific gitignore
   * @param {string} framework - Framework name
   * @param {string[]} additionalPatterns - Additional patterns
   * @returns {string} Generated gitignore content
   */
  generateForFramework(framework, additionalPatterns = []) {
    let content = BASIC_GITIGNORE;

    // Add framework-specific patterns
    const frameworkPatterns = FRAMEWORK_PATTERNS[framework.toLowerCase()];
    if (frameworkPatterns) {
      content += this._formatSection(
        `${framework} specific`,
        frameworkPatterns
      );
    }

    // Add additional patterns
    if (additionalPatterns.length > 0) {
      content += this._formatSection('Additional patterns', additionalPatterns);
    }

    return content;
  }

  /**
   * Generate content management gitignore
   * @param {string[]} contentPaths - Content paths to ignore
   * @param {string} sectionName - Section name for content paths
   * @returns {string} Generated gitignore content
   */
  generateForContentManagement(
    contentPaths = [],
    sectionName = 'Auto-imported content (do not commit)'
  ) {
    let content = BASIC_GITIGNORE;

    // Add content management patterns
    content += this._formatSection('Content management', CONTENT_PATTERNS);

    // Add auto-managed content paths
    if (contentPaths.length > 0) {
      const formattedPaths = contentPaths.map(path => `/${path}`);
      content += this._formatSection(sectionName, formattedPaths);
    }

    return content;
  }

  /**
   * Generate comprehensive gitignore
   * @param {object} options - Generation options
   * @returns {string} Generated gitignore content
   */
  generateComprehensive(options = {}) {
    const {
      framework,
      contentPaths = [],
      developmentMode = false,
      customPatterns = {},
    } = options;

    let content = BASIC_GITIGNORE;

    // Add framework patterns
    if (framework) {
      const frameworkPatterns = FRAMEWORK_PATTERNS[framework.toLowerCase()];
      if (frameworkPatterns) {
        content += this._formatSection(
          `${framework} specific`,
          frameworkPatterns
        );
      }
    }

    // Add content management patterns
    content += this._formatSection('Content management', CONTENT_PATTERNS);

    // Add development patterns if needed
    if (developmentMode) {
      content += this._formatSection('Development', DEVELOPMENT_PATTERNS);
    }

    // Add auto-managed content paths
    if (contentPaths.length > 0) {
      const formattedPaths = contentPaths.map(path => `/${path}`);
      content += this._formatSection(
        'Auto-imported content (do not commit)',
        formattedPaths
      );
    }

    // Add custom pattern sections
    for (const [sectionName, patterns] of Object.entries(customPatterns)) {
      if (Array.isArray(patterns) && patterns.length > 0) {
        content += this._formatSection(sectionName, patterns);
      }
    }

    return content;
  }

  /**
   * Get patterns for specific use case
   * @param {string} useCase - Use case name
   * @returns {string[]} Patterns for use case
   */
  getPatternsFor(useCase) {
    switch (useCase.toLowerCase()) {
      case 'content':
      case 'git-files-sync':
        return [...CONTENT_PATTERNS];
      case 'development':
      case 'dev':
        return [...DEVELOPMENT_PATTERNS];
      default:
        if (FRAMEWORK_PATTERNS[useCase.toLowerCase()]) {
          return [...FRAMEWORK_PATTERNS[useCase.toLowerCase()]];
        }
        return [];
    }
  }

  /**
   * Format a section with patterns
   * @param {string} sectionName - Section name
   * @param {string[]} patterns - Patterns for the section
   * @returns {string} Formatted section
   * @private
   */
  _formatSection(sectionName, patterns) {
    if (!this.includeComments) {
      return '\n' + patterns.join('\n') + '\n';
    }

    return `\n# ${sectionName}\n${patterns.join('\n')}\n`;
  }
}

/**
 * Default template generator instance
 */
export const templateGenerator = new GitIgnoreTemplateGenerator();

/**
 * Export convenience functions
 */
export const generateBasic = (...args) =>
  templateGenerator.generateBasic(...args);
export const generateForFramework = (...args) =>
  templateGenerator.generateForFramework(...args);
export const generateForContentManagement = (...args) =>
  templateGenerator.generateForContentManagement(...args);
export const generateComprehensive = (...args) =>
  templateGenerator.generateComprehensive(...args);
export const getPatternsFor = (...args) =>
  templateGenerator.getPatternsFor(...args);
