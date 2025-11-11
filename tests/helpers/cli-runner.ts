import { execa } from 'execa';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CLI_PATH = path.join(__dirname, '..', '..', 'bin', 'cli.js');

export interface CLIRunOptions {
  cwd?: string;
  env?: Record<string, string>;
  input?: string;
  timeout?: number;
}

export interface CLIResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  failed: boolean;
}

/**
 * Run the CLI with given arguments
 */
export async function runCLI(args: string[], options: CLIRunOptions = {}): Promise<CLIResult> {
  const { cwd = process.cwd(), env = {}, input, timeout = 60000 } = options;

  try {
    const result = await execa('node', [CLI_PATH, ...args], {
      cwd,
      env: {
        ...process.env,
        ...env,
        // Disable interactive prompts by default
        CI: 'true',
      },
      input,
      timeout,
      reject: false,
    });

    return {
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: result.exitCode,
      failed: result.failed,
    };
  } catch (error: unknown) {
    const err = error as { stdout?: string; stderr?: string; exitCode?: number };
    return {
      stdout: err.stdout || '',
      stderr: err.stderr || '',
      exitCode: err.exitCode || 1,
      failed: true,
    };
  }
}

/**
 * Create a project using the CLI
 */
export async function createProject(
  projectName: string,
  options: {
    config?: string;
    skipInstall?: boolean;
    cwd?: string;
  } = {}
): Promise<CLIResult> {
  const args = ['create'];

  // Only add project name if not using config file
  // Config file mode reads name from the config
  if (!options.config) {
    args.push(projectName);
  }

  if (options.config) {
    args.push('--config', options.config);
  }

  if (options.skipInstall) {
    args.push('--skip-install');
  }

  return runCLI(args, { cwd: options.cwd });
}

/**
 * Check if generated project has required files
 */
export async function validateGeneratedProject(
  projectPath: string,
  expectedFiles: string[]
): Promise<{ valid: boolean; missingFiles: string[] }> {
  const missingFiles: string[] = [];

  for (const file of expectedFiles) {
    const filePath = path.join(projectPath, file);
    if (!(await fs.pathExists(filePath))) {
      missingFiles.push(file);
    }
  }

  return {
    valid: missingFiles.length === 0,
    missingFiles,
  };
}

/**
 * Build a generated project
 */
export async function buildGeneratedProject(projectPath: string): Promise<CLIResult> {
  try {
    const result = await execa('npm', ['run', 'build'], {
      cwd: projectPath,
      timeout: 120000, // 2 minutes for build
      reject: false,
    });

    return {
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: result.exitCode,
      failed: result.failed,
    };
  } catch (error: unknown) {
    const err = error as { stdout?: string; stderr?: string; exitCode?: number };
    return {
      stdout: err.stdout || '',
      stderr: err.stderr || '',
      exitCode: err.exitCode || 1,
      failed: true,
    };
  }
}

/**
 * Install dependencies in a generated project
 */
export async function installDependencies(projectPath: string): Promise<CLIResult> {
  try {
    const result = await execa('npm', ['install', '--silent'], {
      cwd: projectPath,
      timeout: 120000, // 2 minutes for install
      reject: false,
    });

    return {
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: result.exitCode,
      failed: result.failed,
    };
  } catch (error: unknown) {
    const err = error as { stdout?: string; stderr?: string; exitCode?: number };
    return {
      stdout: err.stdout || '',
      stderr: err.stderr || '',
      exitCode: err.exitCode || 1,
      failed: true,
    };
  }
}
