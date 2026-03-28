/**
 * Rate limiter en mémoire — fenêtre glissante par clé (ex: "login:1.2.3.4").
 *
 * ⚠️  Fonctionne uniquement sur un seul processus Node.js.
 *     En production multi-instances / multi-workers, remplacer par Redis
 *     (@upstash/ratelimit + @upstash/redis ou ioredis + rate-limiter-flexible).
 */

import { NextRequest, NextResponse } from 'next/server'

// ─────────────────────────────────────────
// Store interne
// ─────────────────────────────────────────

interface Entry {
  count: number
  reset: number  // timestamp ms de fin de fenêtre
}

const store = new Map<string, Entry>()

// Nettoyage des entrées expirées toutes les 2 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, e] of store) {
      if (now > e.reset) store.delete(key)
    }
  }, 120_000)
}

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

export interface RateLimitConfig {
  /** Nombre maximum de requêtes autorisées */
  limit:  number
  /** Durée de la fenêtre en secondes */
  window: number
}

export interface RateLimitResult {
  success:    boolean
  remaining:  number
  reset:      number   // timestamp ms
  retryAfter: number   // secondes avant retry
}

// ─────────────────────────────────────────
// Fonction principale
// ─────────────────────────────────────────

export function rateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now      = Date.now()
  const windowMs = config.window * 1_000
  const entry    = store.get(key)

  if (!entry || now > entry.reset) {
    store.set(key, { count: 1, reset: now + windowMs })
    return {
      success:    true,
      remaining:  config.limit - 1,
      reset:      now + windowMs,
      retryAfter: 0,
    }
  }

  if (entry.count >= config.limit) {
    const retryAfter = Math.ceil((entry.reset - now) / 1_000)
    return {
      success:    false,
      remaining:  0,
      reset:      entry.reset,
      retryAfter,
    }
  }

  entry.count++
  return {
    success:    true,
    remaining:  config.limit - entry.count,
    reset:      entry.reset,
    retryAfter: 0,
  }
}

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

/** Extrait l'IP cliente (prend en compte les proxies). */
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.headers.get('x-real-ip') ?? 'unknown'
}

/** Réponse 429 standardisée avec headers Retry-After. */
export function tooManyRequests(result: RateLimitResult): NextResponse {
  return new NextResponse(
    JSON.stringify({ error: 'Trop de requêtes, veuillez patienter.' }),
    {
      status: 429,
      headers: {
        'Content-Type':          'application/json',
        'Retry-After':           String(result.retryAfter),
        'X-RateLimit-Limit':     '0',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset':     String(Math.ceil(result.reset / 1_000)),
      },
    }
  )
}

// ─────────────────────────────────────────
// Limites pré-définies
// ─────────────────────────────────────────

/** Configs réutilisables selon le type d'endpoint. */
export const LIMITS = {
  /** 10 essais / 10 min — endpoints d'authentification (login, password reset). */
  auth:        { limit: 10, window: 600  } satisfies RateLimitConfig,
  /** 5 créations / heure — inscription. */
  register:    { limit:  5, window: 3600 } satisfies RateLimitConfig,
  /** 30 requêtes / 5 min — refresh token (auto-appel fréquent). */
  refresh:     { limit: 30, window: 300  } satisfies RateLimitConfig,
  /** 20 requêtes / 2 min — endpoints publics légers (display/find). */
  publicLight: { limit: 20, window: 120  } satisfies RateLimitConfig,
  /** 10 requêtes / 5 min — création de commandes publiques. */
  order:       { limit: 10, window: 300  } satisfies RateLimitConfig,
  /** 5 messages / heure — formulaire de contact. */
  contact:     { limit:  5, window: 3600 } satisfies RateLimitConfig,
}
