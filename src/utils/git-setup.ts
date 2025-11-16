/**
 * Git and GitHub Setup Utilities
 *
 * Automates repository initialization and branch setup using git and gh CLI.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { logger } from './logger.js';

const execAsync = promisify(exec);

/**
 * Check if a command is available on the system
 */
async function isCommandAvailable(command: string): Promise<boolean> {
  try {
    await execAsync(`${command} --version`);
    return true;
  } catch {
    return false;
  }
}

/**
 * Setup Git repository with develop and main branches
 * Optionally creates GitHub repository if gh CLI is available
 */
export async function setupGitBranches(projectDir: string, projectName: string): Promise<void> {
  logger.section('Setting up Git repository');

  // Check if git is available
  const hasGit = await isCommandAvailable('git');
  if (!hasGit) {
    logger.warning('Git is not installed. Skipping repository setup.');
    logger.info('Install Git: https://git-scm.com/downloads');
    return;
  }

  try {
    // Initialize git repository
    await execAsync('git init', { cwd: projectDir });
    logger.success('Initialized Git repository');

    // Create develop branch
    await execAsync('git checkout -b develop', { cwd: projectDir });
    logger.success('Created develop branch');

    // Initial commit
    await execAsync('git add .', { cwd: projectDir });
    await execAsync('git commit -m "chore: initial commit"', { cwd: projectDir });
    logger.success('Created initial commit');

    // Create main branch
    await execAsync('git checkout -b main', { cwd: projectDir });
    logger.success('Created main branch');

    // Switch back to develop
    await execAsync('git checkout develop', { cwd: projectDir });
    logger.success('Switched to develop branch');

    // Check if gh CLI is available
    const hasGhCli = await isCommandAvailable('gh');
    if (!hasGhCli) {
      logger.warning('GitHub CLI (gh) not installed. Skipping GitHub repository creation.');
      logger.info('To create GitHub repository manually:');
      logger.info('  1. Install gh CLI: brew install gh (Mac) or https://cli.github.com');
      logger.info('  2. Run: gh auth login');
      logger.info(`  3. Run: gh repo create ${projectName} --source . --private --push`);
      return;
    }

    // Check if authenticated with GitHub
    try {
      await execAsync('gh auth status', { cwd: projectDir });
    } catch {
      logger.warning('Not authenticated with GitHub CLI.');
      logger.info('To create GitHub repository:');
      logger.info('  1. Run: gh auth login');
      logger.info(`  2. Run: gh repo create ${projectName} --source . --private --push`);
      return;
    }

    // Create GitHub repository
    logger.info('Creating GitHub repository...');
    try {
      await execAsync(`gh repo create ${projectName} --source . --private --push`, {
        cwd: projectDir,
      });
      logger.success('GitHub repository created and pushed');

      // Set develop as default branch
      await execAsync('gh repo edit --default-branch develop', { cwd: projectDir });
      logger.success('Set develop as default branch');

      // Push main branch
      await execAsync('git push -u origin main', { cwd: projectDir });
      logger.success('Pushed main branch to GitHub');

      logger.success('✓ Git and GitHub setup complete!');
      logger.info(
        `Repository: https://github.com/$(gh repo view --json owner -q .owner.login)/${projectName}`
      );
    } catch (_error) {
      logger.warning('Failed to create GitHub repository automatically.');
      logger.info('You can create it manually later using:');
      logger.info(`  gh repo create ${projectName} --source . --private --push`);
    }
  } catch (error) {
    logger.error('Git setup failed');
    if (error instanceof Error) {
      logger.error(error.message);
    }
    logger.info('You can initialize the repository manually later.');
  }
}
