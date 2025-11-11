import fs from 'fs-extra';
import path from 'path';
import type { WorkspaceConfig } from '../types/config.js';
import { validateConfig } from '../validators/config-schema.js';
import { logger } from '../utils/logger.js';

/**
 * Load and validate configuration from a JSON file
 */
export async function loadConfigFromFile(configPath: string): Promise<WorkspaceConfig> {
  // Resolve absolute path
  const absolutePath = path.resolve(process.cwd(), configPath);

  // Check if file exists
  const exists = await fs.pathExists(absolutePath);
  if (!exists) {
    throw new Error(`Config file not found: ${absolutePath}`);
  }

  // Read and parse JSON
  let config: unknown;
  try {
    const content = await fs.readFile(absolutePath, 'utf-8');
    config = JSON.parse(content);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to parse config file: ${error.message}`);
    }
    throw new Error('Failed to parse config file');
  }

  // Validate config
  const validation = validateConfig(config);
  if (!validation.valid) {
    logger.error('Config validation failed:');
    validation.errors.forEach((error) => {
      logger.error(`  - ${error}`);
    });
    throw new Error('Invalid configuration');
  }

  return config as WorkspaceConfig;
}

/**
 * Create a default config object from minimal input
 * Useful for quick starts with defaults
 */
export function createDefaultConfig(projectName: string): WorkspaceConfig {
  return {
    name: projectName,
    workspace: {
      type: 'single',
      platforms: ['web'],
    },
    web: {
      framework: 'next',
      typescript: true,
      styling: 'tailwind',
      ui: 'none',
      testing: 'playwright',
      linting: true,
      formatting: true,
      gitHooks: true,
    },
    documentation: {
      aiInstructions: true,
      architecture: true,
      apiDocs: false,
      styleguide: false,
    },
    packageManager: 'npm',
  };
}
