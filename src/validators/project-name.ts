import validateNpmPackageName from 'validate-npm-package-name';
import { directoryExists } from '../utils/file-system.js';
import path from 'path';

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate project name
 */
export function validateProjectName(name: string): ValidationResult {
  const errors: string[] = [];

  // Check if empty
  if (!name || name.trim().length === 0) {
    errors.push('Project name cannot be empty');
    return { valid: false, errors };
  }

  // Check npm package name validity
  const npmValidation = validateNpmPackageName(name);
  if (!npmValidation.validForNewPackages) {
    if (npmValidation.errors) {
      errors.push(...npmValidation.errors);
    }
    if (npmValidation.warnings) {
      errors.push(...npmValidation.warnings);
    }
  }

  // Additional checks
  if (name !== name.toLowerCase()) {
    errors.push('Project name must be lowercase');
  }

  if (name.includes(' ')) {
    errors.push('Project name cannot contain spaces');
  }

  if (name.startsWith('.') || name.startsWith('_')) {
    errors.push('Project name cannot start with . or _');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check if project directory already exists
 */
export async function checkDirectoryExists(projectName: string, cwd: string): Promise<boolean> {
  const targetDir = path.join(cwd, projectName);
  return await directoryExists(targetDir);
}
