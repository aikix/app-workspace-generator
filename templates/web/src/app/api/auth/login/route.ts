/**
 * Login API Route
 *
 * Example authentication endpoint
 * @route POST /api/auth/login
 */

import {
  apiSuccess,
  apiError,
  withErrorHandler,
  parseBody,
  patterns,
  createCookie,
  corsHeaders,
  apiCorsPreflightResponse,
} from '@/lib/api';

/**
 * POST /api/auth/login
 * Authenticate user and create session
 */
export const POST = withErrorHandler(async (request: Request) => {
  // Parse and validate credentials
  const body = await parseBody<{ email: string; password: string }>(request, {
    email: {
      required: true,
      pattern: patterns.email,
    },
    password: {
      required: true,
      min: 8,
    },
  });

  // In a real application, you would:
  // 1. Query database for user
  // 2. Verify password hash
  // 3. Create session token (JWT, session ID, etc.)
  // 4. Store session in database/redis

  // Mock authentication (DO NOT use in production)
  if (body.password !== 'password123') {
    return apiError('Invalid credentials', {
      code: 'INVALID_CREDENTIALS',
      status: 401,
    });
  }

  // Generate session token (in production, use proper JWT library)
  const sessionToken = `session_${Date.now()}_${Math.random().toString(36)}`;

  // Create secure cookie
  const cookie = createCookie('session', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });

  const headers = new Headers(corsHeaders);
  headers.append('Set-Cookie', cookie);

  return apiSuccess(
    {
      user: {
        id: 'user_1',
        email: body.email,
        name: 'Demo User',
      },
      sessionToken, // In production, don't send this in response
    },
    {
      message: 'Login successful',
      headers,
    }
  );
});

export async function OPTIONS() {
  return apiCorsPreflightResponse();
}
