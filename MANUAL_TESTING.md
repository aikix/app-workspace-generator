# Manual Testing Guide

Comprehensive step-by-step guide to test all features of the app-workspace-generator.

## Prerequisites

Before testing, ensure you have:

- Node.js 20+ installed
- npm/yarn/pnpm/bun available
- Firebase CLI installed: `npm install -g firebase-tools`
- Firebase account (for Firebase features)
- Git initialized in test projects

## Test Setup

```bash
# Build the generator
cd /Users/junchao.zhang/Projects/app-workspace-generator
npm run build

# Link for local testing
npm link
```

---

## Test 1: Basic Project Generation (Quick Start)

**Purpose**: Test default configuration with minimal setup

```bash
# Create a test directory
mkdir -p /tmp/test-generator
cd /tmp/test-generator

# Generate with defaults
app-workspace-generator create test-basic

# Expected output:
# - Project name prompt with default 'my-app'
# - Creates test-basic/ directory
# - Generates Next.js project with TypeScript, Tailwind CSS
# - No Firebase, no animations by default
```

**Verify:**

```bash
cd test-basic
ls -la

# Should see:
# - package.json
# - tsconfig.json
# - next.config.js
# - tailwind.config.js
# - src/ directory with app/, components/, lib/
# - .github/ with templates
# - README.md, CLAUDE.md, CONTRIBUTING.md
# - .gitignore, .prettierrc.json
```

**Test the app:**

```bash
npm install
npm run dev
# Visit http://localhost:3000
# Should see working Next.js app with Tailwind

npm run build
npm run type-check
npm run lint
# All should pass
```

---

## Test 2: Interactive Mode with All Features

**Purpose**: Test full feature configuration through prompts

```bash
cd /tmp/test-generator

# Run interactive mode
app-workspace-generator create

# Answer prompts as follows:
? Project name: test-full-features
? Workspace type: Progressive Web App (PWA)
? Framework: Next.js (default)
? Use TypeScript: Yes
? Styling: Tailwind CSS (default)
? UI library: None (default)
? Testing: Playwright
? State management: Zustand
? Add animations with Framer Motion: Yes
? Backend: Firebase
? Firebase pattern: Client-side SDK
? Enable Authentication: Yes
? Enable Firestore: Yes
? Enable Storage: Yes
? Enable AI instructions (CLAUDE.md): Yes
? Enable architecture docs: Yes
? Enable linting: Yes
? Enable git hooks: Yes
? Package manager: npm (or your preference)
```

**Verify generated files:**

```bash
cd test-full-features
ls -la

# Should see PWA files:
ls -la public/
# - manifest.json
# - offline.html
# - icons/ directory
# - screenshots/ directory

# Should see Firebase files:
ls -la src/lib/firebase/
# - config.ts
# - auth.ts
# - firestore.ts
# - storage.ts

ls -la src/hooks/firebase/
# - useAuth.tsx
# - useFirestore.tsx
# - useStorage.tsx

ls -la src/components/storage/
# - FileUpload.tsx
# - ImageUpload.tsx
# - FileManager.tsx

# Should see animation files:
ls -la src/lib/animations/
# - variants.ts
# - hooks.ts
# - components/ (FadeIn, SlideIn, etc.)

# Should see Zustand store:
ls -la src/stores/
# - useAuthStore.ts
# - useThemeStore.ts

# Should see Playwright tests:
ls -la tests/
# - e2e/ (home.spec.ts, api.spec.ts, components.spec.ts)
# - page-objects/ (HomePage.ts, ComponentsPage.ts)
# - helpers/test-utils.ts
# - fixtures/test-data.ts

# Should see CI/CD workflows:
ls -la .github/workflows/
# - ci-develop.yml
# - ci-main.yml
# - release.yml
# - scheduled-prod-release.yml

# Should see semantic-release config:
cat .releaserc.json
```

**Test package.json dependencies:**

