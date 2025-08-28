import { ColorManager } from './cli-colors.js';

const ICONS = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
  pending: '⏳',
  skipped: '⏭️',
};

const STATUS_COLORS = {
  success: 'green',
  error: 'red',
  warning: 'yellow',
  info: 'blue',
  pending: 'cyan',
  skipped: 'gray',
};

export class ProgressBar {
  constructor(total, options = {}) {
    Object.assign(this, {
      total,
      current: 0,
      startTime: Date.now(),
      width: options.width || 40,
      title: options.title || 'Progress',
      colorManager: new ColorManager(options.colors !== false),
      stream: options.stream || process.stdout,
    });
  }

  update(current, status = '') {
    this.current = current;
    const percentage = Math.round((current / this.total) * 100);
    const filled = Math.round((current / this.total) * this.width);
    const bar =
      '█'.repeat(filled) + '░'.repeat(Math.max(0, this.width - filled));
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);

    const line = `${this.title}: [${this.colorManager.colorize(bar, 'cyan')}] ${percentage}% (${current}/${this.total}) ${elapsed}s ${status}`;
    this.stream.clearLine(0);
    this.stream.cursorTo(0);
    this.stream.write(line);
  }

  complete(message = 'Complete!') {
    this.update(this.total);
    this.stream.write('\n');
    console.log(this.colorManager.colorize(`✅ ${message}`, 'green'));
  }

  fail(message = 'Failed!') {
    this.stream.write('\n');
    console.log(this.colorManager.colorize(`❌ ${message}`, 'red'));
  }
}

export class Spinner {
  constructor(text = 'Processing...', options = {}) {
    Object.assign(this, {
      text,
      frameIndex: 0,
      interval: null,
      startTime: Date.now(),
      frames: options.frames || [
        '⠋',
        '⠙',
        '⠹',
        '⠸',
        '⠼',
        '⠴',
        '⠦',
        '⠧',
        '⠇',
        '⠏',
      ],
      colorManager: new ColorManager(options.colors !== false),
      stream: options.stream || process.stdout,
    });
  }

  start() {
    if (this.interval) return;
    this.interval = globalThis.setInterval(() => {
      const frame = this.frames[this.frameIndex];
      const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
      const line = `${this.colorManager.colorize(frame, 'cyan')} ${this.text} (${elapsed}s)`;
      this.stream.clearLine(0);
      this.stream.cursorTo(0);
      this.stream.write(line);
      this.frameIndex = (this.frameIndex + 1) % this.frames.length;
    }, 100);
  }

  setText(text) {
    this.text = text;
  }

  _finish(icon, color, message) {
    this.stop();
    console.log(this.colorManager.colorize(`${icon} ${message}`, color));
  }

  succeed(message = 'Done!') {
    this._finish('✅', 'green', message);
  }
  fail(message = 'Failed!') {
    this._finish('❌', 'red', message);
  }
  warn(message = 'Warning!') {
    this._finish('⚠️', 'yellow', message);
  }
  info(message = 'Info') {
    this._finish('ℹ️', 'blue', message);
  }

  stop() {
    if (this.interval) {
      globalThis.clearInterval(this.interval);
      this.interval = null;
      this.stream.clearLine(0);
      this.stream.cursorTo(0);
    }
  }
}

export class FormattingUtils {
  constructor(options = {}) {
    this.colorManager = new ColorManager(options.colors !== false);
  }

  header(title, color = 'cyan') {
    const line = '='.repeat(title.length + 4);
    console.log(this.colorManager.colorize(line, color));
    console.log(this.colorManager.colorize(`  ${title}  `, color));
    console.log(this.colorManager.colorize(line, color));
    console.log('');
  }

  subheader(title, color = 'blue') {
    console.log(this.colorManager.colorize(`\n📋 ${title}`, color));
    console.log(
      this.colorManager.colorize('-'.repeat(title.length + 4), color)
    );
  }

  table(items, options = {}) {
    const maxLabelLength = Math.max(...items.map(item => item.label.length));
    const separator = options.separator || ': ';
    items.forEach(item => {
      const paddedLabel = item.label.padEnd(maxLabelLength);
      console.log(
        `${this.colorManager.colorize(paddedLabel, 'cyan')}${separator}${item.value}`
      );
    });
  }

  statusList(items) {
    items.forEach(item => {
      const icon = ICONS[item.status] || ICONS.info;
      const color = STATUS_COLORS[item.status] || 'reset';
      console.log(`${this.colorManager.colorize(icon, color)} ${item.message}`);
    });
  }
}

export class EnhancedCLI {
  constructor(options = {}) {
    this.colorManager = new ColorManager(options.colors !== false);
    this.formatting = new FormattingUtils(options);
  }

  createProgressBar(total, options = {}) {
    return new ProgressBar(total, {
      ...options,
      colors: this.colorManager.enabled,
    });
  }

  createSpinner(text, options = {}) {
    return new Spinner(text, { ...options, colors: this.colorManager.enabled });
  }

  _message(icon, color, message) {
    console.log(this.colorManager.colorize(`${icon} ${message}`, color));
  }

  success(message) {
    this._message('✅', 'green', message);
  }
  error(message) {
    this._message('❌', 'red', message);
  }
  warning(message) {
    this._message('⚠️', 'yellow', message);
  }
  info(message) {
    this._message('ℹ️', 'blue', message);
  }
}
