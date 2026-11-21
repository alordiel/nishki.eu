# nishki.eu

Static marketing site (Astro) + Payload CMS (admin, content API, contact form API). See `spec.md` for the brief and `docs/DECISIONS.md` for decisions and open questions.

```
apps/web         Astro static site            → nishki.eu
apps/cms         Payload CMS (Next.js)        → redaktor.nishki.eu, api.nishki.eu
packages/types   TS types generated from the Payload config (pnpm types)
deploy/          build/deploy, backup/restore, Nginx, PM2, cron
.github/         optional GitHub Actions → Cloudflare Pages publish pipeline
```

## Local development

Requires Node ≥ 24.22.1 (Payload 3.93 engine requirement) and pnpm.

```bash
pnpm install
cp .env.example apps/cms/.env        # then edit (dev values: see comments)
SEED_ADMIN_EMAIL=you@example.com SEED_ADMIN_PASSWORD=... pnpm seed
                                     # loads the 6 design pages (BG+EN), sample projects,
                                     # and prints the read-only build API key
pnpm dev:cms                         # http://localhost:3000/admin

# apps/web/.env
#   CMS_URL=http://localhost:3000
#   CMS_API_KEY=<key printed by the seed>
#   PUBLIC_CONTACT_ENDPOINT=http://localhost:3000/contact
#   PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA   (Cloudflare test key)
pnpm build:web && pnpm --filter @nishki/web preview   # http://localhost:4321
```

For local form testing add `CORS_ORIGINS=http://localhost:4321` and `TURNSTILE_SECRET=1x0000000000000000000000000000000AA` to `apps/cms/.env`.

After changing collections/blocks: `pnpm types` (regenerates `packages/types`) and `pnpm --filter @nishki/cms generate:importmap` if admin components changed.

## Pages and URLs

| URL | Source |
|---|---|
| `/`, `/en/` | Page with slug `home` |
| `/<slug>/`, `/en/<slug>/` | Any other Page (about, gallery, prices, contact, privacy) |
| `/gallery/<slug>/`, `/en/gallery/<slug>/` | Project (its own collage gallery) |
| `/sitemap-index.xml`, `/robots.txt`, `/404.html` | generated |

Every page is a list of blocks; each Payload block (`apps/cms/src/blocks`) has one Astro component (`apps/web/src/components/blocks`), wired in `BlockRenderer.astro`.

## Server setup (Phase 1)

1. **DNS (Cloudflare):** `nishki.eu`, `www`, `redaktor`, `api` → VPS IP (or `nishki.eu`/`www` → Cloudflare Pages).
2. **Plesk:** subdomains `redaktor` and `api` (done); Let's Encrypt certificates for all four names. Node 24.22+ via nvm/Plesk Node extension; `npm i -g pnpm pm2`.
3. **Code:** clone to e.g. `/srv/nishki`, `pnpm install --frozen-lockfile`, create `apps/cms/.env` and `apps/web/.env` from `.env.example` (`openssl rand -hex 32` for `PAYLOAD_SECRET`).
4. **CMS:** don't build on a small server (the Next build needs 2–3 GB RAM). `.github/workflows/deploy-cms.yml` builds it on GitHub, uploads it and starts/reloads PM2 via `deploy/deploy-cms.sh`; run that workflow once by hand for the first deploy.
5. **Nginx:** `deploy/nginx/redaktor-api.nishki.eu.conf` (+ `cloudflare-realip.conf` in `http {}` if proxied by Cloudflare); `deploy/nginx/nishki.eu.conf` when the static site is served from the VPS.
6. **First login:** open `https://redaktor.nishki.eu` → create the first user (always becomes admin), or run the seed with `SEED_ADMIN_*`.
7. **Build key:** Users → create user with role *Build*, tick *Enable API key*, copy the key into `apps/web/.env` as `CMS_API_KEY` (the seed does this for you).
8. **Cron:** `deploy/crontab.example` (daily backup + GDPR retention).

Done when `https://redaktor.nishki.eu` shows the admin and `https://api.nishki.eu/health` returns `{"ok":true}`.

## Publishing (Phase 5)

Editors click **Publish site** in the admin header. Only one build runs at a time; clicks during a build queue exactly one follow-up. Status (live since / failed + log) is shown next to the button and under *System → Publish status*.

- `BUILD_MODE=local` (default): runs `deploy/build-and-deploy.sh` → `astro build` → `rsync` into `WEB_ROOT/releases/<timestamp>` → atomic `current` symlink swap. Last 5 releases kept; roll back by pointing `current` at an older release.
- `BUILD_MODE=hook`: POSTs `BUILD_HOOK_URL` — a Cloudflare Pages deploy hook, or GitHub `workflow_dispatch` for `.github/workflows/publish-site.yml` (which reports back via `/api/publish/callback` when `BUILD_CALLBACK_SECRET` is set).

## Contact API (Phase 4)

`POST https://api.nishki.eu/contact` — contract as in the spec. Order: CORS → rate limit (5 / 10 min / IP) → honeypot → Turnstile → validation → save → email owner (reply-to = submitter) → optional auto-reply (`CONTACT_AUTOREPLY=true`). The submission is always saved before email is attempted; email failures are logged and recorded on the submission (`emailError`).

## Operations (Phase 6)

- **Backups:** `deploy/backup.sh` (SQLite online backup + media, 30 days, `rclone` to `BACKUP_REMOTE`). **Test restore:** `deploy/restore.sh db-….tar.gz media-….tar.gz` restores into a temporary directory and checks integrity.
- **Monitoring:** point an uptime monitor (UptimeRobot/Better Stack) at `https://nishki.eu/` and `https://api.nishki.eu/health`.
- **Logs:** `pm2 logs nishki-cms` (`/var/log/nishki/`). Sentry can be added later.
- **Admin hardening:** account lock after 5 failed logins (15 min) + Nginx login rate limit; recommended: Cloudflare Access in front of `redaktor.nishki.eu` (gives 2FA/SSO without code changes).
- **GDPR:** privacy notice + link under the form; submissions auto-deleted after `SUBMISSION_RETENTION_MONTHS` (cron); delete on request from the admin (Submissions → select → Delete; admins only). Export on request: copy the entry from the admin, or `GET /api/submissions?where[email][equals]=…` with an admin token (a CSV export button would need `@payloadcms/plugin-import-export`).
