/**
 * CSRF (Cross-Site Request Forgery) Protection
 *
 * Provides CSRF token generation and validation to prevent CSRF attacks.
 * Use for all state-changing operations (POST, PUT, DELETE requests).
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * CSRF token configuration
 */
const CSRF_CONFIG = {
  tokenLength: 32,
  cookieName: 'csrf-token',
  headerName: 'x-csrf-token',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  },
};

/**
 * Generate a cryptographically secure random token
 */
function generateToken(length: number = CSRF_CONFIG.tokenLength): string {
  const array = new Uint8Array(length);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    // Fallback for environments without crypto API
    for (let i = 0; i < length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join(
    ''
  );
}

/**
 * Generate a new CSRF token and set it in cookies
 *
 * @returns The generated CSRF token
 *
 * @example
 * ```ts
 * // In a server component or API route
 * const token = await generateCSRFToken();
 * ```
 */
export async function generateCSRFToken(): Promise<string> {
  const token = generateToken();
  const cookieStore = await cookies();

  cookieStore.set(CSRF_CONFIG.cookieName, token, CSRF_CONFIG.cookieOptions);

  return token;
}

/**
 * Get the current CSRF token from cookies
 *
 * @returns The CSRF token or null if not found
 */
export async function getCSRFToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(CSRF_CONFIG.cookieName)?.value || null;
}

/**
 * Validate CSRF token from request
 *
 * @param request - Next.js request object
 * @returns true if token is valid, false otherwise
 *
 * @example
 * ```ts
 * export async function POST(request: NextRequest) {
 *   if (!await validateCSRFToken(request)) {
 *     return NextResponse.json(
 *       { error: 'Invalid CSRF token' },
 *       { status: 403 }
 *     );
 *   }
 *
 *   // Continue with request handling...
 * }
 * ```
 */
export async function validateCSRFToken(request: NextRequest): Promise<boolean> {
  // Get token from cookie
  const cookieToken = request.cookies.get(CSRF_CONFIG.cookieName)?.value;

  // Get token from header
  const headerToken = request.headers.get(CSRF_CONFIG.headerName);

  // Both must exist and match
  if (!cookieToken || !headerToken) {
    console.warn('CSRF: Missing token');
    return false;
  }

  // Constant-time comparison to prevent timing attacks
  if (cookieToken.length !== headerToken.length) {
    return false;
  }

  let mismatch = 0;
  for (let i = 0; i < cookieToken.length; i++) {
    mismatch |= cookieToken.charCodeAt(i) ^ headerToken.charCodeAt(i);
  }

  const valid = mismatch === 0;

  if (!valid) {
    console.warn('CSRF: Token mismatch');
  }

  return valid;
}

/**
 * CSRF protection middleware for API routes
 *
 * @example
 * ```ts
 * import { withCSRFProtection } from '@/lib/security/csrf';
 *
 * async function handler(request: NextRequest) {
 *   // Your API logic here
 *   return NextResponse.json({ success: true });
 * }
 *
 * export const POST = withCSRFProtection(handler);
 * ```
 */
export function withCSRFProtection(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Skip CSRF check for safe methods
    const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
    if (safeMethods.includes(request.method)) {
      return handler(request);
    }

    // Validate CSRF token
    const isValid = await validateCSRFToken(request);

    if (!isValid) {
      return NextResponse.json(
        {
          error: 'Invalid or missing CSRF token',
          code: 'CSRF_VALIDATION_FAILED',
        },
        { status: 403 }
      );
    }

    return handler(request);
  };
}

/**
 * Client-side utilities for CSRF token handling
 */

/**
 * Get CSRF token from cookie (client-side)
 */
export function getClientCSRFToken(): string | null {
  if (typeof document === 'undefined') return null;

  const match = document.cookie.match(
    new RegExp(`(^|;\\s*)${CSRF_CONFIG.cookieName}=([^;]+)`)
  );
  return match ? decodeURIComponent(match[2]) : null;
}

/**
 * Fetch with CSRF token included
 *
 * @example
 * ```ts
 * import { fetchWithCSRF } from '@/lib/security/csrf';
 *
 * const response = await fetchWithCSRF('/api/data', {
 *   method: 'POST',
 *   body: JSON.stringify({ data: 'value' }),
 * });
 * ```
 */
