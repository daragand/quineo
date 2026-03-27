/**
 * Composants @react-pdf/renderer pour les cartons de loto.
 * Utilisé côté serveur uniquement (route API).
 *
 * A4 = 595 × 842 pt
 * Marges 15pt → zone utile : 565 × 812 pt
 * 2 cartons + ligne de coupe (10pt) → ~400pt par carton
 * En-tête ~40pt → grille ~360pt → 3 lignes × ~120pt
 */
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'

const s = StyleSheet.create({
  page: {
    backgroundColor:   '#ffffff',
    paddingVertical:   15,
    paddingHorizontal: 15,
    fontFamily:        'Helvetica',
    flexDirection:     'column',
  },

  // ─── Carton : remplit flex-1 de son slot ───────────────────────────────────
  carton: {
    flex:         1,
    border:       '2pt solid #111827',
    borderRadius: 4,
    overflow:     'hidden',
    flexDirection: 'column',
  },

  // ─── En-tête ───────────────────────────────────────────────────────────────
  header: {
    backgroundColor:   '#0b1220',
    paddingVertical:   11,
    paddingHorizontal: 16,
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'center',
  },
  headerTitle: {
    color:         '#ffffff',
    fontSize:      15,
    fontFamily:    'Helvetica-Bold',
    letterSpacing: 0.5,
  },
  headerBadge: {
    backgroundColor:   '#EF9F27',
    color:             '#2C1500',
    fontSize:          17,
    fontFamily:        'Helvetica-Bold',
    paddingVertical:   5,
    paddingHorizontal: 14,
    borderRadius:      4,
    letterSpacing:     1,
  },

  // ─── Grille : prend tout l'espace restant sous l'en-tête ──────────────────
  grid: {
    flex:          1,
    flexDirection: 'column',
  },
  row: {
    flex:          1,          // chaque ligne occupe 1/3 de la grille
    flexDirection: 'row',
    borderTop:     '1.5pt solid #111827',
  },
  cell: {
    flex:           1,         // chaque cellule occupe 1/9 de la ligne
    alignItems:     'center',
    justifyContent: 'center',
    borderRight:    '1pt solid #cccccc',
  },
  cellFilled: {
    backgroundColor: '#ffffff',
  },
  cellEmpty: {
    backgroundColor: '#111827',
  },
  cellNumber: {
    fontSize:   38,
    fontFamily: 'Helvetica-Bold',
    color:      '#111827',
  },

  // ─── Ligne de découpe entre les 2 cartons ─────────────────────────────────
  cutWrapper: {
    paddingVertical: 5,
    alignItems:      'center',
  },
  cutLine: {
    width:     '100%',
    borderTop: '1pt dashed #aaaaaa',
  },
  cutIcon: {
    fontSize:        12,
    color:           '#aaaaaa',
    marginTop:       -9,
    backgroundColor: '#ffffff',
    paddingHorizontal: 4,
  },
})

// ── Composant carton individuel ───────────────────────────────────────────────

function CartonPdf({ grid, serial, session }: {
  grid:    number[][]
  serial:  string
  session: string
}) {
  return (
    <View style={s.carton}>
      <View style={s.header}>
        <Text style={s.headerTitle}>{session.toUpperCase()}</Text>
        <Text style={s.headerBadge}>{serial}</Text>
      </View>

      <View style={s.grid}>
        {grid.map((row, r) => (
          <View key={r} style={s.row}>
            {row.map((cell, c) => (
              <View
                key={c}
                style={[
                  s.cell,
                  cell > 0 ? s.cellFilled : s.cellEmpty,
                  c === 8 ? { borderRight: undefined } : {},
                ]}
              >
                {cell > 0 && <Text style={s.cellNumber}>{cell}</Text>}
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  )
}

// ── Document complet ──────────────────────────────────────────────────────────

export interface CartonPdfData {
  id:     string
  serial: string
  grid:   number[][]
}

export function CartonsPdfDocument({
  cartons,
  sessionName,
}: {
  cartons:     CartonPdfData[]
  sessionName: string
}) {
  const pages: CartonPdfData[][] = []
  for (let i = 0; i < cartons.length; i += 2) {
    pages.push(cartons.slice(i, i + 2))
  }

  return (
    <Document
      title={`Cartons — ${sessionName}`}
      author="Quineo"
      creator="Quineo"
    >
      {pages.map((pair, pi) => (
        <Page key={pi} style={s.page} size="A4">
          <CartonPdf
            grid={pair[0].grid}
            serial={pair[0].serial}
            session={sessionName}
          />

          {pair[1] ? (
            <>
              {/* Ligne de découpe */}
              <View style={s.cutWrapper}>
                <View style={s.cutLine} />
                <Text style={s.cutIcon}>✂</Text>
              </View>

              <CartonPdf
                grid={pair[1].grid}
                serial={pair[1].serial}
                session={sessionName}
              />
            </>
          ) : (
            // Page avec un seul carton : espacer visuellement
            <View style={{ flex: 1 }} />
          )}
        </Page>
      ))}
    </Document>
  )
}
