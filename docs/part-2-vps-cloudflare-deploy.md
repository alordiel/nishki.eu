# Part 2 — Deploying to a VPS behind Cloudflare

*Series: building and running a CMS-backed static website on your own server.*
*[Part 1: architecture](part-1-payload-astro-api.md) · Part 2: VPS + Cloudflare deployment · [Part 3: email, backups and admin protection](part-3-email-backups-access.md)*

---

In Part 1 we designed the system: a static Astro site at `example.com`, and one Payload CMS process serving `admin.example.com` and `api.example.com`. This part puts it on a single Linux VPS, with Cloudflare in front, and sets up deploys that don't need anyone to SSH into the server.

The server in this story is deliberately modest — **2 CPU cores, 4 GB RAM, no swap**, shared with other websites. That constraint shaped several decisions, and one mistake that froze the whole server is described below so you can avoid it.

---

## The request path

```
Visitor / editor
      │  HTTPS
      ▼
┌────────────────────────────────────────────┐
│ Cloudflare                                 │
│  DNS (proxied, orange cloud)               │
│  TLS to the visitor (public certificate)   │
│  CDN cache for static assets               │
│  Turnstile (form CAPTCHA)                  │
└────────────────────────────────────────────┘
      │  HTTPS, verified with an Origin Certificate ("Full (strict)")
      ▼
┌────────────────────────────────────────────┐
│ VPS: Nginx                                 │
│  example.com        → static files         │
│  admin.example.com  ┐                      │
│  api.example.com    ┴→ proxy to 127.0.0.1:3000
└────────────────────────────────────────────┘
      │
      ▼
┌────────────────────────────────────────────┐
│ Node.js: Payload CMS (PM2, one process)    │
│  SQLite file + media folder on local disk  │
└────────────────────────────────────────────┘
```

Each layer has one job:

- **Cloudflare** handles DNS, the public TLS certificate, caching, DDoS absorption and the CAPTCHA.
- **Nginx** terminates TLS from Cloudflare, serves static files, adds security headers, and reverse-proxies the two CMS host names to Node.
- **Node** only listens on `127.0.0.1:3000`. It is never reachable from the internet directly.

---

## Cloudflare: TLS done properly

Set the zone's SSL mode to **Full (strict)**. Cloudflare then connects to your server over HTTPS and **validates its certificate**. The two weaker modes ("Flexible" sends plain HTTP to your server; "Full" accepts any certificate) both allow someone between Cloudflare and your server to read or alter traffic.

For the server's certificate, a **Cloudflare Origin Certificate** is the simplest option: free, valid up to 15 years, and covering `example.com` and `*.example.com` in one certificate. It is only trusted by Cloudflare (browsers would reject it), which is fine because browsers only ever talk to Cloudflare.

> **Gotcha — error 526.** "Invalid SSL certificate" from Cloudflare means the server presented a certificate Cloudflare wouldn't accept. A common cause: the origin certificate is installed for the main domain, but each **subdomain** is still using the server's default self-signed certificate. Hosting panels in particular manage certificates per domain. A wildcard origin certificate covers the subdomains — it just has to be *assigned* to each one. To check what each name really serves, connect to the server's public IP with SNI:
>
> ```bash
> echo | openssl s_client -connect <server-ip>:443 -servername api.example.com 2>/dev/null \
>   | openssl x509 -noout -issuer -subject
> ```
>
> (Connecting to `127.0.0.1` may show nothing if Nginx only listens on the public IP.)

### Real visitor IPs

With Cloudflare in front, every request reaches Nginx from a Cloudflare IP. Anything that relies on the client address — the contact form's rate limit, Turnstile's optional IP check, logs — would see Cloudflare instead of the visitor. Nginx's `realip` module fixes that: trust the `CF-Connecting-IP` header, but **only** when the request comes from Cloudflare's published IP ranges. This is a server-wide (`http {}` level) setting, and the IP list should be refreshed occasionally from cloudflare.com/ips.

---

## Server layout

Everything lives under one unprivileged Linux user. No part of the app runs as root.

```
/home/site/                         (or your panel's per-site home)
  app/                     git checkout of the repo — NOT a web root
    apps/cms/.env          CMS settings and secrets     ┐
    apps/web/.env          site build settings          │ gitignored:
    apps/cms/data/         SQLite database              │ survive every deploy
    apps/cms/media/        uploaded files               ┘
  web/releases/
    20260101-120000/       one folder per published build (last 5 kept)
    20260102-093000/
  public_html  →  web/releases/20260102-093000      ← Nginx root for example.com (symlink)
  backups/, cron-logs/
```

Key ideas:

- **The checkout is not inside any web root.** Source code, `.env` files and the database are never downloadable.
- **Secrets and data are gitignored**, so `git reset --hard` during a deploy can never touch them.
- **The public site is a symlink to a release folder.** More on that next.

