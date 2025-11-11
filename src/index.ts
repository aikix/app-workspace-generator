#!/usr/bin/env node

import { Command } from 'commander';
import { createCommand } from './commands/create.js';
import { readFile } from './utils/file-system.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Main CLI entry point
 */
async function main() {
  const packageJsonPath = path.resolve(__dirname, '../package.json');
  const packageJson = JSON.parse(await readFile(packageJsonPath));

  const program = new Command();

  program
    .name('app-workspace-generator')
    .description('Generate production-ready web app workspaces with AI agent instructions')
    .version(packageJson.version);

  // Add create command
  program.addCommand(createCommand());

  // Parse arguments
  await program.parseAsync(process.argv);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
