import { logger } from './logger.js';
import { removeDir } from './file-system.js';
import chalk from 'chalk';

/**
 * Error codes for programmatic handling
 */
export enum ErrorCode {
  // File system errors
  INSUFFICIENT_DISK_SPACE = 'INSUFFICIENT_DISK_SPACE',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  DIRECTORY_EXISTS = 'DIRECTORY_EXISTS',
  DIRECTORY_NOT_FOUND = 'DIRECTORY_NOT_FOUND',
  FILE_OPERATION_FAILED = 'FILE_OPERATION_FAILED',

  // Configuration errors
  INVALID_CONFIG = 'INVALID_CONFIG',
  INVALID_PROJECT_NAME = 'INVALID_PROJECT_NAME',
  CONFIG_FILE_NOT_FOUND = 'CONFIG_FILE_NOT_FOUND',

  // Template errors
  TEMPLATE_NOT_FOUND = 'TEMPLATE_NOT_FOUND',
  TEMPLATE_COMPILATION_FAILED = 'TEMPLATE_COMPILATION_FAILED',

  // Generation errors
  GENERATION_FAILED = 'GENERATION_FAILED',
  DEPENDENCY_INSTALLATION_FAILED = 'DEPENDENCY_INSTALLATION_FAILED',

  // Unknown
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Custom error class with error code and recovery suggestions
 */
export class GeneratorError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public suggestions: string[] = [],
    public cause?: Error
  ) {
    super(message);
    this.name = 'GeneratorError';
    Object.setPrototypeOf(this, GeneratorError.prototype);
  }
}

/**
 * Format and display error with helpful information
 */
export function displayError(error: unknown, debug = false): void {
  logger.newLine();

  if (error instanceof GeneratorError) {
    // Custom error with code and suggestions
    logger.error(`Error: ${error.message}`);
    logger.newLine();

    if (error.suggestions.length > 0) {
      console.log(chalk.cyan('💡 Suggestions:'));
      error.suggestions.forEach((suggestion) => {
        console.log(chalk.gray(`  • ${suggestion}`));
      });
      logger.newLine();
    }

    if (debug && error.cause) {
      console.log(chalk.dim('Debug information:'));
      console.log(chalk.dim(error.cause.stack || error.cause.message));
      logger.newLine();
    }

    console.log(chalk.gray(`Error code: ${error.code}`));
  } else if (error instanceof Error) {
    // Standard error
    logger.error(`Error: ${error.message}`);

    if (debug) {
      logger.newLine();
      console.log(chalk.dim('Debug information:'));
      console.log(chalk.dim(error.stack));
    }
  } else {
    // Unknown error type
    logger.error('An unexpected error occurred');
    if (debug) {
      console.log(chalk.dim(String(error)));
    }
  }

  logger.newLine();
}

/**
 * Error factory functions for common error scenarios
 */
export const errors = {
  insufficientDiskSpace: (required: number, available: number) =>
    new GeneratorError(
      ErrorCode.INSUFFICIENT_DISK_SPACE,
      `Insufficient disk space to create project.`,
      [
        `You need at least ${formatBytes(required)} of free space`,
        `Currently available: ${formatBytes(available)}`,
        'Free up disk space and try again',
        'Choose a different location with more space',
        'Use --skip-install to skip dependency installation',
      ]
    ),

  permissionDenied: (path: string) =>
    new GeneratorError(ErrorCode.PERMISSION_DENIED, `Permission denied when accessing: ${path}`, [
      'Check that you have write permissions for the target directory',
      'Try running the command with appropriate permissions',
      'Choose a different directory where you have write access',
    ]),

  directoryExists: (path: string) =>
    new GeneratorError(ErrorCode.DIRECTORY_EXISTS, `Directory "${path}" already exists`, [
      'Choose a different project name',
      `Remove the existing directory: rm -rf ${path}`,
      'Use a different location',
    ]),

  invalidProjectName: (name: string, reason: string) =>
    new GeneratorError(ErrorCode.INVALID_PROJECT_NAME, `Invalid project name: "${name}"`, [
      reason,
      'Choose a valid npm package name',
      'Use lowercase letters, numbers, and hyphens',
    ]),

  invalidConfig: (reason: string, cause?: Error) =>
    new GeneratorError(
      ErrorCode.INVALID_CONFIG,
      `Invalid configuration: ${reason}`,
      [
        'Check your configuration file for errors',
        'Refer to the documentation for valid configuration options',
        'Try using the interactive mode instead',
      ],
      cause
    ),

  configFileNotFound: (path: string) =>
    new GeneratorError(ErrorCode.CONFIG_FILE_NOT_FOUND, `Configuration file not found: ${path}`, [
      'Check that the file path is correct',
      'Use an absolute path or a path relative to the current directory',
      'Try using the interactive mode instead',
    ]),

  templateNotFound: (templateName: string) =>
    new GeneratorError(ErrorCode.TEMPLATE_NOT_FOUND, `Template not found: ${templateName}`, [
      'Check that the template name is correct',
      'Ensure the CLI tool is properly installed',
      'Try reinstalling the package',
    ]),

  templateCompilationFailed: (templatePath: string, cause: Error) =>
    new GeneratorError(
      ErrorCode.TEMPLATE_COMPILATION_FAILED,
      `Failed to compile template: ${templatePath}`,
      [
        'This is likely an issue with the template itself',
        'Please report this issue to the maintainers',
      ],
      cause
    ),

  generationFailed: (reason: string, cause?: Error) =>
    new GeneratorError(
      ErrorCode.GENERATION_FAILED,
      `Project generation failed: ${reason}`,
      [
        'Check the error details above',
        'Ensure you have proper permissions',
        'Try again or use --debug for more information',
      ],
      cause
    ),

  dependencyInstallationFailed: (cause?: Error) =>
    new GeneratorError(
      ErrorCode.DEPENDENCY_INSTALLATION_FAILED,
      'Failed to install dependencies',
      [
        'Check your internet connection',
        'Ensure npm/yarn is properly installed',
        'Try running the installation manually after generation',
        'Use --skip-install to skip automatic installation',
      ],
      cause
    ),
};

/**
 * Rollback mechanism - cleanup failed generation
 */
export async function rollbackGeneration(targetDir: string): Promise<void> {
  try {
    logger.warning('Error occurred during generation');
    logger.step('Rolling back changes...');

    await removeDir(targetDir);

    logger.success(`Cleaned up partial project at ${targetDir}`);
  } catch (rollbackError) {
    logger.error(
      `Failed to rollback: ${rollbackError instanceof Error ? rollbackError.message : 'Unknown error'}`
    );
    logger.tip(`You may need to manually remove: ${targetDir}`);
  }
}

/**
 * Wrap async operation with error handling and rollback
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  targetDir: string,
  debug = false
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    displayError(error, debug);

    // Attempt rollback
    await rollbackGeneration(targetDir);

    // Re-throw to be caught by the command handler
    throw error;
  }
}

/**
 * Format bytes to human-readable format
 */
function formatBytes(bytes: number): string {
  const units = ['bytes', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Log error to file for debugging
 */
export async function logErrorToFile(
  _error: unknown,
  _context: Record<string, unknown> = {}
): Promise<void> {
  // TODO: Implement error logging to file
  // This would write to a log file in the user's home directory or temp directory
  // Format: timestamp, error details, context
}
