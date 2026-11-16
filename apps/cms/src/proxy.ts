import { NextResponse, type NextRequest } from 'next/server'

/**
 * Host-based routing for the single Payload process:
 *   admin.nishki.eu  → admin UI (+ /api used by the admin)
 *   api.nishki.eu    → /api (build), /contact, /health — no admin UI
 */
export function proxy(req: NextRequest) {
  const host = (req.headers.get('host') || '').split(':')[0]
  const { pathname } = req.nextUrl

  if (host.startsWith('admin.') && pathname === '/') {
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
