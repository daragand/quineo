'use strict';

const SES = {
  SAINTES_HIVER_25: '30000000-0000-4000-8000-000000000001',
  BRDX_AUTOMNE_25:  '30000000-0000-4000-8000-000000000002',
  LYON_NOEL_25:     '30000000-0000-4000-8000-000000000003',
  NANTES_RUNNING:   '30000000-0000-4000-8000-000000000004',
  TLSE_PRINTEMPS:   '30000000-0000-4000-8000-000000000005',
  MARS_ETE:         '30000000-0000-4000-8000-000000000006',
  STRASB_PAQUES:    '30000000-0000-4000-8000-000000000007',
};

// Convention UUID : 50[session][pack]-0000-4000-8000-000000000000
// session 01→07 / pack 1→5

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('carton_packs', [

      // ── Saintes Hiver 2025 — tarifs standard ──
      { id: '50010001-0000-4000-8000-000000000000', session_id: SES.SAINTES_HIVER_25, label: '1 carton',   quantity: 1,  price: '2.00',  is_active: true, display_order: 1, max_per_person: null, created_at: now },
      { id: '50010002-0000-4000-8000-000000000000', session_id: SES.SAINTES_HIVER_25, label: '3 cartons',  quantity: 3,  price: '5.00',  is_active: true, display_order: 2, max_per_person: null, created_at: now },
      { id: '50010003-0000-4000-8000-000000000000', session_id: SES.SAINTES_HIVER_25, label: '6 cartons',  quantity: 6,  price: '9.00',  is_active: true, display_order: 3, max_per_person: null, created_at: now },
      { id: '50010004-0000-4000-8000-000000000000', session_id: SES.SAINTES_HIVER_25, label: '12 cartons', quantity: 12, price: '15.00', is_active: true, display_order: 4, max_per_person: 2,    created_at: now },

      // ── Bordeaux Automne 2025 — tarifs soirée (+25%) ──
      { id: '50020001-0000-4000-8000-000000000000', session_id: SES.BRDX_AUTOMNE_25, label: '1 carton',   quantity: 1,  price: '2.50',  is_active: true, display_order: 1, max_per_person: null, created_at: now },
      { id: '50020002-0000-4000-8000-000000000000', session_id: SES.BRDX_AUTOMNE_25, label: '3 cartons',  quantity: 3,  price: '6.00',  is_active: true, display_order: 2, max_per_person: null, created_at: now },
      { id: '50020003-0000-4000-8000-000000000000', session_id: SES.BRDX_AUTOMNE_25, label: '6 cartons',  quantity: 6,  price: '11.00', is_active: true, display_order: 3, max_per_person: null, created_at: now },
      { id: '50020004-0000-4000-8000-000000000000', session_id: SES.BRDX_AUTOMNE_25, label: '12 cartons', quantity: 12, price: '19.00', is_active: true, display_order: 4, max_per_person: 3,    created_at: now },

      // ── Lyon Noël 2025 — tarifs soirée spéciale avec bonus ──
      { id: '50030001-0000-4000-8000-000000000000', session_id: SES.LYON_NOEL_25, label: '1 carton',              quantity: 1,  price: '3.00',  is_active: true, display_order: 1, max_per_person: null, created_at: now },
      { id: '50030002-0000-4000-8000-000000000000', session_id: SES.LYON_NOEL_25, label: '3 cartons',             quantity: 3,  price: '8.00',  is_active: true, display_order: 2, max_per_person: null, created_at: now },
      { id: '50030003-0000-4000-8000-000000000000', session_id: SES.LYON_NOEL_25, label: '6 cartons + 1 offert',  quantity: 7,  price: '15.00', is_active: true, display_order: 3, max_per_person: null, created_at: now },
      { id: '50030004-0000-4000-8000-000000000000', session_id: SES.LYON_NOEL_25, label: '14 cartons (lot Noël)', quantity: 14, price: '25.00', is_active: true, display_order: 4, max_per_person: 2,    created_at: now },

      // ── Nantes En cours — tarifs standard ──
      { id: '50040001-0000-4000-8000-000000000000', session_id: SES.NANTES_RUNNING, label: '1 carton',   quantity: 1,  price: '2.00',  is_active: true, display_order: 1, max_per_person: null, created_at: now },
      { id: '50040002-0000-4000-8000-000000000000', session_id: SES.NANTES_RUNNING, label: '3 cartons',  quantity: 3,  price: '5.00',  is_active: true, display_order: 2, max_per_person: null, created_at: now },
      { id: '50040003-0000-4000-8000-000000000000', session_id: SES.NANTES_RUNNING, label: '6 cartons',  quantity: 6,  price: '9.00',  is_active: true, display_order: 3, max_per_person: null, created_at: now },
      { id: '50040004-0000-4000-8000-000000000000', session_id: SES.NANTES_RUNNING, label: '12 cartons', quantity: 12, price: '15.00', is_active: true, display_order: 4, max_per_person: 2,    created_at: now },

      // ── Toulouse Printemps — forfait famille + carton découverte offert ──
      { id: '50050001-0000-4000-8000-000000000000', session_id: SES.TLSE_PRINTEMPS, label: '1 carton',                  quantity: 1,  price: '2.00',  is_active: true, display_order: 1, max_per_person: null, created_at: now },
      { id: '50050002-0000-4000-8000-000000000000', session_id: SES.TLSE_PRINTEMPS, label: '4 cartons',                 quantity: 4,  price: '7.00',  is_active: true, display_order: 2, max_per_person: null, created_at: now },
      { id: '50050003-0000-4000-8000-000000000000', session_id: SES.TLSE_PRINTEMPS, label: '8 cartons',                 quantity: 8,  price: '12.00', is_active: true, display_order: 3, max_per_person: null, created_at: now },
      { id: '50050004-0000-4000-8000-000000000000', session_id: SES.TLSE_PRINTEMPS, label: 'Forfait Famille (20 cartons)', quantity: 20, price: '25.00', is_active: true, display_order: 4, max_per_person: 1,    created_at: now },
      { id: '50050005-0000-4000-8000-000000000000', session_id: SES.TLSE_PRINTEMPS, label: 'Carton découverte (offert)', quantity: 1,  price: '0.00',  is_active: true, display_order: 5, max_per_person: 1,    created_at: now },

      // ── Marseille Été — tarifs majorés (croisière en gros lot) ──
      { id: '50060001-0000-4000-8000-000000000000', session_id: SES.MARS_ETE, label: '1 carton',    quantity: 1,  price: '3.00',  is_active: true, display_order: 1, max_per_person: null, created_at: now },
      { id: '50060002-0000-4000-8000-000000000000', session_id: SES.MARS_ETE, label: '3 cartons',   quantity: 3,  price: '8.00',  is_active: true, display_order: 2, max_per_person: null, created_at: now },
      { id: '50060003-0000-4000-8000-000000000000', session_id: SES.MARS_ETE, label: '10 cartons',  quantity: 10, price: '22.00', is_active: true, display_order: 3, max_per_person: null, created_at: now },
      { id: '50060004-0000-4000-8000-000000000000', session_id: SES.MARS_ETE, label: '20 cartons',  quantity: 20, price: '38.00', is_active: true, display_order: 4, max_per_person: 4,    created_at: now },

      // ── Strasbourg Pâques — tarifs standard ──
      { id: '50070001-0000-4000-8000-000000000000', session_id: SES.STRASB_PAQUES, label: '1 carton',   quantity: 1,  price: '2.00',  is_active: true, display_order: 1, max_per_person: null, created_at: now },
      { id: '50070002-0000-4000-8000-000000000000', session_id: SES.STRASB_PAQUES, label: '3 cartons',  quantity: 3,  price: '5.00',  is_active: true, display_order: 2, max_per_person: null, created_at: now },
      { id: '50070003-0000-4000-8000-000000000000', session_id: SES.STRASB_PAQUES, label: '6 cartons',  quantity: 6,  price: '9.00',  is_active: true, display_order: 3, max_per_person: null, created_at: now },
      { id: '50070004-0000-4000-8000-000000000000', session_id: SES.STRASB_PAQUES, label: '12 cartons', quantity: 12, price: '15.00', is_active: true, display_order: 4, max_per_person: 2,    created_at: now },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('carton_packs', {
      session_id: Object.values(SES),
    });
  },
};
