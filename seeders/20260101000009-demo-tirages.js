'use strict';

// Sessions
const SES = {
  SAINTES_HIVER_25: '30000000-0000-4000-8000-000000000001',
  BRDX_AUTOMNE_25:  '30000000-0000-4000-8000-000000000002',
  LYON_NOEL_25:     '30000000-0000-4000-8000-000000000003',
  NANTES_RUNNING:   '30000000-0000-4000-8000-000000000004',
  TLSE_PRINTEMPS:   '30000000-0000-4000-8000-000000000005',
  MARS_ETE:         '30000000-0000-4000-8000-000000000006',
  STRASB_PAQUES:    '30000000-0000-4000-8000-000000000007',
  SAINTES_ETE_26:   '30000000-0000-4000-8000-000000000008',
};

// Lots
const LOT = {
  // Saintes Hiver 25 (01-06, tous drawn)
  SH_TV:        '40000000-0000-4000-8000-000000000001',
  SH_VELO:      '40000000-0000-4000-8000-000000000002',
  SH_COOKEO:    '40000000-0000-4000-8000-000000000003',
  SH_DECATHL:   '40000000-0000-4000-8000-000000000004',
  SH_SPA:       '40000000-0000-4000-8000-000000000005',
  SH_MOET:      '40000000-0000-4000-8000-000000000006',
  // Bordeaux Automne 25 (07-13)
  BA_PS5:       '40000000-0000-4000-8000-000000000007',
  BA_WEEKEND:   '40000000-0000-4000-8000-000000000008',
  BA_AIRFRYER:  '40000000-0000-4000-8000-000000000009',
  BA_IPAD:      '40000000-0000-4000-8000-000000000010',
  BA_JBL:       '40000000-0000-4000-8000-000000000011',
  BA_NESPRESSO: '40000000-0000-4000-8000-000000000012',
  BA_RESTAU:    '40000000-0000-4000-8000-000000000013',
  // Lyon Noël 25 (14-18)
  LN_INSTAX:    '40000000-0000-4000-8000-000000000014',
  LN_SONY:      '40000000-0000-4000-8000-000000000015',
  LN_GOURMET:   '40000000-0000-4000-8000-000000000016',
  LN_AMAZON:    '40000000-0000-4000-8000-000000000017',
  LN_WHISKY:    '40000000-0000-4000-8000-000000000018',
  // Nantes Running (19-24)
  NA_LG_TV:     '40000000-0000-4000-8000-000000000019',   // drawn
  NA_TROTTINETTE:'40000000-0000-4000-8000-000000000020',  // pending
  NA_THERMOMIX: '40000000-0000-4000-8000-000000000021',
  NA_WEEKEND:   '40000000-0000-4000-8000-000000000022',
  NA_DECATHL:   '40000000-0000-4000-8000-000000000023',
  NA_VIN:       '40000000-0000-4000-8000-000000000024',
  // Toulouse Printemps (25-30)
  TL_IPHONE:    '40000000-0000-4000-8000-000000000025',
  TL_VELO:      '40000000-0000-4000-8000-000000000026',
  TL_SEJOUR:    '40000000-0000-4000-8000-000000000027',
  TL_SWITCH:    '40000000-0000-4000-8000-000000000028',
  TL_AIRFRYER:  '40000000-0000-4000-8000-000000000029',
  TL_BON:       '40000000-0000-4000-8000-000000000030',
  // Marseille Été (31-35)
  MA_TV:        '40000000-0000-4000-8000-000000000031',
  MA_BBQ:       '40000000-0000-4000-8000-000000000032',
  MA_CROISIERE: '40000000-0000-4000-8000-000000000033',
  MA_ROOMBA:    '40000000-0000-4000-8000-000000000034',
  MA_BON:       '40000000-0000-4000-8000-000000000035',
  // Strasbourg Pâques (36-40)
  ST_KITCHENAID:'40000000-0000-4000-8000-000000000036',
  ST_WEEKEND:   '40000000-0000-4000-8000-000000000037',
  ST_TABLET:    '40000000-0000-4000-8000-000000000038',
  ST_BIERES:    '40000000-0000-4000-8000-000000000039',
  ST_CULTURA:   '40000000-0000-4000-8000-000000000040',
  // Saintes Été 26 (41-45)
  SE_CANNE:     '40000000-0000-4000-8000-000000000041',
  SE_GLACIERE:  '40000000-0000-4000-8000-000000000042',
  SE_LEURRES:   '40000000-0000-4000-8000-000000000043',
  SE_DECATHL:   '40000000-0000-4000-8000-000000000044',
  SE_COMBI:     '40000000-0000-4000-8000-000000000045',
};

