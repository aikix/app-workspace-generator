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
      platforms: ['web'],
    },
    web: {
      framework: answers.framework,
      typescript: answers.typescript,
      styling: answers.styling,
      ui: answers.uiLibrary,
      testing: answers.testing,
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

  return {
    projectName: config.name,
    description: config.description || `A modern web application built with ${config.web.framework}`,
    author: config.author || '',
    framework: config.web.framework,
    typescript: config.web.typescript,
    styling: config.web.styling,
    uiLibrary: config.web.ui,
    testing: config.web.testing,
    backend: config.backend?.type || 'none',
    backendFeatures,
    firebasePattern,
    hasAuth: backendFeatures.includes('auth'),
    hasDatabase: backendFeatures.includes('database'),
    hasStorage: backendFeatures.includes('storage'),
    hasFunctions: backendFeatures.includes('functions'),
    linting: config.web.linting,
    formatting: config.web.formatting,
    gitHooks: config.web.gitHooks,
    packageManager: config.packageManager || 'npm',
    year: new Date().getFullYear(),
  };
}
