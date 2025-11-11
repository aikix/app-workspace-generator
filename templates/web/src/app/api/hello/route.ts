/**
 * Hello API Route
 *
 * Simple example GET endpoint
 * @route GET /api/hello
 */

import { apiSuccess, apiCorsPreflightResponse, corsHeaders } from '@/lib/api';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name') || 'World';

  return apiSuccess(
    {
      message: `Hello, ${name}!`,
      timestamp: new Date().toISOString(),
    },
    {
      headers: corsHeaders,
    }
  );
}

export async function OPTIONS() {
  return apiCorsPreflightResponse();
}
