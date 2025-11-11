/**
 * Users API Route
 *
 * Example CRUD endpoints for users
 * @route GET /api/users - List users
 * @route POST /api/users - Create user
 */

import {
  apiSuccess,
  apiError,
  withErrorHandler,
  parseBody,
  validateQuery,
  patterns,
  corsHeaders,
  apiCorsPreflightResponse,
} from '@/lib/api';

// Mock data store (replace with database in production)
const users: Array<{ id: string; name: string; email: string }> = [];

/**
 * GET /api/users
 * List users with optional pagination
 */
export const GET = withErrorHandler(async (request: Request) => {
  const { searchParams } = new URL(request.url);

  // Validate query parameters
  validateQuery(searchParams, {
    page: {
      required: false,
      custom: (value) =>
        value === undefined || (Number(value) > 0 && !isNaN(Number(value))),
    },
    limit: {
      required: false,
      custom: (value) =>
        value === undefined ||
        (Number(value) > 0 && Number(value) <= 100 && !isNaN(Number(value))),
    },
  });

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = (page - 1) * limit;

  const paginatedUsers = users.slice(offset, offset + limit);

  return apiSuccess(
    {
      users: paginatedUsers,
      pagination: {
        page,
        limit,
        total: users.length,
        totalPages: Math.ceil(users.length / limit),
      },
    },
    {
      headers: corsHeaders,
    }
  );
});

/**
 * POST /api/users
 * Create a new user
 */
export const POST = withErrorHandler(async (request: Request) => {
  // Parse and validate request body
  const body = await parseBody<{ name: string; email: string }>(request, {
    name: {
      required: true,
      min: 2,
      max: 50,
    },
    email: {
      required: true,
      pattern: patterns.email,
    },
  });

  // Check if email already exists
  if (users.some((u) => u.email === body.email)) {
    return apiError('User with this email already exists', {
      code: 'DUPLICATE_EMAIL',
      status: 409,
    });
  }

  // Create new user
  const newUser = {
    id: `user_${Date.now()}`,
    name: body.name,
    email: body.email,
  };

  users.push(newUser);

  return apiSuccess(newUser, {
    status: 201,
    message: 'User created successfully',
    headers: corsHeaders,
  });
});

export async function OPTIONS() {
  return apiCorsPreflightResponse();
}
