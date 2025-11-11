import { exec } from 'child_process';
import { promisify } from 'util';
import { logger } from './logger.js';

const execAsync = promisify(exec);

/**
 * Check if Firebase CLI is installed
 */
export async function checkFirebaseCLI(): Promise<boolean> {
  try {
    await execAsync('firebase --version');
    return true;
  } catch (_error) {
    return false;
  }
}

/**
 * Check if user is logged in to Firebase
 */
export async function checkFirebaseLogin(): Promise<boolean> {
  try {
    const { stdout } = await execAsync('firebase login:list');
    return stdout.includes('@');
  } catch (_error) {
    return false;
  }
}

/**
 * Verify Firebase CLI and login status
 */
export async function verifyFirebaseCLI(): Promise<void> {
  logger.step('Verifying Firebase CLI...');

  const isInstalled = await checkFirebaseCLI();
  if (!isInstalled) {
    logger.error('Firebase CLI is not installed');
    logger.info('Install it with: npm install -g firebase-tools');
    throw new Error('Firebase CLI not found');
  }

  logger.success('Firebase CLI found');

  logger.step('Verifying Firebase login...');
  const isLoggedIn = await checkFirebaseLogin();
  if (!isLoggedIn) {
    logger.error('Not logged in to Firebase');
    logger.info('Login with: firebase login');
    throw new Error('Firebase authentication required');
  }

  logger.success('Firebase login verified');
}

/**
 * Firebase project creation options
 */
export interface FirebaseProjectOptions {
  baseName: string;
  environments: string[]; // ['dev', 'prod']
  enableAuth: boolean;
  authProviders?: string[]; // ['email', 'google']
  enableFirestore: boolean;
  enableStorage: boolean;
  enableFunctions: boolean;
  pattern: 'client-side' | 'server-first';
}

/**
 * Create a Firebase project
 */
export async function createFirebaseProject(projectId: string): Promise<void> {
  logger.info(`Creating Firebase project: ${projectId}`);

  try {
    await execAsync(`firebase projects:create ${projectId} --display-name "${projectId}"`);
    logger.success(`Created project: ${projectId}`);
  } catch (error) {
    if (error instanceof Error && error.message.includes('already exists')) {
      logger.warning(`Project ${projectId} already exists, skipping creation`);
    } else {
      throw error;
    }
  }
}

/**
 * Create a web app in a Firebase project
 */
export async function createWebApp(projectId: string, appName: string): Promise<string> {
  logger.info(`Creating web app in ${projectId}...`);

  try {
    const { stdout } = await execAsync(
      `firebase apps:create WEB "${appName}" --project ${projectId}`
    );

    // Extract app ID from output
    const appIdMatch = stdout.match(/App ID: ([^\s]+)/);
    if (!appIdMatch) {
      throw new Error('Failed to extract app ID from Firebase CLI output');
    }

    const appId = appIdMatch[1];
    logger.success(`Created web app: ${appName} (${appId})`);
    return appId;
  } catch (error) {
    if (error instanceof Error && error.message.includes('already exists')) {
      logger.warning(`Web app ${appName} already exists, skipping creation`);
      // Try to get existing app ID
      const { stdout } = await execAsync(`firebase apps:list --project ${projectId}`);
      const appIdMatch = stdout.match(/([^\s]+)\s+\(WEB\)/);
      return appIdMatch ? appIdMatch[1] : '';
    }
    throw error;
  }
}

/**
 * Get Firebase web app config (API keys, etc.)
 */
export async function getWebAppConfig(
  projectId: string,
  appId: string
): Promise<Record<string, string>> {
  logger.info('Fetching web app configuration...');

  try {
    const { stdout } = await execAsync(
      `firebase apps:sdkconfig WEB ${appId} --project ${projectId}`
    );

    // Parse the SDK config JSON output
    const config = JSON.parse(stdout);
    logger.success('Web app config retrieved');
    return config;
  } catch (error) {
    logger.error('Failed to fetch web app config');
    throw error;
  }
}

/**
 * Enable Firebase Authentication
 */
export async function enableAuthentication(
  projectId: string,
  _providers: string[] = ['email']
): Promise<void> {
  logger.info(`Enabling Authentication in ${projectId}...`);

  // Note: Firebase CLI doesn't have direct commands to enable auth providers
  // This would need to use Firebase Admin SDK or REST API
  // For now, we'll just log that manual setup is needed

  logger.warning('Authentication provider setup requires manual configuration');
  logger.info('Enable auth providers in Firebase Console:');
  logger.info(`https://console.firebase.google.com/project/${projectId}/authentication/providers`);
}

/**
 * Enable Firestore Database
 */
export async function enableFirestore(projectId: string): Promise<void> {
  logger.info(`Enabling Firestore in ${projectId}...`);

  // Create Firestore database (this may require REST API as CLI support is limited)
  logger.warning('Firestore creation requires manual setup');
  logger.info('Enable Firestore in Firebase Console:');
  logger.info(`https://console.firebase.google.com/project/${projectId}/firestore`);
}

/**
 * Deploy Firestore rules and indexes
 */
export async function deployFirestoreRules(projectId: string, projectDir: string): Promise<void> {
  logger.info('Deploying Firestore rules and indexes...');

  try {
    await execAsync(`firebase deploy --only firestore --project ${projectId}`, {
      cwd: projectDir,
    });
    logger.success('Firestore rules deployed');
  } catch (error) {
    logger.error('Failed to deploy Firestore rules');
    throw error;
  }
}

/**
 * Generate service account key for server-first pattern
 */
export async function generateServiceAccountKey(
  projectId: string,
  outputPath: string
): Promise<void> {
  logger.info('Generating service account key...');

  // Note: Service account key generation requires gcloud CLI or Firebase Admin REST API
  logger.warning('Service account key generation requires manual setup');
  logger.info('Generate service account key in Firebase Console:');
  logger.info(
    `https://console.firebase.google.com/project/${projectId}/settings/serviceaccounts/adminsdk`
  );
  logger.info(`Download the key and save it to: ${outputPath}`);
}

/**
 * Main automation function to set up Firebase projects
 */
export async function setupFirebaseProjects(
  options: FirebaseProjectOptions,
  projectDir: string
): Promise<void> {
  logger.header('🔥 Firebase Auto-Setup');

  // Verify Firebase CLI
  await verifyFirebaseCLI();

  // Create projects for each environment
  for (const env of options.environments) {
    const projectId = `${options.baseName}-${env}`;

    logger.section(`Setting up ${env} environment (${projectId})`);

    // Create Firebase project
    await createFirebaseProject(projectId);

    // Create web app
    const appName = `${options.baseName}-${env}-web`;
    const appId = await createWebApp(projectId, appName);

    // Get web app config (for future use in .env writing)
    await getWebAppConfig(projectId, appId);

    // Enable services
    if (options.enableAuth) {
      await enableAuthentication(projectId, options.authProviders);
    }

    if (options.enableFirestore) {
      await enableFirestore(projectId);
    }

    // Deploy Firestore rules if enabled
    if (options.enableFirestore) {
      try {
        await deployFirestoreRules(projectId, projectDir);
      } catch (_error) {
        logger.warning('Firestore rules deployment skipped (deploy manually later)');
      }
    }

    // Generate service account for server-first pattern
    if (options.pattern === 'server-first') {
      await generateServiceAccountKey(projectId, `${projectDir}/service-account-${env}.json`);
    }

    logger.success(`${env} environment setup complete`);
    logger.newLine();
  }

  logger.celebrate('Firebase setup complete! 🎉');
}
