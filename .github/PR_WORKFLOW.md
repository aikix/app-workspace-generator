# Pull Request Workflow for AI Agents

## 🎯 Complete Development Flow

### 1. Claim an Issue

```bash
./scripts/get-next-issue.sh agent-name high
```

### 2. Create a Feature Branch

```bash
# Issue #X format
git checkout -b feat/issue-X-short-description

# Examples:
git checkout -b feat/issue-4-nextjs-template
git checkout -b fix/issue-7-error-handling
```

### 3. Work on the Issue

Make your changes, commit frequently:

```bash
git add .
git commit -m "feat(scope): description

- Detail 1
- Detail 2

Issue #X"
```

### 4. Push and Create PR

```bash
# Push branch
git push origin feat/issue-X-short-description

# Create PR
gh pr create --title "feat(scope): Brief description" \
  --body "Closes #X

## Description
[What this PR does]

## Changes
- [Change 1]
- [Change 2]

## Testing
- [How you tested]"
```

Or use the shorthand:

```bash
gh pr create --fill
```

### 5. PR Review Process

#### Automatic Checks (CI)

- ✅ Linting (ESLint)
- ✅ Type checking (TypeScript)
- ✅ Tests (if applicable)
- ✅ Build success

#### Code Review Required

**At least 1 approval** from another agent or maintainer before merge.

**Review Checklist:**

- [ ] Code quality and readability
- [ ] Follows project conventions
- [ ] No security vulnerabilities
- [ ] Tests are adequate
- [ ] Documentation is updated
- [ ] No breaking changes (or properly documented)

### 6. Address Review Comments

If changes requested:

```bash
# Make changes
git add .
git commit -m "fix: address review comments"
git push
```

PR automatically updates!

### 7. Merge PR

Once approved and all checks pass:

```bash
# Merge PR (squash and merge recommended)
gh pr merge --squash --delete-branch
```

Or use GitHub UI to merge.

### 8. Close Issue

**Important:** Only close the issue AFTER the PR is merged!

```bash
gh issue close X --comment "✅ Completed in #PR_NUMBER

Summary:
- [What was implemented]
- [Key changes]

Ready for next issue!"
```

This triggers the automation to unblock dependent issues.

---

## 🤝 Peer Review Guidelines

### For Authors (PR Creator)

**Before requesting review:**

1. Self-review your own code
2. Ensure all tests pass
3. Update documentation
4. Add screenshots for UI changes
5. Link to the issue

**During review:**

- Respond to comments promptly
- Explain your approach when needed
- Be open to feedback
- Make requested changes or discuss alternatives

### For Reviewers

**What to check:**

1. **Correctness**: Does it solve the issue?
2. **Code Quality**: Is it readable and maintainable?
3. **Testing**: Are there adequate tests?
4. **Security**: Any vulnerabilities?
5. **Performance**: Any performance concerns?
6. **Documentation**: Is it documented?

**How to review:**

```bash
# Check out the PR branch
gh pr checkout PR_NUMBER

# Run the code locally
npm install
npm run build
npm run dev

# Review changes
gh pr diff PR_NUMBER
```

**Review comments:**

- Be constructive and specific
- Suggest improvements, don't just criticize
- Use the GitHub suggestion feature for small fixes
- Approve when satisfied: `gh pr review PR_NUMBER --approve`

---

## 🔄 Common PR Workflows

### Simple Change (No Review Issues)

```bash
1. Claim issue → Create branch → Code → Push
2. Create PR → CI passes → Get approval
3. Merge → Close issue
```

**Timeline:** 1-2 hours

### Complex Change (Needs Discussion)

```bash
1. Claim issue → Create branch → Code → Push
2. Create PR → CI passes → Request review
3. Discussion → Address feedback → Push updates
4. Re-review → Approval → Merge → Close issue
```

**Timeline:** 1-2 days

### Blocking PR (Other Issues Depend On It)

```bash
1. Claim #4 → Create branch → Code → Push
2. Create PR → Mark as high priority
3. Fast-track review (request specific reviewer)
4. Merge → Close #4
5. Automation unblocks #5, #8, #9, #10 → Other agents can proceed
```

**Timeline:** Critical - aim for same day

---

## 🚨 PR Review Best Practices

### For High-Priority / Blocking Issues

**Issue #4 (Next.js template) blocks 10+ issues!**

1. **Author responsibilities:**
   - Create PR as soon as possible
   - Self-review thoroughly before requesting review
   - Be available for quick responses
   - Test comprehensively

2. **Reviewer responsibilities:**
   - Prioritize review (within 2 hours)
   - Focus on critical issues first, minor issues later
   - Approve if "good enough" - perfection can come in follow-ups
   - Comment: "LGTM with minor suggestions, approving to unblock"

3. **Fast-track merge:**
   ```bash
   # If urgent and approved
   gh pr merge --squash --delete-branch --admin
   ```

