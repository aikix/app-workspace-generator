/**
 * API Middleware
 *
 * Common middleware utilities for API routes
 */

import { UnauthorizedError, ForbiddenError, RateLimitError } from './errors';

/**
 * Extract bearer token from Authorization header
 *
 * @example
 * const token = getBearerToken(request);
 * if (!token) throw new UnauthorizedError();
 */
export function getBearerToken(request: Request): string | null {
  const authorization = request.headers.get('Authorization');
  if (!authorization) return null;

  const [type, token] = authorization.split(' ');
  if (type !== 'Bearer' || !token) return null;

  return token;
}

/**
 * Verify API key from header
 *
 * @example
 * verifyApiKey(request, process.env.API_KEY);
 */
export function verifyApiKey(request: Request, expectedKey?: string): void {
  if (!expectedKey) {
    throw new Error('API_KEY not configured');
  }

  const apiKey = request.headers.get('X-API-Key');
  if (!apiKey || apiKey !== expectedKey) {
    throw new UnauthorizedError('Invalid API key');
  }
}

/**
 * Simple in-memory rate limiter (for development/testing)
 * In production, use a proper rate limiting service like Upstash or Redis
 *
 * @example
 * const rateLimiter = createRateLimiter({ maxRequests: 10, windowMs: 60000 });
 * await rateLimiter.check(request);
 */
export function createRateLimiter(options: {
  maxRequests: number;
  windowMs: number;
}) {
  const requests = new Map<string, number[]>();

  return {
    check: async (request: Request) => {
      // Use IP address or a header as identifier
      const identifier =
        request.headers.get('X-Forwarded-For') ||
        request.headers.get('X-Real-IP') ||
        'unknown';

      const now = Date.now();
      const timestamps = requests.get(identifier) || [];

      // Remove expired timestamps
      const validTimestamps = timestamps.filter(
        (ts) => now - ts < options.windowMs
      );

      if (validTimestamps.length >= options.maxRequests) {
        const oldestTimestamp = validTimestamps[0]!;
        const retryAfter = Math.ceil((oldestTimestamp + options.windowMs - now) / 1000);

        throw new RateLimitError('Rate limit exceeded', retryAfter);
      }

      validTimestamps.push(now);
      requests.set(identifier, validTimestamps);

      // Cleanup old entries periodically
      if (requests.size > 1000) {
        for (const [key, timestamps] of requests.entries()) {
          const validTimestamps = timestamps.filter(
            (ts) => now - ts < options.windowMs
          );
          if (validTimestamps.length === 0) {
            requests.delete(key);
          } else {
            requests.set(key, validTimestamps);
          }
        }
      }
    },
  };
}

/**
 * Check if request method is allowed
 *
 * @example
 * ensureMethod(request, ['GET', 'POST']);
 */
export function ensureMethod(
  request: Request,
  allowedMethods: string[]
): void {
  if (!allowedMethods.includes(request.method)) {
    throw new ForbiddenError(
      `Method ${request.method} not allowed. Allowed methods: ${allowedMethods.join(', ')}`
    );
  }
}

/**
 * Parse request cookies
 *
 * @example
 * const cookies = parseCookies(request);
 * const sessionId = cookies.get('sessionId');
 */
export function parseCookies(request: Request): Map<string, string> {
  const cookieHeader = request.headers.get('Cookie');
  const cookies = new Map<string, string>();

  if (!cookieHeader) return cookies;

  cookieHeader.split(';').forEach((cookie) => {
    const [name, ...rest] = cookie.split('=');
    const value = rest.join('=').trim();
    if (name && value) {
      cookies.set(name.trim(), decodeURIComponent(value));
    }
  });

  return cookies;
}

/**
 * Create a cookie header
 *
 * @example
 * const headers = new Headers();
 * headers.append('Set-Cookie', createCookie('sessionId', 'abc123', {
 *   httpOnly: true,
 *   secure: true,
 *   sameSite: 'lax',
 *   maxAge: 3600
 * }));
 */
export function createCookie(
  name: string,
  value: string,
  options?: {
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
    maxAge?: number;
    path?: string;
    domain?: string;
  }
): string {
  let cookie = `${name}=${encodeURIComponent(value)}`;

  if (options?.httpOnly) cookie += '; HttpOnly';
  if (options?.secure) cookie += '; Secure';
  if (options?.sameSite) cookie += `; SameSite=${options.sameSite}`;
  if (options?.maxAge) cookie += `; Max-Age=${options.maxAge}`;
  if (options?.path) cookie += `; Path=${options.path}`;
  if (options?.domain) cookie += `; Domain=${options.domain}`;

  return cookie;
}

/**
 * Get client IP address
 *
 * @example
 * const ip = getClientIp(request);
 */
export function getClientIp(request: Request): string {
  return (
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
    request.headers.get('X-Real-IP') ||
    'unknown'
  );
}

/**
 * Check if request is from localhost
 *
 * @example
 * if (isLocalhost(request)) {
 *   // Allow access without auth for local development
 * }
 */
export function isLocalhost(request: Request): boolean {
  const ip = getClientIp(request);
  return ip === '127.0.0.1' || ip === '::1' || ip === 'localhost';
}
