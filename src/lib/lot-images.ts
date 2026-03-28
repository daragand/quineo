/**
 * Gestion des images de lots — stockage local dans public/uploads/sessions/[sessionId]/
 */

import fs   from 'fs'
import path from 'path'

const UPLOADS_ROOT = path.join(process.cwd(), 'public', 'uploads', 'sessions')

const ALLOWED: Record<string, string> = {
  'image/png':  'png',
  'image/jpeg': 'jpg',
  'image/gif':  'gif',
  'image/webp': 'webp',
}

const MAX_BYTES = 5 * 1024 * 1024 // 5 Mo

// ─────────────────────────────────────────
// Helpers internes
// ─────────────────────────────────────────

function sessionDir(sessionId: string) {
  return path.join(UPLOADS_ROOT, sessionId)
}

/** Supprime toutes les versions locales d'un lot (tous formats) */
function deleteLocalLotFile(sessionId: string, lotId: string) {
  const dir = sessionDir(sessionId)
  for (const ext of Object.values(ALLOWED)) {
    try { fs.unlinkSync(path.join(dir, `${lotId}.${ext}`)) } catch { /* ignore */ }
  }
}

// ─────────────────────────────────────────
// API publique
// ─────────────────────────────────────────

export type SaveResult =
  | { url: string; error?: never }
  | { url?: never; error: string }

/**
 * Sauvegarde le fichier uploadé et retourne l'URL publique.
 * Écrase toute version précédente pour ce lot.
 */
export async function saveLotImage(
  sessionId: string,
  lotId:     string,
  file:      File,
): Promise<SaveResult> {
  const ext = ALLOWED[file.type]
  if (!ext) return { error: 'Format non supporté (png, jpg, gif, webp)' }
  if (file.size > MAX_BYTES) return { error: 'Image trop lourde (max 5 Mo)' }

  const dir = sessionDir(sessionId)
  fs.mkdirSync(dir, { recursive: true })

  // Supprimer les anciennes versions (tous formats)
  deleteLocalLotFile(sessionId, lotId)

  const filename = `${lotId}.${ext}`
  const bytes    = await file.arrayBuffer()
  fs.writeFileSync(path.join(dir, filename), Buffer.from(bytes))

  return { url: `/uploads/sessions/${sessionId}/${filename}` }
}

/**
 * Supprime le fichier local d'un lot (si image locale).
 * N'errore pas si le fichier n'existe pas ou si c'est une URL externe.
 */
export function deleteLotImage(sessionId: string, lotId: string, imageUrl?: string | null) {
  if (!imageUrl) return
  // Ne supprimer que les images locales (commencent par /uploads/)
  if (imageUrl.startsWith('/uploads/')) {
    deleteLocalLotFile(sessionId, lotId)
  }
}

/**
 * Supprime le dossier complet d'une session (lors de la suppression de la session).
 */
export function deleteSessionImagesDir(sessionId: string) {
  try {
    fs.rmSync(sessionDir(sessionId), { recursive: true, force: true })
  } catch { /* ignore */ }
}
