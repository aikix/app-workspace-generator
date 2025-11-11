import path from 'path';
import { Command } from 'commander';
import { runInteractivePrompts } from '../prompts/interactive.js';
import { loadConfigFromFile, createDefaultConfig } from '../prompts/config-loader.js';
import { answersToConfig, configToTemplateContext } from '../utils/config-builder.js';
import { generateWebApp } from '../generators/web/index.js';
import { logger } from '../utils/logger.js';
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
    .description('Create a new project')
    .action(async (projectName: string | undefined, options) => {
      try {
        const cwd = process.cwd();

        // Mode 1: Config file (for AI agents)
        if (options.config) {
          await createFromConfig(options.config, cwd, options);
          return;
        }

        // Mode 2: Quick start with project name
        if (projectName && !options.config) {
          await createQuickStart(projectName, cwd, options);
          return;
        }

        // Mode 3: Interactive prompts (for humans)
        await createInteractive(cwd, options);
      } catch (error) {
        if (error instanceof Error) {
          logger.error(error.message);
        } else {
          logger.error('An unexpected error occurred');
        }
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
  options: { skipInstall?: boolean; verbose?: boolean }
): Promise<void> {
  logger.info(`Loading configuration from ${configPath}...`);

  const config = await loadConfigFromFile(configPath);
  const templateContext = configToTemplateContext(config);

  const targetDir = path.join(cwd, config.name);

  const generationOptions: GenerationOptions = {
    targetDir,
    config,
    templateContext,
    skipInstall: options.skipInstall,
    verbose: options.verbose,
  };

  await generateWebApp(generationOptions);
}

/**
 * Create project with quick start defaults
 */
async function createQuickStart(
  projectName: string,
  cwd: string,
  options: { skipInstall?: boolean; verbose?: boolean }
): Promise<void> {
  logger.info(`Creating ${projectName} with default configuration...`);

  const config = createDefaultConfig(projectName);
  const templateContext = configToTemplateContext(config);

  const targetDir = path.join(cwd, config.name);

  const generationOptions: GenerationOptions = {
    targetDir,
    config,
    templateContext,
    skipInstall: options.skipInstall,
    verbose: options.verbose,
  };

  await generateWebApp(generationOptions);
}

/**
 * Create project with interactive prompts (human mode)
 */
async function createInteractive(
  cwd: string,
  options: { skipInstall?: boolean; verbose?: boolean }
): Promise<void> {
  const answers = await runInteractivePrompts(cwd);
  const config = answersToConfig(answers);
  const templateContext = configToTemplateContext(config);

  const targetDir = path.join(cwd, config.name);

  const generationOptions: GenerationOptions = {
    targetDir,
    config,
    templateContext,
    skipInstall: options.skipInstall,
    verbose: options.verbose,
  };

  await generateWebApp(generationOptions);
}
