#!/usr/bin/env bash
# Nightly backup of the SQLite database + media uploads (cron: deploy/crontab.example).
#
# On this server (BACKUP_DIR):
#   db-<stamp>.tar.gz, media-<stamp>.tar.gz             kept BACKUP_LOCAL_DAYS (7)
#
# Off-site (BACKUP_REMOTE = any rclone remote + bucket/path, e.g. "r2:nishki"):
#   db/db-<stamp>.tar.gz                                kept BACKUP_REMOTE_DAYS (30);
#                                                       skipped if the archive is ≥ DB_REMOTE_MAX_MB (100)
#   media/                                              ONE mirror of the uploads (rclone sync: only
#                                                       new/changed files are sent each night)
#   media-removed/<stamp>/                              files deleted/replaced by that sync, kept 30 days
#   The media sync is skipped while free space (REMOTE_LIMIT_GB − bucket size) < REMOTE_MIN_FREE_GB (10 / 2):
#   media is then backed up on this server only, and an alert is emailed.
#
# Alerts (skipped uploads, or the backup failing) go to BACKUP_ALERT_EMAIL (default: OWNER_EMAIL),
# sent with the CMS's SMTP settings from apps/cms/.env (EMAIL_HOST/PORT/USER/PASS/FROM_ADDRESS).
#
# Restore: deploy/restore.sh for the local archives; from R2: rclone copy r2:nishki/media <dir>/media
# and rclone copy r2:nishki/db/db-<stamp>.tar.gz <dir>.
set -euo pipefail
export LC_ALL=C

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${CMS_ENV_FILE:-$REPO_ROOT/apps/cms/.env}"
envval() { if [ -f "$ENV_FILE" ]; then grep -E "^$1=" "$ENV_FILE" | tail -n1 | cut -d= -f2- || true; fi; }

DB="${DB_FILE:-$REPO_ROOT/apps/cms/data/nishki.db}"
MEDIA="${MEDIA_DIR:-$REPO_ROOT/apps/cms/media}"
DEST="${BACKUP_DIR:-$HOME/backups}"
REMOTE="${BACKUP_REMOTE:-}"
LOCAL_DAYS="${BACKUP_LOCAL_DAYS:-7}"
REMOTE_DAYS="${BACKUP_REMOTE_DAYS:-30}"
LIMIT_GB="${REMOTE_LIMIT_GB:-10}"
MIN_FREE_GB="${REMOTE_MIN_FREE_GB:-2}"
DB_MAX_MB="${DB_REMOTE_MAX_MB:-100}"
ALERT_TO="${BACKUP_ALERT_EMAIL:-$(envval OWNER_EMAIL)}"
STAMP="$(date +%Y%m%d-%H%M%S)"
HOST_NAME="$(hostname)"
WORK="$(mktemp -d)"
WARNINGS=()

gb() { awk -v b="$1" 'BEGIN { printf "%.2f GB", b / 1024 / 1024 / 1024 }'; }

# alert <subject> <body>: email via SMTP (curl), or just log when SMTP/recipient isn't configured.
alert() {
  local host port user pass from scheme
  host="$(envval EMAIL_HOST)"; port="$(envval EMAIL_PORT)"; port="${port:-587}"
  user="$(envval EMAIL_USER)"; pass="$(envval EMAIL_PASS)"
  from="$(envval EMAIL_FROM_ADDRESS)"; from="${from:-no-reply@nishki.eu}"
  echo "[backup] ALERT: $1" >&2
  if [ -z "$host" ] || [ -z "$ALERT_TO" ]; then
    echo "[backup] (no EMAIL_HOST or alert recipient configured — not emailed)" >&2
    return 0
  fi
  [ "$port" = 465 ] && scheme=smtps || scheme=smtp
  # Credentials in a private netrc file, not on the command line (visible in ps).
  ( umask 077; printf 'machine %s login %s password %s\n' "$host" "$user" "$pass" > "$WORK/netrc" )
  printf 'From: Nishki backups <%s>\r\nTo: %s\r\nSubject: [nishki backup] %s\r\nDate: %s\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n%s\r\n\r\n-- \r\n%s, %s\r\n' \
    "$from" "$ALERT_TO" "$1" "$(date '+%a, %d %b %Y %H:%M:%S %z')" "$2" "$HOST_NAME" "$0" > "$WORK/mail.txt"
  curl -sS --max-time 60 --ssl-reqd --url "$scheme://$host:$port" --netrc-file "$WORK/netrc" \
    --mail-from "$from" --mail-rcpt "$ALERT_TO" --upload-file "$WORK/mail.txt" \
    || echo "[backup] could not send the alert email" >&2
}

