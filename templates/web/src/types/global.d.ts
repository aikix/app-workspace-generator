/**
 * Global type definitions for the application
 */

// Extend global namespace if needed
declare global {
  // Add global types here
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      NEXT_PUBLIC_APP_URL?: string;
    }
  }
}

export {};
