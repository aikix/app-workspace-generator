import path from 'path';
import { Command } from 'commander';
import { runInteractivePrompts } from '../prompts/interactive.js';
import { loadConfigFromFile, createDefaultConfig } from '../prompts/config-loader.js';
import { answersToConfig, configToTemplateContext } from '../utils/config-builder.js';
import { generateWebApp } from '../generators/web/index.js';
import { logger } from '../utils/logger.js';
import { displayError, withErrorHandling } from '../utils/errors.js';
import {
  validateGenerationEnvironment,
  validateProjectNameForGeneration,
} from '../utils/validation.js';
import { runFirebaseSetupPrompts, executeFirebaseSetup } from '../prompts/firebase-setup.js';
import { checkPrerequisites } from '../utils/prerequisites.js';
import type { GenerationOptions } from '../types/config.js';

/**
 * Create command - Main command for generating projects
 */
export function createCommand(): Command {
  return new Command('create')
    .argument('[project-name]', 'Name of the project to create')
    .option('-c, --config <path>', 'Path to configuration file (JSON)')
    .option('--skip-install', 'Skip dependency installation')
    .option('-v, --verbose', 'Verbose output')
    .option('--debug', 'Enable debug mode with detailed error information')
    .description('Create a new project')
    .action(async (projectName: string | undefined, options) => {
      try {
        const cwd = process.cwd();
        const debug = options.debug || false;

        // Check prerequisites first
        const prerequisitesMet = await checkPrerequisites();
        if (!prerequisitesMet) {
          logger.error('Please install the required tools before continuing.');
          process.exit(1);
        }

        // Mode 1: Config file (for AI agents)
        if (options.config) {
          await createFromConfig(options.config, cwd, options, debug);
          return;
        }

        // Mode 2: Quick start with project name
        if (projectName && !options.config) {
          await createQuickStart(projectName, cwd, options, debug);
          return;
        }

        // Mode 3: Interactive prompts (for humans)
        await createInteractive(cwd, options, debug);
      } catch (error) {
        displayError(error, options.debug);
        process.exit(1);
      }
    });
}

/**
 * Create project from config file (AI agent mode)
 */
async function createFromConfig(
  configPath: string,
  cwd: string,
  options: { skipInstall?: boolean; verbose?: boolean },
  debug: boolean
): Promise<void> {
  logger.info(`Loading configuration from ${configPath}...`);

  const config = await loadConfigFromFile(configPath);
  const templateContext = configToTemplateContext(config);

  const targetDir = path.join(cwd, config.name);

  // Validate environment before starting
  logger.step('Validating environment...');
  await validateGenerationEnvironment(config.name, targetDir, options.skipInstall);
  logger.success('Environment validation passed');

  const generationOptions: GenerationOptions = {
    targetDir,
    config,
    templateContext,
    skipInstall: options.skipInstall,
    verbose: options.verbose,
  };

  // Generate with error handling and rollback
  await withErrorHandling(async () => await generateWebApp(generationOptions), targetDir, debug);

  // Firebase auto-setup if Firebase backend is selected
  if (config.backend?.type === 'firebase') {
    await runFirebaseAutoSetup(targetDir, config.name);
  }
}

/**
 * Create project with quick start defaults
 */
async function createQuickStart(
  projectName: string,
  cwd: string,
  options: { skipInstall?: boolean; verbose?: boolean },
  debug: boolean
): Promise<void> {
  logger.info(`Creating ${projectName} with default configuration...`);

  // Validate project name
  await validateProjectNameForGeneration(projectName, cwd);

  const config = createDefaultConfig(projectName);
  const templateContext = configToTemplateContext(config);

  const targetDir = path.join(cwd, config.name);

  // Validate environment before starting
  logger.step('Validating environment...');
  await validateGenerationEnvironment(config.name, targetDir, options.skipInstall);
  logger.success('Environment validation passed');

  const generationOptions: GenerationOptions = {
    targetDir,
    config,
    templateContext,
    skipInstall: options.skipInstall,
    verbose: options.verbose,
  };

  // Generate with error handling and rollback
  await withErrorHandling(async () => await generateWebApp(generationOptions), targetDir, debug);

  // Firebase auto-setup if Firebase backend is selected
  if (config.backend?.type === 'firebase') {
    await runFirebaseAutoSetup(targetDir, config.name);
  }
}

/**
 * Create project with interactive prompts (human mode)
 */
async function createInteractive(
  cwd: string,
  options: { skipInstall?: boolean; verbose?: boolean },
  debug: boolean
): Promise<void> {
  const answers = await runInteractivePrompts(cwd);
  const config = answersToConfig(answers);
  const templateContext = configToTemplateContext(config);

  const targetDir = path.join(cwd, config.name);

  // Validate environment before starting
  logger.step('Validating environment...');
  await validateGenerationEnvironment(config.name, targetDir, options.skipInstall);
  logger.success('Environment validation passed');

  const generationOptions: GenerationOptions = {
    targetDir,
    config,
    templateContext,
    skipInstall: options.skipInstall,
    verbose: options.verbose,
  };

  // Generate with error handling and rollback
  await withErrorHandling(async () => await generateWebApp(generationOptions), targetDir, debug);

  // Firebase auto-setup if Firebase backend is selected
  if (config.backend?.type === 'firebase') {
    await runFirebaseAutoSetup(targetDir, config.name);
  }
}

/**
 * Run Firebase auto-setup workflow
 */
async function runFirebaseAutoSetup(targetDir: string, projectName?: string): Promise<void> {
  try {
    logger.newLine();
    logger.newLine();

    const answers = await runFirebaseSetupPrompts(projectName);

    if (!answers) {
      logger.info('Firebase setup skipped');
      return;
    }

    const result = await executeFirebaseSetup(answers, targetDir);

    if (!result.success) {
      logger.error('Firebase setup failed');
      if (result.error) {
        logger.error(result.error.message);
      }
      logger.warning('You can set up Firebase manually later');
    }
  } catch (error) {
    logger.error('Firebase setup encountered an error');
    if (error instanceof Error) {
      logger.error(error.message);
    }
    logger.warning('You can set up Firebase manually later');
  }
}
