/**
 * Platform Utilities - Cross-platform compatibility helpers
 * @package @jantonca/git-files-sync
 */

import { execSync } from 'child_process';
import os from 'os';

/**
 * Get current platform information
 */
export function getPlatformInfo() {
  return {
    platform: process.platform,
    isWindows: process.platform === 'win32',
    isMacOS: process.platform === 'darwin',
    isLinux: process.platform === 'linux',
    architecture: process.arch,
    nodeVersion: process.version,
    osRelease: os.release(),
    osType: os.type()
  };
}

/**
 * Get platform-appropriate git command
 */
export function getGitCommand() {
  const platform = getPlatformInfo();
  
  if (platform.isWindows) {
    // Try git.exe first, then git
    try {
      execSync('git.exe --version', { stdio: 'pipe' });
      return 'git.exe';
    } catch {
      try {
        execSync('git --version', { stdio: 'pipe' });
        return 'git';
      } catch {
        throw new Error('Git not found. Please install Git and ensure it\'s in your PATH.');
      }
    }
  } else {
    // Unix-like systems (macOS, Linux)
    try {
      execSync('git --version', { stdio: 'pipe' });
      return 'git';
    } catch {
      throw new Error('Git not found. Please install Git and ensure it\'s in your PATH.');
    }
  }
}

/**
 * Get platform-appropriate shell options
 */
export function getShellOptions() {
  const platform = getPlatformInfo();
  
  return {
    shell: platform.isWindows ? true : '/bin/sh',
    windowsVerbatimArguments: platform.isWindows ? true : false
  };
}

/**
 * Normalize file paths for current platform
 */
export function normalizePath(filepath) {
  // Node.js path module handles this, but this provides explicit normalization
  return filepath.replace(/[/\\]/g, require('path').sep);
}

/**
 * Check if command exists in PATH
 */
export function commandExists(command) {
  const platform = getPlatformInfo();
  const cmd = platform.isWindows ? 'where' : 'which';
  
  try {
    execSync(`${cmd} ${command}`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get environment-specific temp directory
 */
export function getTempDir() {
  // Use Node.js os.tmpdir() as fallback, but prefer project-relative
  return '.content-temp';
}

/**
 * Platform compatibility report
 */
export function getCompatibilityReport() {
  const platform = getPlatformInfo();
  const checks = {
    platform,
    git: {
      available: false,
      command: null,
      version: null
    },
    node: {
      version: platform.nodeVersion,
      compatible: true // We'll assume Node.js 16+ compatibility
    },
    filesystem: {
      caseSensitive: !platform.isWindows && !platform.isMacOS
    }
  };
  
  // Check Git availability
  try {
    const gitCmd = getGitCommand();
    const version = execSync(`${gitCmd} --version`, { encoding: 'utf8' }).trim();
    checks.git = {
      available: true,
      command: gitCmd,
      version
    };
  } catch (error) {
    checks.git.error = error.message;
  }
  
  return checks;
}
