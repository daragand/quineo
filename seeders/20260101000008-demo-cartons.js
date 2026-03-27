'use strict';

const { v4: uuidv4 } = require('uuid');

// ── IDs sessions (même que seeder 004) ───────────────────────
const S = {
  SAINTES_HIVER_25: '30000000-0000-4000-8000-000000000001', // closed  – PECHE_SAINTES
  BRDX_AUTOMNE_25:  '30000000-0000-4000-8000-000000000002', // closed  – OMNI_BORDEAUX
  LYON_NOEL_25:     '30000000-0000-4000-8000-000000000003', // closed  – CULTURE_LYON
  NANTES_RUNNING:   '30000000-0000-4000-8000-000000000004', // running – SPORT_NANTES
  TLSE_PRINTEMPS:   '30000000-0000-4000-8000-000000000005', // open    – LOISIRS_TOULOUSE
  MARS_ETE:         '30000000-0000-4000-8000-000000000006', // open    – FETES_MARSEILLE
  STRASB_PAQUES:    '30000000-0000-4000-8000-000000000007', // open    – FAMILLE_STRASB
  SAINTES_ETE_26:   '30000000-0000-4000-8000-000000000008', // draft   – PECHE_SAINTES
};

// ── Générateur de carton (même règles que cartonGen.ts) ──────

const COL_RANGES = [
  [1, 9], [10, 19], [20, 29], [30, 39], [40, 49],
  [50, 59], [60, 69], [70, 79], [80, 90],
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function range(min, max) {
  return Array.from({ length: max - min + 1 }, (_, i) => i + min);
}

function generateMask() {
  while (true) {
    const mask = Array.from({ length: 3 }, () => Array(9).fill(false));
    for (let row = 0; row < 3; row++) {
      const cols = shuffle(range(0, 8)).slice(0, 5);
      for (const c of cols) mask[row][c] = true;
    }
    const colSums = Array(9).fill(0);
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 9; c++)
        if (mask[r][c]) colSums[c]++;
    if (colSums.every(s => s >= 1)) return mask;
  }
}

function generateGrid() {
  const mask = generateMask();
  const grid = Array.from({ length: 3 }, () => Array(9).fill(0));
  for (let col = 0; col < 9; col++) {
    const [min, max] = COL_RANGES[col];
    const available  = shuffle(range(min, max));
    const rows       = [0, 1, 2].filter(r => mask[r][col]);
    const chosen     = available.slice(0, rows.length).sort((a, b) => a - b);
    const sortedRows = [...rows].sort((a, b) => a - b);
    for (let i = 0; i < sortedRows.length; i++) {
      grid[sortedRows[i]][col] = chosen[i];
    }
  }
  return grid;
}

/**
 * Génère `count` cartons pour une session.
 * soldCount premiers sont 'sold', le reste 'available'.
 */
function makeCartons(sessionId, count, soldCount, now) {
  const rows = [];
  for (let i = 0; i < count; i++) {
    const seq    = i + 1;
    const serial = `C${String(seq).padStart(4, '0')}`;
    const status = i < soldCount ? 'sold' : 'available';
    rows.push({
      id:            uuidv4(),
      session_id:    sessionId,
      serial_number: serial,
      grid:          JSON.stringify(generateGrid()),
      status,
      created_at:    now,
      updated_at:    now,
    });
  }
  return rows;
}

// ── IDs à conserver pour le down ─────────────────────────────
// On ne stocke pas les UUIDs (générés dynamiquement) —
// on supprime par session_id dans down().

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const cartons = [
      // Sessions terminées — beaucoup vendus
      ...makeCartons(S.SAINTES_HIVER_25, 240, 210, now), // 210 sold / 30 available
      ...makeCartons(S.BRDX_AUTOMNE_25,  320, 290, now), // 290 sold / 30 available
      ...makeCartons(S.LYON_NOEL_25,     180, 160, now), // 160 sold / 20 available

      // Session en cours (running) — bien avancée
      ...makeCartons(S.NANTES_RUNNING,   500, 420, now), // 420 sold / 80 available

      // Sessions ouvertes — partiellement vendues
      ...makeCartons(S.TLSE_PRINTEMPS,   200, 80,  now), // 80 sold / 120 available
      ...makeCartons(S.MARS_ETE,         300, 120, now), // 120 sold / 180 available
      ...makeCartons(S.STRASB_PAQUES,    150, 40,  now), // 40 sold / 110 available

      // Session brouillon (PECHE_SAINTES) — cartons générés, aucun vendu
      // → permet de tester la vue cartons avec draft
      ...makeCartons(S.SAINTES_ETE_26,   100, 0,   now), // 100 available
    ];

    await queryInterface.bulkInsert('cartons', cartons);
  },

  async down(queryInterface) {
    const { Op } = require('sequelize');
    await queryInterface.bulkDelete('cartons', {
      session_id: { [Op.in]: Object.values(S) },
    });
  },
};
