import type {
  PromptAnswers,
  WorkspaceConfig,
  TemplateContext,
  BackendFeature,
} from '../types/config.js';

/**
 * Convert prompt answers to WorkspaceConfig
 */
export function answersToConfig(answers: PromptAnswers): WorkspaceConfig {
  return {
    name: answers.projectName,
    workspace: {
      type: answers.workspaceType,
      platforms: answers.workspaceType === 'pwa' ? ['web', 'pwa'] : ['web'],
    },
    web: {
      framework: answers.framework,
      typescript: answers.typescript,
      styling: answers.styling,
      ui: answers.uiLibrary,
      testing: answers.testing,
      stateManagement: answers.stateManagement,
      animations: answers.animations,
      linting: answers.linting,
      formatting: answers.linting, // Use same value as linting for formatting
      gitHooks: answers.gitHooks,
    },
    backend:
      answers.backend !== 'none'
        ? {
            type: answers.backend,
            features: answers.backendFeatures,
            firebasePattern: answers.firebasePattern,
          }
        : undefined,
    pwa:
      answers.workspaceType === 'pwa'
        ? {
            offline: answers.pwaOffline ?? true,
            installable: answers.pwaInstallable ?? true,
            notifications: answers.pwaNotifications ?? false,
          }
        : undefined,
    documentation: {
      aiInstructions: answers.aiInstructions,
      architecture: answers.architecture,
      apiDocs: false,
      styleguide: false,
    },
    packageManager: answers.packageManager,
  };
}

/**
 * Convert WorkspaceConfig to TemplateContext for Handlebars
 */
export function configToTemplateContext(config: WorkspaceConfig): TemplateContext {
  const backendFeatures = (config.backend?.features || []) as BackendFeature[];
  const firebasePattern = config.backend?.firebasePattern || 'client-side';
  const isPwa = config.workspace.type === 'pwa' || config.workspace.platforms.includes('pwa');

  return {
    projectName: config.name,
    description:
      config.description || `A modern web application built with ${config.web.framework}`,
    author: config.author || '',
    framework: config.web.framework,
    typescript: config.web.typescript,
    styling: config.web.styling,
    uiLibrary: config.web.ui,
    testing: config.web.testing,
    stateManagement: config.web.stateManagement,
    animations: config.web.animations,
    backend: config.backend?.type || 'none',
    backendFeatures,
    firebasePattern,
    hasAuth: backendFeatures.includes('auth'),
    hasDatabase: backendFeatures.includes('database'),
    hasStorage: backendFeatures.includes('storage'),
    hasFunctions: backendFeatures.includes('functions'),
    pwa: isPwa,
    pwaOffline: config.pwa?.offline ?? false,
    pwaInstallable: config.pwa?.installable ?? false,
    pwaNotifications: config.pwa?.notifications ?? false,
    linting: config.web.linting,
    formatting: config.web.formatting,
    gitHooks: config.web.gitHooks,
    packageManager: config.packageManager || 'npm',
    year: new Date().getFullYear(),
    documentation: {
      aiInstructions: config.documentation.aiInstructions,
      architecture: config.documentation.architecture,
    },
  };
}
