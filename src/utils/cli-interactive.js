import { ColorManager } from './cli-colors.js';
import { CLIPromptsManager } from './cli-prompts.js';
import { existsSync, readdirSync, statSync, readFileSync } from 'fs';
import { join, dirname } from 'path';

const MENU_ICONS = {
  arrow: '→',
  selected: '●',
  unselected: '○',
  separator: '─',
};

const CONFIRMATION_TYPES = {
  destructive: { icon: '⚠️', color: 'red' },
  important: { icon: '❓', color: 'yellow' },
  normal: { icon: 'ℹ️', color: 'blue' },
};

export class InteractiveMenu {
  constructor(options = {}) {
    this.colorManager = new ColorManager(options.colors !== false);
    this.prompts = new CLIPromptsManager();
  }

  async selectFromMenu(items, options = {}) {
    const { title = 'Select an option:', allowCancel = true } = options;

    if (title) {
      console.log(this.colorManager.colorize(`\n${title}`, 'cyan'));
      console.log(
        this.colorManager.colorize(
          MENU_ICONS.separator.repeat(title.length),
          'cyan'
        )
      );
    }

    items.forEach((item, index) => {
      const icon = MENU_ICONS.unselected;
      const label = typeof item === 'string' ? item : item.label;
      const description = typeof item === 'object' ? item.description : '';

      console.log(
        `${this.colorManager.colorize(icon, 'blue')} ${index + 1}. ${label}`
      );
      if (description) {
        console.log(`   ${this.colorManager.colorize(description, 'gray')}`);
      }
    });

    if (allowCancel) {
      console.log(
        `${this.colorManager.colorize(MENU_ICONS.unselected, 'gray')} 0. Cancel`
      );
    }

    while (true) {
      const choice = await this.prompts.prompt('\nEnter your choice: ');
      const index = parseInt(choice) - 1;

      if (choice === '0' && allowCancel) return null;
      if (index >= 0 && index < items.length) {
        const selected = items[index];
        return typeof selected === 'string'
          ? selected
          : selected.value || selected.label;
      }

      console.log(
        this.colorManager.colorize(
          '❌ Invalid choice. Please try again.',
          'red'
        )
      );
    }
  }

  async multiSelect(items, options = {}) {
    const {
      title = 'Select options (space to toggle, enter to confirm):',
      minSelections = 0,
    } = options;

    console.log(this.colorManager.colorize(`\n${title}`, 'cyan'));
    console.log(
      this.colorManager.colorize(
        'Use comma-separated numbers (e.g., 1,3,5):',
        'gray'
      )
    );

    items.forEach((item, index) => {
      const label = typeof item === 'string' ? item : item.label;
      console.log(`${MENU_ICONS.unselected} ${index + 1}. ${label}`);
    });

    const input = await this.prompts.prompt('\nEnter selections: ');
    const choices = input
      .split(',')
      .map(s => parseInt(s.trim()) - 1)
      .filter(i => i >= 0 && i < items.length);

    if (choices.length < minSelections) {
      console.log(
        this.colorManager.colorize(
          `❌ Minimum ${minSelections} selections required.`,
          'red'
        )
      );
      return this.multiSelect(items, options);
    }

    return choices.map(i =>
      typeof items[i] === 'string' ? items[i] : items[i].value || items[i].label
    );
  }
}

export class PathCompleter {
  constructor(options = {}) {
    this.colorManager = new ColorManager(options.colors !== false);
    this.baseDir = options.baseDir || process.cwd();
  }

  async promptWithCompletion(message, options = {}) {
    const { type = 'any', mustExist = false, extensions = [] } = options;

    console.log(this.colorManager.colorize(`${message}`, 'cyan'));

    if (type === 'directory') {
      console.log(
        this.colorManager.colorize(
          '💡 Use tab completion for directories',
          'gray'
        )
      );
    } else if (extensions.length > 0) {
      console.log(
        this.colorManager.colorize(
          `💡 Supported extensions: ${extensions.join(', ')}`,
          'gray'
        )
      );
    }

    while (true) {
      const input = await this._promptWithHints(message);

      if (!input && !mustExist) return '';

      const validation = this._validatePath(input, options);
      if (validation.valid) return input;

      console.log(this.colorManager.colorize(`❌ ${validation.error}`, 'red'));
      if (validation.suggestions.length > 0) {
        console.log(this.colorManager.colorize('💡 Did you mean:', 'yellow'));
        validation.suggestions.forEach((suggestion, i) => {
          console.log(`   ${i + 1}. ${suggestion}`);
        });

        const choice = await this._promptWithHints(
          'Select suggestion (number) or enter new path: '
        );
        if (/^\d+$/.test(choice)) {
          const index = parseInt(choice) - 1;
          if (index >= 0 && index < validation.suggestions.length) {
            return validation.suggestions[index];
          }
        }
      }
    }
  }

  async _promptWithHints(message) {
    const prompts = new CLIPromptsManager();
    return prompts.prompt(message);
  }

  _validatePath(path, options) {
    const { type, mustExist, extensions } = options;

    if (mustExist && !existsSync(path)) {
      return {
        valid: false,
        error: `Path does not exist: ${path}`,
        suggestions: this._getSuggestions(path),
      };
    }

    if (type === 'directory' && existsSync(path)) {
      if (!statSync(path).isDirectory()) {
        return {
          valid: false,
          error: 'Path is not a directory',
          suggestions: this._getDirectorySuggestions(dirname(path)),
        };
      }
    }

    if (extensions.length > 0) {
      const ext = path.split('.').pop()?.toLowerCase();
      if (!extensions.includes(`.${ext}`)) {
        return {
          valid: false,
          error: `Invalid file extension. Expected: ${extensions.join(', ')}`,
          suggestions: [],
        };
      }
    }

    return { valid: true, suggestions: [] };
  }

