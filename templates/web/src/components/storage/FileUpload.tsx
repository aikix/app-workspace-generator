/**
 * Generic File Upload Component
 * Supports single and multiple file uploads with progress tracking
 */

'use client';

import { useRef, useState } from 'react';
import { useUpload, type UseUploadOptions } from '@/hooks/firebase/useStorage';

export interface FileUploadProps extends UseUploadOptions {
  onUploadComplete?: (url: string) => void;
  onUploadError?: (error: Error) => void;
  accept?: string;
  maxSize?: number;
  label?: string;
  buttonText?: string;
  className?: string;
}

export function FileUpload({
  onUploadComplete,
  onUploadError,
  accept,
  maxSize,
  label = 'Upload File',
  buttonText = 'Choose File',
  className = '',
  ...uploadOptions
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { upload, cancel, reset, progress, url, error, isUploading, isComplete } = useUpload(uploadOptions);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size if specified
    if (maxSize && file.size > maxSize) {
      const errorMsg = `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (${(maxSize / 1024 / 1024).toFixed(2)}MB)`;
      if (onUploadError) {
        onUploadError(new Error(errorMsg));
      }
      return;
    }

    setSelectedFile(file);
    upload(file);
  };

  const handleCancel = () => {
    cancel();
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReset = () => {
    reset();
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle completion
  if (isComplete && url && onUploadComplete) {
    onUploadComplete(url);
  }

  // Handle error
  if (error && onUploadError) {
    onUploadError(error);
  }

  return (
    <div className={`file-upload ${className}`}>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">{label}</label>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            disabled={isUploading}
            className="hidden"
            id="file-input"
          />
          <label
            htmlFor="file-input"
            className={`
              px-4 py-2 rounded-lg border-2 border-blue-500
              text-blue-500 hover:bg-blue-50 cursor-pointer
              transition-colors duration-200
              ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {buttonText}
          </label>
          {selectedFile && (
            <span className="text-sm text-gray-600">{selectedFile.name}</span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {isUploading && progress && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Uploading...</span>
            <span>{progress.progress.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.progress}%` }}
            />
          </div>
          <button
            onClick={handleCancel}
            className="mt-2 text-sm text-red-500 hover:text-red-700"
          >
            Cancel Upload
          </button>
        </div>
      )}

      {/* Success Message */}
      {isComplete && url && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">Upload successful!</p>
          <p className="text-sm text-green-600 mt-1 break-all">{url}</p>
          <button
            onClick={handleReset}
            className="mt-2 text-sm text-blue-500 hover:text-blue-700"
          >
            Upload Another File
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-medium">Upload failed</p>
          <p className="text-sm text-red-600 mt-1">{error.message}</p>
          <button
            onClick={handleReset}
            className="mt-2 text-sm text-blue-500 hover:text-blue-700"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
