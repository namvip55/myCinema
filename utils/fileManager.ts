import { File, Directory, Paths } from 'expo-file-system/next';
import { Platform } from 'react-native';

const VIDEO_DIR_NAME = 'videos';

/**
 * Get the videos directory in app sandbox.
 */
function getVideoDir(): Directory {
  return new Directory(Paths.document, VIDEO_DIR_NAME);
}

/**
 * Ensure the videos directory exists in app sandbox.
 */
export async function ensureVideoDir(): Promise<Directory> {
  if (Platform.OS === 'web') return new Directory('', ''); // Dummy for web
  
  const dir = getVideoDir();
  if (!dir.exists) {
    await dir.create();
  }
  return dir;
}

/**
 * Copy a video from device storage to app sandbox.
 * Returns the new local URI.
 */
export async function copyVideoToAppStorage(
  sourceUri: string,
  fileName: string
): Promise<string | null> {
  // Nếu là web hoặc URI đã nằm trong sandbox thì không cần copy
  if (Platform.OS === 'web' || sourceUri.includes(VIDEO_DIR_NAME)) {
    return sourceUri;
  }

  const dir = await ensureVideoDir();
  // Sanitize filename
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const destName = `${Date.now()}_${safeName}`;

  const sourceFile = new File(sourceUri);
  const destFile = new File(dir, destName);

  try {
    // Android ImagePicker often returns content:// URIs
    // expo-file-system/next File class handles local URIs
    if (sourceUri.startsWith('file://') || sourceUri.startsWith('content://')) {
      await sourceFile.copy(destFile);
      return destFile.uri;
    }
  } catch (e) {
    console.error('Copy critical error:', e);
    return null;
  }

  // Nếu không copy được nhưng cũng không có lỗi (ví dụ không phải file://), trả về null để báo hiệu lỗi logic
  return null;
}

/**
 * Delete a video file from app sandbox.
 */
export async function deleteVideoFromStorage(uri: string): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    const file = new File(uri);
    if (file.exists) {
      await file.delete();
    }
  } catch (e) {
    console.error('Delete error:', e);
  }
}

/**
 * Get file size in bytes.
 */
export async function getFileSize(uri: string): Promise<number> {
  if (Platform.OS === 'web') return 0;
  try {
    const file = new File(uri);
    return file.size ?? 0;
  } catch {
    return 0;
  }
}

/**
 * Calculate total storage used by all videos in app sandbox.
 */
export async function getTotalStorageUsed(): Promise<number> {
  if (Platform.OS === 'web') return 0;
  const dir = await ensureVideoDir();
  let total = 0;

  // List all files in the directory
  const entries = dir.list();
  for (const name of entries) {
    try {
      const file = new File(dir, name);
      if (file.exists) {
        total += file.size ?? 0;
      }
    } catch {
      // Skip unreadable files
    }
  }

  return total;
}

/**
 * Format bytes to human readable string.
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

/**
 * Format seconds to HH:MM:SS or MM:SS.
 */
export function formatDuration(totalSeconds: number): string {
  const seconds = Math.floor(totalSeconds);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}
