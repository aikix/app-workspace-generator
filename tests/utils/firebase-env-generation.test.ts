import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  writeEnvFile,
  updateEnvExample,
  type FirebaseWebAppConfig,
  type EnvVarOptions,
} from '../../src/utils/firebase-automation.js';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

describe('Firebase .env File Generation', () => {
  let tempDir: string;

  beforeEach(async () => {
    // Create a temporary directory for each test
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'firebase-env-test-'));
  });

  afterEach(async () => {
    // Clean up temporary directory after each test
    await fs.remove(tempDir);
  });

  const mockConfig: FirebaseWebAppConfig = {
    apiKey: 'AIzaSyTest123456789',
    authDomain: 'test-project.firebaseapp.com',
    projectId: 'test-project',
    storageBucket: 'test-project.appspot.com',
    messagingSenderId: '123456789',
    appId: '1:123456789:web:abcdef123456',
    measurementId: 'G-ABCDEF1234',
  };

  describe('writeEnvFile', () => {
    describe('client-side pattern', () => {
      it('should create .env.local with client-side configuration', async () => {
        const options: EnvVarOptions = {
          pattern: 'client-side',
          config: mockConfig,
        };

        await writeEnvFile(tempDir, options);

        const envPath = path.join(tempDir, '.env.local');
        const exists = await fs.pathExists(envPath);
        expect(exists).toBe(true);

        const content = await fs.readFile(envPath, 'utf-8');
        expect(content).toContain('NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyTest123456789');
        expect(content).toContain('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=test-project.firebaseapp.com');
        expect(content).toContain('NEXT_PUBLIC_FIREBASE_PROJECT_ID=test-project');
        expect(content).toContain('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=test-project.appspot.com');
        expect(content).toContain('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789');
        expect(content).toContain('NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456');
        expect(content).toContain('NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABCDEF1234');
      });

      it('should work without optional measurementId', async () => {
        const configWithoutMeasurement = { ...mockConfig };
        delete configWithoutMeasurement.measurementId;

        const options: EnvVarOptions = {
          pattern: 'client-side',
          config: configWithoutMeasurement,
        };

        await writeEnvFile(tempDir, options);

        const envPath = path.join(tempDir, '.env.local');
        const content = await fs.readFile(envPath, 'utf-8');
        expect(content).not.toContain('NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID');
      });
    });

    describe('server-first pattern', () => {
      it('should create .env.local with server-first configuration', async () => {
        const options: EnvVarOptions = {
          pattern: 'server-first',
          config: mockConfig,
          serviceAccountPath: './service-account-dev.json',
        };

        await writeEnvFile(tempDir, options);

        const envPath = path.join(tempDir, '.env.local');
        const content = await fs.readFile(envPath, 'utf-8');
        expect(content).toContain('FIREBASE_PROJECT_ID=test-project');
        expect(content).toContain('FIREBASE_SERVICE_ACCOUNT_PATH=./service-account-dev.json');
        expect(content).toContain('# Firebase Configuration (Server-First)');
        expect(content).not.toContain('NEXT_PUBLIC_FIREBASE_API_KEY');
      });

      it('should work without service account path', async () => {
        const options: EnvVarOptions = {
          pattern: 'server-first',
          config: mockConfig,
        };

        await writeEnvFile(tempDir, options);

        const envPath = path.join(tempDir, '.env.local');
        const content = await fs.readFile(envPath, 'utf-8');
        expect(content).toContain('FIREBASE_PROJECT_ID=test-project');
        expect(content).not.toContain('FIREBASE_SERVICE_ACCOUNT_PATH');
      });
    });

    describe('file existence checks', () => {
      it('should throw error if .env.local exists without overwrite', async () => {
        const options: EnvVarOptions = {
          pattern: 'client-side',
          config: mockConfig,
        };

        // Create .env.local first
        const envPath = path.join(tempDir, '.env.local');
        await fs.writeFile(envPath, 'existing content');

        // Should throw error
        await expect(writeEnvFile(tempDir, options, false)).rejects.toThrow(
          '.env.local already exists'
        );
      });

      it('should overwrite .env.local when overwrite is true', async () => {
        const options: EnvVarOptions = {
          pattern: 'client-side',
          config: mockConfig,
        };

        // Create .env.local with old content
        const envPath = path.join(tempDir, '.env.local');
        await fs.writeFile(envPath, 'old content');

        // Should overwrite
        await writeEnvFile(tempDir, options, true);

        const content = await fs.readFile(envPath, 'utf-8');
        expect(content).toContain('NEXT_PUBLIC_FIREBASE_API_KEY');
        expect(content).not.toContain('old content');
      });
    });

    describe('content validation', () => {
      it('should include app configuration for both patterns', async () => {
        const clientOptions: EnvVarOptions = {
          pattern: 'client-side',
          config: mockConfig,
        };

        await writeEnvFile(tempDir, clientOptions);
        const content = await fs.readFile(path.join(tempDir, '.env.local'), 'utf-8');

        expect(content).toContain('NEXT_PUBLIC_APP_NAME=test-project');
        expect(content).toContain('NEXT_PUBLIC_APP_URL=http://localhost:3000');
        expect(content).toContain('NODE_ENV=development');
      });
    });
  });

  describe('updateEnvExample', () => {
    describe('client-side pattern', () => {
      it('should create .env.example with client-side template', async () => {
        await updateEnvExample(tempDir, 'client-side');

        const examplePath = path.join(tempDir, '.env.example');
        const exists = await fs.pathExists(examplePath);
        expect(exists).toBe(true);

        const content = await fs.readFile(examplePath, 'utf-8');
        expect(content).toContain('NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here');
        expect(content).toContain('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com');
        expect(content).toContain('# Firebase Configuration (Client-Side)');
        expect(content).toContain('# Get these from Firebase Console');
      });
    });

    describe('server-first pattern', () => {
      it('should create .env.example with server-first template', async () => {
        await updateEnvExample(tempDir, 'server-first');

        const examplePath = path.join(tempDir, '.env.example');
        const content = await fs.readFile(examplePath, 'utf-8');
        expect(content).toContain('FIREBASE_PROJECT_ID=your-project-id');
        expect(content).toContain('FIREBASE_SERVICE_ACCOUNT_PATH=./service-account.json');
        expect(content).toContain('# Firebase Configuration (Server-First)');
        expect(content).toContain('FIREBASE_CLIENT_EMAIL=');
        expect(content).toContain('FIREBASE_PRIVATE_KEY=');
      });
    });

    describe('file overwrite behavior', () => {
      it('should overwrite existing .env.example', async () => {
        const examplePath = path.join(tempDir, '.env.example');

        // Create existing .env.example
        await fs.writeFile(examplePath, 'old template');

        // Update with new template
        await updateEnvExample(tempDir, 'client-side');

        const content = await fs.readFile(examplePath, 'utf-8');
        expect(content).toContain('NEXT_PUBLIC_FIREBASE_API_KEY');
        expect(content).not.toContain('old template');
      });
    });
  });
});
