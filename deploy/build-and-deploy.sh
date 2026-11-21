#!/usr/bin/env bash
# Builds the static site from the CMS and atomically swaps the live web root.
# Called by the "Publish site" button when BUILD_MODE=local (one run at a time — the CMS holds the lock).
#
#   WEB_ROOT/
#     releases/20261116190000/   ← one directory per build (last KEEP_RELEASES kept)
#     current -> releases/...    ← Nginx document root
#
# CURRENT_LINK moves the live symlink elsewhere, e.g. onto a Plesk domain's existing document root:
#   WEB_ROOT=/var/www/vhosts/nishki.eu/nishki-web  CURRENT_LINK=/var/www/vhosts/nishki.eu/nishki.eu
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEB_ROOT="${WEB_ROOT:-/var/www/nishki}"
KEEP="${KEEP_RELEASES:-5}"
STAMP="$(date +%Y%m%d%H%M%S)"
LINK="${CURRENT_LINK:-$WEB_ROOT/current}"

echo "[deploy] building apps/web ($STAMP)"
cd "$REPO_ROOT/apps/web"
rm -rf dist
pnpm build

mkdir -p "$WEB_ROOT/releases"
rsync -a --delete dist/ "$WEB_ROOT/releases/$STAMP/"

# Atomic switch: rename(2) of a new symlink over the old one (absolute target, so LINK can live anywhere).
if [ -e "$LINK" ] && [ ! -L "$LINK" ]; then
  echo "[deploy] $LINK is a real directory, not a symlink — move it aside once: mv $LINK $LINK.old" >&2
  exit 1
fi
ln -sfn "$WEB_ROOT/releases/$STAMP" "$LINK.tmp"
if mv --version >/dev/null 2>&1; then
  mv -Tf "$LINK.tmp" "$LINK"   # GNU (server)
else
  rm -f "$LINK.tmp"; ln -sfn "$WEB_ROOT/releases/$STAMP" "$LINK"   # BSD/macOS (dev)
fi
echo "[deploy] live: $LINK -> $WEB_ROOT/releases/$STAMP"

# Keep the newest $KEEP releases (rollback = point "current" at an older one).
cd "$WEB_ROOT/releases"
ls -1 | sort -r | tail -n +"$((KEEP + 1))" | xargs -I{} rm -rf -- "{}"
