# 🚀 Deployment Guide

This document explains the complete CI/CD pipeline and deployment process for this application.

## Architecture Overview

```
Feature Branch → develop → Daily PR → main
                    ↓                   ↓
                   CI                  CI + Semantic Release
                    ↓                   ↓
          Firebase App Hosting    Firebase App Hosting
           (auto-deploy)           (auto-deploy)
```

**Note**: Firebase App Hosting automatically builds and deploys when code is pushed to connected branches. GitHub Actions only handle CI/CD testing and semantic versioning - no deployment steps needed!

## Environments

### Development Environment
- **Branch**: `develop` (default branch)
- **Firebase Project**: Development project
- **URL**: `https://develop--<project-id>.web.app`
- **Deploy Trigger**: Auto-deploy on push to `develop`
- **Purpose**: Testing and validation before production

### Production Environment
- **Branch**: `main`
- **Firebase Project**: Production project  
- **URL**: `https://production--<project-id>.web.app` or custom domain
- **Deploy Trigger**: Auto-deploy after merge to `main` + semantic release
- **Purpose**: Live production application

## Workflow

### 1. Feature Development

```bash
# Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push and create PR to develop
git push origin feature/my-feature
gh pr create --base develop --title "feat: add new feature"
```

### 2. Development Deployment

When PR is merged to `develop`:
1. ✅ GitHub Actions: Run tests and linter
2. 🔥 Firebase App Hosting: Auto-detect push, build, and deploy
3. 🎉 Available at develop URL (https://develop--PROJECT_ID.web.app)

### 3. Production Release

#### Automated Daily Release (Recommended)

Every day at 10 AM UTC, a GitHub Action automatically:
1. 📊 Checks if there are new commits in `develop`
2. 📝 Generates changelog from commit messages
3. 🔀 Creates PR from `develop` to `main`
4. 👀 Team reviews and approves PR
5. ✅ Merge triggers production deployment

#### Manual Release

```bash
# Create release PR manually
gh pr create --base main --head develop --title "🚀 Production Release"

# After review and approval, merge PR
# This triggers:
# 1. Tests and build
# 2. Semantic versioning
# 3. Production deployment
```

### 4. Production Deployment

When PR is merged to `main`:
1. ✅ GitHub Actions: Run tests and linter
2. 🏷️ GitHub Actions: Semantic Release (versioning + changelog)
3. 🔥 Firebase App Hosting: Auto-detect push, build, and deploy
4. 🎉 Available at production URL

## Firebase App Hosting Setup

### Prerequisites

1. **Two Firebase Projects** (create if you don't have):
   - Development project (e.g., `my-app-dev`)
   - Production project (e.g., `my-app-prod`)

2. **Firebase CLI** (already installed by generator):
   ```bash
   firebase login
   ```

### Initial Setup (One-Time Manual Configuration)

#### TODO 1: Connect Repository to Firebase App Hosting

**Development Environment:**
1. Open Firebase Console: https://console.firebase.google.com/
2. Select your **development project** (e.g., `my-app-dev`)
3. Go to **App Hosting** section
4. Click "Get Started" or "Add Backend"
5. Connect your GitHub repository
6. Configure backend:
   - **Backend ID**: `develop`
   - **Branch**: `develop`
   - **Root directory**: `/` (or leave default)
   - **Region**: `us-central1` (or preferred region)
7. Review and create backend

**Production Environment:**
1. Select your **production project** (e.g., `my-app-prod`)
2. Go to **App Hosting** section
3. Connect the same GitHub repository
4. Configure backend:
   - **Backend ID**: `production`
   - **Branch**: `main`
   - **Root directory**: `/` (or leave default)
   - **Region**: `us-central1` (or preferred region)
5. Review and create backend

#### TODO 2: Configure Firebase Environment Variables

**For each backend (develop and production):**

In Firebase Console → App Hosting → Backend → Settings → Environment Variables:

Add the following variables:
```
NEXT_PUBLIC_FIREBASE_API_KEY=<your-api-key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<project-id>.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<project-id>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<project-id>.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<your-sender-id>
NEXT_PUBLIC_FIREBASE_APP_ID=<your-app-id>
```

**How to get these values:**
- Go to Firebase Console → Project Settings → General
- Scroll to "Your apps" section
- Select your web app or create one
- Copy the config values

#### TODO 3: Enable Authentication Providers

In Firebase Console for **both projects**:
1. Go to **Authentication** → **Sign-in method**
2. Enable **Google** provider:
   - Add support email
   - Save
3. Enable **Email/Password** provider:
   - Toggle "Email link (passwordless sign-in)"
   - Save
4. Add authorized domains (if needed):
   - Add your production domain
   - localhost is pre-authorized for development

#### TODO 4: Set Up Firestore (if using database)

For **both projects**:
1. Go to **Firestore Database**
2. Click "Create database"
3. Choose location (same as App Hosting region recommended)
4. Start in **production mode** (configure rules later)
5. Update security rules as needed

#### TODO 5: Configure GitHub Secret (Optional - only for semantic-release)

Only **one** secret needed for semantic versioning:

Navigate to: GitHub → Repository → Settings → Secrets and variables → Actions

Add:
```
GITHUB_TOKEN=<automatically provided by GitHub Actions>
```

**Note**: `GITHUB_TOKEN` is automatically provided by GitHub Actions. No manual setup needed unless you need a PAT with extended permissions.

## GitHub Actions Workflows

### `ci-develop.yml` - Development CI

**Triggers**:
- Push to `develop` branch
- Pull requests to `develop` branch

**Jobs**:
1. **Test**: Lint, type-check, build, and E2E tests

**Note**: No deployment step needed - Firebase App Hosting automatically deploys when code is pushed to `develop` branch.

### `ci-main.yml` - Production CI/CD

**Triggers**:
- Push to `main` branch

**Jobs**:
1. **Test**: Lint, type-check, build, and E2E tests
2. **Release**: Semantic versioning and changelog generation

**Note**: No deployment step needed - Firebase App Hosting automatically deploys after semantic-release commits the version tag.

### `release-pr.yml` - Daily Release PR

**Triggers**:
- Daily at 10 AM UTC (configurable)
- Manual trigger via GitHub Actions UI

**Jobs**:
1. Check for new commits in `develop`
2. Generate changelog from commits
3. Create PR from `develop` to `main`
4. Skip if no changes or PR already exists

## Semantic Versioning

This project uses [semantic-release](https://github.com/semantic-release/semantic-release) for automated versioning.

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Patch release (1.0.0 → 1.0.1)
fix: resolve login issue

# Minor release (1.0.0 → 1.1.0)
feat: add dark mode support

# Major release (1.0.0 → 2.0.0)
feat!: redesign authentication flow

BREAKING CHANGE: users need to re-authenticate
```

### Version Bumping

- `fix:` → Patch version (bug fixes)
- `feat:` → Minor version (new features)
- `feat!:` or `BREAKING CHANGE:` → Major version

## Rollback Strategy

### Rollback Development

```bash
# Revert commit in develop
git revert <commit-hash>
git push origin develop
# Auto-deploys reverted state
```

### Rollback Production

```bash
# Option 1: Revert and fast-forward
git checkout main
git revert <commit-hash>
git push origin main
# Triggers new release and deployment

# Option 2: Firebase Console
# Go to App Hosting → production → Rollouts
# Rollback to previous version
```

## Monitoring & Logs

### Firebase Console
- **App Hosting**: View deployment status, logs, metrics
- **Analytics**: User engagement and errors
- **Crashlytics**: Crash reports (if enabled)

### GitHub Actions
- **Actions Tab**: View workflow runs and logs
- **Deployments**: View deployment history

## Custom Domain Setup

### Development
```bash
firebase use my-app-dev
firebase hosting:sites:list
firebase hosting:channel:deploy <channel-name> --only develop
```

### Production
```bash
firebase use my-app-prod
firebase hosting:sites:list
# Add custom domain in Firebase Console
```

## Troubleshooting

### Build Fails
- Check Firebase secrets in GitHub
- Verify `.env` variables match Firebase config
- Review build logs in GitHub Actions

### Deployment Fails
- Verify Firebase service account has permissions
- Check `apphosting.yaml` configuration
- Review Firebase App Hosting logs

### Semantic Release Fails
- Verify commit messages follow conventional format
- Check `GITHUB_TOKEN` has write permissions
- Review `.releaserc.json` configuration

## Best Practices

1. **Always develop in feature branches** based on `develop`
2. **Review PRs thoroughly** before merging
3. **Test in development** before promoting to production
4. **Monitor production deployments** for issues
5. **Use semantic commit messages** for automated versioning
6. **Keep secrets secure** and rotate regularly
7. **Document breaking changes** in commit messages

## Additional Resources

- [Firebase App Hosting Docs](https://firebase.google.com/docs/app-hosting)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Semantic Release](https://github.com/semantic-release/semantic-release)
- [Conventional Commits](https://www.conventionalcommits.org/)

