import chalk from 'chalk';

/**
 * Colorized logging utilities for CLI output
 */

export const logger = {
  info: (message: string) => {
    console.log(chalk.blue('ℹ'), message);
  },

  success: (message: string) => {
    console.log(chalk.green('✓'), message);
  },

  warning: (message: string) => {
    console.log(chalk.yellow('⚠'), message);
  },

  error: (message: string) => {
    console.log(chalk.red('✗'), message);
  },

  step: (message: string) => {
    console.log(chalk.cyan('→'), message);
  },

  header: (message: string) => {
    console.log();
    console.log(chalk.bold.magenta(message));
    console.log();
  },

  section: (title: string) => {
    console.log();
    console.log(chalk.bold.cyan(`📦 ${title}...`));
  },

  tip: (message: string) => {
    console.log(chalk.gray('💡'), chalk.gray(message));
  },

  newLine: () => {
    console.log();
  },
};
