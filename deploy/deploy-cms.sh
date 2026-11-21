#!/usr/bin/env bash
# Server-side deploy of the CMS (and, when its code changed, a rebuild of the static site).
# Run by .github/workflows/deploy-cms.yml over SSH after it has updated the checkout:
#
#   bash deploy/deploy-cms.sh <previous-commit>     # rebuild only what changed since that commit
#   bash deploy/deploy-cms.sh                       # by hand: rebuild everything
#
# Untouched by deploys (gitignored): apps/cms/.env, apps/web/.env, apps/cms/data/, apps/cms/media/.
set -euo pipefail

main() {
  local repo before after
  repo="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
  cd "$repo"

  # Node/pnpm/pm2 from nvm (non-interactive SSH shells don't load ~/.bashrc).
  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  # shellcheck disable=SC1091
  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
  # Plesk's Node.js extension (+ pnpm/pm2 installed with `npm config set prefix ~/.npm-global`).
  NODE_BIN="${NODE_BIN:-/opt/plesk/node/24/bin}"
  [ -d "$NODE_BIN" ] && export PATH="$HOME/.npm-global/bin:$NODE_BIN:$PATH"

  before="${1:-}"
  after="$(git rev-parse HEAD)"
  echo "[deploy] ${before:-<full>} -> $after (node $(node -v))"

  # changed <paths…>: true if any of the paths changed since $before (always true without $before).
  changed() { [ -z "$before" ] || ! git diff --quiet "$before" "$after" -- "$@"; }

  pnpm install --frozen-lockfile

  if changed apps/cms packages pnpm-lock.yaml package.json pnpm-workspace.yaml deploy/ecosystem.config.cjs; then
    echo "[deploy] building CMS"
    pnpm build:cms
    pm2 startOrReload deploy/ecosystem.config.cjs --update-env
    pm2 save
    # Wait for the CMS to answer before calling it done.
    for _ in $(seq 1 30); do
      if curl -fsS http://127.0.0.1:3000/health >/dev/null 2>&1; then echo "[deploy] CMS healthy"; break; fi
      sleep 2
    done
    curl -fsS http://127.0.0.1:3000/health >/dev/null || { echo "[deploy] CMS did not come up — pm2 logs nishki-cms"; exit 1; }
  else
    echo "[deploy] CMS unchanged, skipping build"
  fi

  # Site templates changed → republish so nishki.eu shows the new markup (content changes go via "Publish site").
  if changed apps/web packages/types deploy/build-and-deploy.sh; then
    echo "[deploy] site code changed, rebuilding static site"
    envval() { grep -E "^$1=" apps/cms/.env | tail -n1 | cut -d= -f2- || true; }
    WEB_ROOT="${WEB_ROOT:-$(envval WEB_ROOT)}"
    CURRENT_LINK="${CURRENT_LINK:-$(envval CURRENT_LINK)}"
    [ -n "$WEB_ROOT" ] || { echo "[deploy] WEB_ROOT not set in apps/cms/.env"; exit 1; }
    WEB_ROOT="$WEB_ROOT" CURRENT_LINK="$CURRENT_LINK" bash deploy/build-and-deploy.sh
  fi

  echo "[deploy] done"
}

main "$@"
