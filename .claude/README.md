# Claude Code Configuration

This directory contains Claude Code settings for this project.

## Files

- **`settings.json`** - Shared project settings (committed to git)
  - Contains permissions and configurations that all team members should use
  - Defines allowed commands for Claude Code to run without prompting

- **`settings.local.json`** - Personal settings (gitignored)
  - Your personal overrides that won't be committed
  - Use this for your own custom permissions or settings
  - Settings here merge with and override `settings.json`

## Current Permissions

The shared settings allow Claude Code to run these commands without prompting:

- `chmod` - Make files executable
- `./bin/cli.js --version` - Test CLI version
- `npx husky init` - Initialize git hooks
- `npx lint-staged` - Run staged file linting
- `npx commitlint` - Validate commit messages

## Adding Custom Permissions

If you need personal permissions that shouldn't be shared with the team, add them to `settings.local.json`.

If you think a permission should be shared with everyone, add it to `settings.json` and commit it.

## Learn More

- [Claude Code Documentation](https://docs.claude.com/en/docs/claude-code)
- [Claude Code Settings](https://docs.claude.com/en/docs/claude-code/settings)
