'use strict';

// IDs fixes réutilisés dans les seeders suivants
const IDS = {
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

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('associations', [
      {
        id: IDS.PECHE_SAINTES,
        name: 'Amicale des Pêcheurs de Saintes',
        siret: '41234567800018',
        email: 'contact@peche-saintes.fr',
        phone: '05 46 12 34 56',
        address: '12 Quai de la Charente, 17100 Saintes',
        active: true,
        created_at: now, updated_at: now,
      },
      {
        id: IDS.OMNI_BORDEAUX,
        name: 'Club Omnisports Bordeaux Métropole',
        siret: '41234567800019',
        email: 'admin@cobm.fr',
        phone: '05 56 22 33 44',
        address: '8 Allée de Chartres, 33000 Bordeaux',
        active: true,
        created_at: now, updated_at: now,
      },
      {
        id: IDS.CULTURE_LYON,
        name: 'Association Culturelle des Brotteaux',
        siret: '41234567800020',
        email: 'direction@brotteaux-culture.fr',
        phone: '04 72 45 67 89',
        address: '24 Boulevard des Brotteaux, 69006 Lyon',
        active: true,
        created_at: now, updated_at: now,
      },
      {
        id: IDS.FETES_MONTPELLIER,
        name: 'Comité des Fêtes de Montpellier',
        siret: '41234567800021',
        email: 'comite@fetes-montpellier.fr',
        phone: '04 67 56 78 90',
        address: '3 Place de la Comédie, 34000 Montpellier',
        active: true,
        created_at: now, updated_at: now,
      },
      {
        id: IDS.FOYER_STEMILION,
        name: 'Foyer Rural de Saint-Émilion',
        siret: '41234567800022',
        email: 'foyer@sai-emilion.fr',
        phone: '05 57 24 72 03',
        address: '1 Place du Clocher, 33330 Saint-Émilion',
        active: true,
        created_at: now, updated_at: now,
      },
      {
        id: IDS.SPORT_NANTES,
        name: 'Sporting Club de Nantes Atlantique',
        siret: '41234567800023',
        email: 'contact@scna.fr',
        phone: '02 40 35 46 57',
        address: '15 Rue des Olivettes, 44000 Nantes',
        active: true,
        created_at: now, updated_at: now,
      },
      {
        id: IDS.LOISIRS_TOULOUSE,
        name: 'Club de Loisirs Toulouse Capitole',
        siret: '41234567800024',
        email: 'info@loisirs-capitole.fr',
        phone: '05 61 22 44 66',
        address: '2 Rue du Taur, 31000 Toulouse',
        active: true,
        created_at: now, updated_at: now,
      },
      {
        id: IDS.FAMILLE_STRASB,
        name: 'Association Familiale Alsacienne',
        siret: '41234567800025',
        email: 'accueil@afa-strasbourg.fr',
        phone: '03 88 12 23 34',
        address: '7 Rue des Bouchers, 67000 Strasbourg',
        active: true,
        created_at: now, updated_at: now,
      },
      {
        id: IDS.FETES_MARSEILLE,
        name: 'Comité des Fêtes de Marseille Nord',
        siret: '41234567800026',
        email: 'comite.nord@marseille-fetes.fr',
        phone: '04 91 02 13 24',
        address: '40 Avenue du 24 Avril 1915, 13015 Marseille',
        active: true,
        created_at: now, updated_at: now,
      },
      {
        id: IDS.SPORT_RENNES,
        name: 'Union Sportive de Rennes Thabor',
        siret: '41234567800027',
        email: 'contact@us-rennes-thabor.fr',
        phone: '02 99 45 67 89',
        address: '5 Avenue Jules Ferry, 35000 Rennes',
        active: true,
        created_at: now, updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('associations', {
      id: Object.values(IDS),
    });
  },
};
