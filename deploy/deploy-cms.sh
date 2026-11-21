#!/usr/bin/env bash
# Server-side part of .github/workflows/deploy-cms.yml (runs after the checkout was updated).
#
#   bash deploy/deploy-cms.sh <previous-commit>   # site rebuilt only if apps/web changed since then
#   bash deploy/deploy-cms.sh                     # site always rebuilt
#
# The CMS is NOT built here (too much RAM for this server): CI uploads its build to apps/cms/.next-new,
# this script swaps it in, reloads PM2 and rolls back to the previous build if /health fails.
# Untouched by deploys (gitignored): apps/cms/.env, apps/web/.env, apps/cms/data/, apps/cms/media/.
set -euo pipefail

main() {
  local repo before after cms
  repo="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
  cd "$repo"
  cms="$repo/apps/cms"

  # Plesk's Node.js extension (+ pnpm/pm2 installed with `npm config set prefix ~/.npm-global`).
  NODE_BIN="${NODE_BIN:-/opt/plesk/node/24/bin}"
  [ -d "$NODE_BIN" ] && export PATH="$HOME/.npm-global/bin:$NODE_BIN:$PATH"

  before="${1:-}"
  after="$(git rev-parse HEAD)"
  echo "[deploy] ${before:-<full>} -> $after (node $(node -v))"

  # changed <paths…>: true if any of the paths changed since $before (always true without $before).
  changed() { [ -z "$before" ] || ! git diff --quiet "$before" "$after" -- "$@"; }
  healthy() {
    for _ in $(seq 1 30); do
      curl -fsS http://127.0.0.1:3000/health >/dev/null 2>&1 && return 0
      sleep 2
    done
    return 1
  }

  pnpm install --frozen-lockfile

  if [ -d "$cms/.next-new" ]; then
    echo "[deploy] activating new CMS build"
    rm -rf "$cms/.next-old"
    [ -d "$cms/.next" ] && mv "$cms/.next" "$cms/.next-old"
    mv "$cms/.next-new" "$cms/.next"
    pm2 startOrReload deploy/ecosystem.config.cjs --update-env
    if healthy; then
      echo "[deploy] CMS healthy"
      pm2 save
    else
      echo "[deploy] CMS did not come up — see: pm2 logs nishki-cms" >&2
      if [ -d "$cms/.next-old" ]; then
        echo "[deploy] rolling back to the previous build" >&2
        mv "$cms/.next" "$cms/.next-failed" && mv "$cms/.next-old" "$cms/.next"
        rm -rf "$cms/.next-failed"
        pm2 reload nishki-cms --update-env
      fi
      exit 1
    fi
  else
    echo "[deploy] no uploaded CMS build (apps/cms/.next-new) — CMS left as is"
  fi

  # Site templates changed → republish so nishki.eu shows the new markup (content changes go via "Publish site").
  if changed apps/web packages/types deploy/build-and-deploy.sh; then
    if [ ! -f apps/web/.env ]; then
      echo "[deploy] apps/web/.env missing — site not configured yet, skipping site rebuild"
    else
      echo "[deploy] site code changed, rebuilding static site"
      envval() { grep -E "^$1=" apps/cms/.env | tail -n1 | cut -d= -f2- || true; }
      WEB_ROOT="${WEB_ROOT:-$(envval WEB_ROOT)}"
      CURRENT_LINK="${CURRENT_LINK:-$(envval CURRENT_LINK)}"
      [ -n "$WEB_ROOT" ] || { echo "[deploy] WEB_ROOT not set in apps/cms/.env"; exit 1; }
      WEB_ROOT="$WEB_ROOT" CURRENT_LINK="$CURRENT_LINK" bash deploy/build-and-deploy.sh
    fi
  fi

  echo "[deploy] done"
}

main "$@"
