import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // Test environment
    environment: 'node',

    // Global test timeout
    testTimeout: 60000, // 60 seconds for E2E tests

    // Include patterns
    include: ['tests/**/*.test.ts'],

    // Exclude patterns
    exclude: ['node_modules', 'dist', 'templates', '**/generated-test-*/**'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules',
        'dist',
        'tests',
        'templates',
        '**/*.config.*',
        '**/types/**',
        'bin/**',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },

    // Setup files
    setupFiles: ['./tests/setup.ts'],

    // Global variables
    globals: true,

    // Pool options for better isolation
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: false,
      },
    },
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tests': path.resolve(__dirname, './tests'),
    },
  },
});
