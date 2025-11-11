import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createWebApp, getWebAppConfig } from '../../src/utils/firebase-automation.js';
import { exec } from 'child_process';

// Mock child_process exec
vi.mock('child_process', () => ({
  exec: vi.fn(),
}));

describe('Firebase Web App Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createWebApp', () => {
    it('should create a new web app successfully', async () => {
      const mockExec = exec as unknown as ReturnType<typeof vi.fn>;
      mockExec.mockImplementation((cmd, callback: any) => {
        callback(null, {
          stdout: 'App ID: 1:123456789:web:abc123def456',
          stderr: '',
        });
      });

      const appId = await createWebApp('my-project', 'My App');

      expect(appId).toBe('1:123456789:web:abc123def456');
      expect(mockExec).toHaveBeenCalledWith(
        expect.stringContaining('firebase apps:create WEB "My App"'),
        expect.any(Function)
      );
    });

    it('should handle existing web app gracefully', async () => {
      const mockExec = exec as unknown as ReturnType<typeof vi.fn>;

      // First call (create) fails with "already exists"
      // Second call (list) returns existing app ID
      let callCount = 0;
      mockExec.mockImplementation((cmd, callback: any) => {
        callCount++;
        if (callCount === 1) {
          callback(new Error('already exists'), { stdout: '', stderr: '' });
        } else {
          callback(null, {
            stdout: '1:123456789:web:abc123def456 (WEB)',
            stderr: '',
          });
        }
      });

      const appId = await createWebApp('my-project', 'My App');

      expect(appId).toBe('1:123456789:web:abc123def456');
      expect(mockExec).toHaveBeenCalledTimes(2);
    });

    it('should throw error if app ID extraction fails', async () => {
      const mockExec = exec as unknown as ReturnType<typeof vi.fn>;
      mockExec.mockImplementation((cmd, callback: any) => {
        callback(null, { stdout: 'No app ID in output', stderr: '' });
      });

      await expect(createWebApp('my-project', 'My App')).rejects.toThrow(
        'Failed to extract app ID'
      );
    });

    it('should throw error on Firebase CLI failure (non-exists error)', async () => {
      const mockExec = exec as unknown as ReturnType<typeof vi.fn>;
      mockExec.mockImplementation((cmd, callback: any) => {
        callback(new Error('Permission denied'), { stdout: '', stderr: '' });
      });

      await expect(createWebApp('my-project', 'My App')).rejects.toThrow('Permission denied');
    });

    it('should handle app name with special characters', async () => {
      const mockExec = exec as unknown as ReturnType<typeof vi.fn>;
      mockExec.mockImplementation((cmd, callback: any) => {
        callback(null, {
          stdout: 'App ID: 1:123456789:web:abc123def456',
          stderr: '',
        });
      });

      await createWebApp('my-project', 'My App with "Quotes"');

      expect(mockExec).toHaveBeenCalledWith(
        expect.stringContaining('My App with "Quotes"'),
        expect.any(Function)
      );
    });

    it('should return empty string if existing app not found in list', async () => {
      const mockExec = exec as unknown as ReturnType<typeof vi.fn>;

      let callCount = 0;
      mockExec.mockImplementation((cmd, callback: any) => {
        callCount++;
        if (callCount === 1) {
          callback(new Error('already exists'), { stdout: '', stderr: '' });
        } else {
          // List command returns no WEB apps
          callback(null, {
            stdout: 'No web apps found',
            stderr: '',
          });
        }
      });

      const appId = await createWebApp('my-project', 'My App');

      expect(appId).toBe('');
    });
  });

  describe('getWebAppConfig', () => {
    const mockConfig = {
      apiKey: 'AIzaSyTest123',
      authDomain: 'my-project.firebaseapp.com',
      projectId: 'my-project',
      storageBucket: 'my-project.appspot.com',
      messagingSenderId: '123456789',
      appId: '1:123456789:web:abc123def456',
    };

    it('should retrieve web app configuration successfully', async () => {
      const mockExec = exec as unknown as ReturnType<typeof vi.fn>;
      mockExec.mockImplementation((cmd, callback: any) => {
        callback(null, {
          stdout: JSON.stringify(mockConfig),
          stderr: '',
        });
      });

      const config = await getWebAppConfig('my-project', '1:123456789:web:abc123def456');

      expect(config).toEqual(mockConfig);
      expect(mockExec).toHaveBeenCalledWith(
        expect.stringContaining('firebase apps:sdkconfig WEB'),
        expect.any(Function)
      );
    });

    it('should throw error on Firebase CLI failure', async () => {
      const mockExec = exec as unknown as ReturnType<typeof vi.fn>;
      mockExec.mockImplementation((cmd, callback: any) => {
        callback(new Error('App not found'), { stdout: '', stderr: '' });
      });

      await expect(getWebAppConfig('my-project', '1:123456789:web:abc123def456')).rejects.toThrow(
        'App not found'
      );
    });

    it('should throw error if config JSON is invalid', async () => {
      const mockExec = exec as unknown as ReturnType<typeof vi.fn>;
      mockExec.mockImplementation((cmd, callback: any) => {
        callback(null, { stdout: 'Invalid JSON', stderr: '' });
      });

      await expect(getWebAppConfig('my-project', '1:123456789:web:abc123def456')).rejects.toThrow();
    });

    it('should handle config with missing fields', async () => {
      const mockExec = exec as unknown as ReturnType<typeof vi.fn>;
      const partialConfig = {
        apiKey: 'AIzaSyTest123',
        projectId: 'my-project',
        // Missing other fields
      };

      mockExec.mockImplementation((cmd, callback: any) => {
        callback(null, {
          stdout: JSON.stringify(partialConfig),
          stderr: '',
        });
      });

      const config = await getWebAppConfig('my-project', '1:123456789:web:abc123def456');

      expect(config).toEqual(partialConfig);
    });

    it('should include all standard Firebase config fields', async () => {
      const mockExec = exec as unknown as ReturnType<typeof vi.fn>;
      mockExec.mockImplementation((cmd, callback: any) => {
        callback(null, {
          stdout: JSON.stringify(mockConfig),
          stderr: '',
        });
      });

      const config = await getWebAppConfig('my-project', '1:123456789:web:abc123def456');

      expect(config).toHaveProperty('apiKey');
      expect(config).toHaveProperty('authDomain');
      expect(config).toHaveProperty('projectId');
      expect(config).toHaveProperty('storageBucket');
      expect(config).toHaveProperty('messagingSenderId');
      expect(config).toHaveProperty('appId');
    });
  });
});
