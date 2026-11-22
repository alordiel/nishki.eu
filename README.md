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

After changing collections/blocks/fields: `pnpm --filter @nishki/cms payload migrate:create <name>` and commit the new file in `apps/cms/src/migrations` (production applies pending migrations on startup and never auto-creates tables), `pnpm types` (regenerates `packages/types`) and `pnpm --filter @nishki/cms generate:importmap` if admin components changed.

## Pages and URLs

| URL | Source |
|---|---|
| `/`, `/en/` | Page with slug `home` |
| `/<slug>/`, `/en/<slug>/` | Any other Page (about, gallery, prices, contact, privacy) |
| `/gallery/<slug>/`, `/en/gallery/<slug>/` | Project (its own collage gallery) |
| `/sitemap-index.xml`, `/robots.txt`, `/404.html` | generated |

Every page is a list of blocks; each Payload block (`apps/cms/src/blocks`) has one Astro component (`apps/web/src/components/blocks`), wired in `BlockRenderer.astro`.

## Server setup (Plesk)

One Plesk subscription holds `nishki.eu`, `api.nishki.eu` and `redaktor.nishki.eu`, so a single system user owns everything:

```
/var/www/vhosts/nishki.eu/
  nishki/               git checkout (not public); the CMS runs from here under PM2
    apps/cms/.env       CMS settings      ┐
    apps/web/.env       site build settings│ gitignored — untouched by deploys
    apps/cms/data/      SQLite database    │
    apps/cms/media/     uploads           ┘
  nishki-web/releases/  one folder per "Publish site" build (last 5 kept)
  nishki.eu  →  nishki-web/releases/<latest>    document root of nishki.eu (symlink)
  api.nishki.eu/, redaktor.nishki.eu/           unused; Nginx proxies them to the CMS
  backups/, cron-logs/
```

1. **Cloudflare:** DNS for all names proxied; SSL **Full (strict)** with a Cloudflare **Origin Certificate** (`nishki.eu`, `*.nishki.eu`) assigned to **each** domain in Plesk (Hosting Settings → Security). A domain left on Plesk's default certificate gives Cloudflare error 526.
2. **Shell:** subscription SSH access `/bin/bash` (not chrooted). Node from Plesk (`/opt/plesk/node/24/bin`, ≥ 24.22.1); `npm config set prefix ~/.npm-global && npm i -g pnpm pm2`; put `~/.npm-global/bin:/opt/plesk/node/24/bin` on `PATH` in `~/.bashrc` and have `~/.bash_profile` source it.
3. **Code:** read-only GitHub deploy key on the server; `git clone … ~/nishki && pnpm install --frozen-lockfile`. Plesk's own Git deployment stays **off**.
4. **Settings:** `apps/cms/.env` and `apps/web/.env` from `.env.example`. On the server set `REPO_ROOT`, `MEDIA_DIR`, `WEB_ROOT`, `CURRENT_LINK` (absolute paths) and `CMS_URL=http://127.0.0.1:3000` for the site build.
5. **CMS build and start:** never build the CMS on the server (the Next build needs 2–3 GB RAM and froze the 4 GB box). `.github/workflows/deploy-cms.yml` builds it on GitHub at the server's path, uploads it, and `deploy/deploy-cms.sh` swaps it in, starts/reloads PM2 and rolls back if `/health` fails. The database tables come from `apps/cms/src/migrations`, applied on startup.
6. **Nginx (root, once):** `cp deploy/nginx/cloudflare-realip.conf /etc/nginx/conf.d/nishki.conf && nginx -t && systemctl reload nginx` (real visitor IP behind Cloudflare + the `nishki_login` rate-limit zone).
7. **Nginx (Plesk, per domain):** paste `deploy/plesk/<domain>.nginx` into *Apache & nginx Settings → Additional nginx directives*, with "Proxy mode" and "Serve static files directly by nginx" **off**. Don't enable Plesk's Node.js (Passenger) app: the CMS must be one long-running process (the publish lock and rate limiter live in memory). `nishki.eu`: Preferred domain = `nishki.eu`.
8. **Content:** create the first user at `https://redaktor.nishki.eu` (becomes admin), then seed: `cd apps/cms && NODE_ENV=production NODE_OPTIONS="--no-deprecation --max-old-space-size=1024" nice -n 10 pnpm exec payload run ./src/scripts/seed.ts` — prints the build user's API key for `CMS_API_KEY`. Run CLI scripts with `NODE_ENV=production` on the server (dev mode would try to push the schema).
9. **Cron:** `deploy/crontab.example` (PM2 resurrect on reboot, backup, GDPR retention).
10. **Email:** Resend over SMTP (`smtp.resend.com:465`, user `resend`, password = API key); sender `no-reply@nishki.eu`.

Check: `https://api.nishki.eu/health` → `{"ok":true}`, `https://redaktor.nishki.eu` → admin, **Publish site** → `https://nishki.eu`.

`deploy/nginx/*.conf` are the equivalent full server blocks for a plain (non-Plesk) Nginx.

## Publishing (Phase 5)

Editors click **Publish site** in the admin header. Only one build runs at a time; clicks during a build queue exactly one follow-up. Status (live since / failed + log) is shown next to the button and under *System → Publish status*.

- `BUILD_MODE=local` (default): runs `deploy/build-and-deploy.sh` → `astro build` → `rsync` into `WEB_ROOT/releases/<timestamp>` → atomic `current` symlink swap. Last 5 releases kept; roll back by pointing `current` at an older release.
- `BUILD_MODE=hook`: POSTs `BUILD_HOOK_URL` — a Cloudflare Pages deploy hook, or GitHub `workflow_dispatch` for `.github/workflows/publish-site.yml` (which reports back via `/api/publish/callback` when `BUILD_CALLBACK_SECRET` is set).

## Contact API (Phase 4)

`POST https://api.nishki.eu/contact` — contract as in the spec. Order: CORS → rate limit (5 / 10 min / IP) → honeypot → Turnstile → validation → save → email owner (reply-to = submitter) → optional auto-reply (`CONTACT_AUTOREPLY=true`). The submission is always saved before email is attempted; email failures are logged and recorded on the submission (`emailError`).

## Operations (Phase 6)

- **Backups:** `deploy/backup.sh` nightly (SQLite online backup + media → `BACKUP_DIR`, 30 days; off-site copy with `rclone` when `BACKUP_REMOTE` is set). **Test restore:** `deploy/restore.sh db-….tar.gz media-….tar.gz` restores into a temporary directory and checks integrity.
- **Monitoring:** UptimeRobot on `https://nishki.eu/`; add `https://api.nishki.eu/health` (checks the CMS and its database).
- **Logs:** `pm2 logs nishki-cms` (`~/.pm2/logs/`), cron jobs in `~/cron-logs/`. Sentry can be added later.
- **Admin hardening:** account lock after 5 failed logins (15 min) + Nginx login rate limit; recommended: Cloudflare Access in front of `redaktor.nishki.eu` (gives 2FA/SSO without code changes).
- **GDPR:** privacy notice + link under the form; submissions auto-deleted after `SUBMISSION_RETENTION_MONTHS` (cron); delete on request from the admin (Submissions → select → Delete; admins only). Export on request: copy the entry from the admin, or `GET /api/submissions?where[email][equals]=…` with an admin token (a CSV export button would need `@payloadcms/plugin-import-export`).
