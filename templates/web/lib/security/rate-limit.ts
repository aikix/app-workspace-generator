/**
 * Rate Limiting Utilities
 *
 * Provides rate limiting to prevent abuse and DDoS attacks.
 * Includes both in-memory (development) and Redis-based (production) rate limiters.
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  /**
   * Time window in milliseconds
   */
  windowMs: number;

  /**
   * Maximum number of requests per window
   */
  maxRequests: number;

  /**
   * Message to return when rate limit is exceeded
   */
  message?: string;

  /**
   * Status code to return when rate limit is exceeded
   */
  statusCode?: number;

  /**
   * Function to generate unique identifier for the request
   */
  keyGenerator?: (request: NextRequest) => string;
}

/**
 * In-memory rate limiter store
 * Note: This is suitable for development but not for production with multiple servers.
 * For production, use Redis-based rate limiting.
 */
class InMemoryStore {
  private store = new Map<string, { count: number; resetTime: number }>();

  constructor(private windowMs: number) {
    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  increment(key: string): { count: number; resetTime: number } {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetTime) {
      // Create new entry
      const resetTime = now + this.windowMs;
      const newEntry = { count: 1, resetTime };
      this.store.set(key, newEntry);
      return newEntry;
    }

    // Increment existing entry
    entry.count++;
    this.store.set(key, entry);
    return entry;
  }

  reset(key: string): void {
    this.store.delete(key);
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }

  get size(): number {
    return this.store.size;
  }
}

/**
 * Default key generator (uses IP address)
 */
function defaultKeyGenerator(request: NextRequest): string {
  // Try to get real IP from headers (for proxies/load balancers)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';

  return `rate-limit:${ip}`;
}

/**
 * Create a rate limiter
 *
 * @example
 * ```ts
 * // Create rate limiter (100 requests per 15 minutes)
 * const limiter = createRateLimiter({
 *   windowMs: 15 * 60 * 1000,
 *   maxRequests: 100,
 * });
 *
 * // Use in API route
 * export async function POST(request: NextRequest) {
 *   const rateLimitResult = await limiter(request);
 *   if (rateLimitResult) return rateLimitResult;
 *
 *   // Continue with request handling...
 * }
 * ```
 */
export function createRateLimiter(config: RateLimitConfig) {
  const {
    windowMs,
    maxRequests,
    message = 'Too many requests, please try again later',
    statusCode = 429,
    keyGenerator = defaultKeyGenerator,
  } = config;

  const store = new InMemoryStore(windowMs);

  return async (request: NextRequest): Promise<NextResponse | null> => {
    const key = keyGenerator(request);
    const { count, resetTime } = store.increment(key);

    // Add rate limit headers
    const headers = {
      'X-RateLimit-Limit': maxRequests.toString(),
      'X-RateLimit-Remaining': Math.max(0, maxRequests - count).toString(),
      'X-RateLimit-Reset': new Date(resetTime).toISOString(),
    };

    if (count > maxRequests) {
      return NextResponse.json(
        { error: message },
        {
          status: statusCode,
          headers: {
            ...headers,
            'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    return null; // Allow request
  };
}

/**
 * Pre-configured rate limiters for common scenarios
 */
export const RateLimiters = {
  /**
   * Strict rate limiter for authentication endpoints
   * 5 requests per 15 minutes
   */
  auth: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: 'Too many authentication attempts, please try again later',
  }),

  /**
   * Moderate rate limiter for API endpoints
   * 100 requests per 15 minutes
   */
  api: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
  }),

  /**
   * Lenient rate limiter for general requests
   * 1000 requests per 15 minutes
   */
  general: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 1000,
  }),

  /**
   * Very strict rate limiter for expensive operations
   * 3 requests per hour
   */
  expensive: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    message: 'Rate limit exceeded for this operation',
  }),
};

/**
 * Redis-based rate limiter for production use
 *
 * To use this, install: npm install ioredis
 * And set up Redis connection.
 *
 * @example
 * ```ts
 * import Redis from 'ioredis';
 *
 * const redis = new Redis(process.env.REDIS_URL);
 *
 * const limiter = createRedisRateLimiter({
 *   redis,
 *   windowMs: 15 * 60 * 1000,
 *   maxRequests: 100,
 * });
 * ```
 */
