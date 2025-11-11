# Internal Release Guide

This document explains how to install and test internal releases before public npm publication.

## 🔒 Current Status

- **NPM Publishing**: Disabled (internal use only)
- **GitHub Releases**: Enabled (for version tracking and distribution)
- **Package Privacy**: Set to `private` in package.json

## 📦 Installation Methods

### Method 1: Install from GitHub (Recommended)

Team members can install directly from GitHub:

```bash
# Install latest release
npm install aikix/app-workspace-generator

# Or install a specific version/tag
npm install aikix/app-workspace-generator#v0.1.0

# Or install from a specific branch
npm install aikix/app-workspace-generator#main
```

### Method 2: Install from Local Clone

For development and testing:

```bash
# Clone the repository
git clone https://github.com/aikix/app-workspace-generator.git
cd app-workspace-generator

# Install dependencies and build
npm install
npm run build

# Link globally for testing
npm link

# Now you can use the CLI
awg create my-test-project
```

### Method 3: Install from GitHub Release Assets

Download the release artifacts from GitHub Releases:

1. Go to: https://github.com/aikix/app-workspace-generator/releases
2. Download the `dist` artifact from the latest release
3. Extract and use the built files

## 🧪 Testing Workflow

### For Team Members

1. **Install from GitHub:**

   ```bash
   npm install aikix/app-workspace-generator
   ```

2. **Test the CLI:**

   ```bash
   npx app-workspace-generator create test-project
   # or
   npx awg create test-project
   ```

3. **Report Issues:**
   - Open GitHub issues for bugs
   - Use Discussions for questions
   - Submit PRs for improvements

### For Maintainers

1. **Create Internal Release:**

   ```bash
   # Commit changes with conventional commit message
   git add .
   git commit -m "feat: add new feature"
   git push origin main
   ```

2. **Semantic-release will automatically:**
   - ✅ Analyze commits and determine version
   - ✅ Update package.json version
   - ✅ Generate CHANGELOG.md
   - ✅ Create GitHub Release with artifacts
   - ❌ Skip npm publishing (disabled)

3. **Notify team:**
   - Share the GitHub Release link
   - Update internal documentation
   - Announce in team channels

## 🚀 When Ready for Public Release

When you're ready to publish to npm:

1. **Update `.releaserc.json`:**

   ```json
   "@semantic-release/npm"
   ```

   (Remove the `npmPublish: false` config)

2. **Update `package.json`:**
   Remove the `"private": true` line

3. **Add NPM_TOKEN to GitHub Secrets:**
   - Generate npm token: https://www.npmjs.com/settings/YOUR_USERNAME/tokens
   - Add to GitHub: Repository Settings → Secrets → Actions → `NPM_TOKEN`

4. **Next merge to main will publish to npm automatically**

## 📋 Version Strategy for Internal Testing

- `v0.1.0` - First internal release
- `v0.2.0` - Additional features, internal feedback iteration
- `v0.9.x` - Release candidates for public release
- `v1.0.0` - First public release to npm

## 🔍 Monitoring Internal Releases

- **GitHub Releases**: https://github.com/aikix/app-workspace-generator/releases
- **CHANGELOG.md**: Updated automatically with each release
- **Actions**: https://github.com/aikix/app-workspace-generator/actions

## 💡 Tips

- Each release creates a git tag (e.g., `v0.1.0`)
- Team members can pin to specific versions for stability
- Use semantic versioning to communicate changes
- Test thoroughly in internal projects before going public

## 🤝 Internal Team Access

Ensure team members have:

- ✅ Read access to the GitHub repository
- ✅ npm/npx installed (for running the CLI)
- ✅ Node.js >= 18 (project requirement)

## 📞 Support

For internal support:

- GitHub Issues: Bug reports and feature requests
- GitHub Discussions: Questions and general discussion
- Team channels: Quick questions and updates
