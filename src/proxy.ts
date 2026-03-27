import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/login', '/register']
const API_AUTH_PATHS = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh']

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('token')?.value

  // API auth routes are always public
  if (API_AUTH_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Public routes (/s/... achat de cartons)
  if (pathname.startsWith('/s/')) {
    return NextResponse.next()
  }

  const isPublicAuth = PUBLIC_PATHS.some(p => pathname === p)

  if (isPublicAuth) {
    // Déjà connecté → renvoyer vers le tableau de bord
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    return NextResponse.next()
  }

  // Toutes les autres routes nécessitent un token
  if (!token) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)).*)',
  ],
}
