import path from 'path';
import { executeFileOperations, type FileOperation } from '../base/files.js';
import { ensureDir, writeFile } from '../../utils/file-system.js';
import type { GenerationOptions, TemplateContext } from '../../types/config.js';
import { logger } from '../../utils/logger.js';
import { setupGitBranches } from '../../utils/git-setup.js';

/**
 * Generate a web application
 */
export async function generateWebApp(options: GenerationOptions): Promise<void> {
  const { targetDir, templateContext } = options;
  const startTime = Date.now();
  let totalFiles = 0;

  // Print banner
  logger.banner();

  logger.header(`Creating ${templateContext.projectName}`);

  try {
    // Step 1: Create project directory
    logger.stepIndicator(1, 6, 'Creating project directory');
    await ensureDir(targetDir);
    logger.success('Project directory created');
    totalFiles++;

    // Step 2: Generate configuration files
    logger.stepIndicator(2, 6, 'Generating configuration files');
    const configCount = await generateConfigFiles(targetDir, templateContext);
    logger.fileCount(configCount, 'configuration files created');
    totalFiles += configCount;

    // Step 3: Generate source structure
    logger.stepIndicator(3, 6, 'Generating source structure');
    const sourceCount = await generateSourceStructure(targetDir, templateContext);
    logger.fileCount(sourceCount, 'source files created');
    totalFiles += sourceCount;

    // Step 4: Generate root files
    logger.stepIndicator(4, 6, 'Generating documentation and root files');
    const rootCount = await generateRootFiles(targetDir, templateContext);
    logger.fileCount(rootCount, 'root files created');
    totalFiles += rootCount;

    // Step 5: Generate dev tools
    if (templateContext.linting || templateContext.formatting || templateContext.gitHooks) {
      logger.stepIndicator(5, 6, 'Setting up development tools');
      await generateDevTools(targetDir, templateContext);
      logger.success('Development tools configured');
      totalFiles += 2; // git hooks
    } else {
      logger.stepIndicator(5, 6, 'Skipping development tools');
      logger.info('No development tools configured');
    }

    // Step 6: Setup Git and GitHub
    logger.stepIndicator(6, 6, 'Setting up Git repository');
    await setupGitBranches(targetDir, templateContext.projectName);
    logger.success('Git repository configured');

    // Calculate elapsed time
    const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);

    // Print success summary
    logger.celebrate('Project created successfully!');

    logger.summaryBox([
      `✨ ${templateContext.projectName}`,
      '',
      `📁 Location: ${targetDir}`,
      `📝 Files: ${totalFiles} created`,
      `⏱️  Time: ${elapsedTime}s`,
      '',
      `🚀 Framework: Next.js ${templateContext.typescript ? '+ TypeScript' : ''}`,
      `🎨 Styling: ${templateContext.styling === 'tailwind' ? 'Tailwind CSS v4' : 'CSS'}`,
      ...(templateContext.backend === 'firebase'
        ? [`🔥 Backend: Firebase (${templateContext.firebasePattern})`]
        : []),
    ]);

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
async function generateConfigFiles(targetDir: string, context: TemplateContext): Promise<number> {
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

  // Add Playwright configuration
  if (context.testing === 'playwright') {
    operations.push({
      type: 'copy',
      source: 'web/config/playwright.config.ts',
      destination: 'playwright.config.ts',
    });
  }

  await executeFileOperations(operations, targetDir, 'Configuration files');
  return operations.length;
}

/**
 * Generate source structure
 */
async function generateSourceStructure(
  targetDir: string,
  context: TemplateContext
): Promise<number> {
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
    {
      type: 'copy',
      source: 'web/src/app/loading.tsx',
      destination: 'src/app/loading.tsx',
    },
    {
      type: 'copy',
      source: 'web/src/app/error.tsx',
      destination: 'src/app/error.tsx',
    },
    {
      type: 'copy',
      source: 'web/src/app/not-found.tsx',
      destination: 'src/app/not-found.tsx',
    },
    // Page Routes
    {
      type: 'copy',
      source: 'web/src/app/about/page.tsx',
      destination: 'src/app/about/page.tsx',
    },
    {
      type: 'copy',
      source: 'web/src/app/login/page.tsx',
      destination: 'src/app/login/page.tsx',
    },
    {
      type: 'copy',
      source: 'web/src/app/login/verify/page.tsx',
      destination: 'src/app/login/verify/page.tsx',
    },
    {
      type: 'copy',
      source: 'web/src/app/terms/page.tsx',
      destination: 'src/app/terms/page.tsx',
    },
    {
      type: 'copy',
      source: 'web/src/app/privacy/page.tsx',
      destination: 'src/app/privacy/page.tsx',
    },
    // Components - Layout
    {
      type: 'template',
      source: 'web/src/components/layout/Header.tsx.hbs',
      destination: 'src/components/layout/Header.tsx',
      context,
    },
    {
      type: 'template',
      source: 'web/src/components/layout/Footer.tsx.hbs',
      destination: 'src/components/layout/Footer.tsx',
      context,
    },
    {
      type: 'template',
      source: 'web/src/components/layout/Navigation.tsx.hbs',
      destination: 'src/components/layout/Navigation.tsx',
      context,
    },
    // Components - shadcn/ui (always included)
    {
      type: 'copy',
      source: 'web/src/components/ui/button.tsx',
      destination: 'src/components/ui/button.tsx',
    },
    {
      type: 'copy',
      source: 'web/src/components/ui/card.tsx',
      destination: 'src/components/ui/card.tsx',
    },
    {
      type: 'copy',
      source: 'web/src/components/ui/input.tsx',
      destination: 'src/components/ui/input.tsx',
    },
    {
      type: 'copy',
      source: 'web/src/components/ui/sheet.tsx',
      destination: 'src/components/ui/sheet.tsx',
    },
    {
      type: 'copy',
      source: 'web/src/components/ui/index.ts',
      destination: 'src/components/ui/index.ts',
    },
    // Components - GDPR (always included)
    {
      type: 'copy',
      source: 'web/src/components/gdpr/CookieConsent.tsx',
      destination: 'src/components/gdpr/CookieConsent.tsx',
    },
    // Component directories
    {
      type: 'directory',
      source: '',
      destination: 'src/components/features',
    },
    // Components showcase page
    {
      type: 'copy',
      source: 'web/src/app/components/page.tsx',
      destination: 'src/app/components/page.tsx',
    },
    // PWA components
    ...(context.pwa && context.pwaInstallable
      ? [
          {
            type: 'copy' as const,
            source: 'web/src/components/pwa/InstallPrompt.tsx',
            destination: 'src/components/pwa/InstallPrompt.tsx',
          },
        ]
      : []),
    // Lib directory - utils (always include shadcn cn helper)
    {
      type: 'copy',
      source: 'web/lib/utils.ts',
      destination: 'src/lib/utils.ts',
    },
    // Firebase auth utilities (always included)
    {
      type: 'copy',
      source: 'web/lib/firebase/auth-client.ts',
      destination: 'src/lib/firebase/auth-client.ts',
    },
    // Firebase config (always client-side config)
    {
      type: 'template',
      source: 'web/lib/firebase/config.ts.hbs',
      destination: 'src/lib/firebase/config.ts',
      context,
    },
    // Firebase auth hook (always included)
    {
      type: 'copy',
      source: 'web/src/hooks/firebase/useAuthClient.tsx',
      destination: 'src/hooks/firebase/useAuthClient.tsx',
    },
    // Types directory with type definition files
    {
      type: 'directory',
      source: '',
      destination: 'src/types',
    },
    {
      type: 'template',
      source: 'web/src/types/global.d.ts.hbs',
      destination: 'src/types/global.d.ts',
      context,
    },
    {
      type: 'copy',
      source: 'web/src/types/utils.ts',
      destination: 'src/types/utils.ts',
    },
    {
      type: 'copy',
      source: 'web/src/types/index.ts',
      destination: 'src/types/index.ts',
    },
    // Environment variable validation and type-safe access
    {
      type: 'template',
      source: 'web/lib/env.ts.hbs',
      destination: 'src/lib/env.ts',
      context,
    },
    // API utilities
    {
      type: 'copy',
      source: 'web/src/lib/api/response.ts',
      destination: 'src/lib/api/response.ts',
    },
    {
      type: 'copy',
      source: 'web/src/lib/api/errors.ts',
      destination: 'src/lib/api/errors.ts',
    },
    {
      type: 'copy',
      source: 'web/src/lib/api/validation.ts',
      destination: 'src/lib/api/validation.ts',
    },
    {
      type: 'copy',
      source: 'web/src/lib/api/middleware.ts',
      destination: 'src/lib/api/middleware.ts',
    },
    {
      type: 'copy',
      source: 'web/src/lib/api/index.ts',
      destination: 'src/lib/api/index.ts',
    },
    // Example API routes
    {
      type: 'copy',
      source: 'web/src/app/api/hello/route.ts',
      destination: 'src/app/api/hello/route.ts',
    },
    {
      type: 'copy',
      source: 'web/src/app/api/users/route.ts',
      destination: 'src/app/api/users/route.ts',
    },
    {
      type: 'copy',
      source: 'web/src/app/api/users/[id]/route.ts',
      destination: 'src/app/api/users/[id]/route.ts',
    },
    {
      type: 'copy',
      source: 'web/src/app/api/upload/route.ts',
      destination: 'src/app/api/upload/route.ts',
    },
    {
      type: 'copy',
      source: 'web/src/app/api/auth/login/route.ts',
      destination: 'src/app/api/auth/login/route.ts',
    },
    {
      type: 'copy',
      source: 'web/src/app/api/auth/logout/route.ts',
      destination: 'src/app/api/auth/logout/route.ts',
    },
    {
      type: 'copy',
      source: 'web/src/app/api/webhooks/stripe/route.ts',
      destination: 'src/app/api/webhooks/stripe/route.ts',
    },
  ];

  // Add animation files if animations are enabled
  if (context.animations) {
    operations.push(
      {
        type: 'copy',
        source: 'web/lib/animations/variants.ts',
        destination: 'src/lib/animations/variants.ts',
      },
      {
        type: 'copy',
        source: 'web/lib/animations/hooks.ts',
        destination: 'src/lib/animations/hooks.ts',
      },
      {
        type: 'copy',
        source: 'web/lib/animations/components/FadeIn.tsx',
        destination: 'src/lib/animations/components/FadeIn.tsx',
      },
      {
        type: 'copy',
        source: 'web/lib/animations/components/SlideIn.tsx',
        destination: 'src/lib/animations/components/SlideIn.tsx',
      },
      {
        type: 'copy',
        source: 'web/lib/animations/components/PageTransition.tsx',
        destination: 'src/lib/animations/components/PageTransition.tsx',
      },
      {
        type: 'copy',
        source: 'web/lib/animations/components/ScrollReveal.tsx',
        destination: 'src/lib/animations/components/ScrollReveal.tsx',
      },
      {
        type: 'copy',
        source: 'web/lib/animations/components/Stagger.tsx',
        destination: 'src/lib/animations/components/Stagger.tsx',
      },
      {
        type: 'copy',
        source: 'web/lib/animations/components/index.ts',
        destination: 'src/lib/animations/components/index.ts',
      },
      {
        type: 'copy',
        source: 'web/lib/animations/index.ts',
        destination: 'src/lib/animations/index.ts',
      }
    );
  }

  // Add Firebase configuration files if backend is Firebase
  if (context.backend === 'firebase') {
    // Client-side pattern: Modular Firebase client structure
    if (context.firebasePattern === 'client-side') {
      operations.push(
        {
          type: 'template',
          source: 'web/lib/firebase/auth.ts.hbs',
          destination: 'src/lib/firebase/auth.ts',
          context,
        },
        {
          type: 'template',
          source: 'web/lib/firebase/firestore.ts.hbs',
          destination: 'src/lib/firebase/firestore.ts',
          context,
        },
        {
          type: 'template',
          source: 'web/lib/firebase/storage.ts.hbs',
          destination: 'src/lib/firebase/storage.ts',
          context,
        }
      );

      // React hooks for Firebase
      operations.push(
        {
          type: 'template',
          source: 'web/src/hooks/firebase/useAuth.tsx.hbs',
          destination: 'src/hooks/firebase/useAuth.tsx',
          context,
        },
        {
          type: 'template',
          source: 'web/src/hooks/firebase/useFirestore.tsx.hbs',
          destination: 'src/hooks/firebase/useFirestore.tsx',
          context,
        },
        {
          type: 'copy',
          source: 'web/src/hooks/firebase/useStorage.tsx',
          destination: 'src/hooks/firebase/useStorage.tsx',
        }
      );

      // Firebase Storage components
      operations.push(
        {
          type: 'copy',
          source: 'web/src/components/storage/FileUpload.tsx',
          destination: 'src/components/storage/FileUpload.tsx',
        },
        {
          type: 'copy',
          source: 'web/src/components/storage/ImageUpload.tsx',
          destination: 'src/components/storage/ImageUpload.tsx',
        },
        {
          type: 'copy',
          source: 'web/src/components/storage/FileManager.tsx',
          destination: 'src/components/storage/FileManager.tsx',
        }
      );
    }

    // Add Admin SDK for server-first pattern
    if (context.firebasePattern === 'server-first') {
      // Modular Firebase Admin SDK structure
      operations.push(
        {
          type: 'template',
          source: 'web/lib/firebase-admin/config.ts.hbs',
          destination: 'src/lib/firebase-admin/config.ts',
          context,
        },
        {
          type: 'template',
          source: 'web/lib/firebase-admin/auth.ts.hbs',
          destination: 'src/lib/firebase-admin/auth.ts',
          context,
        },
        {
          type: 'template',
          source: 'web/lib/firebase-admin/firestore.ts.hbs',
          destination: 'src/lib/firebase-admin/firestore.ts',
          context,
        },
        {
          type: 'template',
          source: 'web/lib/firebase-admin/session.ts.hbs',
          destination: 'src/lib/firebase-admin/session.ts',
          context,
        }
      );

      // API routes for authentication
      operations.push(
        {
          type: 'template',
          source: 'web/src/app/api/auth/login/route.ts.hbs',
          destination: 'src/app/api/auth/login/route.ts',
          context,
        },
        {
          type: 'template',
          source: 'web/src/app/api/auth/logout/route.ts.hbs',
          destination: 'src/app/api/auth/logout/route.ts',
          context,
        }
      );

      // Example Server Actions
      operations.push({
        type: 'template',
        source: 'web/src/app/actions/example.ts.hbs',
        destination: 'src/app/actions/example.ts',
        context,
      });
    } else {
      // Keep backward compatibility with the old firebase-admin.ts file
      operations.push({
        type: 'template',
        source: 'web/lib/firebase-admin.ts.hbs',
        destination: 'src/lib/firebase-admin.ts',
        context,
      });
    }

    // Add database models for all Firebase patterns
    operations.push(
      {
        type: 'template',
        source: 'web/lib/db/models/user.ts.hbs',
        destination: 'src/lib/db/models/user.ts',
        context,
      },
      {
        type: 'template',
        source: 'web/lib/db/models/post.ts.hbs',
        destination: 'src/lib/db/models/post.ts',
        context,
      }
    );
  }

  // Add state management files
  if (context.stateManagement === 'context') {
    // Only add AuthContext for Firebase projects (it has Firebase imports)
    if (context.backend === 'firebase') {
      operations.push({
        type: 'copy',
        source: 'web/src/contexts/AuthContext.tsx',
        destination: 'src/contexts/AuthContext.tsx',
      });
    }

    // Always add ThemeContext
    operations.push({
      type: 'copy',
      source: 'web/src/contexts/ThemeContext.tsx',
      destination: 'src/contexts/ThemeContext.tsx',
    });
  }

  if (context.stateManagement === 'zustand') {
    operations.push(
      {
        type: 'copy',
        source: 'web/src/stores/useAuthStore.ts',
        destination: 'src/stores/useAuthStore.ts',
      },
      {
        type: 'copy',
        source: 'web/src/stores/useThemeStore.ts',
        destination: 'src/stores/useThemeStore.ts',
      }
    );
  }

  // Add Playwright E2E tests
  if (context.testing === 'playwright') {
    operations.push(
      // E2E test specs
      {
        type: 'copy',
        source: 'web/tests/e2e/home.spec.ts',
        destination: 'tests/e2e/home.spec.ts',
      },
      {
        type: 'copy',
        source: 'web/tests/e2e/api.spec.ts',
        destination: 'tests/e2e/api.spec.ts',
      },
      {
        type: 'copy',
        source: 'web/tests/e2e/components.spec.ts',
        destination: 'tests/e2e/components.spec.ts',
      },
      // Page objects
      {
        type: 'copy',
        source: 'web/tests/page-objects/HomePage.ts',
        destination: 'tests/page-objects/HomePage.ts',
      },
      {
        type: 'copy',
        source: 'web/tests/page-objects/ComponentsPage.ts',
        destination: 'tests/page-objects/ComponentsPage.ts',
      },
      // Test helpers
      {
        type: 'copy',
        source: 'web/tests/helpers/test-utils.ts',
        destination: 'tests/helpers/test-utils.ts',
      },
      // Test fixtures
      {
        type: 'copy',
        source: 'web/tests/fixtures/test-data.ts',
        destination: 'tests/fixtures/test-data.ts',
      },
      // Test documentation
      {
        type: 'copy',
        source: 'web/tests/README.md',
        destination: 'tests/README.md',
      }
    );
  }

  await executeFileOperations(operations, targetDir, 'Source structure');

  // Create placeholder files for empty directories
  const placeholderContent = `// Placeholder file
// Delete this file when you add your own files to this directory
export {};
`;

  let placeholderCount = 0;
  await writeFile(path.join(targetDir, 'src/hooks/index.ts'), placeholderContent);
  placeholderCount++;

  return operations.length + placeholderCount;
}

