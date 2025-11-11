#!/bin/bash
# Automatically update blocked issues to ready when dependencies are met

set -e

DEPS_FILE=".github/issue-dependencies.json"

echo "🔄 Checking blocked issues for ready status..."
echo ""

updated_count=0

# Get all blocked issues
BLOCKED_ISSUES=$(gh issue list --label "blocked" --state open --json number --jq '.[].number')

if [ -z "$BLOCKED_ISSUES" ]; then
  echo "✅ No blocked issues found. All clear!"
  exit 0
fi

for issue_num in $BLOCKED_ISSUES; do
  # Get dependencies for this issue
  deps=$(jq -r ".dependencies.\"$issue_num\" // [] | .[]" "$DEPS_FILE")

  if [ -z "$deps" ]; then
    echo "⚠️  Issue #$issue_num: No dependencies found in config, marking as ready"
    gh issue edit "$issue_num" --add-label "ready" --remove-label "blocked"
    ((updated_count++))
    continue
  fi

  # Check if all dependencies are closed
  all_closed=true
  open_blockers=""

  for dep in $deps; do
    state=$(gh issue view "$dep" --json state --jq '.state' 2>/dev/null || echo "UNKNOWN")
    if [ "$state" != "CLOSED" ]; then
      all_closed=false
      open_blockers="$open_blockers #$dep"
    fi
  done

  if [ "$all_closed" = true ]; then
    echo "✅ Issue #$issue_num: All dependencies closed! Marking as READY 🎉"

    # Update labels
    gh issue edit "$issue_num" --add-label "ready" --remove-label "blocked"

    # Add comment
    gh issue comment "$issue_num" --body "🎉 **This issue is now READY!**

All blocking issues have been resolved. This issue can now be worked on.

---
_Updated automatically by dependency checker_"

    ((updated_count++))
  else
    echo "🚫 Issue #$issue_num: Still blocked by$open_blockers"
  fi
done

echo ""
echo "✨ Updated $updated_count issue(s) to ready status"
echo ""

if [ $updated_count -gt 0 ]; then
  echo "📋 Ready issues:"
  gh issue list --label "ready" --state open --limit 10
fi
