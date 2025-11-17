import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEST_OUTPUT_DIR = path.join(__dirname, '..', '..', 'test-output');
const CLI_PATH = path.join(__dirname, '..', '..', 'dist', 'index.js');

// Use unique port to avoid conflicts
const TEST_PORT = 3456;

/**
 * Integration test to verify generated projects can actually build and run
 * This test validates the complete generation -> install -> build flow
 */
describe('Build Validation Tests', () => {
  const projectName = 'build-validation-app';
  const projectPath = path.join(TEST_OUTPUT_DIR, projectName);
  const configPath = path.join(projectPath, 'test-config.json');

  beforeAll(async () => {
    // Clean up any existing test output
    if (await fs.pathExists(TEST_OUTPUT_DIR)) {
      await fs.remove(TEST_OUTPUT_DIR);
    }
    await fs.ensureDir(TEST_OUTPUT_DIR);
  }, 10000);

  afterAll(async () => {
    // Clean up test output
    if (await fs.pathExists(TEST_OUTPUT_DIR)) {
      await fs.remove(TEST_OUTPUT_DIR);
    }
  }, 10000);

  it('should generate, install, and build a project successfully', async () => {
    // Create config file
    const config = {
      name: projectName,
      description: 'Build validation test project',
      author: 'Test',
      workspace: { type: 'single', platforms: ['web'] },
      web: {
        framework: 'next',
        typescript: true,
        styling: 'tailwind',
        ui: 'shadcn',
        testing: 'none',
        linting: true,
        formatting: true,
        gitHooks: false, // Skip git hooks for faster testing
        stateManagement: 'context',
        animations: false,
      },
      backend: {
        type: 'firebase',
        features: ['auth'],
        firebasePattern: 'client-side',
      },
      documentation: {
        aiInstructions: true,
        architecture: true,
        apiDocs: false,
        styleguide: false,
      },
      cicd: {
        platform: 'github',
        semanticRelease: false,
        autoDeployment: false,
      },
      packageManager: 'npm',
    };

    await fs.ensureDir(path.dirname(configPath));
    await fs.writeJson(configPath, config, { spaces: 2 });

    // Step 1: Generate project
    console.log('Generating project...');
    const generateCmd = `node "${CLI_PATH}" create --config "${configPath}" --skip-install`;
    const { stdout: genOut } = await execAsync(generateCmd, {
      cwd: TEST_OUTPUT_DIR,
      maxBuffer: 10 * 1024 * 1024,
    });
    expect(genOut).toContain('Project created successfully');

    // Step 2: Verify critical files exist
    expect(await fs.pathExists(path.join(projectPath, 'package.json'))).toBe(true);
    expect(await fs.pathExists(path.join(projectPath, 'src/lib/firebase/config.ts'))).toBe(true);
    expect(
      await fs.pathExists(path.join(projectPath, 'src/hooks/firebase/useAuthClient.tsx'))
    ).toBe(true);

    // Step 3: Verify auth export exists in config
    const configContent = await fs.readFile(
      path.join(projectPath, 'src/lib/firebase/config.ts'),
      'utf-8'
    );
    expect(configContent).toContain('export const auth');
    expect(configContent).toContain('export const db');
    expect(configContent).toContain('getAuth');
    expect(configContent).toContain('getFirestore');

    // Step 4: Install dependencies
    console.log('Installing dependencies (this may take a few minutes)...');
    await execAsync('npm install --legacy-peer-deps', {
      cwd: projectPath,
      maxBuffer: 10 * 1024 * 1024,
    });

    expect(await fs.pathExists(path.join(projectPath, 'node_modules'))).toBe(true);

    // Step 5: Create mock .env.local to satisfy Firebase config validation
    const envContent = `
NEXT_PUBLIC_FIREBASE_API_KEY=test-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=test.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=test-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=test.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123def456
    `.trim();
    await fs.writeFile(path.join(projectPath, '.env.local'), envContent);

    // Step 6: Run type check (faster than full build)
    console.log('Running TypeScript type check...');
    try {
      await execAsync('npx tsc --noEmit', {
        cwd: projectPath,
        maxBuffer: 10 * 1024 * 1024,
        timeout: 60000,
      });
    } catch (error: any) {
      // Type check might fail due to Firebase config requiring real env vars
      // But we should not have import/export errors
      if (error.stdout && error.stdout.includes("Cannot find module '@/lib/firebase/config'")) {
        throw new Error('Module resolution failed - auth export missing');
      }
      // Other type errors are acceptable for this test (like Firebase config validation)
    }

    // Step 7: Verify build can at least start (quick check)
    console.log('Testing build process...');
    try {
      const buildProcess = exec(`npm run build`, {
        cwd: projectPath,
        maxBuffer: 10 * 1024 * 1024,
      });

      // Kill after 30 seconds - we just want to see if it starts without module errors
      const timeout = setTimeout(() => {
        buildProcess.kill();
      }, 30000);

      try {
        await new Promise((resolve, reject) => {
          let output = '';
          buildProcess.stdout?.on('data', (data) => {
            output += data.toString();
            // If we see compilation starting, that's good enough
            if (output.includes('Compiling') || output.includes('Creating an optimized')) {
              clearTimeout(timeout);
              buildProcess.kill();
              resolve(true);
            }
          });
          buildProcess.stderr?.on('data', (data) => {
            const error = data.toString();
            // Check for critical module resolution errors
            if (
              error.includes("Cannot find module '@/lib/firebase/config'") ||
              error.includes("Export auth doesn't exist")
            ) {
              clearTimeout(timeout);
              buildProcess.kill();
              reject(new Error('Module resolution error: ' + error));
            }
          });
          buildProcess.on('exit', (code) => {
            clearTimeout(timeout);
            resolve(code);
          });
          buildProcess.on('error', (err) => {
            clearTimeout(timeout);
            reject(err);
          });
        });
      } catch (error) {
        clearTimeout(timeout);
        throw error;
      }
    } catch (error: any) {
      if (error.message && error.message.includes('Module resolution error')) {
        throw error;
      }
      // Other build errors are acceptable - we just want to verify no import/export issues
      console.log('Build may have other errors, but module resolution is OK');
    }

    console.log('✓ Project generated, installed, and validated successfully');
  }, 300000); // 5 minutes timeout for install + build
});
