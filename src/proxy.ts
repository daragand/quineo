/**
 * Proxy Next.js 16 — sécurité globale + authentification (Edge runtime).
 *
 * Responsabilités :
 *  1. Bloquer les URLs malformées / trop longues
 *  2. Bloquer les user-agents de scanners connus
 *  3. Bloquer les patterns d'injection dans l'URL
 *  4. Valider l'origine des requêtes mutantes (CSRF)
 *  5. Ajouter les headers de sécurité HTTP
 *  6. Rediriger les routes protégées si non authentifié
 */

import { NextRequest, NextResponse } from 'next/server'

// ─────────────────────────────────────────
// Config sécurité
// ─────────────────────────────────────────

const MAX_URL_LENGTH = 2_048

const BLOCKED_UA: RegExp[] = [
  /sqlmap/i,
  /nikto/i,
  /masscan/i,
  /nmap\s/i,
  /zgrab/i,
  /nuclei/i,
  /dirbuster/i,
  /gobuster/i,
  /wfuzz/i,
  /hydra/i,
]

const DANGEROUS_URL: RegExp[] = [
  /\0/,
  /\.\.[\\/]/,
  /<script[\s>]/i,
  /union[\s+]+select/i,
  /;\s*(drop|alter|truncate)\s/i,
  /\bexec\s*\(/i,
  /\beval\s*\(/i,
  /javascript\s*:/i,
]

const PUBLIC_PATHS = ['/login', '/register']
const API_AUTH_PATHS = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh']

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

function block(msg: string, status: number): NextResponse {
  return new NextResponse(msg, { status })
}

function isSameOrigin(req: NextRequest): boolean {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (!appUrl) return true

  let allowedOrigin: string
  try {
    allowedOrigin = new URL(appUrl).origin
  } catch {
    return true
  }

  const origin  = req.headers.get('origin')
  const referer = req.headers.get('referer')

  if (!origin) {
    if (!referer) return true
    try {
      return new URL(referer).origin === allowedOrigin
    } catch {
      return true
    }
  }

  return origin === allowedOrigin
}

// ─────────────────────────────────────────
// Proxy principal
// ─────────────────────────────────────────

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl
  const fullPath = pathname + search
  const ua       = req.headers.get('user-agent') ?? ''
  const method   = req.method

  // ── 1. URL trop longue ──────────────────
  if (req.url.length > MAX_URL_LENGTH) {
    return block('URI Too Long', 414)
  }

  // ── 2. User-agent scanner ───────────────
  for (const pattern of BLOCKED_UA) {
    if (pattern.test(ua)) {
      return block('Forbidden', 403)
    }
  }

  // ── 3. Patterns d'injection dans l'URL ──
  for (const pattern of DANGEROUS_URL) {
    if (pattern.test(fullPath)) {
      return block('Bad Request', 400)
    }
  }

  // ── 4. Validation d'origine (CSRF) ──────
  if (
    process.env.NODE_ENV === 'production' &&
    pathname.startsWith('/api/') &&
    !pathname.startsWith('/api/webhooks/') &&
    ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)
  ) {
    if (!isSameOrigin(req)) {
      return NextResponse.json(
        { error: 'Origine non autorisée' },
        { status: 403 }
      )
    }
  }

  // ── 5. Auth ─────────────────────────────
  const token = req.cookies.get('token')?.value

  if (API_AUTH_PATHS.some(p => pathname.startsWith(p))) {
    return addSecurityHeaders(NextResponse.next())
  }

  if (
    pathname.startsWith('/s/') ||
    pathname.startsWith('/display') ||
    pathname.startsWith('/api/public/')
  ) {
    return addSecurityHeaders(NextResponse.next())
  }

  const isPublicAuth = PUBLIC_PATHS.some(p => pathname === p)

  if (isPublicAuth) {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    return addSecurityHeaders(NextResponse.next())
  }

  if (!token) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ── 6. Headers de sécurité ──────────────
  return addSecurityHeaders(NextResponse.next())
}

function addSecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set('X-Frame-Options',        'SAMEORIGIN')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('X-XSS-Protection',       '1; mode=block')
  res.headers.set('Referrer-Policy',        'strict-origin-when-cross-origin')
  res.headers.set('Permissions-Policy',     'camera=(), microphone=(), geolocation=(), payment=()')
  res.headers.delete('X-Powered-By')
  return res
}

// ─────────────────────────────────────────
// Matcher
// ─────────────────────────────────────────

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf|eot)$).*)',
  ],
}
