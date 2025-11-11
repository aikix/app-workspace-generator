import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * File system utilities
 */

/**
 * Get the root directory of the CLI tool
 */
export function getCliRootDir(): string {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  return path.resolve(__dirname, '../..');
}

/**
 * Get the templates directory
 */
export function getTemplatesDir(): string {
  return path.join(getCliRootDir(), 'templates');
}

/**
 * Check if a directory exists
 */
export async function directoryExists(dirPath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(dirPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Check if a file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(filePath);
    return stats.isFile();
  } catch {
    return false;
  }
}

/**
 * Ensure directory exists, create if it doesn't
 */
export async function ensureDir(dirPath: string): Promise<void> {
  await fs.ensureDir(dirPath);
}

/**
 * Copy file from source to destination
 */
export async function copyFile(src: string, dest: string): Promise<void> {
  await fs.copy(src, dest);
}

/**
 * Copy directory from source to destination
 */
export async function copyDir(src: string, dest: string): Promise<void> {
  await fs.copy(src, dest);
}

/**
 * Write file with content
 */
export async function writeFile(filePath: string, content: string): Promise<void> {
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content, 'utf-8');
}

/**
 * Read file content
 */
export async function readFile(filePath: string): Promise<string> {
  return await fs.readFile(filePath, 'utf-8');
}

/**
 * Get list of files in directory
 */
export async function readDir(dirPath: string): Promise<string[]> {
  return await fs.readdir(dirPath);
}

/**
 * Remove directory recursively
 */
export async function removeDir(dirPath: string): Promise<void> {
  await fs.remove(dirPath);
}
