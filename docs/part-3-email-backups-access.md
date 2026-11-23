# Part 3 — Email with Resend, backups to Cloudflare R2, and protecting the admin

*Series: building and running a CMS-backed static website on your own server.*
*[Part 1: architecture](part-1-payload-astro-api.md) · [Part 2: VPS + Cloudflare deployment](part-2-vps-cloudflare-deploy.md) · Part 3: email, backups and admin protection*

---

The site is live (Parts 1–2). This part covers the operational pieces that decide whether it stays healthy without anyone watching:

1. **Email** — contact form notifications and operational alerts, sent through Resend.
2. **Backups** — nightly, on the server *and* off-site in Cloudflare R2, with space checks and alerts.
3. **Protecting the admin** — the options for putting Cloudflare Access in front of `admin.example.com`.

---

## 1. Email with Resend

### Why not send from the server itself?

The server could run its own mail server, or use a mailbox from the hosting panel. Both work, and both cause trouble:

- **Deliverability.** Mail from a VPS IP address lands in spam far more often. Shared VPS IP ranges have a poor reputation, and getting SPF, DKIM, DMARC and reverse DNS all right is fiddly.
- **TLS and maintenance.** A mail server is one more service to secure, patch and renew certificates for.
- **It exposes the origin.** Mail sent directly from the server carries its IP address in the headers. If the site hides behind Cloudflare, that hands out the address Cloudflare is supposed to hide.

A **transactional email provider** (Resend, Postmark, Brevo, SES…) solves all three. Its servers send the mail, and its whole business is deliverability. A contact form fits comfortably in every free plan.

### Setup, conceptually

1. **Add and verify the domain** in Resend. It gives you DNS records: SPF and DKIM for authentication, an MX record for bounce handling, and optionally DMARC. With DNS at Cloudflare, Resend can add them for you. Verification proves you own the domain and lets receiving servers trust the mail.
2. **Choose a sender address** on that domain, e.g. `no-reply@example.com`. The sender must be on a verified domain.
3. **Create an API key**, ideally with *sending access only*, restricted to that domain.
4. **Connect over SMTP.** Resend accepts mail over standard SMTP, so the CMS needs no special SDK:

   | Setting | Value |
   |---|---|
   | Host | `smtp.resend.com` |
   | Port | `465` (TLS from the start) |
   | Username | `resend` (literally — the same for everyone) |
   | Password | the API key |

   Payload's email adapter is Nodemailer, so these are four environment variables, plus the sender name and address, plus the owner's address that receives notifications.

### How the CMS uses it

From Part 1, the contact handler **saves first, emails second**:

- **Owner notification**: all form fields, a direct link to the submission in the admin, and **reply-to set to the visitor**, so *Reply* in any mail client answers the customer.
- **Optional auto-reply** to the visitor in their language. It's a single switch, worth turning on only after someone has reviewed the wording.
- **If sending fails**, the submission is still stored, the error message is recorded on it, and the admin shows which submissions didn't trigger an email.

### Reusing the same SMTP account for operational alerts

Shell scripts (backups, below) can send alerts through the same account without installing anything: `curl` speaks SMTP.

```bash
curl --ssl-reqd --url smtps://smtp.resend.com:465 \
     --netrc-file "$PRIVATE_TMP/netrc" \
     --mail-from no-reply@example.com --mail-rcpt ops@example.com \
     --upload-file message.txt
```

Note `--netrc-file`. Writing the credentials to a private temporary file (mode `600`) instead of passing `--user resend:<key>` keeps the API key out of the process list, where other users on the server could see it.

---

## 2. Backups

### What actually needs backing up?

| Data | Where it lives | Backed up by |
|---|---|---|
| Code, config templates, deploy scripts | Git | GitHub (already off-site) |
| **Database** (pages, projects, settings, users, submissions) | one SQLite file | **nightly backup** |
| **Uploaded media** | the media folder | **nightly backup** |
| The built static site | release folders | Not needed: it can be rebuilt from the two above with one Publish |
| **Secrets** (`.env` files: API keys, the Payload secret, SMTP key) | the server only | **Your password manager.** The backup script deliberately doesn't copy them anywhere |

That last row matters. A perfect backup of the database is useless if you can't recreate the `.env` files on a new server. Store every secret in a password manager when you create it.

### On the server: consistent, verified, short-lived

Every night (cron, 03:15):

1. **A consistent copy of the database.** Copying a SQLite file with `cp` while the app writes to it can produce a corrupt copy. SQLite's own online backup (`sqlite3 db ".backup copy.db"`) is safe while the CMS runs.
2. **Integrity check** of that copy (`PRAGMA integrity_check`). A backup that fails it aborts the whole run, so a corrupt backup is never recorded as good.
3. Two archives, `db-<stamp>.tar.gz` and `media-<stamp>.tar.gz`, in a backup folder readable **only by the site user**. The database contains personal data from contact forms.
4. **Keep 7 days** locally. They're for quick "undo yesterday" restores, not disaster recovery.