### For Regular Issues

Standard review timeline: **24 hours**

### For Low-Priority Issues

Review when time permits: **48-72 hours**

---

## 📊 PR Status Labels

We use labels to track PR status:

- `ready-for-review` - Awaiting reviewer
- `changes-requested` - Needs updates
- `approved` - Ready to merge
- `blocked` - Blocked by other work
- `high-priority` - Fast-track review needed

```bash
# Add label to PR
gh pr edit PR_NUMBER --add-label "ready-for-review"
```

---

## 🤖 Automated PR Checks

### What CI Checks

1. **Lint**: `npm run lint`
2. **Type Check**: `npm run type-check`
3. **Format**: `npm run format:check`
4. **Build**: `npm run build`
5. **Tests**: `npm test` (when tests exist)

### If CI Fails

```bash
# Check the error
gh pr checks PR_NUMBER

# Fix locally
npm run lint:fix
npm run format
npm run type-check

# Commit and push
git add .
git commit -m "fix: resolve CI issues"
git push
```

---

## 💡 Tips for Efficient Reviews

### For Large PRs (Issue #4, #14, #15)

**Break into reviewable chunks:**

1. Review file structure first
2. Then review core logic
3. Then review tests
4. Then review docs

**Use GitHub's review features:**

- Start a review (don't comment on each line immediately)
- Batch comments together
- Submit review with overall verdict

### For Small PRs

Quick review (< 30 minutes):

- Read the description
- Check the changes
- Run locally if needed
- Approve or request changes

---

## 🎯 Merge Strategy

We use **Squash and Merge** to keep history clean:

```bash
gh pr merge --squash --delete-branch
```

This creates a single commit on main:

```
feat(templates): complete Next.js template structure (#PR_NUMBER)

- Added complete app/ directory
- Configured TypeScript
- Added example components

Closes #4
```

---

## 📝 Example PR Workflow

### Example: Agent working on Issue #7 (Error Handling)

```bash
# 1. Claim issue
./scripts/get-next-issue.sh agent-1 high
# Claims #7

# 2. Create branch
git checkout -b feat/issue-7-error-handling

# 3. Work on it
# ... make changes ...
git add src/utils/error-handler.ts
git commit -m "feat(cli): add error handling with rollback

- Add try-catch for file operations
- Implement rollback mechanism
- Add helpful error messages

Issue #7"

# 4. Push and create PR
git push origin feat/issue-7-error-handling
gh pr create --fill

# 5. Wait for review
# CI runs automatically
# Request review: gh pr edit PR_NUMBER --add-reviewer agent-2

# 6. Address feedback (if needed)
# ... make changes ...
git add .
git commit -m "fix: address review comments"
git push

# 7. Merge when approved
gh pr merge --squash --delete-branch

# 8. Close issue
gh issue close 7 --comment "✅ Completed in #PR_NUMBER"

# 9. Automation unblocks dependent issues!
```

---

## 🔄 Integration with Issue Dependency System

**Important Flow:**

1. **PR Merged** → 2. **Close Issue** → 3. **Automation Runs** → 4. **Unblock Dependent Issues**

**DO NOT close issue before PR is merged!**

Why? If issue is closed but PR has bugs, we need to reopen and it breaks the automation.

**Correct:**

```bash
gh pr merge --squash
gh issue close 4 --comment "✅ Completed in #123"
# Automation sees #4 is closed, unblocks #5, #8, #9, #10
```

**Incorrect:**

```bash
gh issue close 4  # ❌ PR not merged yet!
gh pr merge --squash  # ❌ Too late, automation already ran
# #5, #8, #9, #10 were marked ready but PR might have bugs!
```

---

## 📚 Quick Reference

```bash
# Create PR
gh pr create --fill

# List open PRs
gh pr list

# Check PR status
gh pr view PR_NUMBER

# Check CI status
gh pr checks PR_NUMBER

# Request review
gh pr edit PR_NUMBER --add-reviewer username

# Approve PR
gh pr review PR_NUMBER --approve

# Request changes
gh pr review PR_NUMBER --request-changes --body "Comments..."

# Merge PR
gh pr merge PR_NUMBER --squash --delete-branch

# Close issue after merge
gh issue close ISSUE_NUMBER --comment "✅ Completed in #PR_NUMBER"
```

---

## 🎊 Summary

**Complete Agent Workflow:**

1. ✅ Claim issue
2. 🌿 Create branch
3. 💻 Code
4. 📤 Push & create PR
5. 👀 Get reviewed
6. 🔧 Address feedback
7. ✅ Get approval
8. 🔀 Merge PR
9. ❌ Close issue
10. 🚀 Automation unblocks next issues!

**Key Points:**

- Always create a PR (never push directly to main)
- Get at least 1 approval
- Close issue only AFTER PR is merged
- High-priority PRs get fast-tracked
- Use squash and merge for clean history
