import Handlebars from 'handlebars';
import path from 'path';
import { readFile, getTemplatesDir } from '../../utils/file-system.js';
import type { TemplateContext } from '../../types/config.js';

/**
 * Template engine utilities using Handlebars
 */

/**
 * Register custom Handlebars helpers
 */
export function registerHelpers(): void {
  // Helper: capitalize first letter
  Handlebars.registerHelper('capitalize', (str: string) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  });

  // Helper: uppercase
  Handlebars.registerHelper('uppercase', (str: string) => {
    if (!str) return '';
    return str.toUpperCase();
  });

  // Helper: kebab-case to PascalCase
  Handlebars.registerHelper('pascalCase', (str: string) => {
    if (!str) return '';
    return str
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  });

  // Helper: check if array includes value
  Handlebars.registerHelper('includes', (array: unknown[], value: unknown) => {
    return Array.isArray(array) && array.includes(value);
  });

  // Helper: join array with separator
  Handlebars.registerHelper('join', (array: unknown[], separator: string) => {
    return Array.isArray(array) ? array.join(separator) : '';
  });

  // Helper: equals comparison
  Handlebars.registerHelper('eq', (a: unknown, b: unknown) => {
    return a === b;
  });

  // Helper: not equals comparison
  Handlebars.registerHelper('ne', (a: unknown, b: unknown) => {
    return a !== b;
  });

  // Helper: logical AND
  Handlebars.registerHelper('and', (...args: unknown[]) => {
    // Remove the last argument (Handlebars options object)
    const values = args.slice(0, -1);
    return values.every((v) => !!v);
  });

  // Helper: logical OR
  Handlebars.registerHelper('or', (...args: unknown[]) => {
    // Remove the last argument (Handlebars options object)
    const values = args.slice(0, -1);
    return values.some((v) => !!v);
  });
}

/**
 * Compile a template string with context
 */
export function compileTemplate(templateString: string, context: TemplateContext): string {
  const template = Handlebars.compile(templateString);
  return template(context);
}

/**
 * Load and compile a template file
 */
export async function compileTemplateFile(
  templatePath: string,
  context: TemplateContext
): Promise<string> {
  const templatesDir = getTemplatesDir();
  const absolutePath = path.join(templatesDir, templatePath);
  const templateString = await readFile(absolutePath);
  return compileTemplate(templateString, context);
}

/**
 * Get template file path relative to templates directory
 */
export function getTemplatePath(relativePath: string): string {
  return path.join(getTemplatesDir(), relativePath);
}

// Register helpers on module load
registerHelpers();