// IDs fixes des tirages
const TIR = {
  // Saintes Hiver 25 — 6 tirages terminés
  SH_1: 'a0000000-0000-4000-8000-000000000001',
  SH_2: 'a0000000-0000-4000-8000-000000000002',
  SH_3: 'a0000000-0000-4000-8000-000000000003',
  SH_4: 'a0000000-0000-4000-8000-000000000004',
  SH_5: 'a0000000-0000-4000-8000-000000000005',
  SH_6: 'a0000000-0000-4000-8000-000000000006',
  // Bordeaux Automne 25 — 7 tirages terminés
  BA_1: 'a0000000-0000-4000-8000-000000000011',
  BA_2: 'a0000000-0000-4000-8000-000000000012',
  BA_3: 'a0000000-0000-4000-8000-000000000013',
  BA_4: 'a0000000-0000-4000-8000-000000000014',
  BA_5: 'a0000000-0000-4000-8000-000000000015',
  BA_6: 'a0000000-0000-4000-8000-000000000016',
  BA_7: 'a0000000-0000-4000-8000-000000000017',
  // Lyon Noël 25 — 5 tirages terminés
  LN_1: 'a0000000-0000-4000-8000-000000000021',
  LN_2: 'a0000000-0000-4000-8000-000000000022',
  LN_3: 'a0000000-0000-4000-8000-000000000023',
  LN_4: 'a0000000-0000-4000-8000-000000000024',
  LN_5: 'a0000000-0000-4000-8000-000000000025',
  // Nantes Running — 1 terminé + 5 planifiés (draft)
  NA_1: 'a0000000-0000-4000-8000-000000000031', // completed (LG TV drawn)
  NA_2: 'a0000000-0000-4000-8000-000000000032', // draft
  NA_3: 'a0000000-0000-4000-8000-000000000033', // draft (pause)
  NA_4: 'a0000000-0000-4000-8000-000000000034', // draft
  NA_5: 'a0000000-0000-4000-8000-000000000035', // draft
  NA_6: 'a0000000-0000-4000-8000-000000000036', // draft
  // Toulouse Printemps — 6 tirages planifiés
  TL_1: 'a0000000-0000-4000-8000-000000000041',
  TL_2: 'a0000000-0000-4000-8000-000000000042',
  TL_3: 'a0000000-0000-4000-8000-000000000043',
  TL_4: 'a0000000-0000-4000-8000-000000000044',
  TL_5: 'a0000000-0000-4000-8000-000000000045',
  TL_6: 'a0000000-0000-4000-8000-000000000046',
  // Marseille Été — 5 tirages planifiés
  MA_1: 'a0000000-0000-4000-8000-000000000051',
  MA_2: 'a0000000-0000-4000-8000-000000000052',
  MA_3: 'a0000000-0000-4000-8000-000000000053',
  MA_4: 'a0000000-0000-4000-8000-000000000054',
  MA_5: 'a0000000-0000-4000-8000-000000000055',
  // Strasbourg Pâques — 5 tirages planifiés
  ST_1: 'a0000000-0000-4000-8000-000000000061',
  ST_2: 'a0000000-0000-4000-8000-000000000062',
  ST_3: 'a0000000-0000-4000-8000-000000000063',
  ST_4: 'a0000000-0000-4000-8000-000000000064',
  ST_5: 'a0000000-0000-4000-8000-000000000065',
  // Saintes Été 26 — 5 tirages planifiés (brouillon)
  SE_1: 'a0000000-0000-4000-8000-000000000071',
  SE_2: 'a0000000-0000-4000-8000-000000000072',
  SE_3: 'a0000000-0000-4000-8000-000000000073',
  SE_4: 'a0000000-0000-4000-8000-000000000074',
  SE_5: 'a0000000-0000-4000-8000-000000000075',
};

