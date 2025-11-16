/**
 * Configuration schema for app-workspace-generator
 */

export type WorkspaceType = 'single' | 'pwa' | 'multi';
export type PlatformType = 'web' | 'pwa' | 'ios' | 'android';
export type FrameworkType = 'next' | 'vite' | 'remix';
export type StylingType = 'tailwind' | 'css-modules' | 'styled-components';
export type UILibraryType = 'radix' | 'shadcn' | 'mui' | 'chakra' | 'none';
export type TestingType = 'playwright' | 'cypress' | 'vitest' | 'none';
export type BackendType = 'firebase' | 'supabase' | 'custom' | 'none';
export type BackendFeature = 'auth' | 'database' | 'storage' | 'functions';
export type FirebasePattern = 'client-side' | 'server-first';
export type StateManagementType = 'context' | 'zustand' | 'none';
export type PackageManagerType = 'npm' | 'yarn' | 'pnpm' | 'bun';
export type CICDPlatform = 'github' | 'gitlab' | 'none';

export interface WorkspaceConfig {
  // Project metadata
  name: string;
  description?: string;
  author?: string;

  // Workspace settings
  workspace: {
    type: WorkspaceType;
    platforms: PlatformType[];
  };

  // Web app configuration
  web: {
    framework: FrameworkType;
    typescript: boolean;
    styling: StylingType;
    ui: UILibraryType;
    testing: TestingType;
    stateManagement: StateManagementType;
    animations: boolean; // Framer Motion animations
    linting: boolean;
    formatting: boolean;
    gitHooks: boolean;
  };

  // Backend services (optional)
  backend?: {
    type: BackendType;
    features: BackendFeature[];
    firebasePattern?: FirebasePattern; // Only for Firebase backend
  };

  // Documentation settings
  documentation: {
    aiInstructions: boolean; // Generate CLAUDE.md
    architecture: boolean; // Generate architecture docs
    apiDocs: boolean; // Generate API documentation
    styleguide: boolean; // Generate design system docs
  };

  // CI/CD settings (optional)
  cicd?: {
    platform: CICDPlatform;
    semanticRelease: boolean;
    autoDeployment: boolean;
  };

  // PWA settings (Phase 2 - optional)
  pwa?: {
    offline: boolean;
    installable: boolean;
    notifications: boolean;
  };

  // Native app settings (Phase 3 - optional)
  native?: {
    ios?: {
      bundleId: string;
      teamId?: string;
    };
    android?: {
      packageName: string;
    };
  };

  // Package manager preference
  packageManager?: PackageManagerType;
}

/**
 * Prompt answers from interactive mode
 */
export interface PromptAnswers {
  projectName: string;
  workspaceType: WorkspaceType;
  framework: FrameworkType;
  typescript: boolean;
  styling: StylingType;
  uiLibrary: UILibraryType;
  testing: TestingType;
  stateManagement: StateManagementType;
  animations: boolean;
  backend: BackendType;
  backendFeatures: BackendFeature[];
  firebasePattern: FirebasePattern; // Always asked now
  pwaOffline?: boolean;
  pwaInstallable?: boolean;
  pwaNotifications?: boolean;
  aiInstructions: boolean;
  architecture: boolean;
  linting: boolean;
  gitHooks: boolean;
  packageManager: PackageManagerType;
}

/**
 * Template context for Handlebars
 */
export interface TemplateContext {
  projectName: string;
  description: string;
  author: string;
  framework: FrameworkType;
  typescript: boolean;
  styling: StylingType;
  uiLibrary: UILibraryType;
  testing: TestingType;
  stateManagement: StateManagementType;
  animations: boolean;
  backend: BackendType;
  backendFeatures: BackendFeature[];
  firebasePattern?: FirebasePattern;
  hasAuth: boolean;
  hasDatabase: boolean;
  hasStorage: boolean;
  hasFunctions: boolean;
  pwa: boolean;
  pwaOffline: boolean;
  pwaInstallable: boolean;
  pwaNotifications: boolean;
  linting: boolean;
  formatting: boolean;
  gitHooks: boolean;
  packageManager: PackageManagerType;
  year: number;
  documentation: {
    aiInstructions: boolean;
    architecture: boolean;
  };
}

/**
 * Generation options
 */
export interface GenerationOptions {
  targetDir: string;
  config: WorkspaceConfig;
  templateContext: TemplateContext;
  skipInstall?: boolean;
  verbose?: boolean;
}
