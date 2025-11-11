import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { runCLI, createProject, validateGeneratedProject } from '../helpers/cli-runner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEST_OUTPUT_DIR = path.join(__dirname, '..', '..', 'test-output');

describe('CLI Create Command', () => {
  beforeEach(async () => {
    await fs.ensureDir(TEST_OUTPUT_DIR);
  });

  afterEach(async () => {
    if (await fs.pathExists(TEST_OUTPUT_DIR)) {
      await fs.remove(TEST_OUTPUT_DIR);
    }
  });

  describe('Success Scenarios', () => {
    it('should create project with valid name', async () => {
      const result = await runCLI(['create', 'valid-project-name', '--skip-install'], {
        cwd: TEST_OUTPUT_DIR,
        env: { CI: 'true' },
      });

      expect(result.exitCode).toBe(0);
      expect(result.failed).toBe(false);
      expect(result.stdout).toContain('Project created successfully');

      const projectPath = path.join(TEST_OUTPUT_DIR, 'valid-project-name');
      expect(await fs.pathExists(projectPath)).toBe(true);
    }, 60000);

    it('should skip npm install when --skip-install flag is provided', async () => {
      const result = await createProject('skip-install-test', {
        skipInstall: true,
        cwd: TEST_OUTPUT_DIR,
      });

      expect(result.exitCode).toBe(0);

      const projectPath = path.join(TEST_OUTPUT_DIR, 'skip-install-test');
      const nodeModulesPath = path.join(projectPath, 'node_modules');

      // node_modules should not exist when --skip-install is used
      expect(await fs.pathExists(nodeModulesPath)).toBe(false);
    }, 60000);

    it('should accept kebab-case project names', async () => {
      const result = await createProject('my-awesome-app', {
        skipInstall: true,
        cwd: TEST_OUTPUT_DIR,
      });

      expect(result.exitCode).toBe(0);
      expect(await fs.pathExists(path.join(TEST_OUTPUT_DIR, 'my-awesome-app'))).toBe(true);
    }, 60000);

    it('should accept snake_case project names', async () => {
      const result = await createProject('my_awesome_app', {
        skipInstall: true,
        cwd: TEST_OUTPUT_DIR,
      });

      expect(result.exitCode).toBe(0);
      expect(await fs.pathExists(path.join(TEST_OUTPUT_DIR, 'my_awesome_app'))).toBe(true);
    }, 60000);

    it('should reject camelCase project names', async () => {
      // npm package names cannot contain uppercase letters
      const result = await createProject('myAwesomeApp', {
        skipInstall: true,
        cwd: TEST_OUTPUT_DIR,
      });

      expect(result.exitCode).not.toBe(0);
      expect(result.failed).toBe(true);
    }, 60000);
  });

  describe('Error Scenarios', () => {
    it('should reject invalid project names', async () => {
      // Test a few representative invalid names
      const invalidNames = ['UPPERCASE', 'with spaces', '.startwithdot'];

      for (const name of invalidNames) {
        const result = await runCLI(['create', name, '--skip-install'], {
          cwd: TEST_OUTPUT_DIR,
        });

        expect(result.exitCode).not.toBe(0);
        expect(result.failed).toBe(true);
      }
    }, 60000);

    it('should reject when directory already exists', async () => {
      const projectName = 'existing-project';
      const projectPath = path.join(TEST_OUTPUT_DIR, projectName);

      // Create directory first
      await fs.ensureDir(projectPath);
      await fs.writeFile(path.join(projectPath, 'dummy.txt'), 'test');

      const result = await createProject(projectName, {
        skipInstall: true,
        cwd: TEST_OUTPUT_DIR,
      });

      expect(result.exitCode).not.toBe(0);
      expect(result.failed).toBe(true);
      // Error message could be in stdout or stderr
      const output = result.stdout + result.stderr;
      expect(output).toContain('already exists');
    }, 60000);

    it('should handle missing config file gracefully', async () => {
      const result = await createProject('test-app', {
        config: '/nonexistent/config.json',
        skipInstall: true,
        cwd: TEST_OUTPUT_DIR,
      });

      expect(result.exitCode).not.toBe(0);
      expect(result.failed).toBe(true);
    }, 60000);

    it('should handle invalid config file gracefully', async () => {
      // Create invalid config
      const invalidConfigPath = path.join(TEST_OUTPUT_DIR, 'invalid-config.json');
      await fs.writeFile(invalidConfigPath, '{ invalid json }');

      const result = await createProject('test-app', {
        config: invalidConfigPath,
        skipInstall: true,
        cwd: TEST_OUTPUT_DIR,
      });

      expect(result.exitCode).not.toBe(0);
      expect(result.failed).toBe(true);
    }, 60000);

    it.skip('should require project name argument', async () => {
      // Skipped: This test enters interactive mode which requires user input
      // TODO: Mock inquirer to test interactive mode properly
      const result = await runCLI(['create'], {
        cwd: TEST_OUTPUT_DIR,
      });

      expect(result.exitCode).not.toBe(0);
      expect(result.failed).toBe(true);
    }, 60000);
  });

  describe('File Structure Validation', () => {
    it('should create all essential Next.js files', async () => {
      await createProject('structure-test', {
        skipInstall: true,
        cwd: TEST_OUTPUT_DIR,
      });

      const projectPath = path.join(TEST_OUTPUT_DIR, 'structure-test');
      const essentialFiles = [
        'package.json',
        'tsconfig.json',
        'next.config.js',
        'tailwind.config.js',
        'postcss.config.js',
        '.gitignore',
        'README.md',
        'CLAUDE.md',
        'src/app/page.tsx',
        'src/app/layout.tsx',
        'src/app/globals.css',
        'src/app/loading.tsx',
        'src/app/error.tsx',
        'src/app/not-found.tsx',
        'src/components/layout/Header.tsx',
        'src/components/layout/Footer.tsx',
        'src/components/layout/Navigation.tsx',
        'src/components/ui/Button.tsx',
        'src/components/ui/Card.tsx',
      ];

      const validation = await validateGeneratedProject(projectPath, essentialFiles);
      expect(validation.valid).toBe(true);
      expect(validation.missingFiles).toEqual([]);
    }, 60000);

    it('should create proper directory structure', async () => {
      await createProject('dir-structure-test', {
        skipInstall: true,
        cwd: TEST_OUTPUT_DIR,
      });

      const projectPath = path.join(TEST_OUTPUT_DIR, 'dir-structure-test');
      const requiredDirs = [
        'src',
        'src/app',
        'src/components',
        'src/components/layout',
        'src/components/ui',
        'src/lib',
        'public',
      ];

      for (const dir of requiredDirs) {
        const dirPath = path.join(projectPath, dir);
        const exists = await fs.pathExists(dirPath);
        const stat = exists ? await fs.stat(dirPath) : null;
        expect(exists).toBe(true);
        expect(stat?.isDirectory()).toBe(true);
      }
    }, 60000);
  });
});
