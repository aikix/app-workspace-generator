/**
 * React Hook for Firebase Storage Operations
 * Handles file uploads with progress tracking, validation, and error handling
 */

'use client';

import { useState, useCallback } from 'react';
import type { UploadTask } from 'firebase/storage';
import {
  uploadFileWithProgress,
  uploadMultipleFiles,
  deleteFile,
  getFileURL,
  validateFile,
  generateStoragePath,
  type UploadProgress,
  type UploadWithProgressOptions,
  type BulkUploadResult,
  type BulkUploadOptions,
  type FileValidationError,
} from '@/lib/firebase/storage';

// ============================================================================
// Single File Upload Hook
// ============================================================================

export interface UseUploadOptions extends Omit<UploadWithProgressOptions, 'onProgress' | 'onError' | 'onSuccess'> {
  autoUpload?: boolean;
  generatePath?: (file: File) => string;
}

export interface UseUploadResult {
  upload: (file: File, customPath?: string) => void;
  cancel: () => void;
  reset: () => void;
  progress: UploadProgress | null;
  url: string | null;
  error: Error | null;
  isUploading: boolean;
  isComplete: boolean;
}

export function useUpload(options: UseUploadOptions = {}): UseUploadResult {
  const { autoUpload = false, generatePath, ...uploadOptions } = options;

  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [uploadTask, setUploadTask] = useState<UploadTask | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const upload = useCallback(
    (file: File, customPath?: string) => {
      // Reset state
      setProgress(null);
      setUrl(null);
      setError(null);
      setIsComplete(false);
      setIsUploading(true);

      // Generate path
      const path = customPath || (generatePath ? generatePath(file) : `uploads/${Date.now()}_${file.name}`);

      try {
        // Start upload
        const task = uploadFileWithProgress(path, file, {
          ...uploadOptions,
          onProgress: (progressData) => {
            setProgress(progressData);
          },
          onError: (err) => {
            setError(err);
            setIsUploading(false);
          },
          onSuccess: (downloadUrl) => {
            setUrl(downloadUrl);
            setIsUploading(false);
            setIsComplete(true);
          },
        });

        setUploadTask(task);
      } catch (err) {
        setError(err as Error);
        setIsUploading(false);
      }
    },
    [generatePath, uploadOptions]
  );

  const cancel = useCallback(() => {
    if (uploadTask) {
      uploadTask.cancel();
      setIsUploading(false);
      setError(new Error('Upload canceled'));
    }
  }, [uploadTask]);

  const reset = useCallback(() => {
    setProgress(null);
    setUrl(null);
    setError(null);
    setUploadTask(null);
    setIsUploading(false);
    setIsComplete(false);
  }, []);

  return {
    upload,
    cancel,
    reset,
    progress,
    url,
    error,
    isUploading,
    isComplete,
  };
}

// ============================================================================
// Multiple Files Upload Hook
// ============================================================================

export interface UseBulkUploadOptions extends Omit<BulkUploadOptions, 'onFileProgress' | 'onFileComplete' | 'onFileError'> {
  basePath?: string;
}

export interface FileUploadState {
  file: File;
  progress: UploadProgress | null;
  url: string | null;
  error: Error | null;
  isComplete: boolean;
}

export interface UseBulkUploadResult {
  upload: (files: File[]) => Promise<void>;
  reset: () => void;
  fileStates: Map<File, FileUploadState>;
  overallProgress: number;
  isUploading: boolean;
  isComplete: boolean;
  result: BulkUploadResult | null;
}

export function useBulkUpload(options: UseBulkUploadOptions = {}): UseBulkUploadResult {
  const { basePath = 'uploads', ...uploadOptions } = options;

  const [fileStates, setFileStates] = useState<Map<File, FileUploadState>>(new Map());
  const [isUploading, setIsUploading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [result, setResult] = useState<BulkUploadResult | null>(null);

  const upload = useCallback(
    async (files: File[]) => {
      // Initialize file states
      const initialStates = new Map<File, FileUploadState>();
      files.forEach((file) => {
        initialStates.set(file, {
          file,
          progress: null,
          url: null,
          error: null,
          isComplete: false,
        });
      });

      setFileStates(initialStates);
      setIsUploading(true);
      setIsComplete(false);
      setResult(null);

      try {
        const uploadResult = await uploadMultipleFiles(basePath, files, {
          ...uploadOptions,
          onFileProgress: (file, progress) => {
            setFileStates((prev) => {
              const newStates = new Map(prev);
              const state = newStates.get(file);
              if (state) {
                newStates.set(file, { ...state, progress });
              }
              return newStates;
            });
          },
          onFileComplete: (file, url) => {
            setFileStates((prev) => {
              const newStates = new Map(prev);
              const state = newStates.get(file);
              if (state) {
                newStates.set(file, { ...state, url, isComplete: true });
              }
              return newStates;
            });
          },
          onFileError: (file, error) => {
            setFileStates((prev) => {
              const newStates = new Map(prev);
              const state = newStates.get(file);
              if (state) {
                newStates.set(file, { ...state, error });
              }
              return newStates;
            });
          },
        });

        setResult(uploadResult);
        setIsComplete(true);
      } catch (err) {
        console.error('Bulk upload error:', err);
      } finally {
        setIsUploading(false);
      }
    },
    [basePath, uploadOptions]
  );

  const reset = useCallback(() => {
    setFileStates(new Map());
    setIsUploading(false);
    setIsComplete(false);
    setResult(null);
  }, []);

  // Calculate overall progress
  const overallProgress = Array.from(fileStates.values()).reduce((sum, state) => {
    return sum + (state.progress?.progress || 0);
  }, 0) / (fileStates.size || 1);

  return {
    upload,
    reset,
    fileStates,
    overallProgress,
    isUploading,
    isComplete,
    result,
  };
}

// ============================================================================
// File Management Hook
// ============================================================================

export interface UseFileManagementResult {
  deleteFile: (path: string) => Promise<void>;
  getFileUrl: (path: string) => Promise<string>;
  isDeleting: boolean;
  deleteError: Error | null;
}

export function useFileManagement(): UseFileManagementResult {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<Error | null>(null);

  const handleDeleteFile = useCallback(async (path: string) => {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteFile(path);
    } catch (err) {
      setDeleteError(err as Error);
      throw err;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  const handleGetFileUrl = useCallback(async (path: string) => {
    try {
      return await getFileURL(path);
    } catch (err) {
      throw err;
    }
  }, []);

  return {
    deleteFile: handleDeleteFile,
    getFileUrl: handleGetFileUrl,
    isDeleting,
    deleteError,
  };
}

// ============================================================================
// File Validation Hook
// ============================================================================

export interface UseFileValidationOptions {
  maxSize?: number;
  allowedTypes?: string[];
  category?: 'image' | 'video' | 'document';
}

export interface UseFileValidationResult {
  validate: (file: File) => { valid: boolean; error?: FileValidationError };
  isValidating: boolean;
}

export function useFileValidation(options: UseFileValidationOptions = {}): UseFileValidationResult {
  const [isValidating, setIsValidating] = useState(false);

  const validate = useCallback(
    (file: File): { valid: boolean; error?: FileValidationError } => {
      setIsValidating(true);

      try {
        validateFile(file, options);
        setIsValidating(false);
        return { valid: true };
      } catch (err) {
        setIsValidating(false);
        return { valid: false, error: err as FileValidationError };
      }
    },
    [options]
  );

  return {
    validate,
    isValidating,
  };
}
