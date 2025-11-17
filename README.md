# App Workspace Generator

A flexible CLI tool to scaffold modern web and multi-platform applications with best practices, based on battle-tested patterns from production projects.

## 🎯 Vision

Generate production-ready project structures tailored to your needs through a simple interactive CLI. Whether you're building a standard web app, a Progressive Web App (PWA), or a full multi-platform solution with native iOS and Android apps, this generator sets you up with the right foundation.

## 📋 Prerequisites

Before using this generator, ensure you have the following tools installed:

### Required Tools

1. **Node.js** (v18 or higher)

   ```bash
   node --version  # Check version
   # Install from https://nodejs.org/ or use nvm
   ```

2. **Git**

   ```bash
   git --version  # Check version
   # macOS: brew install git
   # Ubuntu: sudo apt install git
   # https://git-scm.com/downloads
   ```

3. **GitHub CLI (gh)**

   ```bash
   gh --version  # Check version
   npm install -g gh  # Install
   gh auth login  # Authenticate
   # https://cli.github.com/
   ```

4. **Firebase CLI**
   ```bash
   firebase --version  # Check version
   npm install -g firebase-tools  # Install
   firebase login  # Authenticate
   firebase use <project-id>  # Select project
   # https://firebase.google.com/docs/cli
   ```

The generator will automatically check for these tools at startup and provide installation instructions if any are missing.

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

## 📦 Installation & Usage

### Option 1: Run Directly with npx (Recommended)

No installation required! Run the generator directly from GitHub:

```bash
# Create a new project interactively
npx github:aikix/app-workspace-generator create my-app

# Or use the shorter create command
npx github:aikix/app-workspace-generator create

# Use with a config file
npx github:aikix/app-workspace-generator create --config ./my-config.json
```

### Option 2: Install Globally

Install once, use anywhere:

```bash
# Install globally from GitHub
npm install -g github:aikix/app-workspace-generator

# Then use the CLI anywhere
app-workspace-generator create my-app

# Or use the shorter alias
awg create my-app
```

### Option 3: Clone and Develop Locally

For development or customization:

```bash
# Clone the repository
git clone https://github.com/aikix/app-workspace-generator.git
cd app-workspace-generator

# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
npm run dev -- create my-app

# Or link globally for testing
npm link
app-workspace-generator create my-app
```

## 🎮 CLI Interaction Flow

```bash
npx github:aikix/app-workspace-generator create

# Interactive prompts:
✨ Let's create your project!

? Project name: my-awesome-app
? Workspace type: (Use arrow keys)
  ❯ Single web app (recommended for starting)
    Progressive Web App (PWA)
    Multi-Platform (coming soon)

? UI component library:
  ❯ shadcn/ui (Radix + Tailwind, pre-styled components)
    Radix UI (Unstyled primitives, full control)
    None (custom design, recommended for learning)

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
npx github:aikix/app-workspace-generator create [project-name] [options]
```

#### Options

- `-c, --config <path>` - Path to configuration file (JSON)
- `--skip-install` - Skip dependency installation
- `-v, --verbose` - Verbose output
- `--debug` - Enable debug mode with detailed error information

#### Usage Modes

**Interactive Mode** (Default)

```bash
npx github:aikix/app-workspace-generator create
# Prompts you for all configuration options
```

**Quick Start Mode**

```bash
npx github:aikix/app-workspace-generator create my-app
# Creates project with default configuration
```

**Config File Mode**

```bash
npx github:aikix/app-workspace-generator create --config config.json
# Creates project from JSON configuration file
```

#### Firebase Auto-Setup

When you select Firebase as your backend, the CLI automatically sets up Firebase projects and configuration:

```bash
npx github:aikix/app-workspace-generator create my-app
# Select "Firebase" when prompted for backend services
```

The automatic Firebase setup will:

1. Verify Firebase CLI is installed and you're logged in
2. Prompt for Firebase project settings:
   - Base project name
   - Environments to create (dev, staging, prod)
   - Services to enable (Auth, Firestore, Storage)
   - Authentication providers (Email/Password, Google, Anonymous)
3. Create Firebase projects for each environment
4. Create web apps in each project
5. Retrieve Firebase SDK configurations
6. Generate `.env.local` for local development
7. Populate `apphosting.yaml` files for Firebase App Hosting deployments

**Prerequisites:**

- Firebase CLI must be installed: `npm install -g firebase-tools`
- You must be logged in: `firebase login`

**Example:**

```bash
# Create project with Firebase backend
npx app-workspace-generator create my-app

# During setup, you'll be prompted:
? Backend services: Firebase (Auth, Firestore, Storage)

# Then Firebase setup runs automatically:
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

# CLI will then create Firebase projects and generate config files
✨ Firebase Projects Created:
  ✓ my-app-dev
  ✓ my-app-prod

📝 Configuration Files:
  • .env.local (for local development)
  • apphosting.dev.yaml (for dev deployment)
  • apphosting.prod.yaml (for prod deployment)

🔗 Next steps:
  1. Review .env.local for local development
  2. Set environment name in Firebase Console App Hosting settings
  3. Deploy using Firebase App Hosting
```

**Environment Management:**

The generator uses [Firebase App Hosting's multi-environment approach](https://firebase.google.com/docs/app-hosting/multiple-environments):

- **Local Development**: Use `.env.local` with your development Firebase project
- **Deployment**: Use `apphosting.yaml` with environment-specific overrides
  - `apphosting.dev.yaml` - Development environment config
  - `apphosting.prod.yaml` - Production environment config

To deploy to different environments:

1. In Firebase Console > App Hosting > Settings > Environment
2. Set the "Environment name" to `dev` or `prod`
3. Push to your GitHub branch to trigger deployment
4. App Hosting will use the corresponding `apphosting.<env>.yaml` file

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
