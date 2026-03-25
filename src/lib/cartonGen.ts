/**
 * Générateur de cartons de loto français
 *
 * Règles :
 * - Grille 3 lignes × 9 colonnes
 * - Chaque ligne contient exactement 5 numéros (4 cases vides = 0)
 * - Colonne 0 : 1–9 | Col 1 : 10–19 | … | Col 8 : 80–90
 * - Chaque colonne contient 1, 2 ou 3 numéros (jamais vide)
 * - Les numéros sont triés croissant au sein de chaque colonne
 */

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function range(min: number, max: number): number[] {
  return Array.from({ length: max - min + 1 }, (_, i) => i + min)
}

/** Plages de numéros par colonne (0-indexed) */
const COL_RANGES: [number, number][] = [
  [1, 9], [10, 19], [20, 29], [30, 39], [40, 49],
  [50, 59], [60, 69], [70, 79], [80, 90],
]

// ─────────────────────────────────────────
// Génération d'une grille valide
// ─────────────────────────────────────────

/**
 * Génère une matrice binaire 3×9 :
 * - Chaque ligne somme à 5
 * - Chaque colonne somme à ≥ 1
 */
function generateMask(): boolean[][] {
  while (true) {
    const mask: boolean[][] = Array.from({ length: 3 }, () => Array(9).fill(false))
    // Pour chaque ligne, choisir 5 colonnes aléatoires
    for (let row = 0; row < 3; row++) {
      const cols = shuffle(range(0, 8)).slice(0, 5)
      for (const c of cols) mask[row][c] = true
    }
    // Vérifier que chaque colonne a au moins 1 numéro
    const colSums = Array(9).fill(0)
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 9; c++)
        if (mask[r][c]) colSums[c]++
    if (colSums.every((s) => s >= 1)) return mask
    // Sinon réessayer (probabilité ~99.8% de succès à chaque essai)
  }
}

/**
 * Génère une grille de carton complète (3×9 avec numéros).
 * Retourne un tableau 2D de nombres (0 = case vide).
 */
export function generateGrid(): number[][] {
  const mask = generateMask()
  const grid: number[][] = Array.from({ length: 3 }, () => Array(9).fill(0))

  for (let col = 0; col < 9; col++) {
    const [min, max] = COL_RANGES[col]
    const available  = shuffle(range(min, max))
    const rows       = [0, 1, 2].filter((r) => mask[r][col])

    // Sélectionner `rows.length` numéros uniques dans la plage
    const chosen = available.slice(0, rows.length).sort((a, b) => a - b)

    // Distribuer en respectant l'ordre croissant sur la colonne par ligne
    const sortedRows = [...rows].sort((a, b) => a - b)
    for (let i = 0; i < sortedRows.length; i++) {
      grid[sortedRows[i]][col] = chosen[i]
    }
  }

  return grid
}

// ─────────────────────────────────────────
// Génération d'un lot de serial numbers
// ─────────────────────────────────────────

/**
 * Génère `count` cartons avec serial numbers séquentiels.
 * @param sessionId  UUID de la session
 * @param startSeq   Premier numéro séquentiel (ex: 1, ou dernier+1)
 */
export function generateBatch(
  sessionId: string,
  count: number,
  startSeq = 1
): Array<{ session_id: string; serial_number: string; grid: number[][] }> {
  return Array.from({ length: count }, (_, i) => ({
    session_id:    sessionId,
    serial_number: `C${String(startSeq + i).padStart(4, '0')}`,
    grid:          generateGrid(),
  }))
}
