/**
 * Image Upload Component with Preview
 * Optimized for image uploads with preview and optimization options
 */

'use client';

import { useRef, useState, useEffect } from 'react';
import { useUpload, type UseUploadOptions } from '@/hooks/firebase/useStorage';
import { FILE_SIZE_LIMITS, ALLOWED_FILE_TYPES } from '@/lib/firebase/storage';

export interface ImageUploadProps extends UseUploadOptions {
  onUploadComplete?: (url: string) => void;
  onUploadError?: (error: Error) => void;
  maxSize?: number;
  enableOptimization?: boolean;
  label?: string;
  className?: string;
  previewClassName?: string;
  showPreview?: boolean;
}

export function ImageUpload({
  onUploadComplete,
  onUploadError,
  maxSize = FILE_SIZE_LIMITS.image,
  enableOptimization = true,
  label = 'Upload Image',
  className = '',
  previewClassName = '',
  showPreview = true,
  ...uploadOptions
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { upload, cancel, reset, progress, url, error, isUploading, isComplete } = useUpload({
    ...uploadOptions,
    optimize: enableOptimization,
    validationOptions: {
      maxSize,
      allowedTypes: ALLOWED_FILE_TYPES.image,
    },
  });

  // Create preview URL when file is selected
  useEffect(() => {
    if (!selectedFile || !showPreview) return;

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    // Cleanup
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile, showPreview]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_FILE_TYPES.image.includes(file.type)) {
      const errorMsg = `Invalid file type. Please upload: ${ALLOWED_FILE_TYPES.image.join(', ')}`;
      if (onUploadError) {
        onUploadError(new Error(errorMsg));
      }
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      const errorMsg = `Image size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (${(maxSize / 1024 / 1024).toFixed(2)}MB)`;
      if (onUploadError) {
        onUploadError(new Error(errorMsg));
      }
      return;
    }

    setSelectedFile(file);
    upload(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    // Simulate file input change
    if (fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInputRef.current.files = dataTransfer.files;
      handleFileSelect({ target: fileInputRef.current } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleCancel = () => {
    cancel();
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReset = () => {
    reset();
    setSelectedFile(null);
    setPreviewUrl(null);
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
    <div className={`image-upload ${className}`}>
      <label className="block text-sm font-medium mb-2">{label}</label>

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`
          border-2 border-dashed rounded-lg p-6
          ${isUploading ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
          transition-colors duration-200 cursor-pointer
        `}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_FILE_TYPES.image.join(',')}
          onChange={handleFileSelect}
          disabled={isUploading}
          className="hidden"
        />

        {/* Preview or Placeholder */}
        {showPreview && (previewUrl || url) ? (
          <div className={`image-preview ${previewClassName}`}>
            <img
              src={previewUrl || url || ''}
              alt="Preview"
              className="max-w-full max-h-64 mx-auto rounded-lg object-contain"
            />
          </div>
        ) : (
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-600">
              <span className="font-medium text-blue-600 hover:text-blue-500">
                Click to upload
              </span>{' '}
              or drag and drop
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, GIF, WebP up to {(maxSize / 1024 / 1024).toFixed(0)}MB
            </p>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {isUploading && progress && (
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>{enableOptimization ? 'Optimizing and uploading...' : 'Uploading...'}</span>
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
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">Image uploaded successfully!</p>
          <button
            onClick={handleReset}
            className="mt-2 text-sm text-blue-500 hover:text-blue-700"
          >
            Upload Another Image
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
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
