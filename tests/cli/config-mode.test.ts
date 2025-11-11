import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  createProject,
  validateGeneratedProject,
  installDependencies,
  buildGeneratedProject,
} from '../helpers/cli-runner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEST_OUTPUT_DIR = path.join(__dirname, '..', '..', 'test-output');
const FIXTURES_DIR = path.join(__dirname, '..', 'fixtures', 'configs');

describe('CLI Config File Mode', () => {
  beforeEach(async () => {
    await fs.ensureDir(TEST_OUTPUT_DIR);
  });

  afterEach(async () => {
    // Clean up test projects
    if (await fs.pathExists(TEST_OUTPUT_DIR)) {
      await fs.remove(TEST_OUTPUT_DIR);
    }
  });

  it('should generate project with minimal config', async () => {
    const configPath = path.join(FIXTURES_DIR, 'minimal.json');
    const result = await createProject('minimal-test-app', {
      config: configPath,
      skipInstall: true,
      cwd: TEST_OUTPUT_DIR,
    });

    expect(result.exitCode).toBe(0);
    expect(result.failed).toBe(false);

    const projectPath = path.join(TEST_OUTPUT_DIR, 'minimal-test-app');
    expect(await fs.pathExists(projectPath)).toBe(true);

    // Verify required files exist
    const validation = await validateGeneratedProject(projectPath, [
      'package.json',
      'tsconfig.json',
      'next.config.js',
      'tailwind.config.js',
      'src/app/page.tsx',
      'src/app/layout.tsx',
      'src/app/globals.css',
      'README.md',
      'CLAUDE.md',
    ]);

    expect(validation.valid).toBe(true);
    expect(validation.missingFiles).toEqual([]);
  }, 60000);

  it('should generate project with full features config', async () => {
    const configPath = path.join(FIXTURES_DIR, 'full-features.json');
    const result = await createProject('full-features-app', {
      config: configPath,
      skipInstall: true,
      cwd: TEST_OUTPUT_DIR,
    });

    if (result.exitCode !== 0) {
      console.log('STDOUT:', result.stdout);
      console.log('STDERR:', result.stderr);
    }

    expect(result.exitCode).toBe(0);
    expect(result.failed).toBe(false);

    const projectPath = path.join(TEST_OUTPUT_DIR, 'full-features-app');
    expect(await fs.pathExists(projectPath)).toBe(true);

    // Verify base files (use .js not .ts for tailwind)
    const validation = await validateGeneratedProject(projectPath, [
      'package.json',
      'tsconfig.json',
      'next.config.js',
      'tailwind.config.js',
      'src/app/page.tsx',
      'src/app/layout.tsx',
    ]);

    if (!validation.valid) {
      console.log('Missing files:', validation.missingFiles);
    }

    expect(validation.valid).toBe(true);
  }, 60000);

  it.skip('should generate project with Firebase backend', async () => {
    // TODO: Firebase integration files not yet implemented
    const configPath = path.join(FIXTURES_DIR, 'firebase.json');
    const result = await createProject('firebase-test-app', {
      config: configPath,
      skipInstall: true,
      cwd: TEST_OUTPUT_DIR,
    });

    expect(result.exitCode).toBe(0);
    expect(result.failed).toBe(false);

    const projectPath = path.join(TEST_OUTPUT_DIR, 'firebase-test-app');

    // Verify Firebase-specific files
    const validation = await validateGeneratedProject(projectPath, [
      'package.json',
      'src/lib/firebase.ts',
      '.env.local.example',
    ]);

    if (!validation.valid) {
      console.log('Missing files:', validation.missingFiles);
      console.log('Project path:', projectPath);
    }

    expect(validation.valid).toBe(true);

    // Verify package.json contains Firebase dependencies
    const packageJson = await fs.readJson(path.join(projectPath, 'package.json'));
    expect(packageJson.dependencies).toHaveProperty('firebase');
  }, 60000);

  it('should generate valid TypeScript configuration', async () => {
    const configPath = path.join(FIXTURES_DIR, 'minimal.json');
    await createProject('unused', {
      config: configPath,
      skipInstall: true,
      cwd: TEST_OUTPUT_DIR,
    });

    // Config file specifies project name as 'minimal-test-app'
    const projectPath = path.join(TEST_OUTPUT_DIR, 'minimal-test-app');
    const tsconfigPath = path.join(projectPath, 'tsconfig.json');

    expect(await fs.pathExists(tsconfigPath)).toBe(true);

    const tsconfig = await fs.readJson(tsconfigPath);
    expect(tsconfig.compilerOptions).toBeDefined();
    expect(tsconfig.compilerOptions.strict).toBe(true);
    expect(tsconfig.compilerOptions.target).toBeDefined();
  }, 60000);

  it('should generate valid Next.js configuration', async () => {
    const configPath = path.join(FIXTURES_DIR, 'minimal.json');
    await createProject('unused', {
      config: configPath,
      skipInstall: true,
      cwd: TEST_OUTPUT_DIR,
    });

    // Config file specifies project name as 'minimal-test-app'
    const projectPath = path.join(TEST_OUTPUT_DIR, 'minimal-test-app');
    const nextConfigPath = path.join(projectPath, 'next.config.js');

    expect(await fs.pathExists(nextConfigPath)).toBe(true);

    const nextConfigContent = await fs.readFile(nextConfigPath, 'utf-8');
    expect(nextConfigContent).toContain('reactStrictMode');
    expect(nextConfigContent).toContain('turbopack');
  }, 60000);

  it('should create valid package.json with correct metadata', async () => {
    const configPath = path.join(FIXTURES_DIR, 'minimal.json');
    await createProject('unused', {
      config: configPath,
      skipInstall: true,
      cwd: TEST_OUTPUT_DIR,
    });

    // Config file specifies project name as 'minimal-test-app'
    const projectPath = path.join(TEST_OUTPUT_DIR, 'minimal-test-app');
    const packageJson = await fs.readJson(path.join(projectPath, 'package.json'));

    expect(packageJson.name).toBe('minimal-test-app');
    expect(packageJson.description).toBe('Minimal test application');
    expect(packageJson.author).toBe('Test Author');
    expect(packageJson.scripts).toHaveProperty('dev');
    expect(packageJson.scripts).toHaveProperty('build');
    expect(packageJson.scripts).toHaveProperty('start');
    expect(packageJson.dependencies).toHaveProperty('next');
    expect(packageJson.dependencies).toHaveProperty('react');
  }, 60000);
});