> **Gotcha — panel "Git deploy" features.** Many hosting panels can auto-deploy a Git branch into a domain's document root. For this architecture that's wrong twice over: it publishes your *source code* (not the built site), and it copies files over a running app without building or restarting it. Turn it off and use the pipeline below.

---

## Publishing the static site: releases and an atomic switch

When an editor clicks **Publish site** (in `local` mode — Part 1), the CMS runs a deploy script:

```
1. astro build                         → apps/web/dist/
2. copy dist/ → web/releases/<timestamp>/
3. point the live symlink at the new release (atomic rename)
4. delete all but the newest 5 releases
```

Step 3 is the trick. Creating a new symlink and *renaming* it over the old one is a single atomic filesystem operation, so a visitor gets either the complete old site or the complete new site, never a half-copied mix. **Rolling back** means pointing the symlink at the previous release folder.

Two safety details:

- The script **refuses to replace a real directory** with the symlink. On the very first publish you delete the (empty) document root yourself, so nothing is ever deleted by accident.
- On a shared server the build runs with **low CPU priority** (`nice`) and a **capped Node heap**. If it ever needs more memory than allowed, the build fails with an error instead of starving the other websites.

The build reads content from the CMS at `http://127.0.0.1:3000` rather than the public `https://api.example.com`. That's faster, doesn't depend on Cloudflare, and can't be blocked by Cloudflare's bot protection. No visitor ever sees that URL, because images are downloaded and baked into the output.

---

## Running the CMS: one process under PM2

The CMS is a long-running Node process. **PM2** keeps it alive:

