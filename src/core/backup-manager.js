/**
 * Backup Manager - Handles backup and recovery operations
 * Extracted from content-fetcher.js for better separation of concerns
 */

import { CONFIG } from '../utils/config.js';

export class BackupManager {
  constructor(options = {}) {
    this.fileService = options.fileService;
  }

  /**
   * Create backup using FileService
   */
  async createBackup() {
    const folders = Object.values(CONFIG.CONTENT_MAPPING).map(
      mapping => mapping.destination || mapping
    );

    const result = await this.fileService.createBackup(
      folders,
      CONFIG.BACKUP_DIR
    );

    if (result) {
      console.log('💾 Created content backup');
    }

    return result;
  }

  /**
   * Restore from backup using FileService
   */
  async restoreBackup() {
    const result = await this.fileService.restoreBackup(CONFIG.BACKUP_DIR, '.');

    if (result) {
      console.log('🔄 Restored content from backup');
    }

    return result;
  }

  /**
   * Clean old content using FileService with progress tracking
   */
  async cleanOldContent() {
    const folders = Object.values(CONFIG.CONTENT_MAPPING).map(
      mapping => mapping.destination || mapping
    );

    console.log('🗑️  Removing old content...');

    let completed = 0;
    const startTime = Date.now();

    for (const folder of folders) {
      if (this.fileService.exists(folder)) {
        await this.fileService.remove(folder, { recursive: true });
      }

      completed++;
      const progress = Math.round((completed / folders.length) * 100);
      const elapsed = Date.now() - startTime;
      const eta =
        folders.length > completed
          ? Math.round(
              ((elapsed / completed) * (folders.length - completed)) / 1000
            )
          : 0;

      console.log(
        `📊 Cleanup: ${progress}% (${completed}/${folders.length}) ETA: ${eta}s`
      );
    }

    console.log(
      `✅ Cleanup completed in ${Math.round((Date.now() - startTime) / 1000)}s`
    );
  }

  /**
   * Check if backup exists
   */
  backupExists() {
    return this.fileService.exists(CONFIG.BACKUP_DIR);
  }

  /**
   * Get backup info (size, date, etc.)
   */
  async getBackupInfo() {
    if (!this.backupExists()) {
      return null;
    }

    try {
      const files = await this.fileService.getFilesRecursively(
        CONFIG.BACKUP_DIR
      );
      return {
        exists: true,
        fileCount: files ? files.length : 0,
        path: CONFIG.BACKUP_DIR,
      };
    } catch (error) {
      console.warn(`⚠️  Could not get backup info: ${error.message}`);
      return null;
    }
  }

  /**
   * Clean up old backups (keep only latest)
   */
  async cleanupOldBackups() {
    // This could be enhanced to keep multiple backups with rotation
    // For now, just log that cleanup would happen here
    console.log('🧹 Backup cleanup would occur here (placeholder)');
  }
}