```bash
cat package.json | grep -A 20 '"dependencies"'
# Should include:
# - next, react, react-dom
# - firebase (for Firebase backend)
# - zustand (for state management)
# - framer-motion (for animations)
# - next-pwa (for PWA)

cat package.json | grep -A 30 '"devDependencies"'
# Should include:
# - @playwright/test (for E2E testing)
# - husky, lint-staged, @commitlint/* (for git hooks)
# - semantic-release, @semantic-release/* (for releases)
```

**Test the app:**

```bash
npm install

# Test development server
npm run dev
# Visit http://localhost:3000
# - Should see Next.js app
# - Check /components page for UI showcase
# - Animations should work (if viewing animated components)

# Test type checking
npm run type-check
# Should pass

# Test linting
npm run lint
# Should pass

# Test build
npm run build
# Should build successfully

# Test E2E tests (requires app to be running)
npm run dev &
sleep 5
npm run e2e
# Playwright tests should run
kill %1  # Stop dev server
```

---

## Test 3: Firebase Auto-Setup

**Purpose**: Test automated Firebase project creation and configuration

**Prerequisites:**

- Firebase CLI installed
- Logged in to Firebase: `firebase login`
- Have permission to create Firebase projects

```bash
cd /tmp/test-generator

# Generate project and select Firebase backend
app-workspace-generator create test-firebase

# Answer prompts:
? Use TypeScript: Yes
? Styling: Tailwind CSS
? Testing: Playwright
? State management: Context
? Backend: Firebase  # Selecting Firebase triggers automatic setup
? Firebase pattern: Client-side SDK
? Enable Authentication: Yes
? Enable Firestore: Yes
? Enable Storage: Yes
# ... other prompts ...

# Firebase auto-setup will run automatically:
🔥 Firebase Auto-Setup

✓ Firebase CLI verified
✓ Firebase login verified

? Firebase project base name: test-firebase-gen
? Select environments: (select dev and prod)
  ✓ Development (test-firebase-gen-dev)
  ○ Staging
  ✓ Production (test-firebase-gen-prod)

? Enable Firebase Authentication: Yes
? Select auth providers: Email/Password, Google

? Enable Cloud Firestore: Yes
? Enable Cloud Storage: Yes
```

**Wait for Firebase setup to complete:**

```
✨ Firebase Projects Created:
  ✓ test-firebase-gen-dev
  ✓ test-firebase-gen-prod

📝 Configuration Files:
  • .env.local (for local development)
  • apphosting.dev.yaml (for dev deployment)
  • apphosting.prod.yaml (for prod deployment)

🔗 Next steps:
  1. Review .env.local for local development
  2. Set environment name in Firebase Console App Hosting settings
  3. Configure Firebase services in console
  4. Review apphosting.yaml files for deployment config
```

**Verify Firebase setup:**

```bash
cd test-firebase

# Check configuration files
ls -la .env* apphosting*.yaml
# Should see:
# - .env.local (with dev config for local development)
# - apphosting.yaml (base configuration)
# - apphosting.dev.yaml (dev environment config)
# - apphosting.prod.yaml (prod environment config)

# Verify .env.local has real Firebase credentials for local dev
cat .env.local
# Should contain:
# NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
# NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=test-firebase-gen-dev.firebaseapp.com
# NEXT_PUBLIC_FIREBASE_PROJECT_ID=test-firebase-gen-dev
# ... etc

# Verify apphosting.yaml files have real Firebase configs
cat apphosting.dev.yaml
# Should contain actual Firebase config values, not placeholders

# Verify Firebase projects were created
firebase projects:list
# Should show:
# - test-firebase-gen-dev
# - test-firebase-gen-prod
```

**Test Firebase integration:**

```bash
npm install
npm run dev
# Visit http://localhost:3000

# Open browser console
# Check that Firebase initializes without errors
# Try Firebase features if implemented (auth, firestore, storage)
```

**Cleanup (optional):**

```bash
# Delete test Firebase projects
firebase projects:delete test-firebase-gen-dev
firebase projects:delete test-firebase-gen-prod
```

---

## Test 4: Server-First Firebase Pattern

**Purpose**: Test Firebase Admin SDK pattern

