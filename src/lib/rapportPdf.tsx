/**
 * Composant @react-pdf/renderer — Rapport financier.
 * Utilisé côté serveur uniquement (route API).
 */
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import type { SessionStat, MonthlyPoint } from './services/rapports'

// ─── Palette ─────────────────────────────────────────────────────────────────

const C = {
  navy:      '#0b1220',
  navyMid:   '#1e2d45',
  amber:     '#EF9F27',
  amberDeep: '#2C1500',
  white:     '#ffffff',
  text:      '#1e293b',
  textSec:   '#475569',
  textHint:  '#94a3b8',
  sep:       '#e2e8f0',
  bg:        '#f8fafc',
  green:     '#16a34a',
  orange:    '#ea580c',
}

const MONTHS_FR = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

// ─── Styles ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: {
    fontFamily:      'Helvetica',
    backgroundColor: C.bg,
    paddingTop:      28,
    paddingBottom:   40,
    paddingHorizontal: 28,
    fontSize:        10,
    color:           C.text,
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    backgroundColor: C.navy,
    borderRadius:    8,
    padding:         20,
    marginBottom:    14,
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'flex-end',
  },
  logoBox: {
    backgroundColor: C.amber,
    width:           26,
    height:          26,
    borderRadius:    5,
    alignItems:      'center',
    justifyContent:  'center',
  },
  logoText: {
    color:      C.amberDeep,
    fontSize:   15,
    fontFamily: 'Helvetica-Bold',
  },
  headerTitle: {
    color:      C.white,
    fontSize:   20,
    fontFamily: 'Helvetica-Bold',
    marginTop:  10,
  },
  headerSub: {
    color:     'rgba(255,255,255,0.45)',
    fontSize:  10,
    marginTop:  3,
  },
  headerYear: {
    color:      C.amber,
    fontSize:   38,
    fontFamily: 'Helvetica-Bold',
    textAlign:  'right',
  },
  headerDate: {
    color:     'rgba(255,255,255,0.3)',
    fontSize:   9,
    textAlign:  'right',
    marginTop:  2,
  },

  // ── KPIs ────────────────────────────────────────────────────────────────────
  kpiRow: {
    flexDirection: 'row',
    marginBottom:  12,
  },
  kpi: {
    flex:              1,
    backgroundColor:   C.white,
    borderRadius:      6,
    padding:           12,
    borderWidth:       0.5,
    borderColor:       C.sep,
    borderStyle:       'solid',
    marginRight:       8,
  },
  kpiLast: {
    marginRight: 0,
  },
  kpiLabel: {
    fontSize:   8,
    color:      C.textHint,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 5,
  },
  kpiValue: {
    fontSize:   22,
    fontFamily: 'Helvetica-Bold',
    color:      C.text,
    lineHeight: 1,
  },
  kpiValueAmber: {
    fontSize:   22,
    fontFamily: 'Helvetica-Bold',
    color:      C.amber,
    lineHeight: 1,
  },
  kpiSub: {
    fontSize:  8,
    color:     C.textSec,
    marginTop: 3,
  },

  // ── Section card ────────────────────────────────────────────────────────────
  card: {
    backgroundColor: C.white,
    borderRadius:    6,
    borderWidth:     0.5,
    borderColor:     C.sep,
    borderStyle:     'solid',
    marginBottom:    10,
    overflow:        'hidden',
  },
  cardHeader: {
    paddingHorizontal: 14,
    paddingVertical:   8,
    borderBottomWidth: 0.5,
    borderBottomColor: C.sep,
    borderBottomStyle: 'solid',
  },
  cardTitle: {
    fontSize:   8,
    fontFamily: 'Helvetica-Bold',
    color:      C.textHint,
  },

  // ── Bar chart ───────────────────────────────────────────────────────────────
  chartArea: {
    flexDirection: 'row',
    alignItems:    'flex-end',
    height:        70,
    paddingHorizontal: 14,
    paddingTop:    10,
    paddingBottom: 0,
  },
  chartCol: {
    flex:           1,
    alignItems:     'center',
    flexDirection:  'column',
    justifyContent: 'flex-end',
  },
  chartBar: {
    width:        '72%',
    borderRadius: 2,
    minHeight:    2,
  },
  chartLabelRow: {
    flexDirection:     'row',
    paddingHorizontal: 14,
    paddingBottom:     10,
    marginTop:         4,
  },
  chartLabel: {
    flex:      1,
    fontSize:  7,
    color:     C.textHint,
    textAlign: 'center',
  },

  // ── Table ───────────────────────────────────────────────────────────────────
  tableHead: {
    flexDirection:     'row',
    paddingHorizontal: 14,
    paddingVertical:   7,
    borderBottomWidth: 0.5,
    borderBottomColor: C.sep,
    borderBottomStyle: 'solid',
    backgroundColor:   C.bg,
  },
  tableRow: {
    flexDirection:     'row',
    paddingHorizontal: 14,
    paddingVertical:   8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f1f5f9',
    borderBottomStyle: 'solid',
    alignItems:        'center',
  },
  tableRowTotal: {
    flexDirection:     'row',
    paddingHorizontal: 14,
    paddingVertical:   9,
    backgroundColor:   C.bg,
    borderTopWidth:    1,
    borderTopColor:    C.sep,
    borderTopStyle:    'solid',
    alignItems:        'center',
  },
  th: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: C.textHint },
  td: { fontSize:  9,  color: C.textSec },
  tdBold: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.text },
  tdAmber: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: C.amber },

  cSession:  { flex: 3 },
  cDate:     { flex: 2 },
  cCartons:  { flex: 1.8, textAlign: 'right' },
  cTaux:     { flex: 1,   textAlign: 'right' },
  cPartic:   { flex: 1.2, textAlign: 'right' },
  cRecettes: { flex: 2,   textAlign: 'right' },

  // ── Footer ──────────────────────────────────────────────────────────────────
  footer: {
    position:   'absolute',
    bottom:     18,
    left:       28,
    right:      28,
    flexDirection:  'row',
    justifyContent: 'space-between',
    borderTopWidth: 0.5,
    borderTopColor: C.sep,
    borderTopStyle: 'solid',
    paddingTop:     8,
  },
  footerText: { fontSize: 8, color: C.textHint },
})

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function fmtEur(n: number): string {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
}

