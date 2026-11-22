# Decisions & open questions

Things where the spec, the designs and the notes disagreed or were silent. Each one lists what was implemented, so it's easy to change.

## Needs an answer from you / the owner

| # | Topic | What I did | Question |
|---|---|---|---|
| 1 | **Languages** (spec open question) | BG default at `/`, EN at `/en/` — the designs have a BG/EN switch. All text fields are localised; layout/photos are shared. EN copy is **my translation** of the design text. | Confirm BG+EN. Who reviews the English? |
| 2 | **Static hosting** (open question) | Both work: `BUILD_MODE=local` (VPS, Nginx) and `BUILD_MODE=hook` (Cloudflare Pages via GitHub Actions). | **Decided 2026-11-22: VPS/local** (Plesk, `BUILD_MODE=local`). |
| 3 | **Email provider / sender** | SMTP adapter; works with Resend/Postmark. Sender `noreply@nishki.eu`. | **Decided 2026-11-22: Resend** (SMTP), sender `no-reply@nishki.eu`, DNS records via Cloudflare. Still open: auto-reply to the couple on or off (now off)? |
| 4 | **Admin accounts** | Roles `admin`, `editor` + a third role `build` (read-only API key for the build — needed so the build doesn't use a person's account). | Who gets which role? |
| 5 | **Contact form: "origin"** | Spec: **multi**-select `Insta, Facebook, friends, web`. Design: **single**-select `Instagram, Facebook, Препоръка, Друго`. Implemented the **spec** (multi, spec values) with labels Instagram / Facebook / Препоръка от приятели / Интернет. | OK, or should it be single-select, and should "web" be "Друго" (Other)? |
| 6 | **Contact form: phone** | Spec phase 2 says optional, phase 4 says required. Implemented **required** (phase 4 is the API contract). | Confirm. |
| 7 | **Contact form: wedding date** | Free text (as in the design) — couples often know only a month/season. | Prefer a date picker? |
| 8 | **FAQ wording** | The design text is first-person singular ("снимам", "била съм"). The site is two photographers, so the seed uses plural ("снимаме", "били сме") and fixes typos (запзване→запазване, невъзмжност→невъзможност). | Confirm, or revert to the original. Editable in the CMS either way. |
| 9 | **Gallery intro** ("ГАЛЕРИЯ / not only weddings" + paragraph) | In the design it's one flattened image, so it's an image block. Text inside an image is not editable, translatable or indexed by Google. | Rebuild it as real text + photos? (Needs the script font for "not only weddings".) |
| 10 | **Placeholders still to supply** | Logo (text "NISHKI" until a logo is uploaded in Site settings), project names/venues/texts, testimonial(s), Instagram URL, home "мега collage" image, gallery hero caption "-мега колаж-", favicon. | Real content. |
| 11 | **Privacy policy** | Draft page `/privacy/` (noindex) linked under the form; retention 12 months. | Needs legal review / real text. |
| 12 | **"Прочети повече" under the testimonial** | No target page exists in the designs → link left empty (hidden). | Testimonials page, or drop it? |

## Implemented differently from / beyond the spec (FYI)

- **Projects collection added.** The notes require each favourite project / gallery entry to open its own gallery page with ~50 photos and free text between collages. Pages alone can't model that cleanly, so `Projects` has cover, names/venue/location/season, excerpt and a flexible gallery (`collage` / text / banner blocks in any order and number). URL: `/gallery/<slug>/`.
- **Collage (Maley-style)** is pure CSS multi-column masonry: any mix of horizontal/vertical photos, balanced columns, 12px gaps, no JavaScript. Photos flow top-to-bottom in each column (not left-to-right). If strict left-to-right order matters, that needs a build-time layout pass — say so.
- **Media files are publicly readable** (the spec says no public REST read). Files end up on the public site anyway; the build downloads and re-encodes them into the static site (WebP, srcset), so visitors never hit the API for images. Pages/projects/settings/submissions still require the API key.
- **Images** are optimised by Astro at build time (not by serving Payload sizes), so the static site is self-contained. Payload keeps a 2560px master + thumbnail to keep builds fast with camera-size uploads.
- **Fonts:** self-hosted Cormorant Garamond + Jost (with Cyrillic). The design's tagline also used Playfair Display / Karla / Times — unified to the two brand fonts (Karla has no Cyrillic anyway). No Google Fonts requests (GDPR).
- **Editors can change a submission's status** (new/read/archived) — spec says "view"; marking as read seemed part of reviewing. Only admins can delete.
- **Contact API:** a foreign `Origin` gets `403 {"error":"origin"}` (extra code). Honeypot → `400 validation` as the spec says (silently returning 200 is the common alternative). `weddingNotes` max 2000 chars (spec gave none). Extra optional field `locale` for the auto-reply language.
- **Rate limiter and publish lock are in memory** → the CMS must run as one process (PM2 config does). Fine for this traffic; move to Redis/DB if it ever scales out.
- **GraphQL disabled** (not needed; smaller attack surface).
- **Not built (optional in spec):** live preview of drafts, 2FA in Payload (use Cloudflare Access instead), Sentry.

## Can't be done from code — needs your accounts/servers

DNS records, Plesk subdomains/TLS, Node ≥ 24.22.1 on the server (Payload 3.93 requires it; local machine has 24.19 — works, but with engine warnings), Turnstile site key + secret, email provider + DNS records, off-site backup target (`rclone` remote), uptime monitor, Cloudflare Access, Google Search Console, old-URL 301 list.
