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

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('partners', [

      // ── Saintes Hiver 2025 ──
      { id: '70000001-0001-4000-8000-000000000000', session_id: SES.SAINTES_HIVER_25, name: 'E. Leclerc Saintes', logo_url: '/logos/leclerc.svg', website_url: 'https://www.e-leclerc.com', order: 1, active: true, created_at: now, updated_at: now },
      { id: '70000001-0002-4000-8000-000000000000', session_id: SES.SAINTES_HIVER_25, name: 'Groupama Charente-Maritime', logo_url: '/logos/groupama.svg', website_url: 'https://www.groupama.fr', order: 2, active: true, created_at: now, updated_at: now },
      { id: '70000001-0003-4000-8000-000000000000', session_id: SES.SAINTES_HIVER_25, name: 'Boulangerie Paul', logo_url: '/logos/paul.svg', website_url: 'https://www.paul.fr', order: 3, active: true, created_at: now, updated_at: now },
      { id: '70000001-0004-4000-8000-000000000000', session_id: SES.SAINTES_HIVER_25, name: 'Norauto Saintes', logo_url: '/logos/norauto.svg', website_url: 'https://www.norauto.fr', order: 4, active: true, created_at: now, updated_at: now },

      // ── Bordeaux Automne 2025 ──
      { id: '70000002-0001-4000-8000-000000000000', session_id: SES.BRDX_AUTOMNE_25, name: 'Décathlon Bordeaux Lac', logo_url: '/logos/decathlon.svg', website_url: 'https://www.decathlon.fr', order: 1, active: true, created_at: now, updated_at: now },
      { id: '70000002-0002-4000-8000-000000000000', session_id: SES.BRDX_AUTOMNE_25, name: 'Crédit Agricole Aquitaine', logo_url: '/logos/credit-agricole.svg', website_url: 'https://www.credit-agricole.fr', order: 2, active: true, created_at: now, updated_at: now },
      { id: '70000002-0003-4000-8000-000000000000', session_id: SES.BRDX_AUTOMNE_25, name: 'Intermarché Mérignac', logo_url: '/logos/intermarche.svg', website_url: 'https://www.intermarche.com', order: 3, active: true, created_at: now, updated_at: now },
      { id: '70000002-0004-4000-8000-000000000000', session_id: SES.BRDX_AUTOMNE_25, name: 'McDonald\'s Bordeaux Centre', logo_url: '/logos/mcdonalds.svg', website_url: 'https://www.mcdonalds.fr', order: 4, active: true, created_at: now, updated_at: now },
      { id: '70000002-0005-4000-8000-000000000000', session_id: SES.BRDX_AUTOMNE_25, name: 'Optical Center Bordeaux', logo_url: '/logos/optical-center.svg', website_url: 'https://www.optical-center.fr', order: 5, active: true, created_at: now, updated_at: now },

      // ── Lyon Noël 2025 ──
      { id: '70000003-0001-4000-8000-000000000000', session_id: SES.LYON_NOEL_25, name: 'Cultura Lyon Part-Dieu', logo_url: '/logos/cultura.svg', website_url: 'https://www.cultura.com', order: 1, active: true, created_at: now, updated_at: now },
      { id: '70000003-0002-4000-8000-000000000000', session_id: SES.LYON_NOEL_25, name: 'Carrefour Market Brotteaux', logo_url: '/logos/carrefour.svg', website_url: 'https://www.carrefour.fr', order: 2, active: true, created_at: now, updated_at: now },
      { id: '70000003-0003-4000-8000-000000000000', session_id: SES.LYON_NOEL_25, name: 'Harmonie Mutuelle Rhône-Alpes', logo_url: '/logos/harmonie-mutuelle.svg', website_url: 'https://www.harmonie-mutuelle.fr', order: 3, active: true, created_at: now, updated_at: now },
      { id: '70000003-0004-4000-8000-000000000000', session_id: SES.LYON_NOEL_25, name: 'Boulangerie Paul', logo_url: '/logos/paul.svg', website_url: 'https://www.paul.fr', order: 4, active: true, created_at: now, updated_at: now },

      // ── Nantes En cours ──
      { id: '70000004-0001-4000-8000-000000000000', session_id: SES.NANTES_RUNNING, name: 'Bricomarché Nantes Nord', logo_url: '/logos/bricomarche.svg', website_url: 'https://www.bricomarche.com', order: 1, active: true, created_at: now, updated_at: now },
      { id: '70000004-0002-4000-8000-000000000000', session_id: SES.NANTES_RUNNING, name: 'La Poste Loire-Atlantique', logo_url: '/logos/la-poste.svg', website_url: 'https://www.laposte.fr', order: 2, active: true, created_at: now, updated_at: now },
      { id: '70000004-0003-4000-8000-000000000000', session_id: SES.NANTES_RUNNING, name: 'Jardiland Nantes Saint-Herblain', logo_url: '/logos/jardiland.svg', website_url: 'https://www.jardiland.com', order: 3, active: true, created_at: now, updated_at: now },
      { id: '70000004-0004-4000-8000-000000000000', session_id: SES.NANTES_RUNNING, name: 'Grand Frais Rezé', logo_url: '/logos/grand-frais.svg', website_url: 'https://www.grand-frais.com', order: 4, active: true, created_at: now, updated_at: now },
      { id: '70000004-0005-4000-8000-000000000000', session_id: SES.NANTES_RUNNING, name: 'Buffalo Grill Nantes', logo_url: '/logos/buffalo-grill.svg', website_url: 'https://www.buffalo-grill.fr', order: 5, active: true, created_at: now, updated_at: now },

      // ── Toulouse Printemps ──
      { id: '70000005-0001-4000-8000-000000000000', session_id: SES.TLSE_PRINTEMPS, name: 'E. Leclerc Blagnac', logo_url: '/logos/leclerc.svg', website_url: 'https://www.e-leclerc.com', order: 1, active: true, created_at: now, updated_at: now },
      { id: '70000005-0002-4000-8000-000000000000', session_id: SES.TLSE_PRINTEMPS, name: 'Décathlon Toulouse Labège', logo_url: '/logos/decathlon.svg', website_url: 'https://www.decathlon.fr', order: 2, active: true, created_at: now, updated_at: now },
      { id: '70000005-0003-4000-8000-000000000000', session_id: SES.TLSE_PRINTEMPS, name: 'Kiabi Toulouse', logo_url: '/logos/kiabi.svg', website_url: 'https://www.kiabi.com', order: 3, active: true, created_at: now, updated_at: now },
      { id: '70000005-0004-4000-8000-000000000000', session_id: SES.TLSE_PRINTEMPS, name: 'Flunch Toulouse', logo_url: '/logos/flunch.svg', website_url: 'https://www.flunch.fr', order: 4, active: true, created_at: now, updated_at: now },
      { id: '70000005-0005-4000-8000-000000000000', session_id: SES.TLSE_PRINTEMPS, name: 'Brico Dépôt Toulouse', logo_url: '/logos/brico-depot.svg', website_url: 'https://www.brico-depot.fr', order: 5, active: true, created_at: now, updated_at: now },

      // ── Marseille Été ──
      { id: '70000006-0001-4000-8000-000000000000', session_id: SES.MARS_ETE, name: 'Carrefour Marseille Nord', logo_url: '/logos/carrefour.svg', website_url: 'https://www.carrefour.fr', order: 1, active: true, created_at: now, updated_at: now },
      { id: '70000006-0002-4000-8000-000000000000', session_id: SES.MARS_ETE, name: 'McDonald\'s Marseille Les Arnavaux', logo_url: '/logos/mcdonalds.svg', website_url: 'https://www.mcdonalds.fr', order: 2, active: true, created_at: now, updated_at: now },
      { id: '70000006-0003-4000-8000-000000000000', session_id: SES.MARS_ETE, name: 'Groupama Méditerranée', logo_url: '/logos/groupama.svg', website_url: 'https://www.groupama.fr', order: 3, active: true, created_at: now, updated_at: now },
      { id: '70000006-0004-4000-8000-000000000000', session_id: SES.MARS_ETE, name: 'Norauto Marseille', logo_url: '/logos/norauto.svg', website_url: 'https://www.norauto.fr', order: 4, active: true, created_at: now, updated_at: now },

      // ── Strasbourg Pâques ──
      { id: '70000007-0001-4000-8000-000000000000', session_id: SES.STRASB_PAQUES, name: 'Intermarché Strasbourg', logo_url: '/logos/intermarche.svg', website_url: 'https://www.intermarche.com', order: 1, active: true, created_at: now, updated_at: now },
      { id: '70000007-0002-4000-8000-000000000000', session_id: SES.STRASB_PAQUES, name: 'Crédit Agricole Alsace Vosges', logo_url: '/logos/credit-agricole.svg', website_url: 'https://www.credit-agricole.fr', order: 2, active: true, created_at: now, updated_at: now },
      { id: '70000007-0003-4000-8000-000000000000', session_id: SES.STRASB_PAQUES, name: 'Harmonie Mutuelle Grand Est', logo_url: '/logos/harmonie-mutuelle.svg', website_url: 'https://www.harmonie-mutuelle.fr', order: 3, active: true, created_at: now, updated_at: now },
      { id: '70000007-0004-4000-8000-000000000000', session_id: SES.STRASB_PAQUES, name: 'Cultura Strasbourg', logo_url: '/logos/cultura.svg', website_url: 'https://www.cultura.com', order: 4, active: true, created_at: now, updated_at: now },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('partners', {
      session_id: Object.values(SES),
    });
  },
};
