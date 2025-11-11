import fs from 'fs-extra';
import path from 'path';
import { directoryExists } from './file-system.js';
import { errors, GeneratorError } from './errors.js';
import { validateProjectName as validateNpmName } from '../validators/project-name.js';

/**
 * Pre-generation validation utilities
 */

export interface ValidationResult {
  valid: boolean;
  errors: GeneratorError[];
}

/**
 * Check if there's sufficient disk space
 */
export async function checkDiskSpace(_targetPath: string, _requiredBytes: number): Promise<void> {
  // Note: disk space checking is platform-specific and may not be available
  // For now, we skip this check. Can be implemented using platform-specific tools
  // or third-party libraries like 'check-disk-space' if needed
  // TODO: Implement platform-specific disk space check
}

/**
 * Check if we have write permissions for the target directory
 */
export async function checkWritePermissions(targetPath: string): Promise<void> {
  const parentDir = path.dirname(targetPath);

  try {
    // Check if parent directory is writable
    await fs.access(parentDir, fs.constants.W_OK);
  } catch (_error) {
    throw errors.permissionDenied(parentDir);
  }
}

/**
 * Check if target directory already exists
 */
export async function checkDirectoryDoesNotExist(targetPath: string): Promise<void> {
  const exists = await directoryExists(targetPath);

  if (exists) {
    throw errors.directoryExists(targetPath);
  }
}

/**
 * Validate project name
 */
export async function validateProjectNameForGeneration(name: string, cwd: string): Promise<void> {
  // Validate npm package name format
  const validation = validateNpmName(name);

  if (!validation.valid) {
    const reason = validation.errors[0] || 'Invalid name format';
    throw errors.invalidProjectName(name, reason);
  }

  // Check if directory already exists
  const targetPath = path.join(cwd, name);
  await checkDirectoryDoesNotExist(targetPath);
}

/**
 * Run all pre-generation validations
 */
export async function validateGenerationEnvironment(
  _projectName: string,
  targetDir: string,
  skipInstall = false
): Promise<void> {
  const validationErrors: GeneratorError[] = [];

  try {
    // Check disk space (500MB minimum, 1GB if installing dependencies)
    const requiredSpace = skipInstall ? 500 * 1024 * 1024 : 1024 * 1024 * 1024;
    await checkDiskSpace(targetDir, requiredSpace);
  } catch (error) {
    if (error instanceof GeneratorError) {
      validationErrors.push(error);
    }
  }

  try {
    // Check write permissions
    await checkWritePermissions(targetDir);
  } catch (error) {
    if (error instanceof GeneratorError) {
      validationErrors.push(error);
    }
  }

  try {
    // Check directory doesn't exist
    await checkDirectoryDoesNotExist(targetDir);
  } catch (error) {
    if (error instanceof GeneratorError) {
      validationErrors.push(error);
    }
  }

  // If there are any validation errors, throw the first critical one
  if (validationErrors.length > 0) {
    throw validationErrors[0];
  }
}

/**
 * Validate configuration object
 */
export function validateConfig(config: unknown): void {
  if (!config || typeof config !== 'object') {
    throw errors.invalidConfig('Configuration must be an object');
  }

  const cfg = config as Record<string, unknown>;

  // Check required fields
  if (!cfg.name || typeof cfg.name !== 'string') {
    throw errors.invalidConfig('Missing or invalid "name" field');
  }

  if (!cfg.workspaceType || typeof cfg.workspaceType !== 'string') {
    throw errors.invalidConfig('Missing or invalid "workspaceType" field');
  }

  // Validate workspace type
  const validWorkspaceTypes = ['single', 'pwa', 'multi'];
  if (!validWorkspaceTypes.includes(cfg.workspaceType as string)) {
    throw errors.invalidConfig(
      `Invalid workspaceType: ${cfg.workspaceType}. Must be one of: ${validWorkspaceTypes.join(', ')}`
    );
  }

  // Additional validations as needed...
}
