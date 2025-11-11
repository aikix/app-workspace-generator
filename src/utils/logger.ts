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

  /**
   * Print ASCII banner
   */
  banner: () => {
    console.log();
    console.log(chalk.cyan.bold('╔═══════════════════════════════════════════════╗'));
    console.log(chalk.cyan.bold('║                                               ║'));
    console.log(
      chalk.cyan.bold('║  ') +
        chalk.white.bold('🚀  App Workspace Generator') +
        chalk.cyan.bold('              ║')
    );
    console.log(chalk.cyan.bold('║                                               ║'));
    console.log(
      chalk.cyan.bold('║  ') +
        chalk.gray('Create production-ready web applications') +
        chalk.cyan.bold('  ║')
    );
    console.log(
      chalk.cyan.bold('║  ') +
        chalk.gray('with AI agent instructions included') +
        chalk.cyan.bold('    ║')
    );
    console.log(chalk.cyan.bold('║                                               ║'));
    console.log(chalk.cyan.bold('╚═══════════════════════════════════════════════╝'));
    console.log();
  },

  /**
   * Print step indicator
   */
  stepIndicator: (current: number, total: number, message: string) => {
    const progress = `[${current}/${total}]`;
    console.log();
    console.log(chalk.cyan(progress), chalk.bold(message));
  },

  /**
   * Print file count with size
   */
  fileCount: (count: number, description: string) => {
    console.log(chalk.gray(`  → ${count} ${description}`));
  },

  /**
   * Print final summary box
   */
  summaryBox: (lines: string[]) => {
    const maxLength = Math.max(...lines.map((l) => l.length));
    const width = Math.min(maxLength + 4, 60);

    console.log();
    console.log(chalk.green(`┌${'─'.repeat(width - 2)}┐`));

    lines.forEach((line) => {
      const padding = ' '.repeat(Math.max(0, width - line.length - 4));
      console.log(chalk.green('│ ') + chalk.white(line) + padding + chalk.green(' │'));
    });

    console.log(chalk.green(`└${'─'.repeat(width - 2)}┘`));
    console.log();
  },

  /**
   * Print success message with celebration
   */
  celebrate: (message: string) => {
    console.log();
    console.log(chalk.green.bold(`🎉 ${message} 🎉`));
    console.log();
  },
};
