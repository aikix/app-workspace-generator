import inquirer from 'inquirer';
import type {
  PromptAnswers,
  WorkspaceType,
  FrameworkType,
  StylingType,
  UILibraryType,
  TestingType,
  StateManagementType,
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

  // Type assertion needed due to version mismatch between inquirer v10 and @types/inquirer v9
  const answers = await inquirer.prompt<{
    projectName: string;
    workspaceType: WorkspaceType;
    uiLibrary: UILibraryType;
    testing: TestingType;
    stateManagement: StateManagementType;
    animations: boolean;
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
      when: (answers: { workspaceType: WorkspaceType }): boolean => answers.workspaceType === 'pwa',
    },
    {
      type: 'confirm',
      name: 'pwaInstallable',
      message: 'Make app installable (Add to Home Screen)?',
      default: true,
      when: (answers: { workspaceType: WorkspaceType }): boolean => answers.workspaceType === 'pwa',
    },
    {
      type: 'confirm',
      name: 'pwaNotifications',
      message: 'Enable push notifications (optional)?',
      default: false,
      when: (answers: { workspaceType: WorkspaceType }): boolean => answers.workspaceType === 'pwa',
    },
    {
      type: 'list',
      name: 'uiLibrary',
      message: 'UI component library?',
      choices: [
        {
          name: 'shadcn/ui (Radix + Tailwind, pre-styled components)',
          value: 'shadcn',
        },
        {
          name: 'Radix UI (Unstyled primitives, full control)',
          value: 'radix',
        },
        {
          name: 'None (custom design, recommended for learning)',
          value: 'none',
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
          name: 'None (skip testing)',
          value: 'none',
        },
      ],
      default: 'none',
    },
    {
      type: 'list',
      name: 'stateManagement',
      message: 'State management solution?',
      choices: [
        {
          name: 'React Context (Built-in, good for auth & theme)',
          value: 'context',
        },
        {
          name: 'Zustand (Lightweight, simple global state)',
          value: 'zustand',
        },
        {
          name: 'None (use local state only)',
          value: 'none',
        },
      ],
      default: 'context',
    },
    {
      type: 'confirm',
      name: 'animations',
      message: 'Add animations with Framer Motion?',
      default: false,
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
      when: (answers: { backend: BackendType }): boolean => answers.backend === 'firebase',
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
      when: (answers: { backend: BackendType }): boolean => answers.backend === 'firebase',
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ] as any);

  // Set defaults for removed prompts
  const framework: FrameworkType = 'next';
  const typescript = true;
  const styling: StylingType = 'tailwind';
  const packageManager: PackageManagerType = 'npm';

  // Default backendFeatures to empty array if not set
  if (!answers.backendFeatures) {
    answers.backendFeatures = [];
  }

  return {
    ...answers,
    framework,
    typescript,
    styling,
    packageManager,
  } as PromptAnswers;
}
