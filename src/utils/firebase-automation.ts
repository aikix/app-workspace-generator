import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs-extra';
import path from 'path';
import { logger } from './logger.js';

const execAsync = promisify(exec);

/**
 * Check if Firebase CLI is installed
 *
 * Verifies Firebase CLI installation by running `firebase --version`.
 * Returns true if the command succeeds, false otherwise.
 *
 * @returns Promise<boolean> - true if Firebase CLI is installed, false otherwise
 *
 * @example
 * ```typescript
 * const isInstalled = await checkFirebaseCLI();
 * if (!isInstalled) {
 *   console.log('Please install Firebase CLI: npm install -g firebase-tools');
 * }
 * ```
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
 *
 * Verifies Firebase authentication by running `firebase login:list`.
 * Checks if the output contains an email address (@ symbol).
 *
 * @returns Promise<boolean> - true if user is logged in, false otherwise
 *
 * @example
 * ```typescript
 * const isLoggedIn = await checkFirebaseLogin();
 * if (!isLoggedIn) {
 *   console.log('Please login: firebase login');
 * }
 * ```
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
 *
 * Combined verification function that checks both Firebase CLI installation
 * and user authentication. Throws descriptive errors with instructions if
 * either check fails.
 *
 * @throws Error if Firebase CLI is not installed
 * @throws Error if user is not logged in to Firebase
 *
 * @example
 * ```typescript
 * try {
 *   await verifyFirebaseCLI();
 *   console.log('Firebase CLI ready!');
 * } catch (error) {
 *   console.error(error.message);
 *   process.exit(1);
 * }
 * ```
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
 * Validate Firebase project ID format
 *
 * Firebase project IDs must:
 * - Be 6-30 characters long
 * - Start with a lowercase letter
 * - Contain only lowercase letters, numbers, and hyphens
 * - Not end with a hyphen
 *
 * @param projectId - The project ID to validate
 * @returns boolean - true if valid, false otherwise
 *
 * @example
 * ```typescript
 * validateProjectId('my-app-dev'); // true
 * validateProjectId('My-App'); // false (uppercase)
 * validateProjectId('my-app-'); // false (ends with hyphen)
 * ```
 */
export function validateProjectId(projectId: string): boolean {
  // Must be 6-30 characters
  if (projectId.length < 6 || projectId.length > 30) {
    return false;
  }

  // Must start with lowercase letter
  if (!/^[a-z]/.test(projectId)) {
    return false;
  }

  // Can only contain lowercase letters, numbers, and hyphens
  if (!/^[a-z][a-z0-9-]*$/.test(projectId)) {
    return false;
  }

  // Cannot end with hyphen
  if (projectId.endsWith('-')) {
    return false;
  }

  return true;
}

/**
 * Create a Firebase project
 *
 * Creates a new Firebase project with the specified project ID.
 * Handles existing projects gracefully and validates project ID format.
 *
 * @param projectId - The Firebase project ID (must follow Firebase naming rules)
 * @throws Error if project ID is invalid
 * @throws Error if Firebase CLI fails (except for "already exists")
 *
 * @example
 * ```typescript
 * await createFirebaseProject('my-app-dev');
 * // Creates project with ID: my-app-dev
 * ```
 */
export async function createFirebaseProject(projectId: string): Promise<void> {
  logger.info(`Creating Firebase project: ${projectId}`);

  // Validate project ID format
  if (!validateProjectId(projectId)) {
    throw new Error(
      `Invalid project ID: ${projectId}. Must be 6-30 characters, start with lowercase letter, contain only lowercase letters/numbers/hyphens, and not end with hyphen.`
    );
  }

  try {
    await execAsync(`firebase projects:create ${projectId} --display-name "${projectId}"`);
    logger.success(`Created project: ${projectId}`);
  } catch (error) {
    if (error instanceof Error && error.message.includes('already exists')) {
      logger.warning(`Project ${projectId} already exists, skipping creation`);
    } else {
      logger.error(`Failed to create project: ${projectId}`);
      throw error;
    }
  }
}