A second nightly job (03:45) deletes contact submissions older than the retention period. That's the GDPR side of "don't keep personal data longer than needed".

### Off-site: Cloudflare R2

Backups on the same server don't survive the failures you most need them for: a dead disk, a compromised server, or a provider account problem. **Cloudflare R2** is a good fit for a small site:

- **Free tier:** 10 GB of storage, 1 million writes and 10 million reads per month. **Downloads (restores) are always free**, unlike many S3-style services.
- **S3-compatible**, so standard tools (rclone) work.
- You likely already have a Cloudflare account. R2 does require a payment method on file, even on the free tier.

#### Layout: mirror the media, archive the database

Uploading a full media archive every night wastes space: 30 nights × 5 GB is 150 GB. Instead:

```
r2:bucket/
  db/
    db-20261101-031500.tar.gz      one per night, kept 30 days
    …                              (only if the archive is < 100 MB)
  media/                           ONE live mirror of the uploads folder;
    photo-1.webp                   each night only new/changed files upload
    …
  media-removed/
    20261115-031500/               files deleted or replaced in the CMS that night,
      old-photo.jpg                kept 30 days, so an accidental deletion
                                   in the admin is still recoverable
```

`rclone sync media/ r2:bucket/media --backup-dir r2:bucket/media-removed/<stamp>` does exactly this. The sync makes the mirror match the server, and anything it would overwrite or delete is *moved* to the dated folder instead.

One subtle point: files moved into `media-removed/` keep their **original modification times**, which may be years old. Pruning that folder with an age filter (`--min-age 30d`) would delete them immediately. Prune by the **date in the folder name** instead.

#### Guard rails

- **Space check.** Before syncing media, measure the bucket (`rclone size`). If less than 2 GB of the 10 GB free tier is left, **skip the media sync**, keep media on the server only, keep sending the (small) database, and **email an alert**.
- **Database size guard.** If the database archive ever exceeds 100 MB, something unusual is happening. Skip the upload and alert instead of silently uploading large files every night.
- **Failure alert.** A shell `trap` on exit emails "backup FAILED" if any step fails. Without it, a broken backup only shows up in a log file nobody reads.
- Every limit (7 days, 30 days, 2 GB, 10 GB, 100 MB) is an environment variable at the top of the script.

The bucket-scoped key (below) can only see its own bucket. If you use R2 for other things in the same account, the free 10 GB is shared, so lower the limit the script assumes.

#### Access keys: scope them tightly

R2 has **its own token page** (*R2 → Manage API tokens*), separate from Cloudflare's general API tokens. Use it:

| | General API token with "Workers R2 Storage: Edit" | R2 token, "Object Read & Write", one bucket |
|---|---|---|
| Create/delete buckets | ✅ | ❌ |
| Scope | **every** bucket in the account (or several accounts) | **one** bucket |
| Upload/list/delete objects | ✅ | ✅ |

Also restrict the token to the **server's IP address** and set **no expiry**: an expiring backup key fails silently on a random night.

#### rclone and R2: two settings you'll need

```
rclone config create r2 s3 provider=Cloudflare \
  access_key_id=… secret_access_key=… endpoint=https://<account-id>.r2.cloudflarestorage.com \
  acl=private no_check_bucket=true no_head=true
```