function tauxColor(taux: number): string {
  if (taux >= 90) return C.green
  if (taux >= 60) return C.amber
  return C.orange
}

// ─── Document ────────────────────────────────────────────────────────────────

export interface RapportPdfProps {
  sessions:        SessionStat[]
  monthly:         MonthlyPoint[]
  associationName: string
  year:            string
}

export function RapportPdfDocument({ sessions, monthly, associationName, year }: RapportPdfProps) {
  const totalRecettes     = sessions.reduce((s, r) => s + r.recettes, 0)
  const totalCartons      = sessions.reduce((s, r) => s + r.cartonsSold, 0)
  const totalParticipants = sessions.reduce((s, r) => s + r.participants, 0)
  const avgRemplissage    = sessions.length > 0
    ? Math.round(sessions.reduce((s, r) => s + (r.cartonsMax > 0 ? (r.cartonsSold / r.cartonsMax) * 100 : 0), 0) / sessions.length)
    : 0

  const monthlyValues = Array.from({ length: 12 }, (_, i) => monthly.find(d => d.month === i + 1)?.total ?? 0)
  const maxVal = Math.max(...monthlyValues, 1)

  const generatedAt = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <Document title={`Rapport ${year} — ${associationName}`} author="Quinova" creator="Quinova">
      <Page size="A4" style={s.page}>

        {/* ── Header ── */}
        <View style={s.header}>
          <View>
            <View style={s.logoBox}>
              <Text style={s.logoText}>Q</Text>
            </View>
            <Text style={s.headerTitle}>Rapport financier</Text>
            <Text style={s.headerSub}>{associationName}</Text>
          </View>
          <View>
            <Text style={s.headerYear}>{year}</Text>
            <Text style={s.headerDate}>Généré le {generatedAt}</Text>
          </View>
        </View>

        {/* ── KPIs ── */}
        <View style={s.kpiRow}>
          {[
            { label: 'RECETTES TOTALES',     value: fmtEur(totalRecettes),               amber: true,  sub: `${sessions.length} session${sessions.length > 1 ? 's' : ''}` },
            { label: 'CARTONS VENDUS',        value: totalCartons.toLocaleString('fr-FR'), amber: false, sub: `Remplissage moy. ${avgRemplissage} %` },
            { label: 'PARTICIPANTS UNIQUES',  value: totalParticipants.toLocaleString('fr-FR'), amber: false, sub: sessions.length > 0 ? `Moy. ${Math.round(totalParticipants / sessions.length)}/session` : '—' },
            { label: 'SESSIONS ORGANISÉES',  value: String(sessions.length),              amber: false, sub: 'sur la période' },
          ].map((k, i, arr) => (
            <View key={k.label} style={[s.kpi, i === arr.length - 1 ? s.kpiLast : {}]}>
              <Text style={s.kpiLabel}>{k.label}</Text>
              <Text style={k.amber ? s.kpiValueAmber : s.kpiValue}>{k.value}</Text>
              <Text style={s.kpiSub}>{k.sub}</Text>
            </View>
          ))}
        </View>

        {/* ── Bar chart mensuel ── */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <Text style={s.cardTitle}>RECETTES MENSUELLES {year}</Text>
          </View>
          <View style={s.chartArea}>
            {monthlyValues.map((val, i) => {
              const barH = Math.max((val / maxVal) * 52, val > 0 ? 2 : 0)
              return (
                <View key={i} style={s.chartCol}>
                  <View style={[s.chartBar, {
                    height:          barH,
                    backgroundColor: val > 0 ? C.amber : C.sep,
                    opacity:         val > 0 ? 1 : 0.4,
                  }]} />
                </View>
              )
            })}
          </View>
          <View style={s.chartLabelRow}>
            {MONTHS_FR.map(m => (
              <Text key={m} style={s.chartLabel}>{m}</Text>
            ))}
          </View>
        </View>

        {/* ── Tableau sessions ── */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <Text style={s.cardTitle}>DÉTAIL PAR SESSION</Text>
          </View>

          {/* En-tête tableau */}
          <View style={s.tableHead}>
            <Text style={[s.th, s.cSession]}>Session</Text>
            <Text style={[s.th, s.cDate]}>Date</Text>
            <Text style={[s.th, s.cCartons]}>Cartons</Text>
            <Text style={[s.th, s.cTaux]}>Taux</Text>
            <Text style={[s.th, s.cPartic]}>Partic.</Text>
            <Text style={[s.th, s.cRecettes]}>Recettes</Text>
          </View>

          {sessions.length === 0 && (
            <View style={{ padding: 20 }}>
              <Text style={[s.td, { textAlign: 'center', color: C.textHint }]}>Aucune session sur la période</Text>
            </View>
          )}

          {sessions.map((r) => {
            const taux = r.cartonsMax > 0 ? Math.round((r.cartonsSold / r.cartonsMax) * 100) : null
            return (
              <View key={r.id} style={s.tableRow}>
                <Text style={[s.tdBold, s.cSession]}>{r.name.length > 40 ? r.name.slice(0, 38) + '…' : r.name}</Text>
                <Text style={[s.td,     s.cDate]}>{fmtDate(r.date)}</Text>
                <Text style={[s.td,     s.cCartons]}>{r.cartonsSold}{r.cartonsMax > 0 ? ` / ${r.cartonsMax}` : ''}</Text>
                <Text style={[s.td,     s.cTaux, taux !== null ? { color: tauxColor(taux) } : {}]}>
                  {taux !== null ? `${taux} %` : '—'}
                </Text>
                <Text style={[s.td,     s.cPartic]}>{r.participants}</Text>
                <Text style={[s.tdAmber, s.cRecettes]}>{r.recettes > 0 ? fmtEur(r.recettes) : '—'}</Text>
              </View>
            )
          })}

          {sessions.length > 0 && (
            <View style={s.tableRowTotal}>
              <Text style={[s.tdBold, s.cSession]}>Total</Text>
              <Text style={[s.td,    s.cDate]} />
              <Text style={[s.tdBold, s.cCartons]}>{totalCartons.toLocaleString('fr-FR')}</Text>
              <Text style={[s.tdBold, s.cTaux]}>{avgRemplissage} %</Text>
              <Text style={[s.tdBold, s.cPartic]}>{totalParticipants.toLocaleString('fr-FR')}</Text>
              <Text style={[s.tdAmber, s.cRecettes, { fontSize: 13 }]}>{fmtEur(totalRecettes)}</Text>
            </View>
          )}
        </View>

        {/* ── Footer ── */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>Quinova — Gestion de loto associatif</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`} />
        </View>

      </Page>
    </Document>
  )
}