finish() {
  local code=$?
  if [ "$code" -ne 0 ]; then
    alert "FAILED on $HOST_NAME" "The nightly backup $STAMP failed (exit code $code).
Check the log: ~/cron-logs/backup.log"
  fi
  rm -rf "$WORK"
}
trap finish EXIT

# ── Local archives ───────────────────────────────────────────────
mkdir -p "$DEST"
chmod 700 "$DEST"
# Consistent online copy of SQLite (safe while the CMS is running).
sqlite3 "$DB" ".backup '$WORK/nishki.db'"
sqlite3 "$WORK/nishki.db" "PRAGMA integrity_check;" | grep -qx ok
tar -C "$WORK" -czf "$DEST/db-$STAMP.tar.gz" nishki.db
tar -C "$(dirname "$MEDIA")" -czf "$DEST/media-$STAMP.tar.gz" "$(basename "$MEDIA")"
# Keep LOCAL_DAYS nights (today included).
find "$DEST" -maxdepth 1 -name '*.tar.gz' -mtime +"$((LOCAL_DAYS > 0 ? LOCAL_DAYS - 1 : 0))" -delete
echo "[backup] local: db $(gb "$(wc -c < "$DEST/db-$STAMP.tar.gz")"), media $(gb "$(wc -c < "$DEST/media-$STAMP.tar.gz")") in $DEST"

# ── Off-site ─────────────────────────────────────────────────────
if [ -n "$REMOTE" ]; then
  used="$(rclone size "$REMOTE" --json | grep -o '"bytes":[0-9]*' | cut -d: -f2)"
  used="${used:-0}"
  limit=$((LIMIT_GB * 1024 * 1024 * 1024))
  free=$((limit - used))
  echo "[backup] remote: $(gb "$used") used of ${LIMIT_GB} GB, $(gb "$free") free"

  # Database: small, always worth keeping off-site (unless it has grown unexpectedly large).
  db_bytes="$(wc -c < "$DEST/db-$STAMP.tar.gz")"
  if [ "$db_bytes" -lt $((DB_MAX_MB * 1024 * 1024)) ]; then
    rclone copyto "$DEST/db-$STAMP.tar.gz" "$REMOTE/db/db-$STAMP.tar.gz"
    echo "[backup] remote: db uploaded"
  else
    WARNINGS+=("Database archive is $(gb "$db_bytes") (limit ${DB_MAX_MB} MB) - NOT uploaded off-site; it is kept on the server for ${LOCAL_DAYS} days.")
  fi
  rclone delete "$REMOTE/db" --min-age "${REMOTE_DAYS}d" 2>/dev/null || true

  # Media: one mirror; replaced/deleted files go to media-removed/<stamp>/.
  if [ "$free" -ge $((MIN_FREE_GB * 1024 * 1024 * 1024)) ]; then
    rclone sync "$MEDIA" "$REMOTE/media" --backup-dir "$REMOTE/media-removed/$STAMP"
    echo "[backup] remote: media synced"
  else
    WARNINGS+=("Off-site storage is almost full: $(gb "$used") used of ${LIMIT_GB} GB, $(gb "$free") free (minimum ${MIN_FREE_GB} GB). Media was NOT synced off-site tonight - it is only backed up on the server (${LOCAL_DAYS} days). The database still goes off-site.")
  fi
  # media-removed/<stamp>/ older than REMOTE_DAYS, judged by the folder's date (files keep their original mtimes).
  cutoff="$(date -d "$REMOTE_DAYS days ago" +%Y%m%d 2>/dev/null || date -v-"$REMOTE_DAYS"d +%Y%m%d)"
  for d in $(rclone lsf --dirs-only "$REMOTE/media-removed" 2>/dev/null || true); do
    d="${d%/}"
    if [[ "$d" =~ ^[0-9]{8}- ]] && [[ "${d:0:8}" < "$cutoff" ]]; then
      rclone purge "$REMOTE/media-removed/$d"
      echo "[backup] remote: removed media-removed/$d"
    fi
  done
fi

if [ "${#WARNINGS[@]}" -gt 0 ]; then
  alert "action needed on $HOST_NAME" "$(printf '%s\n\n' "${WARNINGS[@]}")"
fi
echo "[backup] ok $STAMP"
