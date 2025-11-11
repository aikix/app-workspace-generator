import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createWebApp,
  getWebAppConfig,
  type FirebaseWebAppConfig,
} from '../../src/utils/firebase-automation.js';
import { exec } from 'child_process';

// Mock child_process exec
vi.mock('child_process', () => ({
  exec: vi.fn(),
}));

describe('Firebase Web App Creation and Config', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createWebApp', () => {
    it('should create a new web app successfully', async () => {
      const mockExec = exec as unknown as ReturnType<typeof vi.fn>;
      mockExec.mockImplementation((cmd, callback: any) => {
        callback(null, {
          stdout: 'App ID: 1:123456789:web:abcdef123456',
          stderr: '',
        });
      });

      const appId = await createWebApp('my-app-dev', 'my-app-dev-web');
      expect(appId).toBe('1:123456789:web:abcdef123456');
    });

    it('should handle existing web apps gracefully', async () => {
      const mockExec = exec as unknown as ReturnType<typeof vi.fn>;
      let callCount = 0;

      mockExec.mockImplementation((cmd, callback: any) => {
        callCount++;
        if (callCount === 1) {
          // First call - app creation fails with "already exists"
          callback(new Error('already exists'), { stdout: '', stderr: '' });
        } else {
          // Second call - list apps returns existing app
          callback(null, {
            stdout: '1:123456789:web:existing123 (WEB)',
            stderr: '',
          });
        }
      });

      const appId = await createWebApp('my-app-dev', 'my-app-dev-web');
      expect(appId).toBe('1:123456789:web:existing123');
    });

    it('should throw error for invalid project ID', async () => {
      await expect(createWebApp('Invalid-ID', 'my-app-web')).rejects.toThrow('Invalid project ID');
    });

    it('should throw error for empty app name', async () => {
      await expect(createWebApp('my-app-dev', '')).rejects.toThrow('App name cannot be empty');

      await expect(createWebApp('my-app-dev', '   ')).rejects.toThrow('App name cannot be empty');
    });

    it('should throw error if app ID cannot be extracted', async () => {
      const mockExec = exec as unknown as ReturnType<typeof vi.fn>;
      mockExec.mockImplementation((cmd, callback: any) => {
        callback(null, { stdout: 'No app ID in output', stderr: '' });
      });

      await expect(createWebApp('my-app-dev', 'my-app-web')).rejects.toThrow(
        'Failed to extract app ID'
      );
    });

    it('should throw error if existing app ID cannot be retrieved', async () => {
      const mockExec = exec as unknown as ReturnType<typeof vi.fn>;
      let callCount = 0;

      mockExec.mockImplementation((cmd, callback: any) => {
        callCount++;
        if (callCount === 1) {
          // First call - app creation fails with "already exists"
          callback(new Error('already exists'), { stdout: '', stderr: '' });
        } else {
          // Second call - list apps returns no app ID
          callback(null, { stdout: 'No WEB apps found', stderr: '' });
        }
      });

      await expect(createWebApp('my-app-dev', 'my-app-web')).rejects.toThrow(
        'could not retrieve app ID'
      );
    });

    it('should throw error on Firebase CLI failure', async () => {
      const mockExec = exec as unknown as ReturnType<typeof vi.fn>;
      mockExec.mockImplementation((cmd, callback: any) => {
        callback(new Error('Permission denied'), { stdout: '', stderr: '' });
      });

      await expect(createWebApp('my-app-dev', 'my-app-web')).rejects.toThrow('Permission denied');
    });
  });

  describe('getWebAppConfig', () => {
    const validConfig: FirebaseWebAppConfig = {
      apiKey: 'AIzaSyTest123456',
      authDomain: 'my-app-dev.firebaseapp.com',
      projectId: 'my-app-dev',
      storageBucket: 'my-app-dev.appspot.com',
      messagingSenderId: '123456789',
      appId: '1:123456789:web:abcdef123456',
      measurementId: 'G-ABCDEF1234',
    };

    it('should retrieve web app config successfully', async () => {
      const mockExec = exec as unknown as ReturnType<typeof vi.fn>;
      mockExec.mockImplementation((cmd, callback: any) => {
        callback(null, { stdout: JSON.stringify(validConfig), stderr: '' });
      });

      const config = await getWebAppConfig('my-app-dev', '1:123456789:web:abcdef123456');

      expect(config).toEqual(validConfig);
      expect(config.apiKey).toBe('AIzaSyTest123456');
      expect(config.projectId).toBe('my-app-dev');
    });

    it('should throw error for invalid project ID', async () => {
      await expect(getWebAppConfig('Invalid-ID', '1:123456789:web:abc')).rejects.toThrow(
        'Invalid project ID'
      );
    });

    it('should throw error for empty app ID', async () => {
      await expect(getWebAppConfig('my-app-dev', '')).rejects.toThrow('App ID cannot be empty');

      await expect(getWebAppConfig('my-app-dev', '   ')).rejects.toThrow('App ID cannot be empty');
    });

    it('should throw error for invalid JSON', async () => {
      const mockExec = exec as unknown as ReturnType<typeof vi.fn>;
      mockExec.mockImplementation((cmd, callback: any) => {
        callback(null, { stdout: 'Not valid JSON', stderr: '' });
      });

      await expect(getWebAppConfig('my-app-dev', '1:123456789:web:abc')).rejects.toThrow(
        'Failed to parse Firebase config JSON'
      );
    });

    it('should throw error if required fields are missing', async () => {
      const mockExec = exec as unknown as ReturnType<typeof vi.fn>;
      const incompleteConfig = {
        apiKey: 'AIzaSyTest123456',
        projectId: 'my-app-dev',
        // Missing other required fields
      };

      mockExec.mockImplementation((cmd, callback: any) => {
        callback(null, { stdout: JSON.stringify(incompleteConfig), stderr: '' });
      });

      await expect(getWebAppConfig('my-app-dev', '1:123456789:web:abc')).rejects.toThrow(
        'missing required fields'
      );
    });

    it('should accept config without optional measurementId', async () => {
      const mockExec = exec as unknown as ReturnType<typeof vi.fn>;
      const configWithoutMeasurement = { ...validConfig };
      delete configWithoutMeasurement.measurementId;

      mockExec.mockImplementation((cmd, callback: any) => {
        callback(null, {
          stdout: JSON.stringify(configWithoutMeasurement),
          stderr: '',
        });
      });

      const config = await getWebAppConfig('my-app-dev', '1:123456789:web:abc');

      expect(config).toEqual(configWithoutMeasurement);
      expect(config.measurementId).toBeUndefined();
    });

    it('should throw error on Firebase CLI failure', async () => {
      const mockExec = exec as unknown as ReturnType<typeof vi.fn>;
      mockExec.mockImplementation((cmd, callback: any) => {
        callback(new Error('App not found'), { stdout: '', stderr: '' });
      });

      await expect(getWebAppConfig('my-app-dev', '1:123456789:web:abc')).rejects.toThrow(
        'App not found'
      );
    });
  });
});
