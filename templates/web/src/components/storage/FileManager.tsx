/**
 * File Manager Component
 * Displays uploaded files with actions to view, download, and delete
 */

'use client';

import { useState } from 'react';
import { useFileManagement, useBulkUpload, type UseBulkUploadOptions } from '@/hooks/firebase/useStorage';

export interface FileItem {
  name: string;
  path: string;
  url?: string;
  size?: number;
  uploadedAt?: Date;
  type?: string;
}

export interface FileManagerProps {
  files: FileItem[];
  onFileDeleted?: (path: string) => void;
  onFilesUploaded?: (files: FileItem[]) => void;
  allowUpload?: boolean;
  allowDelete?: boolean;
  uploadOptions?: UseBulkUploadOptions;
  className?: string;
}

export function FileManager({
  files,
  onFileDeleted,
  onFilesUploaded,
  allowUpload = true,
  allowDelete = true,
  uploadOptions = {},
  className = '',
}: FileManagerProps) {
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [deletingFiles, setDeletingFiles] = useState<Set<string>>(new Set());

  const { deleteFile, isDeleting } = useFileManagement();
  const { upload, fileStates, overallProgress, isUploading, isComplete, result } = useBulkUpload(uploadOptions);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadFiles = Array.from(event.target.files || []);
    if (uploadFiles.length === 0) return;

    upload(uploadFiles);
  };

  const handleDelete = async (path: string) => {
    if (!allowDelete) return;

    const confirmed = window.confirm('Are you sure you want to delete this file?');
    if (!confirmed) return;

    setDeletingFiles((prev) => new Set(prev).add(path));

    try {
      await deleteFile(path);
      if (onFileDeleted) {
        onFileDeleted(path);
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
      alert('Failed to delete file. Please try again.');
    } finally {
      setDeletingFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(path);
        return newSet;
      });
    }
  };

  const handleSelectFile = (path: string) => {
    setSelectedFiles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedFiles.size === files.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(files.map((f) => f.path)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedFiles.size === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedFiles.size} file(s)?`
    );
    if (!confirmed) return;

    const deletePromises = Array.from(selectedFiles).map((path) =>
      handleDelete(path)
    );

    await Promise.all(deletePromises);
    setSelectedFiles(new Set());
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'Unknown';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const getFileIcon = (type?: string): string => {
    if (!type) return '📄';
    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('video/')) return '🎥';
    if (type.startsWith('audio/')) return '🎵';
    if (type.includes('pdf')) return '📕';
    if (type.includes('document') || type.includes('word')) return '📝';
    if (type.includes('spreadsheet') || type.includes('excel')) return '📊';
    return '📄';
  };

  return (
    <div className={`file-manager ${className}`}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Files ({files.length})
        </h3>

        <div className="flex items-center gap-2">
          {allowUpload && (
            <label className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer transition-colors">
              Upload Files
              <input
                type="file"
                multiple
                onChange={handleFileSelect}
                disabled={isUploading}
                className="hidden"
              />
            </label>
          )}

          {allowDelete && selectedFiles.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              disabled={isDeleting}
            >
              Delete Selected ({selectedFiles.size})
            </button>
          )}
        </div>
      </div>

      {/* Bulk Upload Progress */}
      {isUploading && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex justify-between text-sm text-blue-800 mb-2">
            <span>Uploading {fileStates.size} file(s)...</span>
            <span>{overallProgress.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Upload Complete Message */}
      {isComplete && result && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">
            Upload complete: {result.success.length} successful, {result.failed.length} failed
          </p>
          {result.failed.length > 0 && (
            <ul className="mt-2 text-sm text-red-600">
              {result.failed.map((item, index) => (
                <li key={index}>
                  {item.file.name}: {item.error.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* File List */}
      {files.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No files uploaded yet</p>
          {allowUpload && <p className="text-sm mt-2">Click "Upload Files" to get started</p>}
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {/* Table Header */}
          <div className="bg-gray-50 px-4 py-3 flex items-center gap-4 border-b border-gray-200">
            <input
              type="checkbox"
              checked={selectedFiles.size === files.length}
              onChange={handleSelectAll}
              className="h-4 w-4"
            />
            <div className="flex-1 font-medium text-sm">Name</div>
            <div className="w-24 font-medium text-sm">Size</div>
            <div className="w-32 font-medium text-sm">Actions</div>
          </div>

          {/* File Rows */}
          {files.map((file) => (
            <div
              key={file.path}
              className={`
                px-4 py-3 flex items-center gap-4 border-b border-gray-100 last:border-b-0
                hover:bg-gray-50 transition-colors
                ${selectedFiles.has(file.path) ? 'bg-blue-50' : ''}
              `}
            >
              <input
                type="checkbox"
                checked={selectedFiles.has(file.path)}
                onChange={() => handleSelectFile(file.path)}
                className="h-4 w-4"
              />
              <div className="flex-1 flex items-center gap-2">
                <span className="text-2xl">{getFileIcon(file.type)}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  {file.uploadedAt && (
                    <p className="text-xs text-gray-500">
                      {file.uploadedAt.toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="w-24 text-sm text-gray-600">
                {formatFileSize(file.size)}
              </div>
              <div className="w-32 flex items-center gap-2">
                {file.url && (
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700 text-sm"
                  >
                    View
                  </a>
                )}
                {allowDelete && (
                  <button
                    onClick={() => handleDelete(file.path)}
                    disabled={deletingFiles.has(file.path)}
                    className="text-red-500 hover:text-red-700 text-sm disabled:opacity-50"
                  >
                    {deletingFiles.has(file.path) ? 'Deleting...' : 'Delete'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
