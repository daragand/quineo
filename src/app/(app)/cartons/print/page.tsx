import { db } from '@/lib/db'
import { getServerUser } from '@/lib/auth-server'
import { Op } from 'sequelize'
import { notFound } from 'next/navigation'
import { PrintButton } from './PrintButton'

// ─────────────────────────────────────────
// Grille d'un carton — optimisée pour impression A5
// ─────────────────────────────────────────

function CartonGrid({ grid, serial, session }: {
  grid:    number[][]
  serial:  string
  session: string
}) {
  return (
    <div style={{
      width:      '100%',
      fontFamily: 'Arial, sans-serif',
      border:     '2px solid #111',
      borderRadius: 5,
      overflow:   'hidden',
    }}>
      {/* En-tête */}
      <div style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        padding:        '6px 12px',
        background:     '#0b1220',
      }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: 'white', letterSpacing: '.04em' }}>
          {session}
        </span>
        <span style={{
          fontWeight:   700,
          fontSize:     15,
          background:   '#EF9F27',
          color:        '#2C1500',
          padding:      '3px 14px',
          borderRadius: 4,
          letterSpacing: '.08em',
        }}>
          {serial}
        </span>
      </div>

      {/* Lignes de jeu */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {grid.map((row, r) => (
          <div key={r} style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(9, 1fr)',
            borderTop: r > 0 ? '1.5px solid #111' : undefined,
          }}>
            {row.map((cell, c) => (
              <div key={c} style={{
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                height:         42,
                fontWeight:     700,
                fontSize:       18,
                background:     cell > 0 ? 'white' : '#111827',
                color:          cell > 0 ? '#111827' : 'transparent',
                borderRight:    c < 8 ? '1px solid #ccc' : undefined,
              }}>
                {cell > 0 ? cell : null}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// Page
// ─────────────────────────────────────────

export default async function PrintPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const user = await getServerUser()
  if (!user) notFound()

  const sp        = await searchParams
  const sessionId = typeof sp.sessionId === 'string' ? sp.sessionId : null
  const idsParam  = typeof sp.ids       === 'string' ? sp.ids       : null

  if (!sessionId) notFound()

  const session = await db.Session.findOne({
    where:      { id: sessionId, association_id: user.association_id },
    attributes: ['id', 'name'],
    raw:        true,
  }) as { id: string; name: string } | null
  if (!session) notFound()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { session_id: sessionId }
  if (idsParam) {
    const ids = idsParam.split(',').map((s) => s.trim()).filter(Boolean)
    if (ids.length) where.id = { [Op.in]: ids }
  }

  const rows = await db.Carton.findAll({
    where,
    attributes: ['id', 'serial_number', 'grid'],
    order:      [['serial_number', 'ASC']],
    raw:        true,
  }) as unknown as Array<{ id: string; serial_number: string; grid: number[][] }>

  // Grouper par paires (2 cartons par page A4)
  const pages: Array<typeof rows> = []
  for (let i = 0; i < rows.length; i += 2) {
    pages.push(rows.slice(i, i + 2))
  }

  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <title>Cartons — {session.name}</title>
        <style>{`
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          * { box-sizing: border-box; }
          html, body {
            margin: 0;
            padding: 0;
            background: white;
            font-family: Arial, sans-serif;
          }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .no-print { display: none !important; }
          }
          .no-print {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 20px;
            border-bottom: 1px solid #ddd;
            background: #f9fafb;
          }
          /* Chaque .a4-page occupe exactement une page A4 */
          .a4-page {
            width: 190mm;
            height: 277mm;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            justify-content: space-evenly;
            padding: 6mm 0;
            page-break-after: always;
            break-after: page;
          }
          .a4-page:last-child {
            page-break-after: auto;
            break-after: auto;
          }
          /* Séparateur de découpe entre les deux cartons */
          .cut-line {
            border: none;
            border-top: 1px dashed #aaa;
            margin: 4mm 0;
          }
          .cut-line::before {
            content: '✂';
            display: block;
            text-align: center;
            margin-top: -10px;
            font-size: 14px;
            color: #aaa;
            background: white;
            width: 20px;
            margin-left: auto;
            margin-right: auto;
          }
        `}</style>
      </head>
      <body>
        {/* Barre d'action — masquée à l'impression */}
        <div className="no-print">
          <div>
            <strong style={{ fontSize: 14 }}>{session.name}</strong>
            <span style={{ marginLeft: 12, fontSize: 12, color: '#666' }}>
              {rows.length} carton{rows.length > 1 ? 's' : ''} — {pages.length} page{pages.length > 1 ? 's' : ''}
            </span>
          </div>
          <PrintButton />
        </div>

        {/* Pages imprimables */}
        {pages.map((pair, pi) => (
          <div key={pi} className="a4-page">
            <CartonGrid
              grid={pair[0].grid}
              serial={pair[0].serial_number}
              session={session.name}
            />
            {pair[1] && (
              <>
                <hr className="cut-line" />
                <CartonGrid
                  grid={pair[1].grid}
                  serial={pair[1].serial_number}
                  session={session.name}
                />
              </>
            )}
          </div>
        ))}
      </body>
    </html>
  )
}
