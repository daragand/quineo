'use strict';

const ASSO = {
  PECHE_SAINTES:    '10000000-0000-4000-8000-000000000001',
  OMNI_BORDEAUX:    '10000000-0000-4000-8000-000000000002',
  CULTURE_LYON:     '10000000-0000-4000-8000-000000000003',
  FETES_MONTPELLIER:'10000000-0000-4000-8000-000000000004',
  FOYER_STEMILION:  '10000000-0000-4000-8000-000000000005',
  SPORT_NANTES:     '10000000-0000-4000-8000-000000000006',
  LOISIRS_TOULOUSE: '10000000-0000-4000-8000-000000000007',
  FAMILLE_STRASB:   '10000000-0000-4000-8000-000000000008',
  FETES_MARSEILLE:  '10000000-0000-4000-8000-000000000009',
  SPORT_RENNES:     '10000000-0000-4000-8000-000000000010',
};

// IDs fixes réutilisés dans les seeders suivants (lots, carton_packs, partners)
const IDS = {
  // Sessions terminées
  SAINTES_HIVER_25: '30000000-0000-4000-8000-000000000001',
  BRDX_AUTOMNE_25:  '30000000-0000-4000-8000-000000000002',
  LYON_NOEL_25:     '30000000-0000-4000-8000-000000000003',

  // Session en cours
  NANTES_RUNNING:   '30000000-0000-4000-8000-000000000004',

  // Sessions ouvertes (billetterie ouverte)
  TLSE_PRINTEMPS:   '30000000-0000-4000-8000-000000000005',
  MARS_ETE:         '30000000-0000-4000-8000-000000000006',
  STRASB_PAQUES:    '30000000-0000-4000-8000-000000000007',

  // Sessions à venir (brouillon)
  SAINTES_ETE_26:   '30000000-0000-4000-8000-000000000008',
  BRDX_PRINTEMPS_26:'30000000-0000-4000-8000-000000000009',
  MONTP_FERIA:      '30000000-0000-4000-8000-000000000010',
  STEMILION_VEND:   '30000000-0000-4000-8000-000000000011',
  RENNES_MAI:       '30000000-0000-4000-8000-000000000012',
  LYON_FETE_MUSIC:  '30000000-0000-4000-8000-000000000013',
  NANTES_AUTOMNE:   '30000000-0000-4000-8000-000000000014',
  TLSE_NOEL_26:     '30000000-0000-4000-8000-000000000015',
};

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('sessions', [
      // ── Sessions terminées ──
      {
        id: IDS.SAINTES_HIVER_25,
        association_id: ASSO.PECHE_SAINTES,
        name: 'Grand Loto de l\'Hiver 2025',
        date: '2025-02-08',
        status: 'closed',
        max_cartons: 600,
        description: 'Loto annuel de l\'amicale, édition hivernale.',
        created_at: now, updated_at: now,
      },
      {
        id: IDS.BRDX_AUTOMNE_25,
        association_id: ASSO.OMNI_BORDEAUX,
        name: 'Loto d\'Automne COBM 2025',
        date: '2025-11-15',
        status: 'closed',
        max_cartons: 800,
        description: 'Soirée loto pour financer les équipements sportifs.',
        created_at: now, updated_at: now,
      },
      {
        id: IDS.LYON_NOEL_25,
        association_id: ASSO.CULTURE_LYON,
        name: 'Loto de Noël Brotteaux 2025',
        date: '2025-12-13',
        status: 'closed',
        max_cartons: 500,
        description: 'Loto festif avec animations et buffet.',
        created_at: now, updated_at: now,
      },

      // ── Session en cours ──
      {
        id: IDS.NANTES_RUNNING,
        association_id: ASSO.SPORT_NANTES,
        name: 'Loto du Printemps SCNA 2026',
        date: '2026-03-24',
        status: 'running',
        max_cartons: 700,
        description: 'Grand loto printanier avec lots exceptionnels.',
        created_at: now, updated_at: now,
      },

      // ── Sessions ouvertes ──
      {
        id: IDS.TLSE_PRINTEMPS,
        association_id: ASSO.LOISIRS_TOULOUSE,
        name: 'Loto Capitole Printemps 2026',
        date: '2026-04-12',
        status: 'open',
        max_cartons: 600,
        description: 'Réservez vos cartons en ligne dès maintenant.',
        created_at: now, updated_at: now,
      },
      {
        id: IDS.MARS_ETE,
        association_id: ASSO.FETES_MARSEILLE,
        name: 'Loto du Soleil — Marseille Nord 2026',
        date: '2026-05-03',
        status: 'open',
        max_cartons: 900,
        description: 'Le grand loto estival du comité.',
        created_at: now, updated_at: now,
      },
      {
        id: IDS.STRASB_PAQUES,
        association_id: ASSO.FAMILLE_STRASB,
        name: 'Loto de Pâques AFA 2026',
        date: '2026-04-19',
        status: 'open',
        max_cartons: 450,
        description: 'Loto familial avec espace enfants.',
        created_at: now, updated_at: now,
      },

      // ── Brouillons (à venir) ──
      {
        id: IDS.SAINTES_ETE_26,
        association_id: ASSO.PECHE_SAINTES,
        name: 'Loto d\'Été Pêcheurs 2026',
        date: '2026-07-05',
        status: 'draft',
        max_cartons: 500,
        description: null,
        created_at: now, updated_at: now,
      },
      {
        id: IDS.BRDX_PRINTEMPS_26,
        association_id: ASSO.OMNI_BORDEAUX,
        name: 'Loto COBM Printemps 2026',
        date: '2026-05-30',
        status: 'draft',
        max_cartons: 800,
        description: null,
        created_at: now, updated_at: now,
      },
      {
        id: IDS.MONTP_FERIA,
        association_id: ASSO.FETES_MONTPELLIER,
        name: 'Loto de la Féria 2026',
        date: '2026-06-20',
        status: 'draft',
        max_cartons: 1000,
        description: 'Grand événement autour de la féria.',
        created_at: now, updated_at: now,
      },
      {
        id: IDS.STEMILION_VEND,
        association_id: ASSO.FOYER_STEMILION,
        name: 'Loto des Vendanges 2026',
        date: '2026-09-27',
        status: 'draft',
        max_cartons: 300,
        description: 'Loto traditionnel autour des vendanges.',
        created_at: now, updated_at: now,
      },
      {
        id: IDS.RENNES_MAI,
        association_id: ASSO.SPORT_RENNES,
        name: 'Loto US Thabor — Mai 2026',
        date: '2026-05-16',
        status: 'draft',
        max_cartons: 550,
        description: null,
        created_at: now, updated_at: now,
      },
      {
        id: IDS.LYON_FETE_MUSIC,
        association_id: ASSO.CULTURE_LYON,
        name: 'Loto Fête de la Musique 2026',
        date: '2026-06-21',
        status: 'draft',
        max_cartons: 600,
        description: 'Soirée loto musicale.',
        created_at: now, updated_at: now,
      },
      {
        id: IDS.NANTES_AUTOMNE,
        association_id: ASSO.SPORT_NANTES,
        name: 'Loto d\'Automne SCNA 2026',
        date: '2026-10-10',
        status: 'draft',
        max_cartons: 700,
        description: null,
        created_at: now, updated_at: now,
      },
      {
        id: IDS.TLSE_NOEL_26,
        association_id: ASSO.LOISIRS_TOULOUSE,
        name: 'Grand Loto de Noël Capitole 2026',
        date: '2026-12-12',
        status: 'draft',
        max_cartons: 800,
        description: 'Le rendez-vous incontournable de fin d\'année.',
        created_at: now, updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('sessions', {
      id: Object.values(IDS),
    });
  },
};