module.exports = {
  async up(queryInterface) {
    const now  = new Date();
    const past = (daysAgo, hour = 20) => {
      const d = new Date(now);
      d.setDate(d.getDate() - daysAgo);
      d.setHours(hour, 0, 0, 0);
      return d;
    };

    // ── 1. Tirages ────────────────────────────────────────────────────────────

    await queryInterface.bulkInsert('tirages', [

      // Saintes Hiver 25 — terminés
      { id: TIR.SH_1, session_id: SES.SAINTES_HIVER_25, type: 'quine',        order: 0, status: 'completed', started_at: past(90, 19), completed_at: past(90, 19), created_at: past(90), updated_at: past(90) },
      { id: TIR.SH_2, session_id: SES.SAINTES_HIVER_25, type: 'quine',        order: 1, status: 'completed', started_at: past(90, 19), completed_at: past(90, 19), created_at: past(90), updated_at: past(90) },
      { id: TIR.SH_3, session_id: SES.SAINTES_HIVER_25, type: 'double_quine', order: 2, status: 'completed', started_at: past(90, 20), completed_at: past(90, 20), created_at: past(90), updated_at: past(90) },
      { id: TIR.SH_4, session_id: SES.SAINTES_HIVER_25, type: 'double_quine', order: 3, status: 'completed', started_at: past(90, 20), completed_at: past(90, 20), created_at: past(90), updated_at: past(90) },
      { id: TIR.SH_5, session_id: SES.SAINTES_HIVER_25, type: 'carton_plein', order: 4, status: 'completed', started_at: past(90, 21), completed_at: past(90, 21), created_at: past(90), updated_at: past(90) },
      { id: TIR.SH_6, session_id: SES.SAINTES_HIVER_25, type: 'carton_plein', order: 5, status: 'completed', started_at: past(90, 21), completed_at: past(90, 21), created_at: past(90), updated_at: past(90) },

      // Bordeaux Automne 25 — terminés
      { id: TIR.BA_1, session_id: SES.BRDX_AUTOMNE_25, type: 'quine',        order: 0, status: 'completed', started_at: past(60, 19), completed_at: past(60, 19), created_at: past(60), updated_at: past(60) },
      { id: TIR.BA_2, session_id: SES.BRDX_AUTOMNE_25, type: 'quine',        order: 1, status: 'completed', started_at: past(60, 19), completed_at: past(60, 19), created_at: past(60), updated_at: past(60) },
      { id: TIR.BA_3, session_id: SES.BRDX_AUTOMNE_25, type: 'quine',        order: 2, status: 'completed', started_at: past(60, 20), completed_at: past(60, 20), created_at: past(60), updated_at: past(60) },
      { id: TIR.BA_4, session_id: SES.BRDX_AUTOMNE_25, type: 'double_quine', order: 3, status: 'completed', started_at: past(60, 20), completed_at: past(60, 20), created_at: past(60), updated_at: past(60) },
      { id: TIR.BA_5, session_id: SES.BRDX_AUTOMNE_25, type: 'double_quine', order: 4, status: 'completed', started_at: past(60, 20), completed_at: past(60, 20), created_at: past(60), updated_at: past(60) },
      { id: TIR.BA_6, session_id: SES.BRDX_AUTOMNE_25, type: 'carton_plein', order: 5, status: 'completed', started_at: past(60, 21), completed_at: past(60, 21), created_at: past(60), updated_at: past(60) },
      { id: TIR.BA_7, session_id: SES.BRDX_AUTOMNE_25, type: 'carton_plein', order: 6, status: 'completed', started_at: past(60, 21), completed_at: past(60, 21), created_at: past(60), updated_at: past(60) },

      // Lyon Noël 25 — terminés
      { id: TIR.LN_1, session_id: SES.LYON_NOEL_25, type: 'quine',        order: 0, status: 'completed', started_at: past(30, 19), completed_at: past(30, 19), created_at: past(30), updated_at: past(30) },
      { id: TIR.LN_2, session_id: SES.LYON_NOEL_25, type: 'quine',        order: 1, status: 'completed', started_at: past(30, 19), completed_at: past(30, 19), created_at: past(30), updated_at: past(30) },
      { id: TIR.LN_3, session_id: SES.LYON_NOEL_25, type: 'double_quine', order: 2, status: 'completed', started_at: past(30, 20), completed_at: past(30, 20), created_at: past(30), updated_at: past(30) },
      { id: TIR.LN_4, session_id: SES.LYON_NOEL_25, type: 'carton_plein', order: 3, status: 'completed', started_at: past(30, 20), completed_at: past(30, 20), created_at: past(30), updated_at: past(30) },
      { id: TIR.LN_5, session_id: SES.LYON_NOEL_25, type: 'carton_plein', order: 4, status: 'completed', started_at: past(30, 21), completed_at: past(30, 21), created_at: past(30), updated_at: past(30) },

      // Nantes Running — 1 terminé + 5 draft (avec une pause)
      { id: TIR.NA_1, session_id: SES.NANTES_RUNNING, type: 'quine',        order: 0, status: 'completed', started_at: past(1, 19), completed_at: past(1, 20), created_at: past(2), updated_at: past(1) },
      { id: TIR.NA_2, session_id: SES.NANTES_RUNNING, type: 'quine',        order: 1, status: 'draft',     started_at: null, completed_at: null, created_at: past(2), updated_at: past(2) },
      { id: TIR.NA_3, session_id: SES.NANTES_RUNNING, type: 'pause',        order: 2, status: 'draft',     started_at: null, completed_at: null, created_at: past(2), updated_at: past(2) },
      { id: TIR.NA_4, session_id: SES.NANTES_RUNNING, type: 'double_quine', order: 3, status: 'draft',     started_at: null, completed_at: null, created_at: past(2), updated_at: past(2) },
      { id: TIR.NA_5, session_id: SES.NANTES_RUNNING, type: 'carton_plein', order: 4, status: 'draft',     started_at: null, completed_at: null, created_at: past(2), updated_at: past(2) },
      { id: TIR.NA_6, session_id: SES.NANTES_RUNNING, type: 'carton_plein', order: 5, status: 'ready',     started_at: null, completed_at: null, created_at: past(2), updated_at: past(2) },

      // Toulouse Printemps — planifiés
      { id: TIR.TL_1, session_id: SES.TLSE_PRINTEMPS, type: 'quine',        order: 0, status: 'draft', started_at: null, completed_at: null, created_at: past(5), updated_at: past(5) },
      { id: TIR.TL_2, session_id: SES.TLSE_PRINTEMPS, type: 'quine',        order: 1, status: 'draft', started_at: null, completed_at: null, created_at: past(5), updated_at: past(5) },
      { id: TIR.TL_3, session_id: SES.TLSE_PRINTEMPS, type: 'double_quine', order: 2, status: 'ready', started_at: null, completed_at: null, created_at: past(5), updated_at: past(5) },
      { id: TIR.TL_4, session_id: SES.TLSE_PRINTEMPS, type: 'double_quine', order: 3, status: 'draft', started_at: null, completed_at: null, created_at: past(5), updated_at: past(5) },
      { id: TIR.TL_5, session_id: SES.TLSE_PRINTEMPS, type: 'carton_plein', order: 4, status: 'ready', started_at: null, completed_at: null, created_at: past(5), updated_at: past(5) },
      { id: TIR.TL_6, session_id: SES.TLSE_PRINTEMPS, type: 'carton_plein', order: 5, status: 'draft', started_at: null, completed_at: null, created_at: past(5), updated_at: past(5) },

      // Marseille Été — planifiés
      { id: TIR.MA_1, session_id: SES.MARS_ETE, type: 'quine',        order: 0, status: 'draft', started_at: null, completed_at: null, created_at: past(3), updated_at: past(3) },
      { id: TIR.MA_2, session_id: SES.MARS_ETE, type: 'quine',        order: 1, status: 'draft', started_at: null, completed_at: null, created_at: past(3), updated_at: past(3) },
      { id: TIR.MA_3, session_id: SES.MARS_ETE, type: 'double_quine', order: 2, status: 'draft', started_at: null, completed_at: null, created_at: past(3), updated_at: past(3) },
      { id: TIR.MA_4, session_id: SES.MARS_ETE, type: 'carton_plein', order: 3, status: 'draft', started_at: null, completed_at: null, created_at: past(3), updated_at: past(3) },
      { id: TIR.MA_5, session_id: SES.MARS_ETE, type: 'carton_plein', order: 4, status: 'draft', started_at: null, completed_at: null, created_at: past(3), updated_at: past(3) },

      // Strasbourg Pâques — planifiés
      { id: TIR.ST_1, session_id: SES.STRASB_PAQUES, type: 'quine',        order: 0, status: 'draft', started_at: null, completed_at: null, created_at: past(4), updated_at: past(4) },
      { id: TIR.ST_2, session_id: SES.STRASB_PAQUES, type: 'quine',        order: 1, status: 'draft', started_at: null, completed_at: null, created_at: past(4), updated_at: past(4) },
      { id: TIR.ST_3, session_id: SES.STRASB_PAQUES, type: 'double_quine', order: 2, status: 'draft', started_at: null, completed_at: null, created_at: past(4), updated_at: past(4) },
      { id: TIR.ST_4, session_id: SES.STRASB_PAQUES, type: 'carton_plein', order: 3, status: 'draft', started_at: null, completed_at: null, created_at: past(4), updated_at: past(4) },
      { id: TIR.ST_5, session_id: SES.STRASB_PAQUES, type: 'carton_plein', order: 4, status: 'draft', started_at: null, completed_at: null, created_at: past(4), updated_at: past(4) },

      // Saintes Été 26 — brouillons
      { id: TIR.SE_1, session_id: SES.SAINTES_ETE_26, type: 'quine',        order: 0, status: 'draft', started_at: null, completed_at: null, created_at: past(7), updated_at: past(7) },
      { id: TIR.SE_2, session_id: SES.SAINTES_ETE_26, type: 'quine',        order: 1, status: 'draft', started_at: null, completed_at: null, created_at: past(7), updated_at: past(7) },
      { id: TIR.SE_3, session_id: SES.SAINTES_ETE_26, type: 'double_quine', order: 2, status: 'draft', started_at: null, completed_at: null, created_at: past(7), updated_at: past(7) },
      { id: TIR.SE_4, session_id: SES.SAINTES_ETE_26, type: 'carton_plein', order: 3, status: 'draft', started_at: null, completed_at: null, created_at: past(7), updated_at: past(7) },
      { id: TIR.SE_5, session_id: SES.SAINTES_ETE_26, type: 'carton_plein', order: 4, status: 'draft', started_at: null, completed_at: null, created_at: past(7), updated_at: past(7) },
    ]);

    // ── 2. Tirage_lots ────────────────────────────────────────────────────────
    // Associer les lots aux tirages (1 lot par tirage pour les sessions terminées,
    // plusieurs lots possibles sur les sessions planifiées)

    await queryInterface.bulkInsert('tirage_lots', [

      // Saintes Hiver 25 (1 lot/tirage, lots 01-06)
      { tirage_id: TIR.SH_1, lot_id: LOT.SH_MOET,    order: 0 },
      { tirage_id: TIR.SH_2, lot_id: LOT.SH_SPA,     order: 0 },
      { tirage_id: TIR.SH_3, lot_id: LOT.SH_DECATHL, order: 0 },
      { tirage_id: TIR.SH_4, lot_id: LOT.SH_COOKEO,  order: 0 },
      { tirage_id: TIR.SH_5, lot_id: LOT.SH_VELO,    order: 0 },
      { tirage_id: TIR.SH_6, lot_id: LOT.SH_TV,      order: 0 },

      // Bordeaux Automne 25
      { tirage_id: TIR.BA_1, lot_id: LOT.BA_RESTAU,    order: 0 },
      { tirage_id: TIR.BA_2, lot_id: LOT.BA_NESPRESSO, order: 0 },
      { tirage_id: TIR.BA_3, lot_id: LOT.BA_JBL,       order: 0 },
      { tirage_id: TIR.BA_4, lot_id: LOT.BA_AIRFRYER,  order: 0 },
      { tirage_id: TIR.BA_5, lot_id: LOT.BA_WEEKEND,   order: 0 },
      { tirage_id: TIR.BA_6, lot_id: LOT.BA_IPAD,      order: 0 },
      { tirage_id: TIR.BA_7, lot_id: LOT.BA_PS5,       order: 0 },

      // Lyon Noël 25
      { tirage_id: TIR.LN_1, lot_id: LOT.LN_WHISKY,  order: 0 },
      { tirage_id: TIR.LN_2, lot_id: LOT.LN_AMAZON,  order: 0 },
      { tirage_id: TIR.LN_3, lot_id: LOT.LN_GOURMET, order: 0 },
      { tirage_id: TIR.LN_4, lot_id: LOT.LN_INSTAX,  order: 0 },
      { tirage_id: TIR.LN_5, lot_id: LOT.LN_SONY,    order: 0 },

      // Nantes Running — 1 terminé + 4 planifiés avec lots (NA_3 = pause, pas de lot)
      { tirage_id: TIR.NA_1, lot_id: LOT.NA_LG_TV,      order: 0 },
      { tirage_id: TIR.NA_2, lot_id: LOT.NA_VIN,        order: 0 },
      { tirage_id: TIR.NA_4, lot_id: LOT.NA_DECATHL,    order: 0 },
      { tirage_id: TIR.NA_5, lot_id: LOT.NA_WEEKEND,    order: 0 },
      { tirage_id: TIR.NA_5, lot_id: LOT.NA_TROTTINETTE,order: 1 },
      { tirage_id: TIR.NA_6, lot_id: LOT.NA_THERMOMIX,  order: 0 },

      // Toulouse Printemps — multi-lots sur les cartons pleins
      { tirage_id: TIR.TL_1, lot_id: LOT.TL_BON,     order: 0 },
      { tirage_id: TIR.TL_2, lot_id: LOT.TL_AIRFRYER, order: 0 },
      { tirage_id: TIR.TL_3, lot_id: LOT.TL_SWITCH,   order: 0 },
      { tirage_id: TIR.TL_4, lot_id: LOT.TL_SEJOUR,   order: 0 },
      { tirage_id: TIR.TL_5, lot_id: LOT.TL_VELO,     order: 0 },
      { tirage_id: TIR.TL_6, lot_id: LOT.TL_IPHONE,   order: 0 },

      // Marseille Été
      { tirage_id: TIR.MA_1, lot_id: LOT.MA_BON,      order: 0 },
      { tirage_id: TIR.MA_2, lot_id: LOT.MA_ROOMBA,   order: 0 },
      { tirage_id: TIR.MA_3, lot_id: LOT.MA_BBQ,      order: 0 },
      { tirage_id: TIR.MA_4, lot_id: LOT.MA_TV,       order: 0 },
      { tirage_id: TIR.MA_5, lot_id: LOT.MA_CROISIERE,order: 0 },

      // Strasbourg Pâques
      { tirage_id: TIR.ST_1, lot_id: LOT.ST_CULTURA,    order: 0 },
      { tirage_id: TIR.ST_2, lot_id: LOT.ST_BIERES,     order: 0 },
      { tirage_id: TIR.ST_3, lot_id: LOT.ST_TABLET,     order: 0 },
      { tirage_id: TIR.ST_4, lot_id: LOT.ST_WEEKEND,    order: 0 },
      { tirage_id: TIR.ST_5, lot_id: LOT.ST_KITCHENAID, order: 0 },

      // Saintes Été 26
      { tirage_id: TIR.SE_1, lot_id: LOT.SE_DECATHL, order: 0 },
      { tirage_id: TIR.SE_2, lot_id: LOT.SE_LEURRES, order: 0 },
      { tirage_id: TIR.SE_3, lot_id: LOT.SE_GLACIERE, order: 0 },
      { tirage_id: TIR.SE_4, lot_id: LOT.SE_CANNE,   order: 0 },
      { tirage_id: TIR.SE_5, lot_id: LOT.SE_COMBI,   order: 0 },
    ]);
  },

  async down(queryInterface) {
    const tirageIds = Object.values({
      SH_1: 'a0000000-0000-4000-8000-000000000001',
      SH_2: 'a0000000-0000-4000-8000-000000000002',
      SH_3: 'a0000000-0000-4000-8000-000000000003',
      SH_4: 'a0000000-0000-4000-8000-000000000004',
      SH_5: 'a0000000-0000-4000-8000-000000000005',
      SH_6: 'a0000000-0000-4000-8000-000000000006',
      BA_1: 'a0000000-0000-4000-8000-000000000011',
      BA_2: 'a0000000-0000-4000-8000-000000000012',
      BA_3: 'a0000000-0000-4000-8000-000000000013',
      BA_4: 'a0000000-0000-4000-8000-000000000014',
      BA_5: 'a0000000-0000-4000-8000-000000000015',
      BA_6: 'a0000000-0000-4000-8000-000000000016',
      BA_7: 'a0000000-0000-4000-8000-000000000017',
      LN_1: 'a0000000-0000-4000-8000-000000000021',
      LN_2: 'a0000000-0000-4000-8000-000000000022',
      LN_3: 'a0000000-0000-4000-8000-000000000023',
      LN_4: 'a0000000-0000-4000-8000-000000000024',
      LN_5: 'a0000000-0000-4000-8000-000000000025',
      NA_1: 'a0000000-0000-4000-8000-000000000031',
      NA_2: 'a0000000-0000-4000-8000-000000000032',
      NA_3: 'a0000000-0000-4000-8000-000000000033',
      NA_4: 'a0000000-0000-4000-8000-000000000034',
      NA_5: 'a0000000-0000-4000-8000-000000000035',
      NA_6: 'a0000000-0000-4000-8000-000000000036',
      TL_1: 'a0000000-0000-4000-8000-000000000041',
      TL_2: 'a0000000-0000-4000-8000-000000000042',
      TL_3: 'a0000000-0000-4000-8000-000000000043',
      TL_4: 'a0000000-0000-4000-8000-000000000044',
      TL_5: 'a0000000-0000-4000-8000-000000000045',
      TL_6: 'a0000000-0000-4000-8000-000000000046',
      MA_1: 'a0000000-0000-4000-8000-000000000051',
      MA_2: 'a0000000-0000-4000-8000-000000000052',
      MA_3: 'a0000000-0000-4000-8000-000000000053',
      MA_4: 'a0000000-0000-4000-8000-000000000054',
      MA_5: 'a0000000-0000-4000-8000-000000000055',
      ST_1: 'a0000000-0000-4000-8000-000000000061',
      ST_2: 'a0000000-0000-4000-8000-000000000062',
      ST_3: 'a0000000-0000-4000-8000-000000000063',
      ST_4: 'a0000000-0000-4000-8000-000000000064',
      ST_5: 'a0000000-0000-4000-8000-000000000065',
      SE_1: 'a0000000-0000-4000-8000-000000000071',
      SE_2: 'a0000000-0000-4000-8000-000000000072',
      SE_3: 'a0000000-0000-4000-8000-000000000073',
      SE_4: 'a0000000-0000-4000-8000-000000000074',
      SE_5: 'a0000000-0000-4000-8000-000000000075',
    });

    await queryInterface.bulkDelete('tirage_lots', { tirage_id: tirageIds });
    await queryInterface.bulkDelete('tirages',     { id: tirageIds });
  },
};
