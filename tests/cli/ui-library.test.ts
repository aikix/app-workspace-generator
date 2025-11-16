import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { createProject, validateGeneratedProject } from '../helpers/cli-runner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEST_OUTPUT_DIR = path.join(__dirname, '..', '..', 'test-output');
const FIXTURES_DIR = path.join(__dirname, '..', 'fixtures', 'configs');

describe('CLI UI Library Options', () => {
  beforeEach(async () => {
    await fs.ensureDir(TEST_OUTPUT_DIR);
  });

  afterEach(async () => {
    if (await fs.pathExists(TEST_OUTPUT_DIR)) {
      await fs.remove(TEST_OUTPUT_DIR);
    }
  });

  describe('shadcn/ui option', () => {
    it('should generate project with shadcn/ui configuration', async () => {
      const configPath = path.join(FIXTURES_DIR, 'shadcn-ui.json');
      const result = await createProject('shadcn-test-app', {
        config: configPath,
        skipInstall: true,
        cwd: TEST_OUTPUT_DIR,
      });

      expect(result.exitCode).toBe(0);
      expect(result.failed).toBe(false);

      const projectPath = path.join(TEST_OUTPUT_DIR, 'shadcn-test-app');
      expect(await fs.pathExists(projectPath)).toBe(true);

      // Verify base files exist
      const validation = await validateGeneratedProject(projectPath, [
        'package.json',
        'tsconfig.json',
        'next.config.js',
        'tailwind.config.js',
        'src/app/page.tsx',
        'src/app/layout.tsx',
      ]);

      expect(validation.valid).toBe(true);
      expect(validation.missingFiles).toEqual([]);
    }, 60000);

    it('should have correct package.json metadata for shadcn/ui', async () => {
      const configPath = path.join(FIXTURES_DIR, 'shadcn-ui.json');
      await createProject('unused', {
        config: configPath,
        skipInstall: true,
        cwd: TEST_OUTPUT_DIR,
      });

      const projectPath = path.join(TEST_OUTPUT_DIR, 'shadcn-test-app');
      const packageJson = await fs.readJson(path.join(projectPath, 'package.json'));

      expect(packageJson.name).toBe('shadcn-test-app');
      expect(packageJson.description).toBe('Test app with shadcn/ui');
      expect(packageJson.dependencies).toHaveProperty('next');
      expect(packageJson.dependencies).toHaveProperty('react');
      expect(packageJson.devDependencies).toHaveProperty('tailwindcss');
    }, 60000);
  });

  describe('Radix UI option', () => {
    it('should generate project with Radix UI configuration', async () => {
      const configPath = path.join(FIXTURES_DIR, 'radix-ui.json');
      const result = await createProject('radix-test-app', {
        config: configPath,
        skipInstall: true,
        cwd: TEST_OUTPUT_DIR,
      });

      expect(result.exitCode).toBe(0);
      expect(result.failed).toBe(false);

      const projectPath = path.join(TEST_OUTPUT_DIR, 'radix-test-app');
      expect(await fs.pathExists(projectPath)).toBe(true);

      // Verify base files exist
      const validation = await validateGeneratedProject(projectPath, [
        'package.json',
        'tsconfig.json',
        'next.config.js',
        'tailwind.config.js',
        'src/app/page.tsx',
        'src/app/layout.tsx',
      ]);

      expect(validation.valid).toBe(true);
      expect(validation.missingFiles).toEqual([]);
    }, 60000);

    it('should have correct package.json metadata for Radix UI', async () => {
      const configPath = path.join(FIXTURES_DIR, 'radix-ui.json');
      await createProject('unused', {
        config: configPath,
        skipInstall: true,
        cwd: TEST_OUTPUT_DIR,
      });

      const projectPath = path.join(TEST_OUTPUT_DIR, 'radix-test-app');
      const packageJson = await fs.readJson(path.join(projectPath, 'package.json'));

      expect(packageJson.name).toBe('radix-test-app');
      expect(packageJson.description).toBe('Test app with Radix UI');
      expect(packageJson.dependencies).toHaveProperty('next');
      expect(packageJson.dependencies).toHaveProperty('react');
      expect(packageJson.devDependencies).toHaveProperty('tailwindcss');
    }, 60000);
  });

  describe('None option (default)', () => {
    it('should generate project with no UI library (using minimal config)', async () => {
      const configPath = path.join(FIXTURES_DIR, 'minimal.json');
      const result = await createProject('minimal-test-app', {
        config: configPath,
        skipInstall: true,
        cwd: TEST_OUTPUT_DIR,
      });

      expect(result.exitCode).toBe(0);
      expect(result.failed).toBe(false);

      const projectPath = path.join(TEST_OUTPUT_DIR, 'minimal-test-app');
      const packageJson = await fs.readJson(path.join(projectPath, 'package.json'));

      // Should not have UI library dependencies (just base Next.js + Tailwind)
      expect(packageJson.dependencies).toHaveProperty('next');
      expect(packageJson.dependencies).toHaveProperty('react');
      expect(packageJson.devDependencies).toHaveProperty('tailwindcss');

      // Verify it's using "none" for UI (by checking package.json doesn't have extra UI libs)
      expect(packageJson.dependencies).not.toHaveProperty('@radix-ui/react-dialog');
      expect(packageJson.dependencies).not.toHaveProperty('class-variance-authority');
    }, 60000);
  });

  describe('Config validation', () => {
    it('should accept valid UI library values in config', async () => {
      const validConfigs = ['shadcn-ui.json', 'radix-ui.json', 'minimal.json'];

      for (const configFile of validConfigs) {
        const configPath = path.join(FIXTURES_DIR, configFile);
        const config = await fs.readJson(configPath);

        // Verify ui value is one of the accepted types
        expect(['shadcn', 'radix', 'none']).toContain(config.web.ui);
      }
    });
  });
});
