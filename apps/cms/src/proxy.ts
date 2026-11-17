import { NextResponse, type NextRequest } from 'next/server'

/**
 * Host-based routing for the single Payload process:
 *   redaktor.nishki.eu (ADMIN_URL) → admin UI (+ /api used by the admin)
 *   api.nishki.eu      (SERVER_URL) → /api (build), /contact, /health — no admin UI
 */
const hostOf = (url?: string) => {
  try {
    return url ? new URL(url).hostname : ''
  } catch {
    return ''
  }
}

const ADMIN_HOST = hostOf(process.env.ADMIN_URL)

export function proxy(req: NextRequest) {
  const host = (req.headers.get('host') || '').split(':')[0]
  const { pathname } = req.nextUrl

  if (ADMIN_HOST && host === ADMIN_HOST && pathname === '/') {
    return NextResponse.redirect(new URL('/admin', req.url))
  }
  if (host.startsWith('api.')) {
    if (pathname === '/') return NextResponse.json({ ok: true })
    if (pathname.startsWith('/admin')) {
      const admin = process.env.ADMIN_URL
      return admin ? NextResponse.redirect(new URL(pathname, admin)) : new NextResponse(null, { status: 404 })
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/admin/:path*'],
}