export function createRedisRateLimiter(
  config: RateLimitConfig & {
    redis: {
      incr: (key: string) => Promise<number>;
      expire: (key: string, seconds: number) => Promise<number>;
      ttl: (key: string) => Promise<number>;
    };
  }
) {
  const {
    redis,
    windowMs,
    maxRequests,
    message = 'Too many requests, please try again later',
    statusCode = 429,
    keyGenerator = defaultKeyGenerator,
  } = config;

  return async (request: NextRequest): Promise<NextResponse | null> => {
    const key = keyGenerator(request);
    const count = await redis.incr(key);

    if (count === 1) {
      // Set expiration on first request
      await redis.expire(key, Math.ceil(windowMs / 1000));
    }

    const ttl = await redis.ttl(key);
    const resetTime = Date.now() + ttl * 1000;

    // Add rate limit headers
    const headers = {
      'X-RateLimit-Limit': maxRequests.toString(),
      'X-RateLimit-Remaining': Math.max(0, maxRequests - count).toString(),
      'X-RateLimit-Reset': new Date(resetTime).toISOString(),
    };

    if (count > maxRequests) {
      return NextResponse.json(
        { error: message },
        {
          status: statusCode,
          headers: {
            ...headers,
            'Retry-After': ttl.toString(),
          },
        }
      );
    }

    return null; // Allow request
  };
}

/**
 * Rate limit by user ID (for authenticated requests)
 */
export function createUserRateLimiter(config: Omit<RateLimitConfig, 'keyGenerator'>) {
  return createRateLimiter({
    ...config,
    keyGenerator: (request) => {
      // Get user ID from your auth system
      // This is an example - adjust based on your auth implementation
      const userId = request.headers.get('x-user-id') || 'anonymous';
      return `rate-limit:user:${userId}`;
    },
  });
}

/**
 * Rate limit by specific header
 */
export function createHeaderRateLimiter(
  headerName: string,
  config: Omit<RateLimitConfig, 'keyGenerator'>
) {
  return createRateLimiter({
    ...config,
    keyGenerator: (request) => {
      const value = request.headers.get(headerName) || 'unknown';
      return `rate-limit:${headerName}:${value}`;
    },
  });
}

/**
 * Sliding window rate limiter (more accurate)
 *
 * Uses a sliding window algorithm instead of fixed window.
 * Prevents burst traffic at window boundaries.
 */
export function createSlidingWindowRateLimiter(config: RateLimitConfig) {
  const {
    windowMs,
    maxRequests,
    message = 'Too many requests, please try again later',
    statusCode = 429,
    keyGenerator = defaultKeyGenerator,
  } = config;

  const requestTimestamps = new Map<string, number[]>();

  return async (request: NextRequest): Promise<NextResponse | null> => {
    const key = keyGenerator(request);
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get existing timestamps for this key
    let timestamps = requestTimestamps.get(key) || [];

    // Remove timestamps outside the window
    timestamps = timestamps.filter((timestamp) => timestamp > windowStart);

    // Add current timestamp
    timestamps.push(now);
    requestTimestamps.set(key, timestamps);

    const count = timestamps.length;
    const resetTime = timestamps[0] + windowMs;

    // Clean up old entries periodically
    if (Math.random() < 0.01) {
      for (const [k, ts] of requestTimestamps.entries()) {
        if (ts.every((t) => t < windowStart)) {
          requestTimestamps.delete(k);
        }
      }
    }

    // Add rate limit headers
    const headers = {
      'X-RateLimit-Limit': maxRequests.toString(),
      'X-RateLimit-Remaining': Math.max(0, maxRequests - count).toString(),
      'X-RateLimit-Reset': new Date(resetTime).toISOString(),
    };

    if (count > maxRequests) {
      return NextResponse.json(
        { error: message },
        {
          status: statusCode,
          headers: {
            ...headers,
            'Retry-After': Math.ceil((resetTime - now) / 1000).toString(),
          },
        }
      );
    }

    return null; // Allow request
  };
}

/**
 * Usage examples in API routes
 */

// Example 1: Protect auth endpoint
// export async function POST(request: NextRequest) {
//   const rateLimitResult = await RateLimiters.auth(request);
//   if (rateLimitResult) return rateLimitResult;
//
//   // Handle login...
// }

// Example 2: Custom rate limiter
// const uploadLimiter = createRateLimiter({
//   windowMs: 60 * 1000, // 1 minute
//   maxRequests: 5,
//   message: 'Too many uploads, please wait',
// });
//
// export async function POST(request: NextRequest) {
//   const rateLimitResult = await uploadLimiter(request);
//   if (rateLimitResult) return rateLimitResult;
//
//   // Handle upload...
// }

// Example 3: User-specific rate limiting
// const userLimiter = createUserRateLimiter({
//   windowMs: 15 * 60 * 1000,
//   maxRequests: 100,
// });
