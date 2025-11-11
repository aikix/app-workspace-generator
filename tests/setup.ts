import { beforeAll, afterAll } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test output directory for generated projects
export const TEST_OUTPUT_DIR = path.join(__dirname, '..', 'test-output');

// Cleanup before all tests
beforeAll(async () => {
  // Ensure test output directory exists
  await fs.ensureDir(TEST_OUTPUT_DIR);
});

// Cleanup after all tests
afterAll(async () => {
  // Clean up test output directory
  if (await fs.pathExists(TEST_OUTPUT_DIR)) {
    await fs.remove(TEST_OUTPUT_DIR);
  }
});
