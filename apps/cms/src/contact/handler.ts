import config from '@payload-config'
import { getPayload } from 'payload'
import { GUEST_OPTIONS, ORIGIN_OPTIONS, SERVICE_OPTIONS } from '../collections/Submissions'

/**
 * POST https://api.nishki.eu/contact — see spec.md, Phase 4.
 * Order: CORS → rate limit → honeypot → Turnstile → validate → save → email.
 */

type ErrorCode = 'validation' | 'captcha' | 'rate_limited' | 'server' | 'origin'

const allowedOrigins = () =>
  (process.env.CORS_ORIGINS || 'https://nishki.eu,https://www.nishki.eu')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

const corsHeaders = (origin: string | null): Record<string, string> =>
  origin && allowedOrigins().includes(origin)
    ? {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
        Vary: 'Origin',
      }
    : { Vary: 'Origin' }

const json = (origin: string | null, status: number, body: object) =>
  Response.json(body, { status, headers: { ...corsHeaders(origin), 'Cache-Control': 'no-store' } })
const fail = (origin: string | null, status: number, error: ErrorCode) => json(origin, status, { ok: false, error })

// ── Rate limit: 5 requests / 10 minutes per IP (in memory; run the CMS as a single process) ──
const WINDOW_MS = 10 * 60 * 1000
const MAX_HITS = Number(process.env.CONTACT_RATE_LIMIT || 5)
const hits = new Map<string, number[]>()

export function rateLimited(ip: string, now = Date.now()): boolean {
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 10_000) {
    for (const [k, v] of hits) if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k)
  }
  return recent.length > MAX_HITS
}

/** nginx sets X-Real-IP (restored from CF-Connecting-IP via real_ip when proxied by Cloudflare). */
export const clientIp = (h: Headers) =>
  h.get('x-real-ip') || h.get('cf-connecting-ip') || h.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

// ── Validation ──
// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g
const clean = (v: unknown) => (typeof v === 'string' ? v.replace(CONTROL, '').replace(/\r\n?/g, '\n').trim() : '')
const EMAIL = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/
const PHONE = /^[+\d][\d\s().\-/]{4,39}$/

const asList = (v: unknown) => (Array.isArray(v) ? v : typeof v === 'string' && v ? [v] : []).map(clean)

export type ContactInput = {
  name: string
  email: string
  phone: string
  weddingDate: string
  weddingLocation: string
  weddingNotes: string
  message: string
  numberOfGuests: (typeof GUEST_OPTIONS)[number]
  typeOfServices: (typeof SERVICE_OPTIONS)[number][]
  origin: (typeof ORIGIN_OPTIONS)[number][]
}

export function validate(body: Record<string, unknown>): ContactInput | null {
  const s = {
    name: clean(body.name),
    email: clean(body.email).toLowerCase(),
    phone: clean(body.phone),
    weddingDate: clean(body.weddingDate),
    weddingLocation: clean(body.weddingLocation),
    weddingNotes: clean(body.weddingNotes),
    message: clean(body.message),
    numberOfGuests: clean(body.numberOfGuests),
  }
  const services = [...new Set(asList(body.typeOfServices))]
  const origin = [...new Set(asList(body.origin))]

  const ok =
    s.name.length >= 1 && s.name.length <= 100 &&
    s.email.length <= 254 && EMAIL.test(s.email) &&
    PHONE.test(s.phone) &&
    s.weddingDate.length >= 1 && s.weddingDate.length <= 100 &&
    s.weddingLocation.length >= 1 && s.weddingLocation.length <= 300 &&
    s.weddingNotes.length >= 1 && s.weddingNotes.length <= 2000 &&
    s.message.length >= 1 && s.message.length <= 5000 &&
    (GUEST_OPTIONS as readonly string[]).includes(s.numberOfGuests) &&
    services.length >= 1 && services.every((v) => (SERVICE_OPTIONS as readonly string[]).includes(v)) &&
    origin.length >= 1 && origin.every((v) => (ORIGIN_OPTIONS as readonly string[]).includes(v))

  return ok ? ({ ...s, typeOfServices: services, origin } as ContactInput) : null
}

// ── Turnstile ──
async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET
  if (!secret) {
    if (process.env.NODE_ENV === 'production') return false
    return true // local development without a secret
  }
  if (!token || token.length > 2048) return false
  const form = new URLSearchParams({ secret, response: token })
  if (ip !== 'unknown') form.set('remoteip', ip)
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: form,
      signal: AbortSignal.timeout(8000),
    })
    const data = (await res.json()) as { success?: boolean }
    return data.success === true
  } catch {
    return false
  }
}

// ── Email ──
const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

