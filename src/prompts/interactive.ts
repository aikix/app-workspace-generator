import inquirer from 'inquirer';
import type {
  PromptAnswers,
  WorkspaceType,
  FrameworkType,
  StylingType,
  UILibraryType,
  TestingType,
  BackendType,
  BackendFeature,
  FirebasePattern,
  PackageManagerType,
} from '../types/config.js';
import { validateProjectName, checkDirectoryExists } from '../validators/project-name.js';

/**
 * Run interactive prompts to gather project configuration
 */
export async function runInteractivePrompts(cwd: string): Promise<PromptAnswers> {
  console.log();
  console.log('┌─────────────────────────────────────────────────┐');
  console.log('│                                                 │');
  console.log('│   🚀 App Workspace Generator                    │');
  console.log('│                                                 │');
  console.log('│   Create production-ready web applications     │');
  console.log('│   with AI agent instructions included          │');
  console.log('│                                                 │');
  console.log('└─────────────────────────────────────────────────┘');
  console.log();

  const answers = await inquirer.prompt<{
    projectName: string;
    workspaceType: WorkspaceType;
    framework: FrameworkType;
    typescript: boolean;
    styling: StylingType;
    uiLibrary: UILibraryType;
    testing: TestingType;
    backend: BackendType;
    backendFeatures: BackendFeature[];
    firebasePattern?: FirebasePattern;
    pwaOffline?: boolean;
    pwaInstallable?: boolean;
    pwaNotifications?: boolean;
    aiInstructions: boolean;
    architecture: boolean;
    linting: boolean;
    gitHooks: boolean;
    packageManager: PackageManagerType;
  }>([
    {
      type: 'input',
      name: 'projectName',
      message: 'What is your project name?',
      default: 'my-app',
      validate: async (input: string) => {
        const validation = validateProjectName(input);
        if (!validation.valid) {
          return validation.errors[0] || 'Invalid project name';
        }

        const exists = await checkDirectoryExists(input, cwd);
        if (exists) {
          return `Directory "${input}" already exists. Please choose a different name.`;
        }

        return true;
      },
    },
    {
      type: 'list',
      name: 'workspaceType',
      message: 'What type of workspace?',
      choices: [
        {
          name: 'Single web app (recommended for starting)',
          value: 'single',
        },
        {
          name: 'PWA (Progressive Web App - installable, offline-capable)',
          value: 'pwa',
        },
        {
          name: 'Multi-platform (web + iOS + Android) - Phase 3 (Coming soon)',
          value: 'multi',
          disabled: true,
        },
      ],
      default: 'single',
    },
    {
      type: 'confirm',
      name: 'pwaOffline',
      message: 'Enable offline support (service worker caching)?',
      default: true,
      when: (answers) => answers.workspaceType === 'pwa',
    },
    {
      type: 'confirm',
      name: 'pwaInstallable',
      message: 'Make app installable (Add to Home Screen)?',
      default: true,
      when: (answers) => answers.workspaceType === 'pwa',
    },
    {
      type: 'confirm',
      name: 'pwaNotifications',
      message: 'Enable push notifications (optional)?',
      default: false,
      when: (answers) => answers.workspaceType === 'pwa',
    },
    {
      type: 'list',
      name: 'framework',
      message: 'Which framework?',
      choices: [
        {
          name: 'Next.js (recommended)',
          value: 'next',
        },
        {
          name: 'Vite (Coming soon)',
          value: 'vite',
          disabled: true,
        },
        {
          name: 'Remix (Coming soon)',
          value: 'remix',
          disabled: true,
        },
      ],
      default: 'next',
    },
    {
      type: 'confirm',
      name: 'typescript',
      message: 'Use TypeScript?',
      default: true,
    },
    {
      type: 'list',
      name: 'styling',
      message: 'Which styling solution?',
      choices: [
        {
          name: 'Tailwind CSS (recommended)',
          value: 'tailwind',
        },
        {
          name: 'CSS Modules (Coming soon)',
          value: 'css-modules',
          disabled: true,
        },
        {
          name: 'Styled Components (Coming soon)',
          value: 'styled-components',
          disabled: true,
        },
      ],
      default: 'tailwind',
    },
    {
      type: 'list',
      name: 'uiLibrary',
      message: 'UI component library?',
      choices: [
        {
          name: 'None (recommended for custom design)',
          value: 'none',
        },
        {
          name: 'Radix UI (Coming soon)',
          value: 'radix',
          disabled: true,
        },
        {
          name: 'shadcn/ui (Coming soon)',
          value: 'shadcn',
          disabled: true,
        },
        {
          name: 'Material-UI (Coming soon)',
          value: 'mui',
          disabled: true,
        },
        {
          name: 'Chakra UI (Coming soon)',
          value: 'chakra',
          disabled: true,
        },
      ],
      default: 'none',
    },
    {
      type: 'list',
      name: 'testing',
      message: 'Testing framework?',
      choices: [
        {
          name: 'Playwright (E2E testing)',
          value: 'playwright',
        },
        {
          name: 'Cypress (Coming soon)',
          value: 'cypress',
          disabled: true,
        },
        {
          name: 'Vitest (Coming soon)',
          value: 'vitest',
          disabled: true,
        },
        {
          name: 'None (skip testing)',
          value: 'none',
        },
      ],
      default: 'playwright',
    },
    {
      type: 'list',
      name: 'backend',
      message: 'Backend services?',
      choices: [
        {
          name: 'Firebase (Auth, Firestore, Storage)',
          value: 'firebase',
        },
        {
          name: 'Supabase (Coming soon)',
          value: 'supabase',
          disabled: true,
        },
        {
          name: 'Custom backend',
          value: 'custom',
        },
        {
          name: 'None (frontend only)',
          value: 'none',
        },
      ],
      default: 'none',
    },
    {
      type: 'checkbox',
      name: 'backendFeatures',
      message: 'Which Firebase features?',
      choices: [
        { name: 'Authentication', value: 'auth', checked: true },
        { name: 'Firestore Database', value: 'database', checked: true },
        { name: 'Cloud Storage', value: 'storage', checked: false },
        { name: 'Cloud Functions', value: 'functions', checked: false },
      ],
      when: (answers) => answers.backend === 'firebase',
    },
    {
      type: 'list',
      name: 'firebasePattern',
      message: 'Firebase architecture pattern?',
      choices: [
        {
          name: 'Client-side (Simple - Auth and data fetching in browser)',
          value: 'client-side',
        },
        {
          name: 'Server-first (Optimal - Server Components + Admin SDK for security & SEO)',
          value: 'server-first',
        },
      ],
      default: 'server-first',
      when: (answers) => answers.backend === 'firebase',
    },
    {
      type: 'confirm',
      name: 'aiInstructions',
      message: 'Generate AI agent instructions (CLAUDE.md)?',
      default: true,
    },
    {
      type: 'confirm',
      name: 'architecture',
      message: 'Generate architecture documentation?',
      default: true,
    },
    {
      type: 'confirm',
      name: 'linting',
      message: 'Set up ESLint + Prettier?',
      default: true,
    },
    {
      type: 'confirm',
      name: 'gitHooks',
      message: 'Set up Git hooks (Husky)?',
      default: true,
    },
    {
      type: 'list',
      name: 'packageManager',
      message: 'Package manager?',
      choices: [
        { name: 'npm', value: 'npm' },
        { name: 'pnpm', value: 'pnpm' },
        { name: 'yarn', value: 'yarn' },
        { name: 'bun', value: 'bun' },
      ],
      default: 'npm',
    },
  ]);

  // Default backendFeatures to empty array if not set
  if (!answers.backendFeatures) {
    answers.backendFeatures = [];
  }

  return answers;
}
