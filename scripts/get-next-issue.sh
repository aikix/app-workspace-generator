#!/bin/bash
# AI Agent script to find and claim the next ready issue

set -e

AGENT_NAME="${1:-agent-unknown}"
PRIORITY_FILTER="${2:-all}" # high, medium, low, or all

echo "🤖 Agent: $AGENT_NAME"
echo "🔍 Finding next ready issue..."
echo ""

# Build label filter
LABEL_FILTER="ready"
if [ "$PRIORITY_FILTER" != "all" ]; then
  LABEL_FILTER="ready,priority-$PRIORITY_FILTER"
fi

# Get ready issues sorted by priority
ISSUES=$(gh issue list \
  --label "$LABEL_FILTER" \
  --state open \
  --json number,title,labels,priority \
  --jq 'sort_by(.labels | map(select(.name | startswith("priority-"))) | .[0].name) | reverse | .[]')

if [ -z "$ISSUES" ]; then
  echo "⚠️  No ready issues found with filter: $LABEL_FILTER"
  echo ""
  echo "💡 Check blocked issues that might become ready soon:"
  gh issue list --label "blocked" --state open --limit 5
  exit 1
fi

# Get first issue
FIRST_ISSUE=$(echo "$ISSUES" | jq -r '. | @json' | head -1)
ISSUE_NUM=$(echo "$FIRST_ISSUE" | jq -r '.number')
ISSUE_TITLE=$(echo "$FIRST_ISSUE" | jq -r '.title')

echo "✨ Found issue #$ISSUE_NUM: $ISSUE_TITLE"
echo ""

# Claim the issue
read -p "🤝 Do you want to claim this issue? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "📌 Claiming issue #$ISSUE_NUM for $AGENT_NAME..."

  # Remove 'ready', add 'in-progress'
  gh issue edit "$ISSUE_NUM" \
    --add-label "in-progress" \
    --remove-label "ready" \
    --add-assignee "@me"

  # Add comment
  gh issue comment "$ISSUE_NUM" --body "🤖 Claimed by **$AGENT_NAME**

Started working on this issue at $(date '+%Y-%m-%d %H:%M:%S')"

  echo ""
  echo "✅ Issue claimed! Good luck! 🚀"
  echo ""
  echo "📖 View issue: gh issue view $ISSUE_NUM --web"
else
  echo "Skipped. Run again to see next issue."
fi
