import path from 'path';
import ora from 'ora';
import { executeFileOperations, type FileOperation } from '../base/files.js';
import { ensureDir, writeFile } from '../../utils/file-system.js';
import { compileTemplateFile } from '../base/templates.js';
import type { GenerationOptions, TemplateContext } from '../../types/config.js';
import { logger } from '../../utils/logger.js';

/**
 * Generate a web application
 */
export async function generateWebApp(options: GenerationOptions): Promise<void> {
  const { targetDir, templateContext } = options;

  logger.header(`Creating ${templateContext.projectName}`);

  try {
    // Create project directory
    await ensureDir(targetDir);

    // Generate configuration files
    await generateConfigFiles(targetDir, templateContext);

    // Generate source structure
    await generateSourceStructure(targetDir, templateContext);

    // Generate root files
    await generateRootFiles(targetDir, templateContext);

    // Generate documentation
    if (templateContext.linting || templateContext.formatting) {
      await generateDevTools(targetDir, templateContext);
    }

    logger.success(`\n✨ Project created successfully at ${targetDir}`);
    logger.newLine();

    // Print next steps
    printNextSteps(templateContext);
  } catch (error) {
    logger.error('Failed to generate project');
    throw error;
  }
}

/**
 * Generate configuration files
 */
async function generateConfigFiles(
  targetDir: string,
  context: TemplateContext
): Promise<void> {
  logger.section('Generating configuration files');

  const operations: FileOperation[] = [
    {
      type: 'template',
      source: 'web/config/package.json.hbs',
      destination: 'package.json',
      context,
    },
  ];

  if (context.typescript) {
    operations.push({
      type: 'template',
      source: 'web/config/tsconfig.json.hbs',
      destination: 'tsconfig.json',
      context,
    });
  }

  operations.push(
    {
      type: 'template',
      source: 'web/config/next.config.js.hbs',
      destination: 'next.config.js',
      context,
    },
    {
      type: 'copy',
      source: 'web/config/tailwind.config.js',
      destination: 'tailwind.config.js',
    },
    {
      type: 'copy',
      source: 'web/config/postcss.config.js',
      destination: 'postcss.config.js',
    }
  );

  if (context.linting) {
    operations.push({
      type: 'template',
      source: 'web/config/eslint.config.mjs.hbs',
      destination: 'eslint.config.mjs',
      context,
    });
  }

  if (context.gitHooks) {
    operations.push({
      type: 'copy',
      source: 'web/config/commitlint.config.js',
      destination: 'commitlint.config.js',
    });
  }

  await executeFileOperations(operations, targetDir, 'Configuration files');
}

/**
 * Generate source structure
 */
async function generateSourceStructure(
  targetDir: string,
  context: TemplateContext
): Promise<void> {
  logger.section('Generating source structure');

  const operations: FileOperation[] = [
    // App directory
    {
      type: 'template',
      source: 'web/src/app/layout.tsx.hbs',
      destination: 'src/app/layout.tsx',
      context,
    },
    {
      type: 'template',
      source: 'web/src/app/page.tsx.hbs',
      destination: 'src/app/page.tsx',
      context,
    },
    {
      type: 'copy',
      source: 'web/src/app/globals.css',
      destination: 'src/app/globals.css',
    },
    // Component directories
    {
      type: 'directory',
      source: '',
      destination: 'src/components/ui',
    },
    {
      type: 'directory',
      source: '',
      destination: 'src/components/features',
    },
    // Lib directory
    {
      type: 'directory',
      source: '',
      destination: 'src/lib',
    },
    // Hooks directory
    {
      type: 'directory',
      source: '',
      destination: 'src/hooks',
    },
    // Types directory
    {
      type: 'directory',
      source: '',
      destination: 'src/types',
    },
  ];

  // Add Firebase configuration files if backend is Firebase
  if (context.backend === 'firebase') {
    // Always add client SDK
    operations.push({
      type: 'template',
      source: 'web/lib/firebase-client.ts.hbs',
      destination: 'src/lib/firebase-client.ts',
      context,
    });

    // Add Admin SDK for server-first pattern
    if (context.firebasePattern === 'server-first') {
      operations.push({
        type: 'template',
        source: 'web/lib/firebase-admin.ts.hbs',
        destination: 'src/lib/firebase-admin.ts',
        context,
      });
    }
  }

  await executeFileOperations(operations, targetDir, 'Source structure');

  // Create placeholder files for empty directories
  const placeholderContent = `// Placeholder file
// Delete this file when you add your own files to this directory
export {};
`;

  await writeFile(path.join(targetDir, 'src/components/ui/index.ts'), placeholderContent);
  await writeFile(path.join(targetDir, 'src/hooks/index.ts'), placeholderContent);
  await writeFile(path.join(targetDir, 'src/types/index.ts'), placeholderContent);

  // Only create utils.ts placeholder if not using Firebase
  if (context.backend !== 'firebase') {
    await writeFile(path.join(targetDir, 'src/lib/utils.ts'), placeholderContent);
  }
}

