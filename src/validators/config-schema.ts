import type { WorkspaceConfig } from '../types/config.js';

/**
 * Validation result
 */
export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate workspace configuration
 */
export function validateConfig(config: unknown): ConfigValidationResult {
  const errors: string[] = [];

  // Type guard
  if (typeof config !== 'object' || config === null) {
    return { valid: false, errors: ['Config must be an object'] };
  }

  const cfg = config as Partial<WorkspaceConfig>;

  // Required: name
  if (!cfg.name || typeof cfg.name !== 'string') {
    errors.push('Missing or invalid "name" field');
  }

  // Required: workspace
  if (!cfg.workspace || typeof cfg.workspace !== 'object') {
    errors.push('Missing or invalid "workspace" field');
  } else {
    const { type, platforms } = cfg.workspace;

    if (!type || !['single', 'multi'].includes(type)) {
      errors.push('workspace.type must be "single" or "multi"');
    }

    if (!Array.isArray(platforms) || platforms.length === 0) {
      errors.push('workspace.platforms must be a non-empty array');
    }

    const validPlatforms = ['web', 'pwa', 'ios', 'android'];
    const invalidPlatforms = platforms?.filter((p) => !validPlatforms.includes(p)) || [];
    if (invalidPlatforms.length > 0) {
      errors.push(`Invalid platforms: ${invalidPlatforms.join(', ')}`);
    }

    // Logical checks
    if (type === 'single' && platforms && platforms.length > 1) {
      errors.push('Single workspace can only have one platform (web or pwa)');
    }

    if (platforms?.includes('ios') || platforms?.includes('android')) {
      if (!platforms.includes('web') && !platforms.includes('pwa')) {
        errors.push('Native apps require web or pwa platform');
      }
    }
  }

  // Required: web
  if (!cfg.web || typeof cfg.web !== 'object') {
    errors.push('Missing or invalid "web" field');
  } else {
    const { framework, typescript, styling, ui, testing, linting, formatting, gitHooks } = cfg.web;

    if (!framework || !['next', 'vite', 'remix'].includes(framework)) {
      errors.push('web.framework must be "next", "vite", or "remix"');
    }

    if (typeof typescript !== 'boolean') {
      errors.push('web.typescript must be a boolean');
    }

    if (!styling || !['tailwind', 'css-modules', 'styled-components'].includes(styling)) {
      errors.push('web.styling must be "tailwind", "css-modules", or "styled-components"');
    }

    if (!ui || !['radix', 'shadcn', 'mui', 'chakra', 'none'].includes(ui)) {
      errors.push('web.ui must be "radix", "shadcn", "mui", "chakra", or "none"');
    }

    if (!testing || !['playwright', 'cypress', 'vitest', 'none'].includes(testing)) {
      errors.push('web.testing must be "playwright", "cypress", "vitest", or "none"');
    }

    if (typeof linting !== 'boolean') {
      errors.push('web.linting must be a boolean');
    }

    if (typeof formatting !== 'boolean') {
      errors.push('web.formatting must be a boolean');
    }

    if (typeof gitHooks !== 'boolean') {
      errors.push('web.gitHooks must be a boolean');
    }
  }

  // Required: documentation
  if (!cfg.documentation || typeof cfg.documentation !== 'object') {
    errors.push('Missing or invalid "documentation" field');
  } else {
    const { aiInstructions, architecture, apiDocs, styleguide } = cfg.documentation;

    if (typeof aiInstructions !== 'boolean') {
      errors.push('documentation.aiInstructions must be a boolean');
    }

    if (typeof architecture !== 'boolean') {
      errors.push('documentation.architecture must be a boolean');
    }

    if (typeof apiDocs !== 'boolean') {
      errors.push('documentation.apiDocs must be a boolean');
    }

    if (typeof styleguide !== 'boolean') {
      errors.push('documentation.styleguide must be a boolean');
    }
  }

  // Optional: backend
  if (cfg.backend) {
    const { type, features } = cfg.backend;

    if (!type || !['firebase', 'supabase', 'custom', 'none'].includes(type)) {
      errors.push('backend.type must be "firebase", "supabase", "custom", or "none"');
    }

    if (!Array.isArray(features)) {
      errors.push('backend.features must be an array');
    } else {
      const validFeatures = ['auth', 'database', 'storage', 'functions'];
      const invalidFeatures = features.filter((f) => !validFeatures.includes(f));
      if (invalidFeatures.length > 0) {
        errors.push(`Invalid backend features: ${invalidFeatures.join(', ')}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