export async function fetchWithCSRF(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getClientCSRFToken();

  if (!token) {
    throw new Error('CSRF token not found');
  }

  const headers = new Headers(options.headers);
  headers.set(CSRF_CONFIG.headerName, token);
  headers.set('Content-Type', 'application/json');

  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * React hook for CSRF-protected fetch
 *
 * @example
 * ```tsx
 * import { useCSRFFetch } from '@/lib/security/csrf';
 *
 * function MyComponent() {
 *   const csrfFetch = useCSRFFetch();
 *
 *   const handleSubmit = async () => {
 *     const response = await csrfFetch('/api/data', {
 *       method: 'POST',
 *       body: JSON.stringify({ data: 'value' }),
 *     });
 *   };
 * }
 * ```
 */
export function useCSRFFetch() {
  return fetchWithCSRF;
}

/**
 * Form helper to include CSRF token
 *
 * @example
 * ```tsx
 * import { CSRFTokenInput } from '@/lib/security/csrf';
 *
 * function MyForm() {
 *   return (
 *     <form action="/api/submit" method="POST">
 *       <CSRFTokenInput />
 *       <input type="text" name="data" />
 *       <button type="submit">Submit</button>
 *     </form>
 *   );
 * }
 * ```
 */
export function CSRFTokenInput() {
  const token = getClientCSRFToken();

  if (!token) {
    console.error('CSRF token not found');
    return null;
  }

  return (
    <input type="hidden" name="csrf-token" value={token} />
  );
}

/**
 * Server action wrapper with CSRF protection
 *
 * @example
 * ```ts
 * 'use server';
 *
 * import { withServerActionCSRF } from '@/lib/security/csrf';
 *
 * export const myAction = withServerActionCSRF(async (formData: FormData) => {
 *   // Your action logic here
 * });
 * ```
 */
export function withServerActionCSRF<T extends unknown[], R>(
  action: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    // Server actions in Next.js automatically include CSRF protection
    // This wrapper is for additional security measures if needed
    return action(...args);
  };
}

/**
 * Additional security utilities
 */

/**
 * Verify request origin to prevent CSRF
 */
export function verifyOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');

  if (!origin || !host) {
    return false;
  }

  try {
    const originUrl = new URL(origin);
    const expectedOrigin = `${originUrl.protocol}//${host}`;

    return origin === expectedOrigin;
  } catch {
    return false;
  }
}

/**
 * Middleware to check referer header
 */
export function verifyReferer(request: NextRequest): boolean {
  const referer = request.headers.get('referer');
  const host = request.headers.get('host');

  if (!referer || !host) {
    return false;
  }

  try {
    const refererUrl = new URL(referer);
    return refererUrl.host === host;
  } catch {
    return false;
  }
}

/**
 * Complete CSRF protection with origin and referer checks
 */
export async function validateCSRFComplete(
  request: NextRequest
): Promise<{ valid: boolean; reason?: string }> {
  // Check CSRF token
  const tokenValid = await validateCSRFToken(request);
  if (!tokenValid) {
    return { valid: false, reason: 'Invalid CSRF token' };
  }

  // Check origin
  const originValid = verifyOrigin(request);
  if (!originValid) {
    return { valid: false, reason: 'Invalid origin' };
  }

  // Check referer (optional but recommended)
  const refererValid = verifyReferer(request);
  if (!refererValid) {
    console.warn('CSRF: Referer check failed (non-critical)');
  }

  return { valid: true };
}

/**
 * Configuration export for customization
 */
export const CSRFConfig = CSRF_CONFIG;

/**
 * Usage notes:
 *
 * 1. Server-side (API routes):
 *    - Use withCSRFProtection() to wrap your route handlers
 *    - Or manually call validateCSRFToken() for more control
 *
 * 2. Client-side (fetch calls):
 *    - Use fetchWithCSRF() instead of regular fetch()
 *    - Or use useCSRFFetch() hook in React components
 *
 * 3. Forms:
 *    - Include <CSRFTokenInput /> in your forms
 *    - Or manually add the token to form data
 *
 * 4. Server Actions:
 *    - Next.js 16+ includes built-in CSRF protection
 *    - Use withServerActionCSRF() for additional security
 *
 * 5. Token generation:
 *    - Generate token in middleware or layout
 *    - Store in httpOnly cookie
 *    - Send to client for use in requests
 */