/**
 * Generate root files (.gitignore, README, etc.)
 */
async function generateRootFiles(targetDir: string, context: TemplateContext): Promise<void> {
  logger.section('Generating documentation');

  const operations: FileOperation[] = [
    {
      type: 'template',
      source: 'web/root/_gitignore',
      destination: '.gitignore',
      context,
    },
    {
      type: 'template',
      source: 'web/root/README.md.hbs',
      destination: 'README.md',
      context,
    },
  ];

  if (context.formatting) {
    operations.push({
      type: 'copy',
      source: 'web/root/_prettierrc.json',
      destination: '.prettierrc.json',
    });
  }

  // Generate .env.example
  operations.push({
    type: 'template',
    source: 'web/root/_env.example.hbs',
    destination: '.env.example',
    context,
  });

  // Generate CLAUDE.md
  operations.push({
    type: 'template',
    source: 'web/root/CLAUDE.md.hbs',
    destination: 'CLAUDE.md',
    context,
  });

  // Create public directory
  operations.push({
    type: 'directory',
    source: '',
    destination: 'public',
  });

  await executeFileOperations(operations, targetDir, 'Documentation and root files');
}

/**
 * Generate dev tools setup (Husky, etc.)
 */
async function generateDevTools(targetDir: string, context: TemplateContext): Promise<void> {
  if (!context.gitHooks) return;

  logger.section('Setting up Git hooks');

  // Create .husky directory
  await ensureDir(path.join(targetDir, '.husky'));

  // Create pre-commit hook
  const preCommitContent = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
`;

  await writeFile(path.join(targetDir, '.husky/pre-commit'), preCommitContent);

  // Create commit-msg hook
  const commitMsgContent = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx --no -- commitlint --edit "$1"
`;

  await writeFile(path.join(targetDir, '.husky/commit-msg'), commitMsgContent);

  // Create lint-staged config in package.json
  // This will be done via package.json template

  logger.success('Git hooks configured');
}

/**
 * Print next steps
 */
function printNextSteps(context: TemplateContext): void {
  const { projectName, packageManager } = context;

  logger.header('🎯 Next steps:');

  console.log(`  1. cd ${projectName}`);

  const installCmd =
    packageManager === 'npm'
      ? 'npm install'
      : packageManager === 'yarn'
        ? 'yarn install'
        : packageManager === 'bun'
          ? 'bun install'
          : 'pnpm install';

  console.log(`  2. ${installCmd}`);

  const devCmd =
    packageManager === 'npm'
      ? 'npm run dev'
      : packageManager === 'yarn'
        ? 'yarn dev'
        : packageManager === 'bun'
          ? 'bun dev'
          : 'pnpm dev';

  console.log(`  3. ${devCmd}`);
  console.log(`  4. Open http://localhost:3000`);
  logger.newLine();

  logger.header('📖 Documentation:');
  console.log(`  • AI Instructions: CLAUDE.md`);
  console.log(`  • Quick Start: README.md`);
  logger.newLine();

  logger.tip('Pro tip: Check CLAUDE.md for AI agent guidance on this project');
  logger.newLine();
}
