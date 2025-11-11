/**
 * Logout API Route
 *
 * Example logout endpoint
 * @route POST /api/auth/logout
 */

import {
  apiSuccess,
  withErrorHandler,
  createCookie,
  corsHeaders,
  apiCorsPreflightResponse,
} from '@/lib/api';

/**
 * POST /api/auth/logout
 * Invalidate user session
 */
export const POST = withErrorHandler(async (request: Request) => {
  // In a real application, you would:
  // 1. Get session token from cookie or header
  // 2. Invalidate session in database/redis
  // 3. Clear session cookie

  // Clear session cookie
  const cookie = createCookie('session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0, // Expire immediately
    path: '/',
  });

  const headers = new Headers(corsHeaders);
  headers.append('Set-Cookie', cookie);

  return apiSuccess(
    { message: 'Logged out successfully' },
    {
      headers,
    }
  );
});

export async function OPTIONS() {
  return apiCorsPreflightResponse();
}