```bash
cd /tmp/test-generator

app-workspace-generator create test-firebase-admin

# Answer prompts:
? Backend: Firebase
? Firebase pattern: Server-first (Admin SDK)
? Enable Authentication: Yes
? Enable Firestore: Yes
# ... other prompts ...
```

**Verify server-first files:**

```bash
cd test-firebase-admin

# Should have Firebase Admin SDK files
ls -la src/lib/firebase-admin/
# - config.ts
# - auth.ts
# - firestore.ts
# - session.ts

# Should have middleware for auth
cat middleware.ts
# Should contain session management code

# Should have server actions
ls -la src/app/actions/
# - example.ts

# Check .env.example for Admin SDK variables
cat .env.example | grep FIREBASE
# Should see:
# FIREBASE_PROJECT_ID=...
# FIREBASE_CLIENT_EMAIL=...
# FIREBASE_PRIVATE_KEY=...
```

---

## Test 5: Config File Mode (AI Agent Mode)

**Purpose**: Test non-interactive generation from config file

```bash
cd /tmp/test-generator

# Create config file
cat > test-config.json << 'EOF'
{
  "name": "test-from-config",
  "description": "Project generated from config file",
  "author": "Test User",
  "workspace": {
    "type": "single",
    "platforms": ["web"]
  },
  "web": {
    "framework": "next",
    "typescript": true,
    "styling": "tailwind",
    "ui": "none",
    "testing": "playwright",
    "stateManagement": "zustand",
    "animations": true,
    "linting": true,
    "formatting": true,
    "gitHooks": true
  },
  "backend": {
    "type": "firebase",
    "features": ["auth", "database", "storage"],
    "firebasePattern": "client-side"
  },
  "documentation": {
    "aiInstructions": true,
    "architecture": true,
    "apiDocs": false,
    "styleguide": false
  },
  "packageManager": "npm"
}
EOF

# Generate from config
app-workspace-generator create --config test-config.json

# Should generate without prompts
```

**Verify:**

```bash
cd test-from-config
ls -la

# Verify all features from config are present
# - Firebase integration
# - Zustand stores
# - Animation files
# - Playwright tests
# - CI/CD workflows

npm install
npm run build
# Should build successfully
```

---

## Test 6: Animations Feature

**Purpose**: Test Framer Motion integration and animations

```bash
cd /tmp/test-generator

app-workspace-generator create test-animations

# Answer prompts:
? Add animations with Framer Motion: Yes
# ... other prompts ...
```

**Verify animation files:**

```bash
cd test-animations

# Check animation utilities
cat src/lib/animations/variants.ts
# Should have: fadeIn, slideUp, slideDown, slideInLeft, slideInRight,
#              scaleIn, bounceIn, staggerContainer, etc.

cat src/lib/animations/hooks.ts
# Should have: usePrefersReducedMotion, useInView, useScrollAnimation,
#              useScrollPosition, useMousePosition, useReducedMotionVariants

# Check animation components
ls -la src/lib/animations/components/
# - FadeIn.tsx
# - SlideIn.tsx
# - ScrollReveal.tsx
# - Stagger.tsx
# - PageTransition.tsx
# - index.ts

# Verify framer-motion dependency
cat package.json | grep framer-motion
# Should show: "framer-motion": "^12.3.0"
```

**Test animations:**

```bash
npm install

# Create a test page with animations
cat > src/app/test-animations/page.tsx << 'EOF'
'use client';

import { FadeIn, SlideIn, ScrollReveal, Stagger } from '@/lib/animations';

export default function TestAnimationsPage() {
  return (
    <div className="container mx-auto p-8 space-y-8">
      <FadeIn>
        <h1 className="text-4xl font-bold">Animation Tests</h1>
      </FadeIn>

      <SlideIn direction="up">
        <div className="bg-blue-500 text-white p-4 rounded">
          Slides up from bottom
        </div>
      </SlideIn>

      <SlideIn direction="left">
        <div className="bg-green-500 text-white p-4 rounded">
          Slides in from left
        </div>
      </SlideIn>

      <Stagger>
        <div className="bg-purple-500 text-white p-4 rounded">Item 1</div>
        <div className="bg-purple-500 text-white p-4 rounded">Item 2</div>
        <div className="bg-purple-500 text-white p-4 rounded">Item 3</div>
      </Stagger>

      <div style={{ height: '100vh' }} />

      <ScrollReveal>
        <div className="bg-orange-500 text-white p-4 rounded">
          Animates when scrolled into view
        </div>
      </ScrollReveal>
    </div>
  );
}
EOF

npm run dev
# Visit http://localhost:3000/test-animations
# - FadeIn should fade in
# - SlideIn should slide from specified direction
# - Stagger should animate children sequentially
# - ScrollReveal should animate when you scroll down
```