/**
 * Firebase web app configuration structure
 */
export interface FirebaseWebAppConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string; // Optional - for Google Analytics
}

/**
 * Create a web app in a Firebase project
 *
 * Creates a new web application in the specified Firebase project and returns
 * the app ID. If an app with the same name already exists, it attempts to
 * retrieve the existing app ID instead of failing.
 *
 * @param projectId - The Firebase project ID where the web app will be created
 * @param appName - The display name for the web app
 * @returns Promise<string> - The Firebase web app ID (format: 1:123456789:web:abc123def456)
 * @throws Error if project ID is invalid
 * @throws Error if app name is empty
 * @throws Error if Firebase CLI command fails (except for "already exists")
 * @throws Error if app ID cannot be extracted from CLI output
 *
 * @example
 * ```typescript
 * const appId = await createWebApp('my-project-dev', 'My Web App');
 * console.log('Created app:', appId);
 * // Output: Created app: 1:123456789:web:abc123def456
 * ```
 *
 * @example Handling existing apps
 * ```typescript
 * // If app already exists, returns existing app ID
 * const appId1 = await createWebApp('my-project', 'My App');
 * const appId2 = await createWebApp('my-project', 'My App'); // Same as appId1
 * ```
 */
export async function createWebApp(projectId: string, appName: string): Promise<string> {
  // Validate inputs
  if (!validateProjectId(projectId)) {
    throw new Error(`Invalid project ID: ${projectId}`);
  }

  if (!appName || appName.trim().length === 0) {
    throw new Error('App name cannot be empty');
  }

  logger.info(`Creating web app in ${projectId}...`);

  try {
    const { stdout } = await execAsync(
      `firebase apps:create WEB "${appName}" --project ${projectId}`
    );

    // Extract app ID from output
    const appIdMatch = stdout.match(/App ID: ([^\s]+)/);
    if (!appIdMatch || !appIdMatch[1]) {
      throw new Error('Failed to extract app ID from Firebase CLI output');
    }

    const appId = appIdMatch[1]!;
    logger.success(`Created web app: ${appName} (${appId})`);
    return appId;
  } catch (error) {
    if (error instanceof Error && error.message.includes('already exists')) {
      logger.warning(`Web app ${appName} already exists, retrieving existing app ID...`);
      // Try to get existing app ID
      const { stdout } = await execAsync(`firebase apps:list --project ${projectId}`);
      const appIdMatch = stdout.match(/([^\s]+)\s+\(WEB\)/);
      const existingAppId = appIdMatch?.[1];

      if (!existingAppId) {
        throw new Error(`Web app exists but could not retrieve app ID from: ${stdout}`);
      }

      logger.success(`Retrieved existing app ID: ${existingAppId}`);
      return existingAppId;
    }
    logger.error(`Failed to create web app in ${projectId}`);
    throw error;
  }
}

/**
 * Get Firebase web app config (API keys, etc.)
 *
 * Retrieves the Firebase SDK configuration for a web app, including API keys
 * and service endpoints. This config is needed for client-side Firebase initialization.
 *
 * @param projectId - The Firebase project ID
 * @param appId - The Firebase web app ID
 * @returns Promise<FirebaseWebAppConfig> - Firebase SDK configuration
 * @throws Error if project ID is invalid
 * @throws Error if app ID is empty
 * @throws Error if config is invalid or missing required fields
 *
 * @example
 * ```typescript
 * const config = await getWebAppConfig('my-app-dev', '1:123456:web:abc123');
 * console.log(`API Key: ${config.apiKey}`);
 * console.log(`Project ID: ${config.projectId}`);
 * ```
 */
