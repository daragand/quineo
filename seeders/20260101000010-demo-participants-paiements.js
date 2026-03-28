'use strict';

const { v4: uuidv4 } = require('uuid');

// ── Sessions avec cartons vendus (depuis seeder 008) ─────────
const S = {
  SAINTES_HIVER_25: '30000000-0000-4000-8000-000000000001',
  BRDX_AUTOMNE_25:  '30000000-0000-4000-8000-000000000002',
  LYON_NOEL_25:     '30000000-0000-4000-8000-000000000003',
  NANTES_RUNNING:   '30000000-0000-4000-8000-000000000004',
  TLSE_PRINTEMPS:   '30000000-0000-4000-8000-000000000005',
  MARS_ETE:         '30000000-0000-4000-8000-000000000006',
  STRASB_PAQUES:    '30000000-0000-4000-8000-000000000007',
};

const NOMS_DEMO = [
  ['Martin',   'Sophie'],   ['Dupont',   'Pierre'],   ['Bernard',  'Marie'],
  ['Robert',   'Jean'],     ['Moreau',   'Isabelle'], ['Laurent',  'François'],
  ['Simon',    'Nathalie'], ['Michel',   'Philippe'], ['Lefebvre', 'Claire'],
  ['Leroy',    'Patrick'],  ['Roux',     'Catherine'],['David',    'Nicolas'],
  ['Bertrand', 'Sylvie'],   ['Morel',    'Thierry'],  ['Fournier', 'Véronique'],
  ['Girard',   'Antoine'],  ['Bonnet',   'Laure'],    ['Dupuis',   'Stéphane'],
  ['Lambert',  'Hélène'],   ['Fontaine', 'Julien'],   ['Rousseau', 'Mélanie'],
  ['Vincent',  'Sébastien'],['Perez',    'Aurélie'],  ['Simon',    'Maxime'],
  ['Morin',    'Caroline'],
];

function cleanEmail(s) {
  return s.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const sessionsConfig = [
      { id: S.SAINTES_HIVER_25 },
      { id: S.BRDX_AUTOMNE_25  },
      { id: S.LYON_NOEL_25     },
      { id: S.NANTES_RUNNING   },
      { id: S.TLSE_PRINTEMPS   },
      { id: S.MARS_ETE         },
      { id: S.STRASB_PAQUES    },
    ];

    for (const { id: sessionId } of sessionsConfig) {
      // Récupérer les cartons sold sans participant
      const [cartons] = await queryInterface.sequelize.query(
        `SELECT id FROM cartons
         WHERE session_id = :sid AND status = 'sold' AND participant_id IS NULL
         ORDER BY serial_number ASC`,
        { replacements: { sid: sessionId } }
      );

      if (!cartons || cartons.length === 0) continue;

      // Calculer le nombre de participants nécessaires (3-5 cartons chacun en moyenne)
      const nbParticipants = Math.min(NOMS_DEMO.length, Math.ceil(cartons.length / 4));
      const names = NOMS_DEMO.slice(0, nbParticipants);

      const participants = names.map(([last, first]) => ({
        id:         uuidv4(),
        first_name: first,
        last_name:  last,
        email:      `${cleanEmail(first)}.${cleanEmail(last)}@demo.quineo.fr`,
        created_at: now,
        updated_at: now,
      }));

      await queryInterface.bulkInsert('participants', participants);

      // Répartir les cartons sur les participants
      let cartonIdx = 0;
      for (const participant of participants) {
        if (cartonIdx >= cartons.length) break;

        const qty = Math.min(
          3 + Math.floor(Math.random() * 4), // 3 à 6 cartons
          cartons.length - cartonIdx
        );
        const lot = cartons.slice(cartonIdx, cartonIdx + qty);
        cartonIdx += qty;

        const amount = (qty * 3).toFixed(2);
        const paiementId = uuidv4();

        await queryInterface.bulkInsert('paiements', [{
          id:             paiementId,
          participant_id: participant.id,
          provider_id:    null,
          method:         'CASH',
          amount,
          status:         'completed',
          reference:      null,
          paid_at:        now,
          created_at:     now,
          updated_at:     now,
        }]);

        const cartonIds = lot.map(c => c.id);

        await queryInterface.sequelize.query(
          `UPDATE cartons SET participant_id = :pid, updated_at = :now
           WHERE id IN (:ids)`,
          { replacements: { pid: participant.id, now, ids: cartonIds } }
        );

        const paiementCartons = lot.map(c => ({
          paiement_id:    paiementId,
          carton_id:      c.id,
          carton_pack_id: null,
          created_at:     now,
        }));
        await queryInterface.bulkInsert('paiement_cartons', paiementCartons);
      }
    }
  },

  async down(queryInterface) {
    const allSessionIds = Object.values(S);

    await queryInterface.sequelize.query(
      `DELETE FROM paiement_cartons
       WHERE paiement_id IN (
         SELECT p.id FROM paiements p
         JOIN participants pt ON pt.id = p.participant_id
         WHERE pt.email LIKE '%@demo.quineo.fr'
       )`
    );

    await queryInterface.sequelize.query(
      `DELETE FROM paiements
       WHERE participant_id IN (
         SELECT id FROM participants WHERE email LIKE '%@demo.quineo.fr'
       )`
    );

    await queryInterface.sequelize.query(
      `UPDATE cartons SET participant_id = NULL
       WHERE session_id IN (:ids)`,
      { replacements: { ids: allSessionIds } }
    );

    await queryInterface.sequelize.query(
      `DELETE FROM participants WHERE email LIKE '%@demo.quineo.fr'`
    );
  },
};
