/**
 * Middleware Next.js — couche de sécurité globale (Edge runtime).
 *
 * Responsabilités :
 *  1. Bloquer les URLs malformées / trop longues
 *  2. Bloquer les user-agents de scanners connus
 *  3. Bloquer les patterns d'injection dans l'URL
 *  4. Valider l'origine des requêtes mutantes (CSRF)
 *  5. Ajouter les headers de sécurité HTTP
 *
 * Note : le rate-limiting par IP est géré dans chaque route API
 * (Node.js runtime, store en mémoire) car le middleware Edge
 * ne dispose pas d'état partagé entre workers.
 */

import { NextRequest, NextResponse } from 'next/server'

// ─────────────────────────────────────────
// Config
// ─────────────────────────────────────────

const MAX_URL_LENGTH = 2_048

/** User-agents de scanners/outils d'attaque courants */
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

/** Patterns dangereux dans le chemin ou la query string */
const DANGEROUS_URL: RegExp[] = [
  /\0/,                             // null byte
  /\.\.[\\/]/,                      // path traversal
  /<script[\s>]/i,                  // XSS
  /union[\s+]+select/i,             // SQL injection
  /;\s*(drop|alter|truncate)\s/i,   // SQL DDL injection
  /\bexec\s*\(/i,                   // code injection
  /\beval\s*\(/i,
  /javascript\s*:/i,                // javascript: URIs
]

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

function block(msg: string, status: number): NextResponse {
  return new NextResponse(msg, { status })
}

function isSameOrigin(req: NextRequest): boolean {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (!appUrl) return true                      // pas configuré → on laisse passer

  let allowedOrigin: string
  try {
    allowedOrigin = new URL(appUrl).origin
  } catch {
    return true
  }

  const origin  = req.headers.get('origin')
  const referer = req.headers.get('referer')

  // Pas d'origin : requête same-origin, curl, ou app mobile — on tolère
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
// Middleware principal
// ─────────────────────────────────────────

export function middleware(req: NextRequest) {
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
  // Uniquement en production pour les mutations API (hors webhooks)
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

  // ── 5. Headers de sécurité ──────────────
  const res = NextResponse.next()

  // Anti-clickjacking
  res.headers.set('X-Frame-Options',         'SAMEORIGIN')
  // Empêche le MIME-sniffing
  res.headers.set('X-Content-Type-Options',  'nosniff')
  // Protection XSS legacy (IE/anciens navigateurs)
  res.headers.set('X-XSS-Protection',        '1; mode=block')
  // Contrôle du referer
  res.headers.set('Referrer-Policy',         'strict-origin-when-cross-origin')
  // Restriction des APIs navigateur
  res.headers.set('Permissions-Policy',      'camera=(), microphone=(), geolocation=(), payment=()')
  // Supprime l'information sur la technologie serveur
  res.headers.delete('X-Powered-By')

  return res
}

// ─────────────────────────────────────────
// Matcher — toutes les routes sauf assets statiques
// ─────────────────────────────────────────

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf|eot)$).*)',
  ],
}
