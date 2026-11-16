# nishki.eu — Technical Specification

## 1. Overview

In folder `./HTML` you will find raw files of the design. In Folder `./Pics` ar png files of the design. In `./note.md` are few notes. 

A static marketing website with a separate admin for content editing, plus a small API for the contact form.

| Subdomain | Purpose | Tech |
|---|---|---|
| `nishki.eu` (+ `www`) | Public static site | Astro (static output) |
| `admin.nishki.eu` | Content editing, submissions inbox, publish | Payload CMS |
| `api.nishki.eu` | Content API (build time) + contact form endpoint | Payload CMS (same app) |

### Core stack
- **Frontend:** Astro, `output: 'static'`, TypeScript
- **CMS / API:** Payload CMS (Node.js, TypeScript)
- **Database:** SQLite (default) — Postgres if volume grows
- **Captcha:** Cloudflare Turnstile
- **Email:** Payload Nodemailer adapter via Resend / Postmark / SMTP
- **Hosting:** VPS (Plesk) for Payload behind Nginx reverse proxy; static site on Cloudflare Pages or Nginx on the same VPS
- **DNS / TLS:** Cloudflare DNS, Let's Encrypt (or Cloudflare proxy)

### Architecture flow
1. Editor edits content at `admin.nishki.eu`.
2. Editor clicks **Publish** → Payload triggers a build.
3. Build pulls content from `api.nishki.eu`, runs `astro build`, deploys static files to `nishki.eu`.
4. Visitor submits contact form → `POST api.nishki.eu/contact` → Turnstile verified → saved to DB → email sent to owner.
5. Owner reviews submissions in `admin.nishki.eu`.

---

## Phase 1 — Infrastructure setup

- Register DNS records: `nishki.eu`, `www`, `admin`, `api`.
- Provision VPS site entries (Plesk) for `admin` and `api`; Node.js runtime (LTS) with PM2 or systemd.
- Nginx reverse proxy: `admin.nishki.eu` and `api.nishki.eu` → Payload process (same port, host-based routing).
- TLS certificates for all subdomains.
- Git repository (monorepo):
  ```
  /apps/web      # Astro site
  /apps/cms      # Payload CMS
  /packages/types # shared TS types (generated from Payload)
  ```
- Environment variables: `DATABASE_URI`, `PAYLOAD_SECRET`, `TURNSTILE_SECRET`, `EMAIL_*`, `BUILD_HOOK_URL`, `OWNER_EMAIL`.

**Done when:** all subdomains resolve over HTTPS; Payload "hello" admin loads at `admin.nishki.eu`.

---

## Phase 2 — CMS content model

### Collections
- **Pages** — `title`, `slug`, `seo` (title, description, OG image), `layout` (blocks array), `status` (draft/published).
- **Media** — uploads with alt text; image sizes generated for responsive output.
- **Submissions** — `name`, `email`, `phone` (optional), `message`, `createdAt`, `ip`, `userAgent`, `status` (new / read / archived). Read-only fields except `status`.
- **Users** — admin accounts (roles: `admin`, `editor`).

### Globals
- **Site settings** — site name, logo, contact email, social links, default SEO.
- **Navigation** — header and footer menus.

### Blocks (one per design section)
Define one Payload block per section in the existing designs (e.g. Hero, Text + Image, Features grid, Gallery, CTA, FAQ, Contact form). Final list derived from the design files.

### Access control
- Public: no read access via REST except what the build needs (protected by API key).
- `editor`: edit Pages, Media, Navigation; view Submissions.
- `admin`: everything, including Users and Settings.

**Done when:** all design pages can be fully represented as content in the admin.

---

## Phase 3 — Astro frontend

- Implement layouts and components matching the designs.
- One Astro component per Payload block; a `BlockRenderer` maps block type → component.
- `getStaticPaths()` fetches all published Pages from `api.nishki.eu` (authenticated with a read-only API key).
- Images: `astro:assets` / responsive `srcset` from Payload media sizes.
- SEO: meta tags, Open Graph, `sitemap.xml` (`@astrojs/sitemap`), `robots.txt`, canonical URLs.
- Contact form component: client-side validation, Turnstile widget, `fetch` POST to `api.nishki.eu/contact`, success/error states.
- Performance target: Lighthouse ≥ 95 on all categories; no JS except form and minimal interactivity (Astro islands).