export async function getWebAppConfig(
  projectId: string,
  appId: string
): Promise<FirebaseWebAppConfig> {
  // Validate inputs
  if (!validateProjectId(projectId)) {
    throw new Error(`Invalid project ID: ${projectId}`);
  }

  if (!appId || appId.trim().length === 0) {
    throw new Error('App ID cannot be empty');
  }

  logger.info('Fetching web app configuration...');

  try {
    const { stdout } = await execAsync(
      `firebase apps:sdkconfig WEB ${appId} --project ${projectId}`
    );

    // Parse the SDK config JSON output
    const config = JSON.parse(stdout) as FirebaseWebAppConfig;

    // Validate required fields
    const requiredFields: (keyof FirebaseWebAppConfig)[] = [
      'apiKey',
      'authDomain',
      'projectId',
      'storageBucket',
      'messagingSenderId',
      'appId',
    ];

    const missingFields = requiredFields.filter((field) => !config[field]);
    if (missingFields.length > 0) {
      throw new Error(`Firebase config missing required fields: ${missingFields.join(', ')}`);
    }

    logger.success('Web app config retrieved');
    return config;
  } catch (error) {
    logger.error('Failed to fetch web app config');
    if (error instanceof SyntaxError) {
      throw new Error('Failed to parse Firebase config JSON');
    }
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
 * Write Firebase configuration to .env file
 *
 * Creates environment variable files with Firebase configuration.
 * Supports both client-side and server-first patterns.
 *
 * @param targetDir - Directory where to write the .env file
 * @param filename - Name of the env file (.env.local, .env.example, etc.)
 * @param config - Firebase configuration object
 * @param pattern - Firebase pattern (client-side or server-first)
 *
 * @example
 * ```typescript
 * await writeEnvFile(
 *   '/path/to/project',
 *   '.env.local',
 *   config,
 *   'client-side'
 * );
 * ```
 */
export async function writeEnvFile(
  targetDir: string,
  filename: string,
  config: FirebaseWebAppConfig,
  pattern: 'client-side' | 'server-first'
): Promise<void> {
  const { writeFile } = await import('./file-system.js');
  const path = await import('path');

  let content = '';

  if (pattern === 'client-side') {
    content = `# Firebase Configuration (Client-Side)
# These variables are exposed to the browser
NEXT_PUBLIC_FIREBASE_API_KEY=${config.apiKey}
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${config.authDomain}
NEXT_PUBLIC_FIREBASE_PROJECT_ID=${config.projectId}
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${config.storageBucket}
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${config.messagingSenderId}
NEXT_PUBLIC_FIREBASE_APP_ID=${config.appId}
${config.measurementId ? `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=${config.measurementId}` : ''}
`;
  } else {
    // Server-first pattern
    content = `# Firebase Configuration (Server-First)
# Admin SDK credentials - Keep these secret!
FIREBASE_PROJECT_ID=${config.projectId}
# FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
# FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"

# Client-side config (also needed for server-first)
NEXT_PUBLIC_FIREBASE_API_KEY=${config.apiKey}
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${config.authDomain}
NEXT_PUBLIC_FIREBASE_PROJECT_ID=${config.projectId}
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${config.storageBucket}
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${config.messagingSenderId}
NEXT_PUBLIC_FIREBASE_APP_ID=${config.appId}
${config.measurementId ? `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=${config.measurementId}` : ''}
`;
  }

  const filePath = path.default.join(targetDir, filename);
  await writeFile(filePath, content);
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
 * Environment variable options
 */
export interface EnvVarOptions {
  pattern: 'client-side' | 'server-first';
  config: FirebaseWebAppConfig;
  serviceAccountPath?: string; // For server-first pattern
}

/**
 * Write Firebase configuration to .env.local file
 *
 * Creates a .env.local file with Firebase credentials based on the selected pattern.
 * Client-side pattern uses NEXT_PUBLIC_ prefixed variables for browser access.
 * Server-first pattern uses FIREBASE_ variables for server-side access.
 *
 * @param projectDir - Project directory where .env.local will be created
 * @param options - Environment variable options (pattern, config, etc.)
 * @param overwrite - Whether to overwrite existing .env.local file (default: false)
 * @throws Error if .env.local exists and overwrite is false
 *
 * @example Client-side pattern
 * ```typescript
 * await writeEnvFile('/path/to/project', {
 *   pattern: 'client-side',
 *   config: { apiKey: '...', authDomain: '...', ... }
 * });
 * ```
 *
 * @example Server-first pattern
 * ```typescript
 * await writeEnvFile('/path/to/project', {
 *   pattern: 'server-first',
 *   config: { projectId: '...', ... },
 *   serviceAccountPath: './service-account.json'
 * });
 * ```
 */
export async function writeEnvFile(
  projectDir: string,
  options: EnvVarOptions,
  overwrite = false
): Promise<void> {
  const envPath = path.join(projectDir, '.env.local');

  // Check if .env.local already exists
  const exists = await fs.pathExists(envPath);
  if (exists && !overwrite) {
    throw new Error(
      `.env.local already exists. Use overwrite=true to replace it, or manually merge the configuration.`
    );
  }

  logger.info('Writing Firebase configuration to .env.local...');

  let envContent = '';

  if (options.pattern === 'client-side') {
    // Client-side pattern: NEXT_PUBLIC_ prefixed variables
    envContent = `# Firebase Configuration (Client-Side)
# These variables are exposed to the browser

NEXT_PUBLIC_FIREBASE_API_KEY=${options.config.apiKey}
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${options.config.authDomain}
NEXT_PUBLIC_FIREBASE_PROJECT_ID=${options.config.projectId}
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${options.config.storageBucket}
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${options.config.messagingSenderId}
NEXT_PUBLIC_FIREBASE_APP_ID=${options.config.appId}
${options.config.measurementId ? `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=${options.config.measurementId}\n` : ''}
# App Configuration
NEXT_PUBLIC_APP_NAME=${options.config.projectId}
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
`;
  } else {
    // Server-first pattern: FIREBASE_ variables for server-side
    envContent = `# Firebase Configuration (Server-First)
# These variables are used server-side only

FIREBASE_PROJECT_ID=${options.config.projectId}
${options.serviceAccountPath ? `FIREBASE_SERVICE_ACCOUNT_PATH=${options.serviceAccountPath}\n` : ''}
# Note: For production, use FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY
# instead of service account file

# App Configuration
NEXT_PUBLIC_APP_NAME=${options.config.projectId}
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
`;
  }

  await fs.writeFile(envPath, envContent, 'utf-8');
  logger.success(`.env.local created with ${options.pattern} configuration`);
}

/**
 * Update .env.example file with Firebase configuration template
 *
 * Updates the .env.example file with Firebase variable templates (without actual values).
 * This helps developers know which environment variables are needed.
 *
 * @param projectDir - Project directory where .env.example exists
 * @param pattern - Firebase pattern (client-side or server-first)
 *
 * @example
 * ```typescript
 * await updateEnvExample('/path/to/project', 'client-side');
 * ```
 */
export async function updateEnvExample(
  projectDir: string,
  pattern: 'client-side' | 'server-first'
): Promise<void> {
  const examplePath = path.join(projectDir, '.env.example');

  logger.info('Updating .env.example...');

  let exampleContent = '';

  if (pattern === 'client-side') {
    exampleContent = `# Firebase Configuration (Client-Side)
# Get these from Firebase Console > Project Settings > General > Your apps

NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# App Configuration
NEXT_PUBLIC_APP_NAME=Your App Name
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
`;
  } else {
    exampleContent = `# Firebase Configuration (Server-First)
# Get these from Firebase Console > Project Settings > Service Accounts

FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT_PATH=./service-account.json
# For production deployments (instead of service account file):
# FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
# FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"

# App Configuration
NEXT_PUBLIC_APP_NAME=Your App Name
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
`;
  }

  await fs.writeFile(examplePath, exampleContent, 'utf-8');
  logger.success('.env.example updated');
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
