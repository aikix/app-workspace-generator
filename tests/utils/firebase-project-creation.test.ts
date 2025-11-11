import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateProjectId, createFirebaseProject } from '../../src/utils/firebase-automation.js';
import { exec } from 'child_process';

// Mock child_process exec
vi.mock('child_process', () => ({
  exec: vi.fn(),
}));

describe('Firebase Project Creation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateProjectId', () => {
    it('should accept valid project IDs', () => {
      expect(validateProjectId('my-app-dev')).toBe(true);
      expect(validateProjectId('app123')).toBe(true);
      expect(validateProjectId('my-awesome-app')).toBe(true);
      expect(validateProjectId('project')).toBe(true);
    });

    it('should reject project IDs that are too short', () => {
      expect(validateProjectId('short')).toBe(false); // 5 chars
      expect(validateProjectId('abc')).toBe(false); // 3 chars
    });

    it('should reject project IDs that are too long', () => {
      expect(validateProjectId('a'.repeat(31))).toBe(false); // 31 chars
      expect(validateProjectId('my-very-long-project-name-that-exceeds-limit')).toBe(false);
    });

    it('should reject project IDs that start with non-lowercase letter', () => {
      expect(validateProjectId('My-App')).toBe(false); // uppercase
      expect(validateProjectId('1my-app')).toBe(false); // starts with number
      expect(validateProjectId('-my-app')).toBe(false); // starts with hyphen
    });

    it('should reject project IDs with invalid characters', () => {
      expect(validateProjectId('my_app')).toBe(false); // underscore
      expect(validateProjectId('my.app')).toBe(false); // dot
      expect(validateProjectId('my app')).toBe(false); // space
      expect(validateProjectId('my@app')).toBe(false); // special char
    });

    it('should reject project IDs ending with hyphen', () => {
      expect(validateProjectId('my-app-')).toBe(false);
      expect(validateProjectId('test-project-')).toBe(false);
    });
  });

  describe('createFirebaseProject', () => {
    it('should create a new Firebase project successfully', async () => {
      const mockExec = exec as unknown as ReturnType<typeof vi.fn>;
      mockExec.mockImplementation((cmd, callback: any) => {
        callback(null, { stdout: 'Project created', stderr: '' });
      });

      await expect(createFirebaseProject('my-app-dev')).resolves.toBeUndefined();
    });

    it('should handle existing projects gracefully', async () => {
      const mockExec = exec as unknown as ReturnType<typeof vi.fn>;
      mockExec.mockImplementation((cmd, callback: any) => {
        callback(new Error('already exists'), { stdout: '', stderr: '' });
      });

      await expect(createFirebaseProject('my-app-dev')).resolves.toBeUndefined();
    });

    it('should throw error for invalid project ID', async () => {
      await expect(createFirebaseProject('My-App')).rejects.toThrow('Invalid project ID');
      await expect(createFirebaseProject('short')).rejects.toThrow('Invalid project ID');
      await expect(createFirebaseProject('my-app-')).rejects.toThrow('Invalid project ID');
    });

    it('should throw error on Firebase CLI failure (non-exists error)', async () => {
      const mockExec = exec as unknown as ReturnType<typeof vi.fn>;
      mockExec.mockImplementation((cmd, callback: any) => {
        callback(new Error('Permission denied'), { stdout: '', stderr: '' });
      });

      await expect(createFirebaseProject('my-app-dev')).rejects.toThrow('Permission denied');
    });

    it('should validate project ID before making CLI call', async () => {
      const mockExec = exec as unknown as ReturnType<typeof vi.fn>;

      await expect(createFirebaseProject('invalid_id')).rejects.toThrow();

      // Verify exec was never called
      expect(mockExec).not.toHaveBeenCalled();
    });
  });
});