**Done when:** `astro build` produces a complete site from CMS content that matches the designs.

---

## Phase 4 — Contact form API

### Endpoint
`POST https://api.nishki.eu/contact`

**Request (JSON):**
```json
{
  "name": "string, required, max 100",
  "email": "string, required, valid email",
  "phone": "string, required",
  "weddingDate": "string, required",
  "weddingLocation": "string, required",
  "weddingNotes": "string, required",
  "message": "string, required, max 5000",
  "numberOfGuests": "string, required, 100, single select are `<50`, `50-100`, `100-150`, `150+`",
  "typeOfServices": "string, required, 300, multi-select  `wedding photography`, `before-the-wedding photography`, `video`, `photo-album`",
  "origin": "string, required, 300, multi-select  `Insta`, `Facebook`, `friends`, `web`",
  "turnstileToken": "string, required",
  "website": "string, honeypot — must be empty"
}
```

**Processing:**
1. CORS: allow origin `https://nishki.eu` and `https://www.nishki.eu` only.
2. Rate limit: e.g. 5 requests / 10 min per IP.
3. Reject if honeypot filled.
4. Verify `turnstileToken` with Cloudflare `siteverify` (server-side, include remote IP).
5. Validate and sanitise input.
6. Create `Submissions` record.
7. Send notification email to `OWNER_EMAIL` (reply-to = submitter's email).
8. Optional: auto-reply confirmation to submitter.

**Responses:**
- `200 { "ok": true }`
- `400 { "ok": false, "error": "validation" }`
- `403 { "ok": false, "error": "captcha" }`
- `429 { "ok": false, "error": "rate_limited" }`
- `500 { "ok": false, "error": "server" }`

Email failure must not lose the submission (record saved first; failure logged).

**Done when:** submissions appear in admin and owner receives the email; spam attempts are blocked.

---

## Phase 5 — Build & publish pipeline

- **Publish button** in admin (custom Payload UI component or global action) — preferred over auto-build on every save.
- Publish calls `BUILD_HOOK_URL`, one of:
  - Cloudflare Pages deploy hook (Pages builds Astro from Git, fetches content from API), **or**
  - GitHub Actions `workflow_dispatch` → build → deploy, **or**
  - Local script on VPS: `astro build` → `rsync` to web root (atomic swap via symlink).
- Debounce / lock: ignore new publish requests while a build is running; queue one follow-up.
- Build status shown in admin (last build time, success/failure).
- Optional: draft preview route on `admin.nishki.eu` using Payload live preview.

**Done when:** editor changes content, clicks Publish, and the live site updates within a few minutes without developer involvement.

---

## Phase 6 — Security, backups, monitoring

- Admin: strong passwords, optional 2FA, login rate limiting; consider restricting `admin.nishki.eu` with Cloudflare Access.
- Security headers on all subdomains (CSP, HSTS, X-Frame-Options, Referrer-Policy).
- Daily DB backup (SQLite file / `pg_dump`) + media uploads, retained 30 days, stored off-server.
- Uptime monitoring for `nishki.eu` and `api.nishki.eu/health`.
- Error logging for Payload (PM2 logs / Sentry).
- GDPR: privacy notice on contact form; submissions retention policy (e.g. auto-delete after 12 months); data export/delete on request.

**Done when:** backups verified by a test restore; monitoring alerts confirmed.

---

## Phase 7 — QA & launch

- Cross-browser and mobile testing against the designs.
- Form testing: valid, invalid, captcha fail, rate limit, email delivery (check spam folders, SPF/DKIM/DMARC for sending domain).
- Content entry walkthrough with the site owner; short editor guide.
- 301 redirects from any old URLs.
- Switch DNS / go live; submit sitemap to Google Search Console.

---

## Open questions
- Languages: single language or multilingual (e.g. BG/EN)? Payload supports field-level localisation; Astro i18n routing.
- Static hosting choice: Cloudflare Pages vs VPS.
- Email provider and sending address (e.g. `noreply@nishki.eu`).
- Who has admin accounts and which roles.
- Final block list from the designs.