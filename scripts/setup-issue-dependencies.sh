#!/bin/bash
# Setup issue dependencies and labels

set -e

REPO="aikix/app-workspace-generator"
DEPS_FILE=".github/issue-dependencies.json"

echo "🔧 Setting up issue dependencies..."

# Read dependencies and mark issues as ready or blocked
while IFS= read -r line; do
  issue_num=$(echo "$line" | jq -r '.issue')
  deps=$(echo "$line" | jq -r '.deps[]' 2>/dev/null || echo "")

  if [ -z "$deps" ]; then
    # No dependencies - mark as ready
    echo "✅ Issue #$issue_num: No dependencies, marking as READY"
    gh issue edit "$issue_num" --add-label "ready,wave-1" --remove-label "blocked" 2>/dev/null || true
  else
    # Has dependencies - check if they're all closed
    all_closed=true
    blocking_issues=""

    for dep in $deps; do
      state=$(gh issue view "$dep" --json state --jq '.state' 2>/dev/null || echo "UNKNOWN")
      if [ "$state" != "CLOSED" ]; then
        all_closed=false
        blocking_issues="$blocking_issues #$dep"
      fi
    done

    if [ "$all_closed" = true ]; then
      echo "✅ Issue #$issue_num: All dependencies closed, marking as READY"
      gh issue edit "$issue_num" --add-label "ready" --remove-label "blocked" 2>/dev/null || true
    else
      echo "🚫 Issue #$issue_num: Blocked by$blocking_issues"
      gh issue edit "$issue_num" --add-label "blocked" --remove-label "ready" 2>/dev/null || true

      # Add blocking comment
      gh issue comment "$issue_num" --body "⚠️ **BLOCKED BY:**$blocking_issues

This issue will automatically be marked as 'ready' when all blocking issues are closed." 2>/dev/null || true
    fi
  fi
done < <(jq -r '.dependencies | to_entries | map({issue: .key, deps: .value}) | .[] | @json' "$DEPS_FILE")

echo ""
echo "✨ Setup complete!"
echo ""
echo "📋 To see ready issues, run:"
echo "   gh issue list --label ready --state open"
echo ""
echo "🔄 To update dependencies after closing issues, run:"
echo "   ./scripts/update-ready-issues.sh"
