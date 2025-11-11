/**
 * Utility types for the application
 */

/**
 * Standard API response wrapper
 */
export type ApiResponse<T = unknown> = {
  success: true;
  data: T;
} | {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
};

/**
 * Async function return type
 */
export type AsyncReturnType<T extends (...args: unknown[]) => Promise<unknown>> = T extends (
  ...args: unknown[]
) => Promise<infer R>
  ? R
  : never;

/**
 * Make specific properties optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make specific properties required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Extract promise type
 */
export type Awaited<T> = T extends Promise<infer U> ? U : T;

/**
 * Deep partial type
 */
export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

/**
 * Value of an object/array
 */
export type ValueOf<T> = T[keyof T];

/**
 * Nullable type
 */
export type Nullable<T> = T | null;

/**
 * Optional type
 */
export type Optional<T> = T | undefined;

/**
 * Maybe type (null or undefined)
 */
export type Maybe<T> = T | null | undefined;
