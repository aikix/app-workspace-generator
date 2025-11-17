import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { writeEnvFile, type FirebaseWebAppConfig } from '../../src/utils/firebase-automation.js';
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
        await writeEnvFile(tempDir, '.env.local', mockConfig, 'client-side');

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

        await writeEnvFile(tempDir, '.env.local', configWithoutMeasurement, 'client-side');

        const envPath = path.join(tempDir, '.env.local');
        const content = await fs.readFile(envPath, 'utf-8');
        expect(content).not.toContain('NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID');
      });
    });

    describe('server-first pattern', () => {
      it('should create .env.local with server-first configuration', async () => {
        await writeEnvFile(tempDir, '.env.local', mockConfig, 'server-first');

        const envPath = path.join(tempDir, '.env.local');
        const content = await fs.readFile(envPath, 'utf-8');
        expect(content).toContain('FIREBASE_PROJECT_ID=test-project');
        expect(content).toContain('# Firebase Configuration (Server-First)');
        // Server-first also includes client-side config
        expect(content).toContain('NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyTest123456789');
      });
    });
  });
});
