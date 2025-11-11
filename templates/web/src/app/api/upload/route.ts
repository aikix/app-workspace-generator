/**
 * File Upload API Route
 *
 * Example file upload endpoint
 * @route POST /api/upload
 */

import {
  apiSuccess,
  apiError,
  withErrorHandler,
  ValidationError,
  corsHeaders,
  apiCorsPreflightResponse,
} from '@/lib/api';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

/**
 * POST /api/upload
 * Upload a file
 */
export const POST = withErrorHandler(async (request: Request) => {
  const contentType = request.headers.get('content-type');

  if (!contentType?.includes('multipart/form-data')) {
    return apiError('Content-Type must be multipart/form-data', {
      code: 'INVALID_CONTENT_TYPE',
      status: 400,
    });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    throw new ValidationError('File is required', {
      file: ['No file provided'],
    });
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new ValidationError('File is too large', {
      file: [`File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`],
    });
  }

  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new ValidationError('Invalid file type', {
      file: [`Allowed types: ${ALLOWED_TYPES.join(', ')}`],
    });
  }

  // In a real application, you would:
  // 1. Upload to cloud storage (S3, Firebase Storage, etc.)
  // 2. Generate a unique filename
  // 3. Store file metadata in database
  // 4. Return the file URL

  // For this example, we'll just return file information
  const fileInfo = {
    name: file.name,
    type: file.type,
    size: file.size,
    // In production, this would be the actual URL after uploading
    url: `/uploads/${file.name}`,
    uploadedAt: new Date().toISOString(),
  };

  return apiSuccess(fileInfo, {
    status: 201,
    message: 'File uploaded successfully',
    headers: corsHeaders,
  });
});

export async function OPTIONS() {
  return apiCorsPreflightResponse();
}
