/**
 * Prerequisites Checker
 *
 * Verifies that all required tools are installed before generation
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { logger } from './logger.js';

const execAsync = promisify(exec);

export interface PrerequisiteCheck {
  name: string;
  command: string;
  required: boolean;
  installInstructions: string[];
}

const PREREQUISITES: PrerequisiteCheck[] = [
  {
    name: 'Git',
    command: 'git --version',
    required: true,
    installInstructions: [
      'Visit: https://git-scm.com/downloads',
      'Or use your package manager:',
      '  macOS: brew install git',
      '  Ubuntu: sudo apt install git',
    ],
  },
  {
    name: 'Node.js',
    command: 'node --version',
    required: true,
    installInstructions: [
      'Visit: https://nodejs.org/',
      'Or use nvm: https://github.com/nvm-sh/nvm',
    ],
  },
  {
    name: 'GitHub CLI (gh)',
    command: 'gh --version',
    required: true,
    installInstructions: [
      'Install: npm install -g gh',
      'Or visit: https://cli.github.com/',
      'Then authenticate: gh auth login',
    ],
  },
  {
    name: 'Firebase CLI',
    command: 'firebase --version',
    required: true,
    installInstructions: [
      'Install: npm install -g firebase-tools',
      'Or visit: https://firebase.google.com/docs/cli',
      'Then authenticate: firebase login',
    ],
  },
];

/**
 * Check if a tool is installed
 */
async function checkTool(prerequisite: PrerequisiteCheck): Promise<boolean> {
  try {
    await execAsync(prerequisite.command);
    return true;
  } catch {
    return false;
  }
}

/**
 * Verify all prerequisites are met
 */
export async function checkPrerequisites(): Promise<boolean> {
  logger.section('Checking Prerequisites');

  const results: { name: string; installed: boolean; required: boolean }[] = [];
  let allRequiredMet = true;

  for (const prereq of PREREQUISITES) {
    const installed = await checkTool(prereq);
    results.push({ name: prereq.name, installed, required: prereq.required });

    if (installed) {
      logger.success(`✓ ${prereq.name}`);
    } else {
      if (prereq.required) {
        logger.error(`✗ ${prereq.name} (required)`);
        allRequiredMet = false;
      } else {
        logger.warning(`✗ ${prereq.name} (optional)`);
      }
    }
  }

  if (!allRequiredMet) {
    logger.info('');
    logger.error('Missing required tools!');
    logger.info('');

    for (const prereq of PREREQUISITES) {
      const result = results.find((r) => r.name === prereq.name);
      if (result && !result.installed && result.required) {
        logger.info(`${prereq.name}:`);
        prereq.installInstructions.forEach((instruction) => {
          logger.info(`  ${instruction}`);
        });
        logger.info('');
      }
    }

    return false;
  }

  logger.success('All prerequisites met!');
  logger.info('');
  return true;
}