const LABELS: [keyof ContactInput, string][] = [
  ['name', 'Име'],
  ['email', 'Имейл'],
  ['phone', 'Телефон'],
  ['weddingDate', 'Дата на сватбата'],
  ['weddingLocation', 'Място на събитието'],
  ['numberOfGuests', 'Брой гости'],
  ['typeOfServices', 'Услуги'],
  ['origin', 'Как ни откриха'],
  ['weddingNotes', 'Допълнителна информация'],
  ['message', 'Разкажете ни за вашия ден'],
]

function ownerEmail(d: ContactInput, adminUrl: string) {
  const rows = LABELS.map(([k, label]) => {
    const v = Array.isArray(d[k]) ? (d[k] as string[]).join(', ') : String(d[k])
    return { label, v }
  })
  return {
    subject: `Ново запитване: ${d.name} (${d.weddingDate})`,
    text: rows.map((r) => `${r.label}: ${r.v}`).join('\n') + `\n\n${adminUrl}`,
    html:
      `<table cellpadding="6" style="font-family:sans-serif;font-size:14px;border-collapse:collapse">` +
      rows
        .map((r) => `<tr><th align="left" valign="top" style="color:#7A5A4E">${esc(r.label)}</th><td style="white-space:pre-wrap">${esc(r.v)}</td></tr>`)
        .join('') +
      `</table><p><a href="${esc(adminUrl)}">Отвори в админ панела</a></p>`,
  }
}

function autoReply(d: ContactInput, locale: string) {
  return locale === 'en'
    ? {
        subject: 'We received your enquiry — Nishki',
        text: `Hi ${d.name},\n\nThank you for getting in touch! We received your enquiry and will reply soon.\n\nYoana & Maria`,
      }
    : {
        subject: 'Получихме запитването ви — Nishki',
        text: `Здравейте, ${d.name},\n\nБлагодарим ви, че се свързахте с нас! Получихме запитването ви и ще ви отговорим скоро.\n\nЙоана и Мария`,
      }
}

// ── Handlers ──
export async function handleOptions(req: Request) {
  const origin = req.headers.get('origin')
  if (!origin || !allowedOrigins().includes(origin)) return new Response(null, { status: 403 })
  return new Response(null, { status: 204, headers: corsHeaders(origin) })
}

export async function handlePost(req: Request) {
  const origin = req.headers.get('origin')
  // 1. CORS: browsers always send Origin on cross-site POSTs; reject foreign ones.
  if (origin && !allowedOrigins().includes(origin)) return fail(origin, 403, 'origin')

  // 2. Rate limit
  const ip = clientIp(req.headers)
  if (rateLimited(ip)) return fail(origin, 429, 'rate_limited')

  let body: Record<string, unknown>
  try {
    const raw = await req.text()
    if (raw.length > 32_000) return fail(origin, 400, 'validation')
    body = JSON.parse(raw)
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('not an object')
  } catch {
    return fail(origin, 400, 'validation')
  }

  // 3. Honeypot
  if (clean(body.website) !== '') return fail(origin, 400, 'validation')

  // 4. Turnstile
  if (!(await verifyTurnstile(clean(body.turnstileToken), ip))) return fail(origin, 403, 'captcha')

  // 5. Validate & sanitise
  const data = validate(body)
  if (!data) return fail(origin, 400, 'validation')
  const locale = body.locale === 'en' ? 'en' : 'bg'

  // 6. Save first — an email failure must never lose a submission.
  let payload
  let id: number | string
  try {
    payload = await getPayload({ config })
    const doc = await payload.create({
      collection: 'submissions',
      overrideAccess: true,
      data: {
        ...data,
        status: 'new',
        locale,
        ip,
        userAgent: (req.headers.get('user-agent') || '').slice(0, 500),
      },
    })
    id = doc.id
  } catch (err) {
    console.error('[contact] could not save submission', err)
    return fail(origin, 500, 'server')
  }

  // 7. Notify the owner (reply-to = submitter). 8. Optional auto-reply.
  try {
    const to = process.env.OWNER_EMAIL
    if (!to) throw new Error('OWNER_EMAIL is not set')
    const adminUrl = `${process.env.ADMIN_URL || ''}/admin/collections/submissions/${id}`
    await payload.sendEmail({ to, replyTo: data.email, ...ownerEmail(data, adminUrl) })
    await payload.update({ collection: 'submissions', id, overrideAccess: true, data: { emailSent: true } })
  } catch (err) {
    payload.logger.error({ err, id }, '[contact] notification email failed')
    await payload
      .update({ collection: 'submissions', id, overrideAccess: true, data: { emailError: String((err as Error).message).slice(0, 300) } })
      .catch(() => undefined)
  }
  if (process.env.CONTACT_AUTOREPLY === 'true') {
    await payload.sendEmail({ to: data.email, ...autoReply(data, locale) }).catch((err: unknown) => {
      payload.logger.error({ err, id }, '[contact] auto-reply failed')
    })
  }

  return json(origin, 200, { ok: true })
}
