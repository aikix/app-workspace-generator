#!/usr/bin/env node

/**
 * CLI entry point for app-workspace-generator
 *
 * This file serves as the bin entry point and delegates to the compiled TypeScript.
 * For development, it uses tsx to run the TypeScript directly.
 * For production (after npm publish), it runs the compiled JavaScript.
 */

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check if we're in development (no dist folder) or production (dist folder exists)
const distPath = resolve(__dirname, '../dist/index.js');
const srcPath = resolve(__dirname, '../src/index.ts');

if (existsSync(distPath)) {
  // Production: use compiled JavaScript
  await import(distPath);
} else {
  // Development: use tsx to run TypeScript directly
  const { register } = await import('tsx/esm/api');
  register();
  await import(srcPath);
}
