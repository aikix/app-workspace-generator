# 🚀 Deployment Guide

This document explains the complete CI/CD pipeline and deployment process for this application.

## Architecture Overview

```
Feature Branch → develop (auto-deploy to dev) → main (auto-deploy to prod)
                    ↓                              ↓
              Firebase App Hosting          Firebase App Hosting
                 (Develop)                     (Production)
```

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
1. ✅ Run tests and linter
2. ✅ Build application with dev Firebase config
3. ✅ Deploy to Firebase App Hosting (develop environment)
4. 🎉 Available at develop URL

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
1. ✅ Run tests and linter
2. ✅ Build application with prod Firebase config
3. 🏷️ **Semantic Release**: Auto-version based on commits
4. 📝 Generate CHANGELOG.md
5. 🚀 Deploy to Firebase App Hosting (production)
6. 🎉 Available at production URL

## Firebase App Hosting Setup

### Prerequisites

1. **Two Firebase Projects**:
   - Development project (e.g., `my-app-dev`)
   - Production project (e.g., `my-app-prod`)

2. **Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

### Initial Setup

#### 1. Create Firebase App Hosting Sites

```bash
# For development
firebase use my-app-dev
firebase apphosting:backends:create develop \
  --location us-central1 \
  --service-account firebase-admin@my-app-dev.iam.gserviceaccount.com

# For production  
firebase use my-app-prod
firebase apphosting:backends:create production \
  --location us-central1 \
  --service-account firebase-admin@my-app-prod.iam.gserviceaccount.com
```

#### 2. Connect GitHub Repository

In Firebase Console:
1. Go to App Hosting
2. Connect your GitHub repository
3. Select appropriate branch for each backend:
   - `develop` backend → `develop` branch
   - `production` backend → `main` branch

#### 3. Configure GitHub Secrets

Navigate to GitHub → Settings → Secrets and variables → Actions

Add the following secrets:

**Development Secrets** (suffix with `_DEV`):
```
FIREBASE_PROJECT_ID_DEV=my-app-dev
FIREBASE_API_KEY_DEV=<from Firebase console>
FIREBASE_AUTH_DOMAIN_DEV=my-app-dev.firebaseapp.com
FIREBASE_STORAGE_BUCKET_DEV=my-app-dev.appspot.com
FIREBASE_MESSAGING_SENDER_ID_DEV=<from Firebase console>
FIREBASE_APP_ID_DEV=<from Firebase console>
FIREBASE_SERVICE_ACCOUNT_DEV=<service account JSON>
```

**Production Secrets** (suffix with `_PROD`):
```
FIREBASE_PROJECT_ID_PROD=my-app-prod
FIREBASE_API_KEY_PROD=<from Firebase console>
FIREBASE_AUTH_DOMAIN_PROD=my-app-prod.firebaseapp.com
FIREBASE_STORAGE_BUCKET_PROD=my-app-prod.appspot.com
FIREBASE_MESSAGING_SENDER_ID_PROD=<from Firebase console>
FIREBASE_APP_ID_PROD=<from Firebase console>
FIREBASE_SERVICE_ACCOUNT_PROD=<service account JSON>
```

**How to get service account JSON**:
```bash
# Development
firebase use my-app-dev
firebase projects:list
# Go to Firebase Console → Project Settings → Service Accounts
# Generate new private key → Copy JSON content

# Production
firebase use my-app-prod
# Repeat the same process
```

## GitHub Actions Workflows

### `ci-develop.yml` - Development CI/CD

**Triggers**:
- Push to `develop` branch
- Pull requests to `develop` branch

**Jobs**:
1. **Test**: Lint, type-check, build, test (on PRs)
2. **Deploy**: Deploy to Firebase App Hosting develop (on push)

### `ci-main.yml` - Production CI/CD

**Triggers**:
- Push to `main` branch

**Jobs**:
1. **Test & Build**: Lint, type-check, build, test
2. **Release**: Semantic versioning and changelog
3. **Deploy**: Deploy to Firebase App Hosting production

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

