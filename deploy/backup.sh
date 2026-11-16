#!/usr/bin/env bash
# Daily backup of the SQLite database + media uploads, kept 30 days locally and copied off-server.
# Off-server target: any rclone remote (S3, Backblaze B2, Hetzner Storage Box, …) set in BACKUP_REMOTE.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DB="${DB_FILE:-$REPO_ROOT/apps/cms/data/nishki.db}"
MEDIA="${MEDIA_DIR:-$REPO_ROOT/apps/cms/media}"
DEST="${BACKUP_DIR:-/var/backups/nishki}"
REMOTE="${BACKUP_REMOTE:-}"          # e.g. "b2:nishki-backups"
DAYS="${BACKUP_RETENTION_DAYS:-30}"
STAMP="$(date +%Y%m%d-%H%M%S)"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

mkdir -p "$DEST"
# Consistent online copy of SQLite (safe while the CMS is running).
sqlite3 "$DB" ".backup '$WORK/nishki.db'"
sqlite3 "$WORK/nishki.db" "PRAGMA integrity_check;" | grep -qx ok
tar -C "$WORK" -czf "$DEST/db-$STAMP.tar.gz" nishki.db
tar -C "$(dirname "$MEDIA")" -czf "$DEST/media-$STAMP.tar.gz" "$(basename "$MEDIA")"

find "$DEST" -name '*.tar.gz' -mtime +"$DAYS" -delete

if [ -n "$REMOTE" ]; then
  rclone copy "$DEST" "$REMOTE" --include "*-$STAMP.tar.gz"
  rclone delete "$REMOTE" --min-age "${DAYS}d"
fi
echo "[backup] ok $STAMP"