/**
 * Generate root files (.gitignore, README, etc.)
 */
async function generateRootFiles(targetDir: string, context: TemplateContext): Promise<number> {
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

  // Add next-env.d.ts for TypeScript projects
  if (context.typescript) {
    operations.push({
      type: 'copy',
      source: 'web/root/next-env.d.ts',
      destination: 'next-env.d.ts',
    });
  }

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

  // Add middleware.ts for Firebase server-first pattern
  if (context.backend === 'firebase' && context.firebasePattern === 'server-first') {
    operations.push({
      type: 'template',
      source: 'web/root/middleware.ts.hbs',
      destination: 'middleware.ts',
      context,
    });
  }

  // Add Firestore configuration files
  if (context.backend === 'firebase') {
    operations.push(
      {
        type: 'copy',
        source: 'web/root/firestore.rules',
        destination: 'firestore.rules',
      },
      {
        type: 'copy',
        source: 'web/root/firestore.indexes.json',
        destination: 'firestore.indexes.json',
      },
      {
        type: 'copy',
        source: 'web/root/storage.rules',
        destination: 'storage.rules',
      }
    );
  }

  // Add Git configuration files
  operations.push(
    {
      type: 'copy',
      source: 'web/root/_gitattributes',
      destination: '.gitattributes',
    },
    {
      type: 'template',
      source: 'web/root/CONTRIBUTING.md.hbs',
      destination: 'CONTRIBUTING.md',
      context,
    }
  );

  // Add Firebase setup script
  operations.push({
    type: 'copy',
    source: 'web/scripts/firebase-setup.js',
    destination: 'scripts/firebase-setup.js',
  });

  // Add GitHub templates
  operations.push(
    {
      type: 'copy',
      source: 'web/github/PULL_REQUEST_TEMPLATE.md',
      destination: '.github/PULL_REQUEST_TEMPLATE.md',
    },
    {
      type: 'copy',
      source: 'web/github/ISSUE_TEMPLATE/bug_report.md',
      destination: '.github/ISSUE_TEMPLATE/bug_report.md',
    },
    {
      type: 'copy',
      source: 'web/github/ISSUE_TEMPLATE/feature_request.md',
      destination: '.github/ISSUE_TEMPLATE/feature_request.md',
    },
    {
      type: 'copy',
      source: 'web/github/ISSUE_TEMPLATE/question.md',
      destination: '.github/ISSUE_TEMPLATE/question.md',
    }
  );

  // Add GitHub Actions workflows (always included)
  operations.push(
    {
      type: 'template',
      source: 'web/github/workflows/ci-develop.yml',
      destination: '.github/workflows/ci-develop.yml',
      context,
    },
    {
      type: 'template',
      source: 'web/github/workflows/ci-main.yml',
      destination: '.github/workflows/ci-main.yml',
      context,
    },
    {
      type: 'copy',
      source: 'web/root/.releaserc.json',
      destination: '.releaserc.json',
    }
  );

  // Add shadcn/ui components.json config (always included)
  operations.push({
    type: 'copy',
    source: 'web/components.json',
    destination: 'components.json',
  });

  // Create public directory
  operations.push({
    type: 'directory',
    source: '',
    destination: 'public',
  });

  // Add PWA files
  if (context.pwa) {
    operations.push(
      {
        type: 'template',
        source: 'web/public/manifest.json.hbs',
        destination: 'public/manifest.json',
        context,
      },
      {
        type: 'template',
        source: 'web/public/offline.html.hbs',
        destination: 'public/offline.html',
        context,
      },
      {
        type: 'copy',
        source: 'web/public/icons/README.md',
        destination: 'public/icons/README.md',
      },
      {
        type: 'copy',
        source: 'web/public/screenshots/README.md',
        destination: 'public/screenshots/README.md',
      }
    );
  }

  await executeFileOperations(operations, targetDir, 'Documentation and root files');
  return operations.length;
}

/**
 * Generate dev tools setup (Husky, etc.)
 */
async function generateDevTools(targetDir: string, context: TemplateContext): Promise<void> {
  if (!context.gitHooks) {
    return;
  }

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