- restarts it if it crashes, or if it exceeds a memory limit
- captures logs
- `pm2 save` + a `@reboot pm2 resurrect` cron entry brings it back after a server reboot, without root (`pm2 startup` needs root; the cron line doesn't)

It runs as **exactly one instance**, on purpose. The contact form's rate limiter and the publish lock live in memory, and SQLite wants a single writer. That's a perfectly good design at this scale. If you ever outgrow it, those move to Redis/Postgres first.

> **Gotcha — panel Node.js integrations.** Hosting panels often offer to run Node apps through Phusion Passenger. Passenger may start several processes or stop an "idle" one, which breaks in-memory locks and kills a running build. Use a plain process manager and a reverse proxy instead.

> **Gotcha — PATH in non-interactive shells.** If Node, pnpm and PM2 are installed per user (e.g. a Node version from the panel plus `npm config set prefix ~/.npm-global`), remember that cron jobs and SSH commands from CI **don't read `~/.bashrc`**, and SSH login shells may read only `~/.bash_profile`. Scripts should set their own `PATH`.

---

## Nginx configuration, conceptually

**`admin.example.com` and `api.example.com`** → reverse proxy to `127.0.0.1:3000`, passing `Host`, `X-Forwarded-For` and `X-Forwarded-Proto` so the app knows which host was requested and that the original request was HTTPS. Plus:

- a **rate limit on the login URL only** (`/api/users/login`, a few attempts per minute per IP), on top of Payload's own account lock-out
- a larger **upload size limit** on the admin host (full-size photos), since Nginx's default is 1 MB

**`example.com`** → serve files from the live symlink, with:

- `try_files $uri $uri/ =404` and your designed `404.html`
- **caching rules:**
  - HTML: `Cache-Control: max-age=0, must-revalidate` — a Publish shows up immediately
  - `/_astro/*` (hashed CSS/JS/images): `max-age=31536000, immutable` — the file name changes on every build, so it can be cached forever
- **security headers:** `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, and the Content Security Policy from Part 1
- a **301 from `www`** to the bare domain (or the other way round — pick one)

> **Gotcha — headers that disappear.** In Nginx, `add_header` in a `location` block *replaces* all `add_header`s inherited from the server block. Repeat the security headers in every location that sets its own (e.g. the `/_astro/` cache block), or they silently vanish for those files.

> **Gotcha — stale headers at the CDN.** After changing caching headers, Cloudflare may keep serving copies it cached *with the old headers* until they expire. Compare what Cloudflare returns (look at `cf-cache-status`) with what your server returns directly (`curl --resolve example.com:443:<server-ip> -k …`), and purge the cache if they differ.

### If you use a hosting panel (Plesk, cPanel, …)

Panels generate the Nginx server blocks themselves and give you an "additional directives" box per domain. The same configuration applies, with a few twists:

- **Disable the panel's proxy-to-Apache mode** and its **"serve static files directly"** option for these domains. Otherwise the panel's own `location` rules take some requests (e.g. `*.js`) before yours do.
- The panel already defines `location /`, so use an equivalent **regex location** (`location ~ ^/ { … }`) to avoid a "duplicate location" error.
- Server-level directives the panel already sets (e.g. `client_max_body_size`) can't be repeated at server level. Put yours **inside** your location block instead.
- `http {}`-level settings (real IP, rate-limit zones) go in a separate file in Nginx's `conf.d/`, added once by root. Always run `nginx -t` before reloading, because one broken file takes down **every** site on the server.

---

## Code deploys: build the CMS in CI, not on the server

### The mistake

The first attempt built the CMS on the server: `git pull && pnpm build && pm2 reload`. A Payload/Next.js production build needs **2–3 GB of RAM**. On a 4 GB server with no swap, running other sites, the build pushed the machine into memory exhaustion. **SSH, the hosting panel and every other site on the server froze**, and it needed a hard reboot.

The lesson isn't just "add swap". **Production servers should run software, not compile it** — especially shared ones.

### The pipeline

```
git push main
      │
      ▼
GitHub Actions runner (plenty of RAM)
  1. check out the repo at the SAME absolute path it has on the server
  2. pnpm install && build the CMS
  3. rsync the build output to the server as  .next-new/
      │
      ▼  SSH
Server (deploy script)
  4. git fetch && git reset --hard <the exact commit that was built>
  5. pnpm install (fast: packages are cached)
  6. swap  .next → .next-old,  .next-new → .next
  7. pm2 reload
  8. wait for GET /health → ok
       ├─ ok   → done, pm2 save
       └─ fail → swap .next-old back, reload, mark the deploy failed
  9. if site templates (apps/web) changed → rebuild the static site too
```

Why each step is there:

- **Same absolute path on the runner (step 1).** Framework build outputs can contain absolute paths. Building at the server's path removes a whole class of "works in CI, breaks on the server" problems.
- **Upload to a side folder, then swap (steps 3 and 6).** The running app keeps serving from its current build while the new one uploads. The switch takes seconds, and building on the server had caused minutes of downtime.
- **Reset to the exact built commit (step 4)**, not "latest main", so the code on disk always matches the uploaded build.
- **Health check and automatic rollback (step 8).** A broken release puts the previous build back by itself.
- **Change detection (step 9).** The deploy compares the previous and new commits. Only if `apps/web` changed does it rebuild the public site. A CMS-only change doesn't republish anything.
- **Docs-only commits don't deploy at all**, thanks to a `paths` filter on the workflow.

### Keys and trust

Three SSH relationships, each as narrow as possible:

| Key | Lives on | Allows |
|---|---|---|
| **Deploy key** (read-only) | the server | the server pulls the private repo from GitHub. It can't push |
| **CI key** | GitHub Actions secrets | CI logs in to the server **as the unprivileged site user** (never root) |
| **known_hosts entry** | GitHub Actions secrets | CI verifies it's talking to *your* server |

The `known_hosts` entry is the one people skip. It's the server's public host-key fingerprint, captured once with `ssh-keyscan`. Without it, either CI can't connect (nobody is there to answer "are you sure? yes/no"), or you disable host checking, which means CI will happily upload your build to whoever answers at that address after a DNS hijack. Note: rebuilding the server changes the fingerprint, and deploys then fail until you update the secret. That's the protection doing its job.

> **Gotcha — empty arguments over SSH.** `ssh host bash -s -- "$A" "$B" ""` does **not** pass the empty third argument. SSH joins all arguments into one command string, and an empty one vanishes. With `set -u` the remote script then fails with "unbound variable". Always pass explicit values (`0`/`1`) instead of empty strings.

### What still runs on the server

- the CMS itself
- the **static site build** behind the Publish button. It needs the live CMS content, so it runs where the content is. It's much lighter than the CMS build, and it runs with `nice` and a heap cap.
- **CLI scripts** (seed, retention). Run them with `NODE_ENV=production` so Payload doesn't try to auto-push the schema, and with a heap cap.

---

## First-time setup, in order

1. **DNS** in Cloudflare (proxied), **Full (strict)**, origin certificate **assigned to every host name**.
2. **Unprivileged site user** with SSH; Node, pnpm and PM2 installed for that user.
3. **Read-only deploy key** → clone the repo outside the web roots → `pnpm install`.
4. **`.env` files**: secrets (`openssl rand -hex 32`), public URLs, absolute paths, `CMS_URL=http://127.0.0.1:3000` for the site build.
5. **CI secrets/variables** (CI key, known_hosts, host, user, path) → run the deploy workflow → CMS running under PM2, `/health` ok on the server.
6. **`@reboot pm2 resurrect`** in the user's crontab. Test it with `pm2 kill` + running the line by hand.
7. **Nginx**: real-IP + rate-limit zone (server-wide), then the proxy config for `admin.`/`api.`. Test `https://api.example.com/health`.
8. **First admin user** in the browser, then the seed script (content + the read-only build user + its API key).
9. **`apps/web/.env`** with the build key → test it with one authenticated API request → first **Publish**.
10. **Static site headers/caching/redirect** → verify with `curl -I`, and test the contact form in a real browser (a CSP mistake breaks the CAPTCHA).
11. **Uptime monitors** on `https://example.com/` **and** `https://api.example.com/health`.

At every step, check before moving on. Most of the problems above surfaced as one clear error at the step that caused them, and were cheap to fix there.

**Next: [Part 3 — Email with Resend, backups to Cloudflare R2, and protecting the admin with Cloudflare Access](part-3-email-backups-access.md).**
