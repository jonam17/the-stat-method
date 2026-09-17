#!/usr/bin/env bash
# Move internal planning docs out of the repo before it goes public.
# Files are MOVED, not deleted — they land in ../the-stat-method-private/
#
# NOTE: `[ -e "$f" ] && mv ...` as the last statement in a loop body returns 1
# when the file is absent, which under `set -e` aborts the whole script. Use an
# explicit if-block instead. (This script did exactly that on first run and
# silently moved only a third of the files.)
set -uo pipefail

PRIVATE="../the-stat-method-private"
mkdir -p "$PRIVATE"

INTERNAL=(
  BUSINESS-PLAN.md GROWTH-FOUNDATION.md POST-LAUNCH.md TOOLS-ROADMAP.md
  ANALYTICS.md SEARCH-CONSOLE.md LAUNCH-CHECKLIST.md PENDING.md
  CLAUDE-HANDOFF.md CLAUDE-REVIEW-CHECKLIST.md
  DESIGN-UPDATE.md DESIGN-REFACTOR-NOTES.md MERGE-REPORT.md CHANGES.md
  START-HERE.md
)

# Working documents under docs/. These hold open questions whose answers will
# appear on the site once resolved — the brief is a snapshot of what is not yet
# decided, which is a different thing from the published record of what was.
INTERNAL_DOCS=(
  docs/reviewer-brief.md
  docs/clinical-research-prompt.md
)

moved=0
for f in "${INTERNAL[@]}" "${INTERNAL_DOCS[@]}" PHASE-*.md; do
  if [ -e "$f" ]; then
    mkdir -p "$PRIVATE/$(dirname "$f")"
    mv "$f" "$PRIVATE/$f"
    echo "  moved   $f"
    moved=$((moved + 1))
  fi
done

echo
echo "$moved file(s) moved to $PRIVATE"
echo
echo "Kept public:"
ls *.md docs/*.md 2>/dev/null | sed 's/^/  /'
