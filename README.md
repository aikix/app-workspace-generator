# App Workspace Generator

A flexible CLI tool to scaffold modern web and multi-platform applications with best practices, based on battle-tested patterns from production projects.

## 🎯 Vision

Generate production-ready project structures tailored to your needs through a simple interactive CLI. Whether you're building a standard web app, a Progressive Web App (PWA), or a full multi-platform solution with native iOS and Android apps, this generator sets you up with the right foundation.

## 🚀 Features

### Flexible Project Types

- **Web App Only** - Standard Next.js web application
- **Progressive Web App (PWA)** - Installable, offline-capable web app
- **Multi-Platform** - PWA + Native iOS + Native Android apps

### Interactive CLI

- Simple question-based setup
- Smart defaults based on best practices
- Configurable tech stack options
- Automatic project structure generation

### Production-Ready Setup

- TypeScript configuration
- Linting and formatting (ESLint + Prettier)
- Testing setup (Playwright for E2E)
- Git workflow and conventions
- CI/CD pipeline templates
- Comprehensive documentation

## 📋 Supported Tech Stacks

### Web/PWA

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Backend**: Firebase (Auth, Firestore, Storage, Hosting)
- **State Management**: React Context / Zustand (optional)
- **Animation**: Motion (Framer Motion)
- **Testing**: Playwright (E2E)

### Native Apps

- **Wrapper**: PWABuilder + Capacitor
- **iOS**: Xcode project with native capabilities
- **Android**: Android Studio project with native capabilities

## 🎮 CLI Interaction Flow

```bash
npx app-workspace-generator create

# Interactive prompts:
✨ Let's create your project!

? Project name: my-awesome-app
? Workspace type: (Use arrow keys)
  ❯ Single web app (recommended for starting)
    Progressive Web App (PWA)
    Multi-Platform (coming soon)

? UI component library:
  ❯ None (recommended for custom design)
    Radix UI (coming soon)
    shadcn/ui (coming soon)

? Testing framework:
  ❯ None (skip testing)
    Playwright (E2E testing)

? State management solution:
  ❯ React Context (Built-in, good for auth & theme)
    Zustand
    None

? Backend services:
  ❯ None (frontend only)
    Firebase (Auth, Firestore, Storage)

? Generate AI agent instructions (CLAUDE.md)? (Y/n)
? Set up ESLint + Prettier? (Y/n)

✅ Creating project structure...
✅ Installing dependencies...
✅ Configuring Git...

🎉 Done! Your project is ready at ./my-awesome-app

📚 Next steps:
  cd my-awesome-app
  npm run dev

Note: Defaults automatically set:
  • Framework: Next.js 15 (App Router)
  • Language: TypeScript
  • Styling: Tailwind CSS v4
  • Package Manager: npm
```

## 🖥️ CLI Commands

### Create Command

```bash
npx app-workspace-generator create [project-name] [options]
```

#### Options

- `-c, --config <path>` - Path to configuration file (JSON)
- `--skip-install` - Skip dependency installation
- `--firebase-auto-setup` - Automatically set up Firebase projects and configuration
- `-v, --verbose` - Verbose output
- `--debug` - Enable debug mode with detailed error information

#### Usage Modes

**Interactive Mode** (Default)

```bash
npx app-workspace-generator create
# Prompts you for all configuration options
```

**Quick Start Mode**

```bash
npx app-workspace-generator create my-app
# Creates project with default configuration
```

**Config File Mode**

```bash
npx app-workspace-generator create --config config.json
# Creates project from JSON configuration file
```

#### Firebase Auto-Setup

The `--firebase-auto-setup` flag automates the Firebase project creation and configuration process:

```bash
npx app-workspace-generator create my-app --firebase-auto-setup
```

When enabled, the CLI will:

1. Verify Firebase CLI is installed and you're logged in
2. Prompt for Firebase project settings:
   - Base project name
   - Environments to create (dev, staging, prod)
   - Services to enable (Auth, Firestore, Storage)
   - Authentication providers (Email/Password, Google, Anonymous)
3. Create Firebase projects for each environment
4. Create web apps in each project
5. Retrieve Firebase SDK configurations
6. Generate `.env.local`, `.env.example`, and environment-specific `.env` files

**Prerequisites:**

- Firebase CLI must be installed: `npm install -g firebase-tools`
- You must be logged in: `firebase login`

**Example:**

