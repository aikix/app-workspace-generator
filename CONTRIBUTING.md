# Contributing to App Workspace Generator

Thank you for your interest in contributing! This document outlines the development workflow, coding standards, and best practices for this project.

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm (comes with Node.js)
- Git

### Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd app-workspace-generator
```

2. Install dependencies:

```bash
npm install
```

3. Build the project:

```bash
npm run build
```

### Claude Code Setup (Optional)

If you're using [Claude Code](https://docs.claude.com/en/docs/claude-code), this project includes shared settings in `.claude/settings.json` that configure helpful permissions for development tasks.

The settings are automatically loaded when you open the project. You can customize permissions in `.claude/settings.local.json` for your personal preferences without affecting the team.

## 🛠️ Development Workflow

### Available Scripts

- `npm run dev` - Run in development mode with watch
- `npm run build` - Build the project for production
- `npm run type-check` - Check TypeScript types
- `npm run lint` - Lint code with ESLint
- `npm run lint:fix` - Auto-fix linting issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Generate test coverage report

### Making Changes

1. Create a new branch:

```bash
git checkout -b feat/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

2. Make your changes following the coding standards

3. Test your changes:

```bash
npm run build
npm run test
npm run lint
```

4. Commit your changes (see commit guidelines below)

5. Push to your branch:

```bash
git push origin feat/your-feature-name
```

6. Open a Pull Request

## 📝 Commit Guidelines

This project uses [Conventional Commits](https://www.conventionalcommits.org/) for commit messages. All commits must follow this format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Commit Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, missing semi colons, etc)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **build**: Build system or external dependencies
- **ci**: CI configuration changes
- **chore**: Other changes that don't modify src or test files
- **revert**: Reverts a previous commit

### Examples

```bash
feat(cli): add interactive mode for project creation
fix(generator): resolve template path resolution issue
docs(readme): update installation instructions
refactor(utils): simplify file system operations
test(validators): add tests for project name validation
```

### Commit Message Validation

Commit messages are automatically validated using [Commitlint](https://commitlint.js.org/) via Git hooks. Invalid commit messages will be rejected.

## 🎨 Code Style & Quality

### ESLint

This project uses ESLint with TypeScript support. The configuration includes:

- TypeScript ESLint plugin
- Consistent import styles (type imports)
- No unused variables
- Consistent code patterns

Run linting:

```bash
npm run lint
npm run lint:fix  # Auto-fix issues
```

### Prettier

Code formatting is enforced using Prettier with the following settings:

- Single quotes
- Semicolons
- 2 spaces indentation
- 100 character line width
- LF line endings

Format code:

```bash
npm run format
npm run format:check  # Check without fixing
```

### TypeScript

All code must be written in TypeScript with strict type checking enabled.

Run type checking:

```bash
npm run type-check
```

## 🔗 Git Hooks

This project uses [Husky](https://typicode.github.io/husky/) for Git hooks:

### Pre-commit Hook

Runs automatically before each commit:

- Lints staged files with ESLint (auto-fixes)
- Formats staged files with Prettier
- Only processes staged files (via lint-staged)

### Commit-msg Hook

Validates commit messages against Conventional Commits format.

## 🧪 Testing

### Writing Tests

- Place test files next to the source files with `.test.ts` extension
- Use descriptive test names
- Follow the AAA pattern: Arrange, Act, Assert
- Aim for high test coverage

### Running Tests

```bash
npm run test           # Run tests in watch mode
npm run test -- --run  # Run tests once
npm run test:coverage  # Generate coverage report
npm run test:ui        # Run with UI
```

## 📦 Pull Request Process

1. **Create a PR** targeting the `main` or `develop` branch

2. **PR Title**: Follow Conventional Commits format

   ```
   feat(scope): add new feature
   fix(scope): resolve bug
   ```

3. **Description**: Provide a clear description of:
   - What changes were made
   - Why these changes were necessary
   - Any breaking changes
   - Related issues

4. **Checks**: Ensure all CI checks pass:
   - ✅ Linting
   - ✅ Type checking
   - ✅ Tests
   - ✅ Build

5. **Review**: Wait for code review and address feedback

6. **Merge**: Once approved, the PR will be merged

## 🚢 Release Process

This project uses [semantic-release](https://semantic-release.gitbook.io/) for automated versioning and releases.

### How It Works

1. When commits are pushed to `main`:
   - semantic-release analyzes commit messages
   - Determines the next version based on commit types:
     - `feat:` → Minor version bump (0.x.0)
     - `fix:`, `perf:`, `refactor:` → Patch version bump (0.0.x)
     - `BREAKING CHANGE:` → Major version bump (x.0.0)
   - Generates CHANGELOG.md
   - Creates a GitHub release
   - Publishes to npm (if configured)

2. Version is automatically updated in:
   - package.json
   - package-lock.json
   - CHANGELOG.md

### Manual Release (if needed)

```bash
npm run release
```

## 🔍 Code Review Guidelines

When reviewing PRs, check for:

- ✅ Code follows project conventions
- ✅ Tests are included and passing
- ✅ Documentation is updated
- ✅ No unnecessary dependencies added
- ✅ Performance considerations
- ✅ Security considerations
- ✅ Backwards compatibility (or breaking changes are documented)

## 📚 Additional Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)
- [Semantic Release](https://semantic-release.gitbook.io/)

## 🤝 Questions?

If you have questions or need help, please:

1. Check existing documentation
2. Search for existing issues
3. Open a new issue with the `question` label

## 📄 License

By contributing, you agree that your contributions will be licensed under the project's MIT License.