  _getSuggestions(path) {
    try {
      const dir = dirname(path) || '.';
      const baseName = path.split('/').pop() || '';

      if (!existsSync(dir)) return [];

      return readdirSync(dir)
        .filter(name => name.toLowerCase().startsWith(baseName.toLowerCase()))
        .map(name => join(dir, name))
        .slice(0, 5);
    } catch {
      return [];
    }
  }

  _getDirectorySuggestions(dir) {
    try {
      if (!existsSync(dir)) return [];

      return readdirSync(dir)
        .filter(name => {
          try {
            return statSync(join(dir, name)).isDirectory();
          } catch {
            return false;
          }
        })
        .map(name => join(dir, name))
        .slice(0, 5);
    } catch {
      return [];
    }
  }
}

export class ConfirmationDialog {
  constructor(options = {}) {
    this.colorManager = new ColorManager(options.colors !== false);
    this.prompts = new CLIPromptsManager();
  }

  async confirm(message, options = {}) {
    const {
      type = 'normal',
      defaultValue = false,
      details = null,
      showConsequences = false,
    } = options;

    const config = CONFIRMATION_TYPES[type];
    const icon = config.icon;
    const color = config.color;

    console.log(this.colorManager.colorize(`\n${icon} ${message}`, color));

    if (details) {
      console.log(this.colorManager.colorize(`   ${details}`, 'gray'));
    }

    if (showConsequences && type === 'destructive') {
      console.log(
        this.colorManager.colorize(
          '   ⚠️  This action cannot be undone!',
          'red'
        )
      );
    }

    const defaultText = defaultValue ? '[Y/n]' : '[y/N]';
    const response = await this.prompts.prompt(`\nConfirm ${defaultText}: `);

    if (!response) return defaultValue;

    const normalized = response.toLowerCase().trim();
    return ['y', 'yes', 'true', '1'].includes(normalized);
  }

  async confirmMultiple(actions, options = {}) {
    const { title = 'Review actions to be performed:' } = options;

    console.log(this.colorManager.colorize(`\n${title}`, 'cyan'));
    console.log(
      this.colorManager.colorize(
        MENU_ICONS.separator.repeat(title.length),
        'cyan'
      )
    );

    actions.forEach((action, index) => {
      const icon = action.type === 'destructive' ? '⚠️' : 'ℹ️';
      const color = action.type === 'destructive' ? 'red' : 'blue';
      console.log(
        `${index + 1}. ${this.colorManager.colorize(icon, color)} ${action.description}`
      );
    });

    return this.confirm('\nProceed with all actions?', {
      type: actions.some(a => a.type === 'destructive')
        ? 'destructive'
        : 'important',
      showConsequences: true,
    });
  }
}

export class SmartDefaults {
  constructor(options = {}) {
    this.colorManager = new ColorManager(options.colors !== false);
    this.projectRoot = options.projectRoot || process.cwd();
  }

  detectFramework() {
    const detectors = [
      { file: 'astro.config.mjs', framework: 'astro' },
      { file: 'astro.config.js', framework: 'astro' },
      { file: 'next.config.js', framework: 'nextjs' },
      { file: 'next.config.mjs', framework: 'nextjs' },
      { file: 'package.json', framework: this._detectFromPackageJson() },
      { file: 'vite.config.js', framework: 'vite' },
      { file: 'nuxt.config.js', framework: 'nuxt' },
    ];

    for (const detector of detectors) {
      if (existsSync(join(this.projectRoot, detector.file))) {
        return detector.framework;
      }
    }

    return 'unknown';
  }

  _detectFromPackageJson() {
    try {
      const packagePath = join(this.projectRoot, 'package.json');
      if (!existsSync(packagePath)) return null;

      const pkg = JSON.parse(readFileSync(packagePath, 'utf8'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };

      if (deps.astro) return 'astro';
      if (deps.next) return 'nextjs';
      if (deps.react && deps['react-dom']) return 'react';
      if (deps.vue) return 'vue';
      if (deps.svelte) return 'svelte';

      return null;
    } catch {
      return null;
    }
  }

  getDefaultPaths(framework) {
    const defaults = {
      astro: {
        content: 'src/content',
        components: 'src/components',
        pages: 'src/pages',
        config: 'astro.config.mjs',
      },
      nextjs: {
        content: 'content',
        components: 'components',
        pages: 'pages',
        config: 'next.config.js',
      },
      react: {
        content: 'src/content',
        components: 'src/components',
        pages: 'src/pages',
        config: 'package.json',
      },
    };

    return defaults[framework] || defaults.react;
  }

  suggestRepositoryBranch(repoUrl) {
    if (repoUrl.includes('github.com')) return 'main';
    if (repoUrl.includes('gitlab.com')) return 'main';
    if (repoUrl.includes('bitbucket.org')) return 'master';
    return 'main';
  }

  getRecommendedMappings(framework) {
    const framework_mappings = {
      astro: [
        { source: 'content/blog', dest: 'src/content/blog', type: 'folder' },
        { source: 'content/pages', dest: 'src/content/pages', type: 'folder' },
        {
          source: 'components',
          dest: 'src/components/shared',
          type: 'selective',
        },
      ],
      nextjs: [
        { source: 'content', dest: 'content', type: 'folder' },
        { source: 'components', dest: 'components/shared', type: 'selective' },
        { source: 'public', dest: 'public/shared', type: 'selective' },
      ],
    };

    return framework_mappings[framework] || framework_mappings.astro;
  }
}
