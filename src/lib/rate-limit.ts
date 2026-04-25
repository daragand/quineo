/**
 * Rate limiter — fenêtre glissante par clé, basé sur rate-limiter-flexible.
 * En mémoire (process unique). Pour multi-instances, remplacer par RateLimiterRedis.
 */

import { RateLimiterMemory } from 'rate-limiter-flexible'
import { NextRequest, NextResponse } from 'next/server'

export interface RateLimitConfig {
  limit:  number
  window: number
}

export interface RateLimitResult {
  success:    boolean
  remaining:  number
  reset:      number
  retryAfter: number
}

const limiters = new Map<string, RateLimiterMemory>()

function getLimiter(type: string, points: number, duration: number): RateLimiterMemory {
  const cacheKey = `${type}:${points}:${duration}`
  if (!limiters.has(cacheKey)) {
    limiters.set(cacheKey, new RateLimiterMemory({ points, duration }))
  }
  return limiters.get(cacheKey)!
}

export async function rateLimit(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
  const colonIdx  = key.indexOf(':')
  const limitType = colonIdx >= 0 ? key.slice(0, colonIdx) : key
  const id        = colonIdx >= 0 ? key.slice(colonIdx + 1) : key

  const limiter = getLimiter(limitType, config.limit, config.window)

  try {
    const res     = await limiter.consume(id)
    const resetMs = Date.now() + res.msBeforeNext
    return { success: true, remaining: res.remainingPoints, reset: resetMs, retryAfter: 0 }
  } catch (err: unknown) {
    const rl      = err as { msBeforeNext: number }
    const resetMs = Date.now() + rl.msBeforeNext
    return {
      success:    false,
      remaining:  0,
      reset:      resetMs,
      retryAfter: Math.ceil(rl.msBeforeNext / 1_000),
    }
  }
}

/**
 * Extrait l'IP cliente de façon fiable.
 * Priorité : x-real-ip (positionné par le reverse proxy) > dernier X-Forwarded-For
 * (le dernier hop ajouté par notre propre proxy, non injectable par le client).
 */
export function getClientIp(req: NextRequest): string {
  const realIp = req.headers.get('x-real-ip')
  if (realIp) return realIp.trim()

  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    const ips = forwarded.split(',').map(s => s.trim()).filter(Boolean)
    if (ips.length > 0) return ips[ips.length - 1]
  }

  return 'unknown'
}

export function tooManyRequests(result: RateLimitResult): NextResponse {
  return new NextResponse(
    JSON.stringify({ error: 'Trop de requêtes, veuillez patienter.' }),
    {
      status: 429,
      headers: {
        'Content-Type':          'application/json',
        'Retry-After':           String(result.retryAfter),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset':     String(Math.ceil(result.reset / 1_000)),
      },
    }
  )
}

export const LIMITS = {
  auth:        { limit: 10, window: 600  } satisfies RateLimitConfig,
  register:    { limit:  5, window: 3600 } satisfies RateLimitConfig,
  refresh:     { limit: 30, window: 300  } satisfies RateLimitConfig,
  publicLight: { limit: 20, window: 120  } satisfies RateLimitConfig,
  order:       { limit: 10, window: 300  } satisfies RateLimitConfig,
  contact:     { limit:  5, window: 3600 } satisfies RateLimitConfig,
}
