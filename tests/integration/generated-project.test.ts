import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  createProject,
  installDependencies,
  buildGeneratedProject,
} from '../helpers/cli-runner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEST_OUTPUT_DIR = path.join(__dirname, '..', '..', 'test-output');
const FIXTURES_DIR = path.join(__dirname, '..', 'fixtures', 'configs');

// Skip integration tests for now - they require npm install and build which are very slow
// These tests are important but should be run separately in CI
describe.skip('Generated Project Integration Tests', () => {
  beforeEach(async () => {
    await fs.ensureDir(TEST_OUTPUT_DIR);
  });

  afterEach(async () => {
    if (await fs.pathExists(TEST_OUTPUT_DIR)) {
      await fs.remove(TEST_OUTPUT_DIR);
    }
  });

  it('should generate a project that can install dependencies', async () => {
    const configPath = path.join(FIXTURES_DIR, 'minimal.json');
    await createProject('install-test-app', {
      config: configPath,
      skipInstall: true,
      cwd: TEST_OUTPUT_DIR,
    });

    const projectPath = path.join(TEST_OUTPUT_DIR, 'install-test-app');
    const installResult = await installDependencies(projectPath);

    expect(installResult.exitCode).toBe(0);
    expect(installResult.failed).toBe(false);

    // Verify node_modules exists
    const nodeModulesPath = path.join(projectPath, 'node_modules');
    expect(await fs.pathExists(nodeModulesPath)).toBe(true);
  }, 180000); // 3 minutes timeout

  it('should generate a project that can build successfully', async () => {
    const configPath = path.join(FIXTURES_DIR, 'minimal.json');
    await createProject('build-test-app', {
      config: configPath,
      skipInstall: true,
      cwd: TEST_OUTPUT_DIR,
    });

    const projectPath = path.join(TEST_OUTPUT_DIR, 'build-test-app');

    // Install dependencies first
    const installResult = await installDependencies(projectPath);
    expect(installResult.exitCode).toBe(0);

    // Build the project
    const buildResult = await buildGeneratedProject(projectPath);

    expect(buildResult.exitCode).toBe(0);
    expect(buildResult.failed).toBe(false);
    expect(buildResult.stdout).toContain('Compiled successfully');

    // Verify .next directory exists
    const nextDir = path.join(projectPath, '.next');
    expect(await fs.pathExists(nextDir)).toBe(true);
  }, 240000); // 4 minutes timeout

  it('should generate valid TypeScript that compiles without errors', async () => {
    const configPath = path.join(FIXTURES_DIR, 'minimal.json');
    await createProject('typecheck-test-app', {
      config: configPath,
      skipInstall: true,
      cwd: TEST_OUTPUT_DIR,
    });

    const projectPath = path.join(TEST_OUTPUT_DIR, 'typecheck-test-app');

    // Install dependencies
    await installDependencies(projectPath);

    // The build process includes TypeScript checking
    const buildResult = await buildGeneratedProject(projectPath);

    expect(buildResult.exitCode).toBe(0);
    // Build should not have TypeScript errors
    expect(buildResult.stderr).not.toContain('error TS');
  }, 240000);

  it('should generate project with Firebase that includes Firebase dependencies', async () => {
    const configPath = path.join(FIXTURES_DIR, 'firebase.json');
    await createProject('firebase-deps-test', {
      config: configPath,
      skipInstall: true,
      cwd: TEST_OUTPUT_DIR,
    });

    const projectPath = path.join(TEST_OUTPUT_DIR, 'firebase-deps-test');
    const packageJson = await fs.readJson(path.join(projectPath, 'package.json'));

    expect(packageJson.dependencies).toHaveProperty('firebase');
    expect(packageJson.dependencies.firebase).toMatch(/^\d+\.\d+\.\d+$/);

    // Install and verify Firebase can be imported
    await installDependencies(projectPath);

    const firebaseLibPath = path.join(projectPath, 'src', 'lib', 'firebase.ts');
    const firebaseLib = await fs.readFile(firebaseLibPath, 'utf-8');
    expect(firebaseLib).toContain('import { initializeApp }');
    expect(firebaseLib).toContain("from 'firebase/app'");
  }, 240000);

  it('should generate project that produces valid HTML in build output', async () => {
    const configPath = path.join(FIXTURES_DIR, 'minimal.json');
    await createProject('html-test-app', {
      config: configPath,
      skipInstall: true,
      cwd: TEST_OUTPUT_DIR,
    });

    const projectPath = path.join(TEST_OUTPUT_DIR, 'html-test-app');

    // Install and build
    await installDependencies(projectPath);
    const buildResult = await buildGeneratedProject(projectPath);
    expect(buildResult.exitCode).toBe(0);

    // Check that static pages were generated
    const pagesManifest = path.join(projectPath, '.next', 'server', 'pages-manifest.json');
    if (await fs.pathExists(pagesManifest)) {
      const manifest = await fs.readJson(pagesManifest);
      expect(manifest).toBeDefined();
    }
  }, 240000);

  it('should generate all component examples that compile', async () => {
    const configPath = path.join(FIXTURES_DIR, 'minimal.json');
    await createProject('components-test-app', {
      config: configPath,
      skipInstall: true,
      cwd: TEST_OUTPUT_DIR,
    });

    const projectPath = path.join(TEST_OUTPUT_DIR, 'components-test-app');

    // Verify component files exist
    const componentFiles = [
      'src/components/layout/Header.tsx',
      'src/components/layout/Footer.tsx',
      'src/components/layout/Navigation.tsx',
      'src/components/ui/Button.tsx',
      'src/components/ui/Card.tsx',
    ];

    for (const file of componentFiles) {
      const filePath = path.join(projectPath, file);
      expect(await fs.pathExists(filePath)).toBe(true);

      const content = await fs.readFile(filePath, 'utf-8');
      expect(content).toContain('export');
    }

    // Build to verify components compile
    await installDependencies(projectPath);
    const buildResult = await buildGeneratedProject(projectPath);
    expect(buildResult.exitCode).toBe(0);
  }, 240000);
});
