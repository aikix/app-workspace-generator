import path from 'path';
import ora from 'ora';
import { writeFile, copyFile, copyDir, ensureDir } from '../../utils/file-system.js';
import { compileTemplateFile, getTemplatePath } from './templates.js';
import type { TemplateContext } from '../../types/config.js';
import { logger } from '../../utils/logger.js';

/**
 * File generation utilities
 */

export interface FileOperation {
  type: 'template' | 'copy' | 'directory';
  source: string; // Relative to templates directory
  destination: string; // Relative to project root
  context?: TemplateContext;
}

/**
 * Generate a single file from template
 */
export async function generateFileFromTemplate(
  templatePath: string,
  destinationPath: string,
  context: TemplateContext
): Promise<void> {
  try {
    const content = await compileTemplateFile(templatePath, context);
    await writeFile(destinationPath, content);
  } catch (error) {
    throw new Error(
      `Failed to generate file from template "${templatePath}": ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Copy a static file
 */
export async function copyStaticFile(sourcePath: string, destinationPath: string): Promise<void> {
  try {
    await copyFile(sourcePath, destinationPath);
  } catch (error) {
    throw new Error(
      `Failed to copy file from "${sourcePath}" to "${destinationPath}": ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Copy a directory
 */
export async function copyStaticDirectory(
  sourcePath: string,
  destinationPath: string
): Promise<void> {
  try {
    await copyDir(sourcePath, destinationPath);
  } catch (error) {
    throw new Error(
      `Failed to copy directory from "${sourcePath}" to "${destinationPath}": ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Create an empty directory
 */
export async function createDirectory(dirPath: string): Promise<void> {
  try {
    await ensureDir(dirPath);
  } catch (error) {
    throw new Error(
      `Failed to create directory "${dirPath}": ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Execute multiple file operations with progress indicator
 */
export async function executeFileOperations(
  operations: FileOperation[],
  targetDir: string,
  section: string
): Promise<void> {
  const spinner = ora(`${section}...`).start();

  try {
    for (const operation of operations) {
      const destPath = path.join(targetDir, operation.destination);

      switch (operation.type) {
        case 'template':
          if (!operation.context) {
            throw new Error('Template operation requires context');
          }
          await generateFileFromTemplate(operation.source, destPath, operation.context);
          break;

        case 'copy':
          const srcPath = getTemplatePath(operation.source);
          await copyStaticFile(srcPath, destPath);
          break;

        case 'directory':
          await createDirectory(destPath);
          break;

        default:
          throw new Error(`Unknown operation type: ${(operation as FileOperation).type}`);
      }
    }

    spinner.succeed(section);
  } catch (error) {
    spinner.fail(`${section} failed`);
    throw error;
  }
}

/**
 * Generate file with spinner feedback
 */
export async function generateFile(
  description: string,
  generator: () => Promise<void>
): Promise<void> {
  const spinner = ora(description).start();
  try {
    await generator();
    spinner.succeed(description);
  } catch (error) {
    spinner.fail(`${description} failed`);
    logger.error(error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}
