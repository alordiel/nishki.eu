#!/usr/bin/env bash
# Builds the static site from the CMS and atomically swaps the live web root.
# Called by the "Publish site" button when BUILD_MODE=local (one run at a time — the CMS holds the lock).
#
#   WEB_ROOT/
#     releases/20261116190000/   ← one directory per build (last KEEP_RELEASES kept)
#     current -> releases/...    ← Nginx document root
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEB_ROOT="${WEB_ROOT:-/var/www/nishki}"
KEEP="${KEEP_RELEASES:-5}"
STAMP="$(date +%Y%m%d%H%M%S)"

echo "[deploy] building apps/web ($STAMP)"
cd "$REPO_ROOT/apps/web"
rm -rf dist
pnpm build

mkdir -p "$WEB_ROOT/releases"
rsync -a --delete dist/ "$WEB_ROOT/releases/$STAMP/"

# Atomic switch: rename(2) of a new symlink over the old one.
ln -sfn "releases/$STAMP" "$WEB_ROOT/current.tmp"
if mv --version >/dev/null 2>&1; then
  mv -Tf "$WEB_ROOT/current.tmp" "$WEB_ROOT/current"   # GNU (server)
else
  rm -f "$WEB_ROOT/current.tmp"; ln -sfn "releases/$STAMP" "$WEB_ROOT/current"   # BSD/macOS (dev)
fi
echo "[deploy] live: $WEB_ROOT/current -> releases/$STAMP"

# Keep the newest $KEEP releases (rollback = point "current" at an older one).
cd "$WEB_ROOT/releases"
ls -1 | sort -r | tail -n +"$((KEEP + 1))" | xargs -I{} rm -rf -- "{}"
