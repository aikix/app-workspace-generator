# Issue Workflow & Dependency Management

This document explains how to use the automated issue dependency system for parallel AI agent development.

## 🎯 Overview

Issues are organized with:

- **Dependencies**: Defined in `.github/issue-dependencies.json`
- **Labels**: `ready`, `blocked`, `in-progress`, `wave-1/2/3`, `priority-high/medium/low`
- **Automation**: GitHub Actions automatically updates blocked → ready when dependencies close

## 🚀 Quick Start for AI Agents

### 1. Find and claim your next issue

```bash
# Get the highest priority ready issue
./scripts/get-next-issue.sh agent-name

# Get only high priority issues
./scripts/get-next-issue.sh agent-name high

# Or manually query
gh issue list --label "ready,priority-high" --state open
```

### 2. Work on the issue

Once claimed, the issue will be:

- ✅ Labeled `in-progress`
- 🚫 Removed from `ready`
- 👤 Assigned to you

### 3. Complete and close

When done, close the issue:

```bash
gh issue close <number> --comment "✅ Completed! [brief description]"
```

The automation will automatically:

- Check all blocked issues
- Mark newly unblocked issues as `ready`
- Notify via comments

## 📊 Issue States

### Ready (`ready` label)

- ✅ No blocking dependencies
- ✅ Can be worked on immediately
- 🎯 Agents should pick from these

**Query ready issues:**

```bash
# All ready issues
gh issue list --label "ready" --state open

# By priority
gh issue list --label "ready,priority-high" --state open

# By phase
gh issue list --label "ready,phase-1" --state open
```

### Blocked (`blocked` label)

- 🚫 Has open dependencies
- ⏳ Will become `ready` when dependencies close
- 📋 Can't be worked on yet

**Query blocked issues:**

```bash
gh issue list --label "blocked" --state open
```

### In Progress (`in-progress` label)

- 🔨 Currently being worked on
- 👤 Has assignee
- ⚠️ Only one agent per issue

**Query in-progress issues:**

```bash
gh issue list --label "in-progress" --state open
```

## 🔧 Setup & Maintenance

### Initial Setup (Run once)

```bash
# Setup all dependencies
./scripts/setup-issue-dependencies.sh
```

This will:

1. Read dependencies from `.github/issue-dependencies.json`
2. Mark issues with no dependencies as `ready`
3. Mark issues with dependencies as `blocked`
4. Add blocking comments to blocked issues

### Manual Updates (Run after closing issues)

```bash
# Check and update blocked → ready
./scripts/update-ready-issues.sh
```

**Note:** GitHub Actions runs this automatically, but you can run manually if needed.

### Editing Dependencies

Edit `.github/issue-dependencies.json` to add/change dependencies:

```json
{
  "dependencies": {
    "5": [4], // Issue #5 blocked by #4
    "12": [4, 5], // Issue #12 blocked by #4 AND #5
    "16": [14] // Issue #16 blocked by #14
  }
}
```

After editing, run:

```bash
./scripts/setup-issue-dependencies.sh
```

## 📋 Dependency Graph

### Wave 1: Foundation (Ready Now)

- #4: Next.js template ⭐ **CRITICAL BLOCKER**
- #6: Progress indicators
- #7: Error handling
- #32: Git workflow
- #36: VS Code config

### Wave 2: After #4

- #5: Tailwind (needs #4)
- #8: TypeScript (needs #4)
- #9: Next.js config (needs #4)
- #10: Environment variables (needs #4)

### Wave 3: After Wave 2

- #12: Components (needs #4, #5)
- #13: README (needs #10)
- #14: Firebase client (needs #4, #10)
- #15: Firebase server (needs #4, #10)

**See `.github/issue-dependencies.json` for complete graph**

## 🤖 Automation

### GitHub Actions Workflow

Located at `.github/workflows/update-issue-dependencies.yml`

**Triggers:**

- When any issue is closed

**Actions:**

1. Runs `update-ready-issues.sh`
2. Checks all blocked issues
3. Updates to `ready` if dependencies met
4. Adds notification comments

### Manual Trigger

You can also trigger the workflow manually:

```bash
gh workflow run update-issue-dependencies.yml
```

## 💡 Tips for AI Agents

### 1. Always claim before starting

```bash
./scripts/get-next-issue.sh your-agent-name
```

### 2. Check dependencies before starting

```bash
gh issue view <number> --json body | jq -r '.body' | grep "BLOCKED BY"
```

### 3. Focus on high priority first

```bash
./scripts/get-next-issue.sh your-agent-name high
```

### 4. Work on one issue at a time

- Don't claim multiple issues
- Finish before claiming next

### 5. Close when complete

```bash
gh issue close <number> --comment "✅ Completed!

Summary:
- [what was done]
- [any notes]

Ready for review."
```

## 📈 Monitoring Progress

### Dashboard Queries

```bash
# Overall status
echo "Ready: $(gh issue list --label ready --state open --jq '. | length')"
echo "Blocked: $(gh issue list --label blocked --state open --jq '. | length')"
echo "In Progress: $(gh issue list --label in-progress --state open --jq '. | length')"
echo "Closed: $(gh issue list --state closed --jq '. | length')"

# By phase
gh issue list --label "phase-1" --state all --json number,state,labels \
  --jq 'group_by(.state) | map({state: .[0].state, count: length})'

# Critical path (is #4 done?)
gh issue view 4 --json state,title --jq '"#4: \(.title) - \(.state)"'
```

### Visualization

Use GitHub Projects for visual progress tracking:

```bash
# Create project
gh project create --title "App Workspace Generator" --body "Development tracking"

# Add issues to project
gh issue list --state all --json number | jq -r '.[].number' | \
  xargs -I {} gh project item-add <project-number> --owner aikix --url "https://github.com/aikix/app-workspace-generator/issues/{}"
```

## 🆘 Troubleshooting

### Issue shows as ready but has dependencies

Run the setup script again:

```bash
./scripts/setup-issue-dependencies.sh
```

### Issue should be ready but still blocked

Check if dependencies are actually closed:

```bash
deps=$(jq -r ".dependencies.\"<issue-num>\" // [] | .[]" .github/issue-dependencies.json)
for dep in $deps; do
  gh issue view $dep --json state,title --jq '"#\(.number): \(.title) - \(.state)"'
done
```

Then manually update:

```bash
gh issue edit <issue-num> --add-label "ready" --remove-label "blocked"
```

### Automation not working

1. Check workflow runs:

   ```bash
   gh run list --workflow=update-issue-dependencies.yml
   ```

2. Check workflow permissions (Settings → Actions → Permissions)

3. Manually run update:
   ```bash
   ./scripts/update-ready-issues.sh
   ```

## 📚 Additional Resources

- [GitHub CLI Manual](https://cli.github.com/manual/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Issue Dependencies in `.github/issue-dependencies.json`](.github/issue-dependencies.json)
