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
  console.log('│   ✨ Team Starter Generator                     │');
  console.log('│                                                 │');
  console.log('│   Opinionated, production-ready stack          │');
  console.log('│                                                 │');
  console.log('└─────────────────────────────────────────────────┘');
  console.log();
  console.log('Fixed Tech Stack:');
  console.log('  • Next.js 15 + TypeScript');
  console.log('  • Tailwind CSS v4 + shadcn/ui');
  console.log('  • Firebase Backend');
  console.log('  • ESLint + Prettier + Husky + commitlint');
  console.log();

  // Type assertion needed due to version mismatch between inquirer v10 and @types/inquirer v9
  const answers = await inquirer.prompt<{
    projectName: string;
    workspaceType: WorkspaceType;
    testing: TestingType;
    stateManagement: StateManagementType;
    animations: boolean;
    backendFeatures: BackendFeature[];
    firebasePattern: FirebasePattern;
    pwaOffline?: boolean;
    pwaInstallable?: boolean;
    pwaNotifications?: boolean;
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
      message: 'Project type?',
      choices: [
        {
          name: 'Web App',
          value: 'single',
        },
        {
          name: 'Progressive Web App (PWA)',
          value: 'pwa',
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
      name: 'firebasePattern',
      message: 'Firebase architecture?',
      choices: [
        {
          name: 'Server-first (Recommended - Server Components + Admin SDK)',
          value: 'server-first',
        },
        {
          name: 'Client-side (Simple - Browser only)',
          value: 'client-side',
        },
      ],
      default: 'server-first',
    },
    {
      type: 'checkbox',
      name: 'backendFeatures',
      message: 'Firebase features?',
      choices: [
        { name: 'Authentication', value: 'auth', checked: true },
        { name: 'Firestore Database', value: 'database', checked: true },
        { name: 'Cloud Storage', value: 'storage', checked: false },
        { name: 'Cloud Functions', value: 'functions', checked: false },
      ],
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
          name: 'None',
          value: 'none',
        },
      ],
      default: 'playwright',
    },
    {
      type: 'list',
      name: 'stateManagement',
      message: 'State management?',
      choices: [
        {
          name: 'Zustand (Lightweight global state)',
          value: 'zustand',
        },
        {
          name: 'React Context (Built-in)',
          value: 'context',
        },
      ],
      default: 'zustand',
    },
    {
      type: 'confirm',
      name: 'animations',
      message: 'Add Framer Motion animations?',
      default: false,
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ] as any);

  // Set fixed defaults for team-opinionated stack
  const framework: FrameworkType = 'next';
  const typescript = true;
  const styling: StylingType = 'tailwind';
  const uiLibrary: UILibraryType = 'shadcn';
  const backend: BackendType = 'firebase';
  const aiInstructions = true;
  const architecture = true;
  const linting = true;
  const gitHooks = true;
  const packageManager: PackageManagerType = 'npm';

  return {
    ...answers,
    framework,
    typescript,
    styling,
    uiLibrary,
    backend,
    aiInstructions,
    architecture,
    linting,
    gitHooks,
    packageManager,
  } as PromptAnswers;
}
