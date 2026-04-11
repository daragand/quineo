/**
 * Gestion des logos partenaires — stockage local dans public/uploads/sessions/[sessionId]/partners/
 */

import fs   from 'fs'
import path from 'path'

const UPLOADS_ROOT = path.join(process.cwd(), 'public', 'uploads', 'sessions')

const ALLOWED: Record<string, string> = {
  'image/png':     'png',
  'image/jpeg':    'jpg',
  'image/gif':     'gif',
  'image/webp':    'webp',
  'image/svg+xml': 'svg',
}

const MAX_BYTES = 2 * 1024 * 1024 // 2 Mo

// ─────────────────────────────────────────
// Helpers internes
// ─────────────────────────────────────────

function partnersDir(sessionId: string) {
  return path.join(UPLOADS_ROOT, sessionId, 'partners')
}

function deleteLocalFile(sessionId: string, partnerId: string) {
  const dir = partnersDir(sessionId)
  for (const ext of Object.values(ALLOWED)) {
    try { fs.unlinkSync(path.join(dir, `${partnerId}.${ext}`)) } catch { /* ignore */ }
  }
}

// ─────────────────────────────────────────
// API publique
// ─────────────────────────────────────────

export type SaveResult =
  | { url: string; error?: never }
  | { url?: never; error: string }

/**
 * Sauvegarde le logo uploadé et retourne l'URL publique.
 * Écrase toute version précédente pour ce partenaire.
 */
export async function savePartnerLogo(
  sessionId:  string,
  partnerId:  string,
  file:       File,
): Promise<SaveResult> {
  const ext = ALLOWED[file.type]
  if (!ext) return { error: 'Format non supporté (png, jpg, gif, webp, svg)' }
  if (file.size > MAX_BYTES) return { error: 'Image trop lourde (max 2 Mo)' }

  const dir = partnersDir(sessionId)
  fs.mkdirSync(dir, { recursive: true })

  // Supprimer les anciennes versions (tous formats)
  deleteLocalFile(sessionId, partnerId)

  const filename = `${partnerId}.${ext}`
  const bytes    = await file.arrayBuffer()
  fs.writeFileSync(path.join(dir, filename), Buffer.from(bytes))

  return { url: `/uploads/sessions/${sessionId}/partners/${filename}` }
}

/**
 * Supprime le logo local d'un partenaire (si image locale).
 */
export function deletePartnerLogo(sessionId: string, partnerId: string, logoUrl?: string | null) {
  if (!logoUrl) return
  if (logoUrl.startsWith('/uploads/')) {
    deleteLocalFile(sessionId, partnerId)
  }
}