---

## Test 7: CI/CD Workflows

**Purpose**: Test GitHub Actions workflow generation

```bash
cd /tmp/test-generator

app-workspace-generator create test-cicd

# Answer prompts:
? Enable git hooks: Yes
? Backend: Firebase
# ... other prompts ...
```

**Verify CI/CD files:**

```bash
cd test-cicd

# Check workflow files
ls -la .github/workflows/
# Should see:
# - ci-develop.yml
# - ci-main.yml
# - release.yml
# - scheduled-prod-release.yml

# Check semantic-release config
cat .releaserc.json
# Should have branches: main and develop (beta)

# Check Firebase deployment guide (if Firebase backend)
cat scripts/service-accounts/README.md
# Should have detailed deployment instructions

# Verify semantic-release dependencies
cat package.json | grep semantic-release
# Should include semantic-release and plugins
```

**Test workflows (requires Git):**

```bash
# Initialize git repo
git init
git add .
git commit -m "feat: initial commit"

# Check if workflows are valid YAML
npm install -g js-yaml
for file in .github/workflows/*.yml; do
  echo "Validating $file"
  js-yaml "$file" > /dev/null && echo "✓ Valid" || echo "✗ Invalid"
done
```

---

## Test 8: PWA Features

**Purpose**: Test Progressive Web App configuration

```bash
cd /tmp/test-generator

app-workspace-generator create test-pwa

# Answer prompts:
? Workspace type: Progressive Web App (PWA)
? PWA offline support: Yes
? PWA installable: Yes
? PWA notifications: No
# ... other prompts ...
```

**Verify PWA files:**

```bash
cd test-pwa

# Check manifest
cat public/manifest.json
# Should have PWA configuration

# Check offline page
cat public/offline.html
# Should have offline fallback page

# Check icons directory
ls -la public/icons/
# Should have README.md with instructions

# Check for next-pwa dependency
cat package.json | grep next-pwa
# Should show: "next-pwa": "^5.6.0"

# Check InstallPrompt component (if installable)
cat src/components/pwa/InstallPrompt.tsx
# Should have install prompt component
```

---

## Test 9: Different Package Managers

**Purpose**: Test generation with different package managers

```bash
cd /tmp/test-generator

# Test with pnpm
app-workspace-generator create test-pnpm
# Select pnpm as package manager
cd test-pnpm
pnpm install
pnpm run build

# Test with yarn
cd /tmp/test-generator
app-workspace-generator create test-yarn
# Select yarn as package manager
cd test-yarn
yarn install
yarn build

# Test with bun
cd /tmp/test-generator
app-workspace-generator create test-bun
# Select bun as package manager
cd test-bun
bun install
bun run build
```

---

## Test 10: State Management Options

**Purpose**: Test different state management solutions

### Test Context API:

```bash
cd /tmp/test-generator
app-workspace-generator create test-context

# Select: State management: React Context
cd test-context

# Verify Context files
ls -la src/contexts/
# - AuthContext.tsx
# - ThemeContext.tsx
```

### Test Zustand:

```bash
cd /tmp/test-generator
app-workspace-generator create test-zustand

# Select: State management: Zustand
cd test-zustand

# Verify Zustand stores
ls -la src/stores/
# - useAuthStore.ts
# - useThemeStore.ts

# Verify zustand dependency
cat package.json | grep zustand
# Should show: "zustand": "^5.0.2"
```

---

## Test 11: Playwright E2E Tests

**Purpose**: Test E2E testing setup

