/**
 * Auth helpers — JWT (jsonwebtoken) + bcrypt
 */

import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { NextRequest, NextResponse } from 'next/server'

// ─────────────────────────────────────────
// Config
// ─────────────────────────────────────────

const JWT_SECRET         = process.env.JWT_SECRET         ?? 'dev-secret-change-me'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret'
const ACCESS_TTL  = '8h'
const REFRESH_TTL = '30d'

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
// Réponse d'erreur standard
// ─────────────────────────────────────────

export function apiError(message: string, status = 400): NextResponse {
  return NextResponse.json({ error: message }, { status })
}
