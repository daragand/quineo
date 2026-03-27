'use client'

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      style={{
        padding:      '7px 18px',
        background:   '#EF9F27',
        color:        '#2C1500',
        border:       'none',
        borderRadius: 7,
        fontWeight:   700,
        fontSize:     13,
        cursor:       'pointer',
      }}
    >
      🖨 Imprimer
    </button>
  )
}
