import { input, confirm, checkbox } from '@inquirer/prompts';
import path from 'path';
import { readFile, writeFile } from 'fs/promises';
import { logger } from '../utils/logger.js';
import {
  verifyFirebaseCLI,
  validateProjectId,
  createFirebaseProject,
  createWebApp,
  getWebAppConfig,
  writeEnvFile,
  type FirebaseWebAppConfig,
} from '../utils/firebase-automation.js';

export interface FirebaseSetupAnswers {
  baseName: string;
  environments: string[];
  enableAuth: boolean;
  authProviders?: string[];
  enableFirestore: boolean;
  enableStorage: boolean;
}

export interface FirebaseSetupResult {
  success: boolean;
  projectIds: string[];
  configs: Record<string, FirebaseWebAppConfig>;
  error?: Error;
}

/**
 * Update apphosting.yaml files with actual Firebase configurations
 */
async function updateApphostingYamlFiles(
  targetDir: string,
  configs: Record<string, FirebaseWebAppConfig>,
  environments: string[]
): Promise<void> {
  for (const env of environments) {
    const config = configs[env];
    if (!config) {
      logger.warning(`Configuration not found for environment: ${env}, skipping`);
      continue;
    }

    const filename = `apphosting.${env}.yaml`;
    const filepath = path.join(targetDir, filename);

    try {
      let content = await readFile(filepath, 'utf-8');

      // Replace placeholder values with actual Firebase config
      content = content
        .replace(`__${env.toUpperCase()}_API_KEY__`, config.apiKey)
        .replace(`__${env.toUpperCase()}_AUTH_DOMAIN__`, config.authDomain)
        .replace(`__${env.toUpperCase()}_PROJECT_ID__`, config.projectId)
        .replace(`__${env.toUpperCase()}_STORAGE_BUCKET__`, config.storageBucket)
        .replace(`__${env.toUpperCase()}_MESSAGING_SENDER_ID__`, config.messagingSenderId)
        .replace(`__${env.toUpperCase()}_APP_ID__`, config.appId);

      await writeFile(filepath, content, 'utf-8');
    } catch (error) {
      logger.warning(
        `Failed to update ${filename}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

/**
 * Run Firebase auto-setup prompts
 */
export async function runFirebaseSetupPrompts(
  projectName?: string
): Promise<FirebaseSetupAnswers | null> {
  logger.header('🔥 Firebase Auto-Setup');
  logger.newLine();

  try {
    // Verify Firebase CLI is installed and user is logged in
    logger.step('Verifying Firebase CLI...');
    await verifyFirebaseCLI();
    logger.success('Firebase CLI verified');
    logger.newLine();

    // Get project base name (default to project name if provided)
    const defaultBaseName = projectName || 'my-app';
    const baseName = await input({
      message: 'Firebase project base name?',
      default: defaultBaseName,
      validate: (value: string) => {
        if (!value || value.trim().length === 0) {
          return 'Project base name is required';
        }
        // Basic validation (will be validated with environment suffix)
        if (!/^[a-z][a-z0-9-]*$/.test(value)) {
          return 'Base name must start with lowercase letter and contain only lowercase letters, numbers, and hyphens';
        }
        return true;
      },
    });

    // Select environments
    const environments = await checkbox({
      message: 'Select environments to create:',
      choices: [
        { name: `Development (${baseName}-dev)`, value: 'dev', checked: true },
        { name: `Staging (${baseName}-staging)`, value: 'staging', checked: false },
        { name: `Production (${baseName}-prod)`, value: 'prod', checked: true },
      ],
    });

    if (environments.length === 0) {
      logger.warning('No environments selected. Skipping Firebase setup.');
      return null;
    }

    // Validate all project IDs before continuing
    const projectIds = environments.map((env) => `${baseName}-${env}`);
    const invalidIds = projectIds.filter((id) => !validateProjectId(id));

    if (invalidIds.length > 0) {
      logger.error(`Invalid project IDs: ${invalidIds.join(', ')}`);
      logger.info(
        'Project IDs must be 6-30 characters, start with lowercase letter, and contain only lowercase letters, numbers, and hyphens'
      );
      return null;
    }

    // Authentication
    const enableAuth = await confirm({
      message: 'Enable Firebase Authentication?',
      default: true,
    });

    let authProviders: string[] | undefined;
    if (enableAuth) {
      authProviders = await checkbox({
        message: 'Select auth providers:',
        choices: [
          { name: 'Email/Password', value: 'email', checked: true },
          { name: 'Google', value: 'google', checked: false },
          { name: 'Anonymous', value: 'anonymous', checked: false },
        ],
      });
    }

    // Firestore
    const enableFirestore = await confirm({
      message: 'Enable Cloud Firestore?',
      default: true,
    });

    // Storage
    const enableStorage = await confirm({
      message: 'Enable Cloud Storage?',
      default: true,
    });

    return {
      baseName,
      environments,
      enableAuth,
      authProviders,
      enableFirestore,
      enableStorage,
    };
  } catch (error) {
    logger.error('Firebase setup prompts failed');
    throw error;
  }
}

/**
 * Execute Firebase auto-setup
 */
export async function executeFirebaseSetup(
  answers: FirebaseSetupAnswers,
  targetDir: string
): Promise<FirebaseSetupResult> {
  logger.newLine();
  logger.header('🔧 Setting up Firebase projects...');
  logger.newLine();

  const projectIds: string[] = [];
  const configs: Record<string, FirebaseWebAppConfig> = {};

  try {
    // Step 1: Create Firebase projects
    logger.section('Creating Firebase projects');

    for (const env of answers.environments) {
      const projectId = `${answers.baseName}-${env}`;
      projectIds.push(projectId);

      await createFirebaseProject(projectId);
    }

    logger.newLine();

    // Step 2: Create web apps and get configs
    logger.section('Creating web apps and retrieving configurations');

    for (const env of answers.environments) {
      const projectId = `${answers.baseName}-${env}`;
      const appName = `${answers.baseName} (${env})`;

      const appId = await createWebApp(projectId, appName);
      const config = await getWebAppConfig(projectId, appId);
      configs[env] = config;
    }

    logger.newLine();

    // Step 3: Write configuration files
    logger.section('Writing configuration files');

    // Find dev environment (or first environment)
    const devEnv = answers.environments.find((env) => env === 'dev') || answers.environments[0];
    if (!devEnv) {
      throw new Error('No environment selected');
    }

    const devConfig = configs[devEnv];
    if (!devConfig) {
      throw new Error(`Configuration not found for environment: ${devEnv}`);
    }

    // Write .env.local with dev config (for local development only)
    await writeEnvFile(targetDir, '.env.local', devConfig, 'client-side');
    logger.success(`✓ Created .env.local with ${devEnv} configuration (for local development)`);

    // Update apphosting.yaml files with actual Firebase configs
    await updateApphostingYamlFiles(targetDir, configs, answers.environments);
    logger.success('✓ Updated apphosting.*.yaml files with Firebase configurations');

    logger.newLine();
    logger.celebrate('Firebase setup complete!');
    logger.newLine();

    // Summary
    logger.summaryBox([
      '✨ Firebase Projects Created:',
      '',
      ...projectIds.map((id) => `  ✓ ${id}`),
      '',
      '📝 Configuration Files:',
      '  • .env.local (for local development)',
      ...answers.environments.map((env) => `  • apphosting.${env}.yaml (for ${env} deployment)`),
      '',
      '🔗 Next steps:',
      '  1. Review .env.local for local development',
      '  2. Set environment name in Firebase Console App Hosting settings',
      '  3. Configure Firebase services in console',
      '  4. Review apphosting.yaml files for deployment config',
      '',
      '📖 Learn more: https://firebase.google.com/docs/app-hosting/multiple-environments',
    ]);

    logger.newLine();

    return {
      success: true,
      projectIds,
      configs,
    };
  } catch (error) {
    logger.error('Firebase setup failed');

    return {
      success: false,
      projectIds,
      configs,
      error: error as Error,
    };
  }
}
