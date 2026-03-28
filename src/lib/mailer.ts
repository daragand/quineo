/**
 * Service d'envoi d'emails via Resend.
 * Ce module ne contient que la logique d'envoi.
 * Les templates HTML sont dans src/lib/emails/.
 */

import { Resend } from 'resend'
import React from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import { CartonsPdfDocument, type CartonPdfData } from './cartonPdf'
import { buildOrderConfirmationHtml } from './emails/orderConfirmation'
import { buildReminderHtml }          from './emails/reminder'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM    = process.env.EMAIL_FROM ?? 'Quineo <commandes@quineo.fr>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://quineo.fr'

// ─────────────────────────────────────────
// Types publics
// ─────────────────────────────────────────

export type { CartonPdfData }

export interface OrderMailOptions {
  to:              string
  firstName:       string
  lastName:        string
  sessionName:     string
  sessionDate?:    string | null
  associationName: string
  displayCode?:    string | null
  cartons:         CartonPdfData[]
  amount:          number
  paiementId:      string
}

export interface ReminderMailOptions {
  to:              string
  firstName:       string
  lastName:        string
  sessionName:     string
  sessionDate?:    string | null
  associationName: string
  displayCode?:    string | null
  cartons:         CartonPdfData[]
  paiementId:      string
}

// ─────────────────────────────────────────
// Confirmation de commande
// ─────────────────────────────────────────

export async function sendOrderConfirmation(opts: OrderMailOptions): Promise<void> {
  const {
    to, firstName, lastName, sessionName, sessionDate,
    associationName, displayCode, cartons, amount, paiementId,
  } = opts

  const ref     = paiementId.slice(0, 8).toUpperCase()
  const dateStr = toDateStr(sessionDate)

  const [html, pdfBuffer] = await Promise.all([
    Promise.resolve(buildOrderConfirmationHtml({
      firstName, lastName, sessionName, dateStr, associationName,
      displayCode, cartons, amount, ref, paiementId,
    })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    renderToBuffer(React.createElement(CartonsPdfDocument, { cartons, sessionName }) as any),
  ])

  await resend.emails.send({
    from:    FROM,
    to,
    subject: `Vos ${cartons.length} carton${cartons.length > 1 ? 's' : ''} pour ${sessionName} — Réf. ${ref}`,
    html,
    attachments: [
      {
        filename: `cartons-quineo-${ref}.pdf`,
        content:  Buffer.from(pdfBuffer),
      },
    ],
  })
}

// ─────────────────────────────────────────
// Rappel J-1
// ─────────────────────────────────────────

export async function sendReminderEmail(opts: ReminderMailOptions): Promise<void> {
  const {
    to, firstName, lastName, sessionName, sessionDate,
    associationName, displayCode, cartons, paiementId,
  } = opts

  const ref     = paiementId.slice(0, 8).toUpperCase()
  const dateStr = toDateStr(sessionDate)

  const html = buildReminderHtml({
    firstName, lastName, sessionName, dateStr,
    associationName, displayCode, cartons, ref, paiementId,
  })

  await resend.emails.send({
    from:    FROM,
    to,
    subject: `C'est demain ! Votre loto "${sessionName}" — Réf. ${ref}`,
    html,
  })
}

// ─────────────────────────────────────────
// Helpers internes
// ─────────────────────────────────────────

function toDateStr(date?: string | null): string | null {
  if (!date) return null
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}
