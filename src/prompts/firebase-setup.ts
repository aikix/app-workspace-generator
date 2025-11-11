import { input, confirm, checkbox } from '@inquirer/prompts';
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
 * Run Firebase auto-setup prompts
 */
export async function runFirebaseSetupPrompts(): Promise<FirebaseSetupAnswers | null> {
  logger.header('🔥 Firebase Auto-Setup');
  logger.newLine();

  try {
    // Verify Firebase CLI is installed and user is logged in
    logger.step('Verifying Firebase CLI...');
    await verifyFirebaseCLI();
    logger.success('Firebase CLI verified');
    logger.newLine();

    // Get project base name
    const baseName = await input({
      message: 'Firebase project base name?',
      default: 'my-app',
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

      logger.info(`Creating project: ${projectId}...`);
      await createFirebaseProject(projectId);
      logger.success(`✓ ${projectId} created`);
    }

    logger.newLine();

    // Step 2: Create web apps and get configs
    logger.section('Creating web apps and retrieving configurations');

    for (const env of answers.environments) {
      const projectId = `${answers.baseName}-${env}`;
      const appName = `${answers.baseName} (${env})`;

      logger.info(`Creating web app in ${projectId}...`);
      const appId = await createWebApp(projectId, appName);
      logger.success(`✓ Web app created: ${appId}`);

      logger.info(`Retrieving configuration for ${projectId}...`);
      const config = await getWebAppConfig(projectId, appId);
      configs[env] = config;
      logger.success(`✓ Configuration retrieved`);
    }

    logger.newLine();

    // Step 3: Write .env files
    logger.section('Writing environment files');

    // Write .env.local with dev config (or first environment)
    const primaryEnv = answers.environments[0];
    if (!primaryEnv) {
      throw new Error('No environment selected');
    }

    const primaryConfig = configs[primaryEnv];
    if (!primaryConfig) {
      throw new Error(`Configuration not found for environment: ${primaryEnv}`);
    }

    await writeEnvFile(targetDir, '.env.local', primaryConfig, 'client-side');
    logger.success(`✓ Created .env.local with ${primaryEnv} configuration`);

    // Write .env.example
    const exampleConfig: FirebaseWebAppConfig = {
      apiKey: 'your-api-key',
      authDomain: 'your-project.firebaseapp.com',
      projectId: 'your-project-id',
      storageBucket: 'your-project.appspot.com',
      messagingSenderId: 'your-sender-id',
      appId: 'your-app-id',
    };

    await writeEnvFile(targetDir, '.env.example', exampleConfig, 'client-side');
    logger.success('✓ Created .env.example');

    // Write environment-specific files if multiple environments
    if (answers.environments.length > 1) {
      for (const env of answers.environments) {
        const envConfig = configs[env];
        if (!envConfig) {
          logger.warning(`Configuration not found for environment: ${env}, skipping`);
          continue;
        }
        await writeEnvFile(targetDir, `.env.${env}`, envConfig, 'client-side');
        logger.success(`✓ Created .env.${env}`);
      }
    }

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
      '  • .env.local (primary config)',
      '  • .env.example (template)',
      ...(answers.environments.length > 1
        ? answers.environments.map((env) => `  • .env.${env}`)
        : []),
      '',
      '🔗 Next steps:',
      '  1. Review .env.local configuration',
      '  2. Set up Firebase services in console',
      '  3. Configure Firestore rules',
      '  4. Set up Authentication providers',
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
