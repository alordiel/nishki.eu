#!/usr/bin/env bash
# Restore test / disaster recovery:  deploy/restore.sh /var/backups/nishki/db-XXXX.tar.gz /var/backups/nishki/media-XXXX.tar.gz [target-dir]
# Without a target dir it restores into a scratch directory and verifies the data (the "test restore" from the spec).
set -euo pipefail
DB_ARCHIVE="$1"; MEDIA_ARCHIVE="$2"; TARGET="${3:-$(mktemp -d)}"
mkdir -p "$TARGET"
tar -C "$TARGET" -xzf "$DB_ARCHIVE"
tar -C "$TARGET" -xzf "$MEDIA_ARCHIVE"
sqlite3 "$TARGET/nishki.db" "PRAGMA integrity_check;" | grep -qx ok
echo "pages: $(sqlite3 "$TARGET/nishki.db" 'select count(*) from pages;')  submissions: $(sqlite3 "$TARGET/nishki.db" 'select count(*) from submissions;')  media files: $(ls "$TARGET/media" | wc -l)"
echo "restored into $TARGET"
