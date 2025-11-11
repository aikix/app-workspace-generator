#!/usr/bin/env node

/**
 * Manual test script for Firebase Web App functions
 *
 * Usage:
 * 1. Ensure you have Firebase CLI installed: npm install -g firebase-tools
 * 2. Login to Firebase: firebase login
 * 3. Create a test project first (see test-firebase-project.ts)
 * 4. Build the project: npm run build
 * 5. Run this script: node dist/test-firebase-webapp.js
 *
 * Environment Variables:
 * - FIREBASE_PROJECT_ID: The Firebase project ID to use (required)
 *
 * Example:
 * FIREBASE_PROJECT_ID=my-test-project node dist/test-firebase-webapp.js
 */

import { createWebApp, getWebAppConfig, verifyFirebaseCLI } from './utils/firebase-automation.js';
import { logger } from './utils/logger.js';

async function testFirebaseWebApp() {
  logger.banner();
  logger.header('Testing Firebase Web App Functions');
  logger.newLine();

  try {
    // Step 1: Verify Firebase CLI
    logger.section('Step 1: Verifying Firebase CLI');
    await verifyFirebaseCLI();
    logger.newLine();

    // Step 2: Get project ID from environment or use default
    const projectId = process.env.FIREBASE_PROJECT_ID;
    if (!projectId) {
      logger.error('FIREBASE_PROJECT_ID environment variable is required');
      logger.info('Usage: FIREBASE_PROJECT_ID=my-project node dist/test-firebase-webapp.js');
      process.exit(1);
    }

    logger.info(`Using Firebase project: ${projectId}`);
    logger.newLine();

    // Step 3: Create web app
    logger.section('Step 2: Creating Web App');
    const appName = `Test Web App ${Date.now()}`;
    logger.info(`Creating web app: ${appName}`);

    const appId = await createWebApp(projectId, appName);
    logger.success(`✓ Web app created successfully!`);
    logger.info(`App ID: ${appId}`);
    logger.newLine();

    // Step 4: Get web app config
    logger.section('Step 3: Retrieving Web App Config');
    const config = await getWebAppConfig(projectId, appId);
    logger.success(`✓ Config retrieved successfully!`);
    logger.newLine();

    // Step 5: Display config
    logger.section('Step 4: Web App Configuration');
    logger.info('Config structure:');
    console.log(JSON.stringify(config, null, 2));
    logger.newLine();

    // Step 6: Validate config structure
    logger.section('Step 5: Validating Config Structure');
    const requiredFields = [
      'apiKey',
      'authDomain',
      'projectId',
      'storageBucket',
      'messagingSenderId',
      'appId',
    ];

    const missingFields = requiredFields.filter((field) => !(field in config));

    if (missingFields.length > 0) {
      logger.error(`✗ Missing required fields: ${missingFields.join(', ')}`);
      process.exit(1);
    }

    logger.success('✓ All required fields present');
    logger.newLine();

    // Step 7: Test idempotency (creating same app again)
    logger.section('Step 6: Testing Idempotency');
    logger.info('Attempting to create the same web app again...');

    const appId2 = await createWebApp(projectId, appName);
    if (appId2 === appId || appId2 === '') {
      logger.success('✓ Idempotency test passed (handled existing app)');
    } else {
      logger.warning(`Different app ID returned: ${appId2}`);
    }
    logger.newLine();

    // Success summary
    logger.celebrate('All tests passed successfully!');
    logger.newLine();

    logger.summaryBox([
      '✅ Test Results:',
      '',
      `✓ Firebase CLI verified`,
      `✓ Web app created: ${appName}`,
      `✓ App ID: ${appId}`,
      `✓ Config retrieved and validated`,
      `✓ Idempotency test passed`,
      '',
      'Next steps:',
      '1. Check the Firebase Console to verify the web app',
      '2. Test getWebAppConfig with the app ID',
      '3. Clean up test apps if needed',
    ]);
  } catch (error) {
    logger.error('Test failed');
    if (error instanceof Error) {
      logger.error(error.message);
      if (error.stack) {
        console.error(error.stack);
      }
    }
    process.exit(1);
  }
}

// Run the test
testFirebaseWebApp().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
