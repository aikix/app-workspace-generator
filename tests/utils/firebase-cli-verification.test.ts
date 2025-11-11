import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  checkFirebaseCLI,
  checkFirebaseLogin,
  verifyFirebaseCLI,
} from '../../src/utils/firebase-automation.js';
import { exec } from 'child_process';

// Mock child_process exec
vi.mock('child_process', () => ({
  exec: vi.fn(),
}));

describe('Firebase CLI Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkFirebaseCLI', () => {
    it('should return true when Firebase CLI is installed', async () => {
      const mockExec = exec as unknown as ReturnType<typeof vi.fn>;
      mockExec.mockImplementation((cmd, callback: any) => {
        callback(null, { stdout: 'v13.0.0', stderr: '' });
      });

      const result = await checkFirebaseCLI();
      expect(result).toBe(true);
    });

    it('should return false when Firebase CLI is not installed', async () => {
      const mockExec = exec as unknown as ReturnType<typeof vi.fn>;
      mockExec.mockImplementation((cmd, callback: any) => {
        callback(new Error('command not found'), { stdout: '', stderr: '' });
      });

      const result = await checkFirebaseCLI();
      expect(result).toBe(false);
    });
  });

  describe('checkFirebaseLogin', () => {
    it('should return true when user is logged in', async () => {
      const mockExec = exec as unknown as ReturnType<typeof vi.fn>;
      mockExec.mockImplementation((cmd, callback: any) => {
        callback(null, { stdout: 'user@example.com', stderr: '' });
      });

      const result = await checkFirebaseLogin();
      expect(result).toBe(true);
    });

    it('should return false when user is not logged in', async () => {
      const mockExec = exec as unknown as ReturnType<typeof vi.fn>;
      mockExec.mockImplementation((cmd, callback: any) => {
        callback(new Error('not logged in'), { stdout: '', stderr: '' });
      });

      const result = await checkFirebaseLogin();
      expect(result).toBe(false);
    });

    it('should return false when no email in login list', async () => {
      const mockExec = exec as unknown as ReturnType<typeof vi.fn>;
      mockExec.mockImplementation((cmd, callback: any) => {
        callback(null, { stdout: 'No accounts', stderr: '' });
      });

      const result = await checkFirebaseLogin();
      expect(result).toBe(false);
    });
  });

  describe('verifyFirebaseCLI', () => {
    it('should throw error when Firebase CLI is not installed', async () => {
      const mockExec = exec as unknown as ReturnType<typeof vi.fn>;
      mockExec.mockImplementation((cmd, callback: any) => {
        callback(new Error('command not found'), { stdout: '', stderr: '' });
      });

      await expect(verifyFirebaseCLI()).rejects.toThrow('Firebase CLI not found');
    });

    it('should throw error when not logged in', async () => {
      const mockExec = exec as unknown as ReturnType<typeof vi.fn>;
      let callCount = 0;
      mockExec.mockImplementation((cmd, callback: any) => {
        callCount++;
        if (callCount === 1) {
          // First call - version check succeeds
          callback(null, { stdout: 'v13.0.0', stderr: '' });
        } else {
          // Second call - login check fails
          callback(new Error('not logged in'), { stdout: '', stderr: '' });
        }
      });

      await expect(verifyFirebaseCLI()).rejects.toThrow('Firebase authentication required');
    });

    it('should succeed when Firebase CLI is installed and user is logged in', async () => {
      const mockExec = exec as unknown as ReturnType<typeof vi.fn>;
      let callCount = 0;
      mockExec.mockImplementation((cmd, callback: any) => {
        callCount++;
        if (callCount === 1) {
          // First call - version check succeeds
          callback(null, { stdout: 'v13.0.0', stderr: '' });
        } else {
          // Second call - login check succeeds
          callback(null, { stdout: 'user@example.com', stderr: '' });
        }
      });

      await expect(verifyFirebaseCLI()).resolves.toBeUndefined();
    });
  });
});