- `no_check_bucket=true`: an object-only key isn't allowed to create buckets, so rclone must not try.
- `no_head=true`: older rclone versions (e.g. 1.60 from Ubuntu's packages) read each object back after upload, asking for the specific *version* R2 just returned. R2 answers `501 Not Implemented`. The upload had succeeded, and rclone's retry hides the problem, but the log fills with errors. Skipping that read-back is safe because every upload is still verified with a `Content-MD5` checksum.

How we found it: run one upload with retries disabled and `--dump headers` (filtering out the `Authorization` lines). The failing request was the one *after* a successful PUT.

#### Honest limitations, and the upgrades

- **The server's key can delete backups.** It needs delete rights to prune old files, so an attacker with server access could wipe the bucket. Mitigation: an **R2 bucket lock** (retention rule) that blocks deleting objects younger than N days, or a second bucket written by a different machine.
- **Cloudflare could technically read the data.** It's encrypted at rest, but with Cloudflare's keys. If that matters (contact submissions are personal data), wrap the remote in **rclone `crypt`**, which encrypts client-side before upload. The price is one more secret that must never be lost.

### Restoring

- **From the server:** a restore script unpacks a `db-*.tar.gz` + `media-*.tar.gz` pair into a scratch folder, runs the integrity check and prints record counts. That's the "test restore".
- **From R2:** `rclone copy r2:bucket/db/db-<stamp>.tar.gz .` and `rclone copy r2:bucket/media ./media`. Or download through the Cloudflare dashboard, which needs no key.
- **Practise it.** A backup you've never restored is a hope, not a backup. Run a test restore every few months, and after any change to the backup script.

---

## 3. Protecting the admin with Cloudflare Access (options)

### What's already protecting it

The admin is reasonably secure out of the box: strong passwords, account lock after 5 failed logins, an Nginx rate limit on the login URL, and HTTPS everywhere. But the login page is **public**. Bots find it and keep trying, and one leaked password is enough to get in.

### What Cloudflare Access adds

Access (part of **Cloudflare Zero Trust**, free for up to 50 users) puts an identity check **at Cloudflare's edge**, before a request ever reaches your server:

```
Editor → admin.example.com
          │
          ▼
   Cloudflare Access: "Who are you?"
     ├─ email one-time code, or Google / GitHub / Microsoft login
     ├─ policy: is this identity on the allow list?
     │     no  → blocked at Cloudflare; your server never sees the request
     │     yes → short-lived Access session (e.g. 24 h – 1 week)
          ▼
   Payload login page (normal password) → admin
```

The result is effectively **two-factor login** (identity provider + CMS password) with no code changes, and attackers never even see the CMS login page.

### Setup, conceptually

1. **Enable Zero Trust** and choose a team name. Your login page becomes `<team>.cloudflareaccess.com`, and editors see that address briefly, so pick a neutral name.
2. **Choose login methods.** *One-time PIN* (a code by email) needs no setup. Google/GitHub/Microsoft are nicer for teams that already use them.
3. **Add a self-hosted application** for `admin.example.com`, **only**.
4. **Policy:** *Allow* these emails, or everyone at `@yourcompany.com`. Everything else is denied.
5. **Session duration:** how often editors re-authenticate.

### The rules that keep things working

- **Never put Access on `api.example.com`.** Visitors' browsers post the contact form there, and the uptime monitor calls `/health`. Neither can log in.
- The admin's own API calls go to `admin.example.com/api/...` from the editor's browser, which carries the Access cookie, so they keep working.
- The site build reads from `127.0.0.1` and the CI deploy talks to the server over SSH, so **neither passes through Access**.
- If an automated tool ever needs `admin.example.com`, give it an Access **service token** rather than a user identity.

### Closing the side door: the origin bypass

Access is enforced **at Cloudflare**. Someone who learns the server's IP address can send requests straight to it with `Host: admin.example.com` and skip Access entirely. How far to go is a judgement call:

| Option | Effort | What it does |
|---|---|---|
| **A. Access only** | Minutes | Stops every attacker who goes through the domain name, which is almost all of them. The CMS password and lock-out still protect the side door |
| **B. Access + Nginx accepts `admin.` only from Cloudflare IPs** | One small Nginx change | Direct-to-IP requests for the admin host are refused. Uses the same Cloudflare IP list as the real-IP config, so keep it current |
| **C. Access + verify the Access token** | Small code or Nginx change | Cloudflare adds a signed `Cf-Access-Jwt-Assertion` header to every request it lets through. The origin rejects requests without a valid one. Strongest check while still using a public origin |
| **D. Cloudflare Tunnel** | Moderate | A `cloudflared` agent on the server makes an *outbound* connection to Cloudflare, so the admin needs no public port at all. There's no side door to close. A bigger change to how traffic reaches the server |

For a small business site, **A** is a big improvement on its own, and **B** closes most of the remaining gap for very little work. **C** and **D** suit teams with stricter requirements.

### Should you turn it on?

It's a trade-off for the site owner, not a technical necessity:

- **For:** stops password guessing completely, adds a second factor for free, takes about 10 minutes, and nothing changes on the server.
- **Against:** one more login step for editors (once per session), a dependency on Cloudflare's identity flow, and the editor list must be maintained when people join or leave.

---

## Wrapping up the series

| Concern | Solution | Where |
|---|---|---|
| Editing | Payload CMS, blocks ↔ components, roles, drafts | Part 1 |
| Public site | Astro static build, self-contained images, Publish button with lock/queue | Part 1 |
| Forms | `api.` endpoint: CORS → rate limit → honeypot → Turnstile → save → email | Parts 1, 3 |
| Hosting | Cloudflare (Full strict, origin cert) → Nginx → one PM2 process | Part 2 |
| Releases | Atomic symlink switch, 5 releases kept | Part 2 |
| Code deploys | Build in CI, upload, swap, health check, automatic rollback | Part 2 |
| Email | Resend over SMTP, also used for ops alerts | Part 3 |
| Backups | Nightly: 7 days local, R2 off-site (DB archives + media mirror), alerts | Part 3 |
| Admin hardening | Lock-out + rate limit; optionally Cloudflare Access | Parts 2, 3 |

None of the pieces is exotic. What makes the setup dependable is that each one fails **loudly and safely**: builds can't freeze the server, deploys roll themselves back, submissions are saved before email, and backups tell you when they couldn't run.