```bash
cd /tmp/test-generator
app-workspace-generator create test-e2e

# Select: Testing: Playwright
cd test-e2e

npm install

# Verify Playwright config
cat playwright.config.ts
# Should have multi-browser config

# Run E2E tests
npx playwright install --with-deps
npm run dev &
sleep 5
npm run e2e

# Should run tests successfully:
# - home.spec.ts (homepage tests)
# - api.spec.ts (API tests)
# - components.spec.ts (component tests)

kill %1  # Stop dev server

# Check test utilities
cat tests/helpers/test-utils.ts
# Should have 20+ utility functions

# Check page objects
cat tests/page-objects/HomePage.ts
# Should have Page Object Model pattern
```

---

## Test 12: Skip Install Flag

**Purpose**: Test --skip-install flag

```bash
cd /tmp/test-generator

app-workspace-generator create test-skip-install --skip-install

# Should generate project but NOT run npm install
cd test-skip-install
ls -la node_modules/
# Should not exist

# Manually install
npm install
# Now node_modules should exist
```

---

## Test 13: Git Hooks

**Purpose**: Test Husky, lint-staged, and commitlint

```bash
cd /tmp/test-generator
app-workspace-generator create test-git-hooks

# Select: Enable git hooks: Yes
cd test-git-hooks

npm install

# Initialize git
git init
git add .

# Verify Husky setup
ls -la .husky/
# Should see:
# - pre-commit
# - commit-msg

# Test pre-commit hook (runs lint-staged)
echo "const x = 'test'" > src/test.ts
git add src/test.ts
git commit -m "test: add test file"
# Lint and format should run automatically

# Test commit-msg hook (commitlint)
git commit --allow-empty -m "invalid commit message"
# Should fail with commitlint error

git commit --allow-empty -m "feat: valid commit message"
# Should succeed
```

---

## Test 14: Documentation Generation

**Purpose**: Test generated documentation

```bash
cd /tmp/test-generator
app-workspace-generator create test-docs

# Select: Enable AI instructions: Yes, Enable architecture docs: Yes
cd test-docs

# Verify documentation files
cat CLAUDE.md
# Should have AI assistant instructions

cat README.md
# Should have project overview and setup instructions

cat CONTRIBUTING.md
# Should have contribution guidelines

ls -la .github/
# Should have PR and issue templates
```

---

## Common Issues & Troubleshooting

### Issue: Firebase CLI not found

```bash
npm install -g firebase-tools
firebase login
```

### Issue: Type errors during build

```bash
# Known issue with inquirer types (pre-existing)
# Check that build completes despite warnings
npm run build 2>&1 | grep "error TS" | wc -l
# Should show 6 or fewer errors (all in interactive.ts)
```

### Issue: Port 3000 already in use

```bash
# Kill existing process
lsof -ti:3000 | xargs kill -9
# Or use different port
PORT=3001 npm run dev
```

### Issue: Playwright tests fail

```bash
# Install browsers
npx playwright install --with-deps

# Make sure dev server is running
npm run dev &
npm run e2e
kill %1
```

---

## Test Summary Checklist

- [ ] Basic project generation works
- [ ] Interactive mode with all features works
- [ ] Firebase auto-setup creates projects and .env files
- [ ] Server-first Firebase pattern generates correctly
- [ ] Config file mode generates without prompts
- [ ] Animations feature includes all components and hooks
- [ ] CI/CD workflows are generated and valid
- [ ] PWA features are included when selected
- [ ] Different package managers work (npm, yarn, pnpm, bun)
- [ ] Context API and Zustand state management work
- [ ] Playwright E2E tests run successfully
- [ ] Skip install flag works
- [ ] Git hooks trigger on commit
- [ ] Documentation files are generated

---

## Performance Testing

Test generation speed:

```bash
time app-workspace-generator create perf-test --skip-install
# Should complete in < 10 seconds
```

---

## Cleanup

After testing, clean up:

```bash
cd /tmp/test-generator
rm -rf test-*
cd /Users/junchao.zhang/Projects/app-workspace-generator
npm unlink
```
