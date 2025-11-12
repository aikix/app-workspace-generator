/**
 * Input Sanitization Utilities
 *
 * Provides sanitization utilities to prevent XSS attacks and other injection vulnerabilities.
 * Always sanitize user-generated content before rendering or storing.
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitization configuration presets
 */
const SANITIZE_CONFIG = {
  /**
   * Strict: Remove all HTML tags
   */
  strict: {
    ALLOWED_TAGS: [] as string[],
    ALLOWED_ATTR: [] as string[],
    KEEP_CONTENT: true,
  },

  /**
   * Basic: Allow only safe formatting tags
   */
  basic: {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'p', 'br'],
    ALLOWED_ATTR: [] as string[],
  },

  /**
   * Rich: Allow common rich text tags
   */
  rich: {
    ALLOWED_TAGS: [
      'b',
      'i',
      'em',
      'strong',
      'u',
      'p',
      'br',
      'ul',
      'ol',
      'li',
      'a',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'blockquote',
      'code',
      'pre',
    ],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
  },

  /**
   * HTML: Allow most HTML tags (still removes dangerous content)
   */
  html: {
    ALLOWED_TAGS: [
      'a',
      'abbr',
      'address',
      'article',
      'aside',
      'b',
      'blockquote',
      'br',
      'caption',
      'cite',
      'code',
      'col',
      'colgroup',
      'dd',
      'del',
      'details',
      'div',
      'dl',
      'dt',
      'em',
      'figcaption',
      'figure',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'hr',
      'i',
      'img',
      'ins',
      'kbd',
      'li',
      'mark',
      'ol',
      'p',
      'pre',
      'q',
      'rp',
      'rt',
      'ruby',
      's',
      'samp',
      'section',
      'small',
      'span',
      'strong',
      'sub',
      'summary',
      'sup',
      'table',
      'tbody',
      'td',
      'tfoot',
      'th',
      'thead',
      'time',
      'tr',
      'u',
      'ul',
      'var',
      'wbr',
    ],
    ALLOWED_ATTR: [
      'href',
      'src',
      'alt',
      'title',
      'width',
      'height',
      'class',
      'id',
      'style',
      'target',
      'rel',
    ],
  },
};

/**
 * Sanitize HTML content to prevent XSS attacks
 *
 * @param dirty - Untrusted HTML string
 * @param config - Sanitization config preset or custom config
 * @returns Sanitized HTML string safe for rendering
 *
 * @example
 * ```ts
 * // Remove all HTML
 * const text = sanitizeHTML(userInput, 'strict');
 *
 * // Allow basic formatting
 * const formatted = sanitizeHTML(userInput, 'basic');
 *
 * // Allow rich text
 * const richText = sanitizeHTML(userInput, 'rich');
 *
 * // Custom config
 * const custom = sanitizeHTML(userInput, {
 *   ALLOWED_TAGS: ['p', 'b'],
 *   ALLOWED_ATTR: []
 * });
 * ```
 */
export function sanitizeHTML(
  dirty: string,
  config: keyof typeof SANITIZE_CONFIG | DOMPurify.Config = 'basic'
): string {
  if (!dirty) return '';

  const sanitizeConfig =
    typeof config === 'string' ? SANITIZE_CONFIG[config] : config;

  return DOMPurify.sanitize(dirty, sanitizeConfig);
}

/**
 * Sanitize text by removing all HTML and dangerous characters
 *
 * @param text - Untrusted text input
 * @returns Plain text with HTML removed
 *
 * @example
 * ```ts
 * const safe = sanitizeText('<script>alert("xss")</script>Hello');
 * // Returns: "Hello"
 * ```
 */
export function sanitizeText(text: string): string {
  return sanitizeHTML(text, 'strict');
}

/**
 * Sanitize URL to prevent javascript: and data: URIs
 *
 * @param url - Untrusted URL
 * @returns Safe URL or empty string if dangerous
 *
 * @example
 * ```ts
 * const safe = sanitizeURL('https://example.com'); // OK
 * const blocked = sanitizeURL('javascript:alert(1)'); // Returns ''
 * ```
 */
export function sanitizeURL(url: string): string {
  if (!url) return '';

  const trimmed = url.trim().toLowerCase();

  // Block dangerous protocols
  const dangerousProtocols = [
    'javascript:',
    'data:',
    'vbscript:',
    'file:',
    'about:',
  ];

  for (const protocol of dangerousProtocols) {
    if (trimmed.startsWith(protocol)) {
      console.warn(`Blocked dangerous URL protocol: ${protocol}`);
      return '';
    }
  }

  return url;
}

