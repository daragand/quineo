import { cookies } from 'next/headers'
import { verifyAccessToken, type TokenPayload } from './auth'

/**
 * Lit le JWT depuis le cookie `token` dans un Server Component.
 * Retourne le payload décodé, ou null si absent / invalide.
 */
export async function getServerUser(): Promise<TokenPayload | null> {
  try {
    const store = await cookies()
    const token = store.get('token')?.value
    if (!token) return null
    return verifyAccessToken(token)
  } catch {
    return null
  }
}