```bash
# Create project with Firebase auto-setup
npx app-workspace-generator create my-app --firebase-auto-setup

# During setup, you'll be prompted:
🔥 Firebase Auto-Setup

✓ Firebase CLI verified
✓ Firebase login verified

? Firebase project base name? my-app
? Select environments to create: (Use arrow keys and space to select)
  ✓ Development (my-app-dev)
  ○ Staging (my-app-staging)
  ✓ Production (my-app-prod)

? Enable Firebase Authentication? (Y/n)
? Select auth providers: (Use arrow keys and space to select)
  ✓ Email/Password
  ○ Google
  ○ Anonymous

? Enable Cloud Firestore? (Y/n)
? Enable Cloud Storage? (Y/n)

# CLI will then create Firebase projects and generate .env files
✨ Firebase Projects Created:
  ✓ my-app-dev
  ✓ my-app-prod

📝 Configuration Files:
  • .env.local (primary config)
  • .env.example (template)
  • .env.dev
  • .env.prod
```

## 📁 Generated Project Structure

### Web App Only

```
my-awesome-app/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   ├── lib/              # Utilities and helpers
│   ├── hooks/            # Custom React hooks
│   └── types/            # TypeScript type definitions
├── public/               # Static assets
├── tests/                # E2E tests
├── .github/              # CI/CD workflows
├── docs/                 # Documentation
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── .env.local.example
├── .gitignore
├── CLAUDE.md            # AI assistant guidance
└── README.md
```

### Multi-Platform

```
my-awesome-app-workspace/
├── web/                  # PWA (same structure as above)
├── ios/                  # Native iOS app
│   ├── App/
│   ├── capacitor.config.ts
│   └── package.json
├── android/              # Native Android app
│   ├── app/
│   ├── capacitor.config.ts
│   └── package.json
├── my-awesome-app.code-workspace
├── CLAUDE.md            # Workspace-level guidance
└── README.md            # Workspace overview
```

## 🛠️ Development Roadmap

### Phase 1: Core CLI (Current)

- [x] Initialize repository
- [ ] Design CLI architecture
- [ ] Implement interactive prompts
- [ ] Create template structures
- [ ] Build file generation logic

### Phase 2: Template System

- [ ] Web app template (Next.js + TypeScript + Tailwind)
- [ ] PWA enhancements (manifest, service worker, offline)
- [ ] Firebase integration templates
- [ ] Authentication templates
- [ ] Database schemas and seed data

### Phase 3: Native Apps

- [ ] iOS project template (Capacitor)
- [ ] Android project template (Capacitor)
- [ ] Native capability integrations
- [ ] Platform-specific configurations

### Phase 4: Developer Experience

- [ ] Documentation generation
- [ ] CLAUDE.md templates for AI assistance
- [ ] Git setup and conventions
- [ ] CI/CD pipeline templates (GitHub Actions)
- [ ] Testing setup and examples

### Phase 5: Advanced Features

- [ ] Custom component library option
- [ ] Theme/design system setup
- [ ] i18n/l10n setup
- [ ] Analytics integration
- [ ] Performance monitoring

## 🎨 Design Principles

1. **Simplicity First** - Easy to use, minimal questions, smart defaults
2. **Production Ready** - Battle-tested patterns and configurations
3. **Flexible** - Support various project types and tech stacks
4. **Well Documented** - Comprehensive guides for every feature
5. **AI-Friendly** - Include CLAUDE.md files for AI assistant guidance
6. **Maintainable** - Clean code, TypeScript, tested, linted

## 🔧 Technical Architecture

### CLI Tool

- **Framework**: Commander.js or Inquirer.js
- **Language**: TypeScript
- **Template Engine**: EJS or custom
- **File Operations**: fs-extra
- **Package Management**: npm/yarn/pnpm detection

### Template Management

- Modular template system
- Conditional file inclusion
- Variable substitution
- Post-generation hooks

## 📖 Documentation Structure

Each generated project includes:

- `README.md` - Project overview and quick start
- `CLAUDE.md` - AI assistant guidance
- `docs/getting-started/` - Setup guides
- `docs/architecture/` - System design docs
- `docs/features/` - Feature documentation
- `docs/deployment/` - Deployment guides

## 🤝 Contributing

This project is based on learnings from [ChibiCart](https://chibicart.com) and aims to make those patterns reusable for any project.

## 📝 License

MIT

## 🎯 Next Steps

1. Design the CLI command structure
2. Create template directory structure
3. Implement interactive prompts
4. Build file generation engine
5. Add Firebase setup automation
6. Create comprehensive documentation templates
7. Test with real-world project generation
8. Publish to npm

---

**Goal**: Enable developers to spin up production-ready web and multi-platform applications in minutes, not days.
