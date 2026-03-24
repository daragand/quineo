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
    await queryInterface.bulkInsert('lots', [

      // ── Saintes Hiver 2025 (terminé — tous drawn) ──
      { id: '40000000-0000-4000-8000-000000000001', session_id: SES.SAINTES_HIVER_25, name: 'Télévision Samsung 65" QLED', description: 'TV 65 pouces 4K QLED avec télécommande vocale', order: 1, value: 899.00, status: 'drawn', created_at: now, updated_at: now },
      { id: '40000000-0000-4000-8000-000000000002', session_id: SES.SAINTES_HIVER_25, name: 'Vélo électrique Decathlon', description: 'VTC électrique 250W autonomie 80 km', order: 2, value: 749.00, status: 'drawn', created_at: now, updated_at: now },
      { id: '40000000-0000-4000-8000-000000000003', session_id: SES.SAINTES_HIVER_25, name: 'Robot cuiseur Cookeo Touch', description: 'Multicuiseur 6L avec écran tactile', order: 3, value: 299.00, status: 'drawn', created_at: now, updated_at: now },
      { id: '40000000-0000-4000-8000-000000000004', session_id: SES.SAINTES_HIVER_25, name: 'Bon cadeau Décathlon 100€', description: null, order: 4, value: 100.00, status: 'drawn', created_at: now, updated_at: now },
      { id: '40000000-0000-4000-8000-000000000005', session_id: SES.SAINTES_HIVER_25, name: 'Coffret Spa Well & Well', description: 'Coffret soin corps et bain pour 2', order: 5, value: 49.90, status: 'drawn', created_at: now, updated_at: now },
      { id: '40000000-0000-4000-8000-000000000006', session_id: SES.SAINTES_HIVER_25, name: 'Bouteille Moët & Chandon', description: 'Champagne brut Impérial 75cl', order: 6, value: 39.00, status: 'drawn', created_at: now, updated_at: now },

      // ── Bordeaux Automne 2025 (terminé) ──
      { id: '40000000-0000-4000-8000-000000000007', session_id: SES.BRDX_AUTOMNE_25, name: 'Console PlayStation 5 + 2 jeux', description: 'PS5 édition Standard + FIFA 25 + EA Sports FC', order: 1, value: 649.00, status: 'drawn', created_at: now, updated_at: now },
      { id: '40000000-0000-4000-8000-000000000008', session_id: SES.BRDX_AUTOMNE_25, name: 'Week-end Spa pour 2', description: 'Séjour 2 nuits avec accès spa en Dordogne', order: 2, value: 380.00, status: 'drawn', created_at: now, updated_at: now },
      { id: '40000000-0000-4000-8000-000000000009', session_id: SES.BRDX_AUTOMNE_25, name: 'Airfryer Philips XXL 7.3L', description: 'Friteuse sans huile grande capacité', order: 3, value: 149.00, status: 'drawn', created_at: now, updated_at: now },
      { id: '40000000-0000-4000-8000-000000000010', session_id: SES.BRDX_AUTOMNE_25, name: 'Tablette iPad 10ème génération', description: 'iPad 64Go WiFi avec étui', order: 4, value: 409.00, status: 'drawn', created_at: now, updated_at: now },
      { id: '40000000-0000-4000-8000-000000000011', session_id: SES.BRDX_AUTOMNE_25, name: 'Enceinte JBL Charge 5', description: 'Enceinte Bluetooth portable waterproof', order: 5, value: 149.00, status: 'drawn', created_at: now, updated_at: now },
      { id: '40000000-0000-4000-8000-000000000012', session_id: SES.BRDX_AUTOMNE_25, name: 'Cafetière Nespresso Vertuo Next', description: 'Machine à café + 50 capsules offertes', order: 6, value: 119.00, status: 'drawn', created_at: now, updated_at: now },
      { id: '40000000-0000-4000-8000-000000000013', session_id: SES.BRDX_AUTOMNE_25, name: 'Bon restaurant gastronomique', description: 'Dîner pour 2 au restaurant Le Pressoir d\'Argent', order: 7, value: 120.00, status: 'drawn', created_at: now, updated_at: now },

      // ── Lyon Noël 2025 (terminé) ──
      { id: '40000000-0000-4000-8000-000000000014', session_id: SES.LYON_NOEL_25, name: 'Appareil photo Fujifilm Instax Wide', description: 'Appareil photo instantané + 20 films', order: 1, value: 129.00, status: 'drawn', created_at: now, updated_at: now },
      { id: '40000000-0000-4000-8000-000000000015', session_id: SES.LYON_NOEL_25, name: 'Casque audio Sony WH-1000XM5', description: 'Casque Bluetooth à réduction de bruit', order: 2, value: 279.00, status: 'drawn', created_at: now, updated_at: now },
      { id: '40000000-0000-4000-8000-000000000016', session_id: SES.LYON_NOEL_25, name: 'Box gastronomique Gourmet Box', description: 'Coffret 6 mois de produits artisanaux', order: 3, value: 180.00, status: 'drawn', created_at: now, updated_at: now },
      { id: '40000000-0000-4000-8000-000000000017', session_id: SES.LYON_NOEL_25, name: 'Bon cadeau Amazon 80€', description: null, order: 4, value: 80.00, status: 'drawn', created_at: now, updated_at: now },
      { id: '40000000-0000-4000-8000-000000000018', session_id: SES.LYON_NOEL_25, name: 'Coffret whisky Glenfiddich', description: 'Coffret 2 bouteilles 12 ans + 2 verres', order: 5, value: 79.00, status: 'drawn', created_at: now, updated_at: now },

      // ── Nantes EN COURS ──
      { id: '40000000-0000-4000-8000-000000000019', session_id: SES.NANTES_RUNNING, name: 'Télévision LG OLED 55"', description: 'TV OLED 55 pouces 4K avec télécommande magique', order: 1, value: 1099.00, status: 'drawn', created_at: now, updated_at: now },
      { id: '40000000-0000-4000-8000-000000000020', session_id: SES.NANTES_RUNNING, name: 'Trottinette électrique Xiaomi Pro 4', description: 'Autonomie 55 km, vitesse max 25 km/h', order: 2, value: 499.00, status: 'pending', created_at: now, updated_at: now },
      { id: '40000000-0000-4000-8000-000000000021', session_id: SES.NANTES_RUNNING, name: 'Robot Thermomix TM7', description: 'Robot cuiseur multifonction dernière génération', order: 3, value: 1499.00, status: 'pending', created_at: now, updated_at: now },
      { id: '40000000-0000-4000-8000-000000000022', session_id: SES.NANTES_RUNNING, name: 'Week-end Bretagne pour 2', description: 'Gîte 2 nuits en bord de mer + dîner homard', order: 4, value: 320.00, status: 'pending', created_at: now, updated_at: now },
      { id: '40000000-0000-4000-8000-000000000023', session_id: SES.NANTES_RUNNING, name: 'Bon cadeau Décathlon 150€', description: null, order: 5, value: 150.00, status: 'pending', created_at: now, updated_at: now },
      { id: '40000000-0000-4000-8000-000000000024', session_id: SES.NANTES_RUNNING, name: 'Coffret vin domaine Muscadet', description: 'Caisse 6 bouteilles du domaine de la Mortaine', order: 6, value: 65.00, status: 'pending', created_at: now, updated_at: now },

      // ── Toulouse Printemps (ouvert) ──
      { id: '40000000-0000-4000-8000-000000000025', session_id: SES.TLSE_PRINTEMPS, name: 'iPhone 16 128Go', description: 'Smartphone Apple toutes couleurs au choix', order: 1, value: 999.00, status: 'pending', created_at: now, updated_at: now },
      { id: '40000000-0000-4000-8000-000000000026', session_id: SES.TLSE_PRINTEMPS, name: 'Vélo électrique Cube Access', description: 'VTT électrique femme 29", 10 vitesses', order: 2, value: 2199.00, status: 'pending', created_at: now, updated_at: now },
      { id: '40000000-0000-4000-8000-000000000027', session_id: SES.TLSE_PRINTEMPS, name: 'Séjour Occitanie 3 nuits', description: 'Gîte de charme en Aveyron pour 4 personnes', order: 3, value: 480.00, status: 'pending', created_at: now, updated_at: now },
      { id: '40000000-0000-4000-8000-000000000028', session_id: SES.TLSE_PRINTEMPS, name: 'Console Nintendo Switch 2', description: 'Console + jeu Mario Kart World', order: 4, value: 469.00, status: 'pending', created_at: now, updated_at: now },
      { id: '40000000-0000-4000-8000-000000000029', session_id: SES.TLSE_PRINTEMPS, name: 'Airfryer Ninja DualZone', description: '2 zones indépendantes, 9.5L', order: 5, value: 179.00, status: 'pending', created_at: now, updated_at: now },
      { id: '40000000-0000-4000-8000-000000000030', session_id: SES.TLSE_PRINTEMPS, name: 'Bon cadeau restaurants Toulouse', description: 'Bon valable dans 5 restaurants partenaires', order: 6, value: 100.00, status: 'pending', created_at: now, updated_at: now },

      // ── Marseille Été (ouvert) ──
      { id: '40000000-0000-4000-8000-000000000031', session_id: SES.MARS_ETE, name: 'Télévision Samsung 75" Crystal UHD', description: 'Smart TV 75 pouces 4K HDR', order: 1, value: 1199.00, status: 'pending', created_at: now, updated_at: now },
      { id: '40000000-0000-4000-8000-000000000032', session_id: SES.MARS_ETE, name: 'Barbecue Weber Spirit II E-315', description: 'Barbecue gaz 3 brûleurs avec plancha', order: 2, value: 649.00, status: 'pending', created_at: now, updated_at: now },
      { id: '40000000-0000-4000-8000-000000000033', session_id: SES.MARS_ETE, name: 'Croisière Méditerranée pour 2', description: '7 nuits MSC Croisières, cabine intérieure', order: 3, value: 1400.00, status: 'pending', created_at: now, updated_at: now },
      { id: '40000000-0000-4000-8000-000000000034', session_id: SES.MARS_ETE, name: 'Robot aspirateur Roomba j9+', description: 'Aspirateur robot avec vidage automatique', order: 4, value: 599.00, status: 'pending', created_at: now, updated_at: now },
      { id: '40000000-0000-4000-8000-000000000035', session_id: SES.MARS_ETE, name: 'Bon cadeau Carrefour 200€', description: null, order: 5, value: 200.00, status: 'pending', created_at: now, updated_at: now },

      // ── Strasbourg Pâques (ouvert) ──
      { id: '40000000-0000-4000-8000-000000000036', session_id: SES.STRASB_PAQUES, name: 'Robot KitchenAid Artisan', description: 'Robot pâtissier 4.8L rouge empire', order: 1, value: 599.00, status: 'pending', created_at: now, updated_at: now },
      { id: '40000000-0000-4000-8000-000000000037', session_id: SES.STRASB_PAQUES, name: 'Week-end Alsace pour 2', description: 'Nuit en Hôtel 4* + dîner winstub + dégustation vins', order: 2, value: 350.00, status: 'pending', created_at: now, updated_at: now },
      { id: '40000000-0000-4000-8000-000000000038', session_id: SES.STRASB_PAQUES, name: 'Tablette Samsung Galaxy Tab S9', description: '11 pouces, 128 Go, WiFi', order: 3, value: 499.00, status: 'pending', created_at: now, updated_at: now },
      { id: '40000000-0000-4000-8000-000000000039', session_id: SES.STRASB_PAQUES, name: 'Coffret bières artisanales alsaciennes', description: '24 bières de 8 brasseries artisanales', order: 4, value: 79.00, status: 'pending', created_at: now, updated_at: now },
      { id: '40000000-0000-4000-8000-000000000040', session_id: SES.STRASB_PAQUES, name: 'Bon cadeau Cultura 80€', description: null, order: 5, value: 80.00, status: 'pending', created_at: now, updated_at: now },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('lots', {
      session_id: Object.values(SES),
    });
  },
};
