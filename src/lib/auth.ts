/**
 * Auth helpers — JWT (jsonwebtoken) + bcrypt
 */

import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { createHmac, timingSafeEqual } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

// ─────────────────────────────────────────
// Config
// ─────────────────────────────────────────

const JWT_SECRET         = process.env.JWT_SECRET         ?? 'dev-secret-change-me'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret'
const VIEW_SECRET        = process.env.PAYMENT_VIEW_SECRET ?? 'dev-view-secret'
const ACCESS_TTL  = '8h'
const REFRESH_TTL = '30d'
const RESET_TTL   = '1h'

// Fail fast en production si les secrets ne sont pas définis
if (process.env.NODE_ENV === 'production') {
  const missing: string[] = []
  if (JWT_SECRET         === 'dev-secret-change-me') missing.push('JWT_SECRET')
  if (JWT_REFRESH_SECRET === 'dev-refresh-secret')   missing.push('JWT_REFRESH_SECRET')
  if (VIEW_SECRET        === 'dev-view-secret')      missing.push('PAYMENT_VIEW_SECRET')
  if (missing.length > 0) {
    throw new Error(
      `[SECURITY] Variables d'environnement obligatoires manquantes en production : ${missing.join(', ')}`
    )
  }
}

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

export interface TokenPayload {
  sub:            string   // user id
  association_id: string
  role:           'super_admin' | 'admin' | 'operator' | 'viewer'
  email:          string
}

export interface AuthedRequest extends NextRequest {
  user: TokenPayload
}

// ─────────────────────────────────────────
// JWT
// ─────────────────────────────────────────

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TTL })
}

export function signRefreshToken(payload: Pick<TokenPayload, 'sub'>): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TTL })
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload
}

/**
 * Token de réinitialisation de mot de passe.
 * Signé avec JWT_SECRET + hash du mot de passe actuel → usage unique automatique :
 * une fois le mot de passe changé, l'ancien token est invalidé.
 */
export function signResetToken(userId: string, passwordHash: string): string {
  const secret = JWT_SECRET + passwordHash
  return jwt.sign({ sub: userId, type: 'reset' }, secret, { expiresIn: RESET_TTL })
}

export function verifyResetToken(token: string, passwordHash: string): { sub: string } {
  const secret = JWT_SECRET + passwordHash
  return jwt.verify(token, secret) as { sub: string }
}

// ─────────────────────────────────────────
// Bcrypt
// ─────────────────────────────────────────

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12)
}

export function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}

// ─────────────────────────────────────────
// Middleware helper — extraire le token de la requête
// ─────────────────────────────────────────

export function extractToken(req: NextRequest): string | null {
  const auth = req.headers.get('authorization')
  if (auth?.startsWith('Bearer ')) return auth.slice(7)
  const cookie = req.cookies.get('token')?.value
  return cookie ?? null
}

// ─────────────────────────────────────────
// withAuth — HOF pour les Route Handlers
// ─────────────────────────────────────────

type RouteHandler = (
  req: NextRequest,
  ctx: { params: Promise<Record<string, string>>; user: TokenPayload }
) => Promise<NextResponse> | NextResponse

export function withAuth(handler: RouteHandler) {
  return async (
    req: NextRequest,
    ctx: { params: Promise<Record<string, string>> }
  ): Promise<NextResponse> => {
    const token = extractToken(req)
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }
    let user: TokenPayload
    try {
      user = verifyAccessToken(token)
    } catch {
      return NextResponse.json({ error: 'Token invalide ou expiré' }, { status: 401 })
    }
    try {
      return await handler(req, { ...ctx, user })
    } catch (err) {
      console.error('[API error]', req.method, req.nextUrl.pathname, err)
      const message = process.env.NODE_ENV !== 'production'
        ? String(err)
        : 'Erreur serveur'
      return NextResponse.json({ error: message }, { status: 500 })
    }
  }
}

// ─────────────────────────────────────────
// withRole — restrict to roles
// ─────────────────────────────────────────

export function withRole(
  roles: TokenPayload['role'][],
  handler: RouteHandler
): RouteHandler {
  return async (req, ctx) => {
    if (!roles.includes(ctx.user.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }
    return handler(req, ctx)
  }
}

// ─────────────────────────────────────────
// View token — protège les endpoints publics PII
// ─────────────────────────────────────────

/** Génère un HMAC-SHA256 du paiementId pour autoriser la consultation des données. */
export function signViewToken(paiementId: string): string {
  return createHmac('sha256', VIEW_SECRET).update(paiementId).digest('hex')
}

/** Vérifie le view_token de façon timing-safe. */
export function verifyViewToken(paiementId: string, token: string): boolean {
  try {
    const expected = Buffer.from(signViewToken(paiementId), 'hex')
    const provided  = Buffer.from(token, 'hex')
    if (expected.length !== provided.length) return false
    return timingSafeEqual(expected, provided)
  } catch {
    return false
  }
}

// ─────────────────────────────────────────
// Réponse d'erreur standard
// ─────────────────────────────────────────

export function apiError(message: string, status = 400): NextResponse {
  return NextResponse.json({ error: message }, { status })
}
