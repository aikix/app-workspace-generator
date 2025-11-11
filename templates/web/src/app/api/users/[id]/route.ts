/**
 * User Detail API Route
 *
 * CRUD operations for individual user
 * @route GET /api/users/[id] - Get user by ID
 * @route PUT /api/users/[id] - Update user
 * @route DELETE /api/users/[id] - Delete user
 */

import {
  apiSuccess,
  apiNotFound,
  withErrorHandler,
  parseBody,
  patterns,
  corsHeaders,
  apiCorsPreflightResponse,
} from '@/lib/api';

// Mock data store (replace with database in production)
// Note: In a real app, this would be imported from a shared module
const users: Array<{ id: string; name: string; email: string }> = [];

/**
 * GET /api/users/[id]
 * Get user by ID
 */
export const GET = withErrorHandler(
  async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const user = users.find((u) => u.id === id);

    if (!user) {
      return apiNotFound('User not found');
    }

    return apiSuccess(user, {
      headers: corsHeaders,
    });
  }
);

/**
 * PUT /api/users/[id]
 * Update user
 */
export const PUT = withErrorHandler(
  async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const user = users.find((u) => u.id === id);

    if (!user) {
      return apiNotFound('User not found');
    }

    // Parse and validate request body
    const body = await parseBody<{ name?: string; email?: string }>(request, {
      name: {
        required: false,
        min: 2,
        max: 50,
      },
      email: {
        required: false,
        pattern: patterns.email,
      },
    });

    // Update user fields
    if (body.name) user.name = body.name;
    if (body.email) user.email = body.email;

    return apiSuccess(user, {
      message: 'User updated successfully',
      headers: corsHeaders,
    });
  }
);

/**
 * DELETE /api/users/[id]
 * Delete user
 */
export const DELETE = withErrorHandler(
  async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const index = users.findIndex((u) => u.id === id);

    if (index === -1) {
      return apiNotFound('User not found');
    }

    users.splice(index, 1);

    return apiSuccess(
      { message: 'User deleted successfully' },
      {
        headers: corsHeaders,
      }
    );
  }
);

export async function OPTIONS() {
  return apiCorsPreflightResponse();
}