/**
 * Sanitize filename to prevent directory traversal and command injection
 *
 * @param filename - Untrusted filename
 * @returns Safe filename
 *
 * @example
 * ```ts
 * const safe = sanitizeFilename('../../etc/passwd');
 * // Returns: 'etc_passwd'
 * ```
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return '';

  return (
    filename
      // Remove directory traversal
      .replace(/\.\./g, '')
      .replace(/[/\\]/g, '')
      // Remove null bytes
      .replace(/\0/g, '')
      // Remove shell special characters
      .replace(/[;&|`$(){}[\]<>]/g, '')
      // Replace spaces with underscores
      .replace(/\s+/g, '_')
      // Remove leading dots
      .replace(/^\.+/, '')
      // Limit length
      .slice(0, 255)
  );
}

/**
 * Sanitize SQL input (basic - prefer parameterized queries)
 *
 * This is a defense-in-depth measure. Always use parameterized queries or ORMs.
 *
 * @param input - Untrusted SQL input
 * @returns Escaped input
 */
export function sanitizeSQL(input: string): string {
  if (!input) return '';

  return input
    .replace(/'/g, "''") // Escape single quotes
    .replace(/\\/g, '\\\\') // Escape backslashes
    .replace(/\0/g, '') // Remove null bytes
    .replace(/\n/g, '\\n') // Escape newlines
    .replace(/\r/g, '\\r'); // Escape carriage returns
}

/**
 * Sanitize JSON to prevent JSON injection
 *
 * @param obj - Object to sanitize
 * @returns Sanitized JSON string
 */
export function sanitizeJSON(obj: unknown): string {
  try {
    // Use JSON.stringify which handles escaping
    return JSON.stringify(obj);
  } catch (error) {
    console.error('Failed to sanitize JSON:', error);
    return '{}';
  }
}

/**
 * Escape HTML entities for safe rendering in HTML context
 *
 * @param text - Text to escape
 * @returns Escaped text safe for HTML
 *
 * @example
 * ```tsx
 * <div>{escapeHTML(userInput)}</div>
 * ```
 */
export function escapeHTML(text: string): string {
  if (!text) return '';

  const entities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return text.replace(/[&<>"'/]/g, (char) => entities[char] || char);
}

/**
 * Sanitize object by sanitizing all string values
 *
 * @param obj - Object with potentially unsafe string values
 * @param config - Sanitization config
 * @returns Object with sanitized values
 *
 * @example
 * ```ts
 * const safe = sanitizeObject({
 *   name: '<script>alert(1)</script>John',
 *   bio: '<b>Developer</b>'
 * }, 'strict');
 * ```
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  config: keyof typeof SANITIZE_CONFIG | DOMPurify.Config = 'strict'
): T {
  const sanitized = { ...obj };

  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeHTML(sanitized[key] as string, config) as T[Extract<keyof T, string>];
    } else if (
      typeof sanitized[key] === 'object' &&
      sanitized[key] !== null &&
      !Array.isArray(sanitized[key])
    ) {
      sanitized[key] = sanitizeObject(
        sanitized[key] as Record<string, unknown>,
        config
      ) as T[Extract<keyof T, string>];
    }
  }

  return sanitized;
}

/**
 * Check if string contains potential XSS vectors
 *
 * @param input - String to check
 * @returns true if potentially dangerous
 */
export function containsXSS(input: string): boolean {
  if (!input) return false;

  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // Event handlers like onclick=
    /<iframe[^>]*>/gi,
    /<object[^>]*>/gi,
    /<embed[^>]*>/gi,
    /data:text\/html/gi,
  ];

  return xssPatterns.some((pattern) => pattern.test(input));
}

/**
 * Sanitization utilities for forms
 */
export const FormSanitization = {
  /**
   * Sanitize form data before submission
   */
  sanitizeFormData(data: Record<string, unknown>): Record<string, unknown> {
    return sanitizeObject(data, 'strict');
  },

  /**
   * Sanitize and validate email
   */
  sanitizeEmail(email: string): string {
    return sanitizeText(email).toLowerCase().trim();
  },

  /**
   * Sanitize display name
   */
  sanitizeName(name: string): string {
    return sanitizeText(name).trim();
  },

  /**
   * Sanitize rich text content (allows formatting)
   */
  sanitizeRichText(html: string): string {
    return sanitizeHTML(html, 'rich');
  },
};

/**
 * Security headers for API responses
 */
export const SecurityHeaders = {
  /**
   * Get security headers for API responses
   */
  getHeaders(): HeadersInit {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    };
  },

  /**
   * Apply security headers to Response
   */
  applyToResponse(response: Response): Response {
    const headers = this.getHeaders();
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  },
};
