# 🤖 AI Agent Quick Start Guide

## TL;DR - Get Your Next Task

```bash
# Find and claim the next high-priority issue
./scripts/get-next-issue.sh agent-name high

# Or just get any ready issue
./scripts/get-next-issue.sh agent-name
```

## ✅ What's Ready to Work On Right Now?

```bash
gh issue list --label "ready" --state open
```

**Current ready issues (Wave 1):**

- #4: Next.js template ⭐ **HIGHEST PRIORITY - BLOCKS EVERYTHING**
- #7: Error handling (high priority)
- #6: Progress indicators (medium priority)
- #32: Git workflow (high priority)
- #36: VS Code config (low priority)

## 🎯 Recommended Order for 5 Agents Working in Parallel

### Agent 1 (Most Experienced)

```bash
# Take the critical blocker
gh issue edit 4 --add-label "in-progress" --remove-label "ready" --add-assignee "@me"
```

**Task:** #4 - Next.js template structure (2-3 days, blocks 20+ issues)

### Agent 2

```bash
gh issue edit 7 --add-label "in-progress" --remove-label "ready" --add-assignee "@me"
```

**Task:** #7 - Error handling (1 day)

### Agent 3

```bash
gh issue edit 32 --add-label "in-progress" --remove-label "ready" --add-assignee "@me"
```

**Task:** #32 - Git workflow (1 day)

### Agent 4

```bash
gh issue edit 6 --add-label "in-progress" --remove-label "ready" --add-assignee "@me"
```

**Task:** #6 - Progress indicators (1 day)

### Agent 5

```bash
gh issue edit 36 --add-label "in-progress" --remove-label "ready" --add-assignee "@me"
```

**Task:** #36 - VS Code config (1 day)

## 🔄 After Completing an Issue

```bash
# Close the issue
gh issue close <number> --comment "✅ Completed!

Summary:
- [what you did]
- [any notes]"

# Check what became ready
gh issue list --label "ready" --state open
```

**When #4 closes, these 10 issues automatically become ready:**

- #5, #8, #9, #10, #17, #18, #20, #22, and more!

## 📊 Check Progress

```bash
# See overall status
echo "Ready: $(gh issue list --label ready --state open --json number | jq '. | length')"
echo "In Progress: $(gh issue list --label in-progress --state open --json number | jq '. | length')"
echo "Blocked: $(gh issue list --label blocked --state open --json number | jq '. | length')"

# See what's blocking other work
gh issue view 4 --json state,title
```

## 🚨 Critical Path

```
#4 (Next.js template) ⭐ MUST BE DONE FIRST
 ├─> #5 (Tailwind)
 ├─> #8 (TypeScript)
 ├─> #9 (Next.js config)
 ├─> #10 (Env vars)
 │    ├─> #14 (Firebase client)
 │    └─> #15 (Firebase server)
 └─> #17 (PWA)
      └─> #23 (Capacitor)
           ├─> #24 (iOS)
           └─> #25 (Android)
```

## 💡 Pro Tips

1. **Always work on high priority first**

   ```bash
   ./scripts/get-next-issue.sh agent-name high
   ```

2. **Check dependencies before starting**

   ```bash
   gh issue view <number>
   ```

3. **One issue at a time** - Finish before claiming next

4. **Update when stuck** - Comment on the issue

5. **Close when done** - Triggers automatic unblocking

## 📚 Full Documentation

- [Complete Workflow Guide](.github/ISSUE_WORKFLOW.md)
- [Dependency Graph](.github/issue-dependencies.json)
- [Project README](README.md)

## 🆘 Need Help?

```bash
# See all available commands
gh issue --help

# View issue details
gh issue view <number> --web

# See what's blocking an issue
gh issue view <number> | grep "BLOCKED BY"

# Manual update (if automation fails)
./scripts/update-ready-issues.sh
```

---

**Ready to start? Pick an issue and ship it! 🚀**
