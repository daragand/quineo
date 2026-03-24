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

// IDs fixes réutilisés dans les seeders suivants (paiements)
const IDS = {
  SUMUP_SAINTES:   '60000000-0000-4000-8000-000000000001',
  SUMUP_BRDX:      '60000000-0000-4000-8000-000000000002',
  SUMUP_NANTES:    '60000000-0000-4000-8000-000000000003',
  SUMUP_RENNES:    '60000000-0000-4000-8000-000000000004',
  HELLOASSO_LYON:  '60000000-0000-4000-8000-000000000005',
  HELLOASSO_MONTP: '60000000-0000-4000-8000-000000000006',
  HELLOASSO_TLSE:  '60000000-0000-4000-8000-000000000007',
  PAYPAL_STRASB:   '60000000-0000-4000-8000-000000000008',
  PAYPAL_MARS:     '60000000-0000-4000-8000-000000000009',
  STRIPE_BRDX:     '60000000-0000-4000-8000-000000000010',
};

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('payment_providers', [
      // ── SumUp (terminal de paiement physique, idéal pour les lotos en salle) ──
      {
        id: IDS.SUMUP_SAINTES,
        association_id: ASSO.PECHE_SAINTES,
        name: 'SumUp — Amicale Saintes',
        type: 'sumup',
        config: JSON.stringify({ merchant_code: 'SUMUP-SAINTS-001', currency: 'EUR' }),
        active: true,
        created_at: now, updated_at: now,
      },
      {
        id: IDS.SUMUP_BRDX,
        association_id: ASSO.OMNI_BORDEAUX,
        name: 'SumUp — COBM',
        type: 'sumup',
        config: JSON.stringify({ merchant_code: 'SUMUP-COBM-001', currency: 'EUR' }),
        active: true,
        created_at: now, updated_at: now,
      },
      {
        id: IDS.SUMUP_NANTES,
        association_id: ASSO.SPORT_NANTES,
        name: 'SumUp — SCNA',
        type: 'sumup',
        config: JSON.stringify({ merchant_code: 'SUMUP-SCNA-001', currency: 'EUR' }),
        active: true,
        created_at: now, updated_at: now,
      },
      {
        id: IDS.SUMUP_RENNES,
        association_id: ASSO.SPORT_RENNES,
        name: 'SumUp — US Rennes Thabor',
        type: 'sumup',
        config: JSON.stringify({ merchant_code: 'SUMUP-RENN-001', currency: 'EUR' }),
        active: true,
        created_at: now, updated_at: now,
      },

      // ── HelloAsso (plateforme dédiée aux associations françaises, type 'other') ──
      {
        id: IDS.HELLOASSO_LYON,
        association_id: ASSO.CULTURE_LYON,
        name: 'HelloAsso — ACB Lyon',
        type: 'other',
        config: JSON.stringify({ organization_slug: 'acb-brotteaux', form_slug: 'loto-2026' }),
        active: true,
        created_at: now, updated_at: now,
      },
      {
        id: IDS.HELLOASSO_MONTP,
        association_id: ASSO.FETES_MONTPELLIER,
        name: 'HelloAsso — Fêtes Montpellier',
        type: 'other',
        config: JSON.stringify({ organization_slug: 'fetes-montpellier', form_slug: 'loto-printemps' }),
        active: true,
        created_at: now, updated_at: now,
      },
      {
        id: IDS.HELLOASSO_TLSE,
        association_id: ASSO.LOISIRS_TOULOUSE,
        name: 'HelloAsso — Loisirs Capitole',
        type: 'other',
        config: JSON.stringify({ organization_slug: 'loisirs-capitole', form_slug: 'grand-loto-automne' }),
        active: true,
        created_at: now, updated_at: now,
      },

      // ── PayPal ──
      {
        id: IDS.PAYPAL_STRASB,
        association_id: ASSO.FAMILLE_STRASB,
        name: 'PayPal — AFA Strasbourg',
        type: 'paypal',
        config: JSON.stringify({ client_id: 'PP-CLIENT-AFA-STRASB', environment: 'sandbox' }),
        active: true,
        created_at: now, updated_at: now,
      },
      {
        id: IDS.PAYPAL_MARS,
        association_id: ASSO.FETES_MARSEILLE,
        name: 'PayPal — Fêtes Marseille Nord',
        type: 'paypal',
        config: JSON.stringify({ client_id: 'PP-CLIENT-MARS-NORD', environment: 'production' }),
        active: true,
        created_at: now, updated_at: now,
      },

      // ── Stripe ──
      {
        id: IDS.STRIPE_BRDX,
        association_id: ASSO.OMNI_BORDEAUX,
        name: 'Stripe — COBM (vente en ligne)',
        type: 'stripe',
        config: JSON.stringify({ publishable_key: 'pk_test_cobm_bordeaux', webhook_secret: 'whsec_xxxx' }),
        active: true,
        created_at: now, updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('payment_providers', {
      id: Object.values(IDS),
    });
  },
};
