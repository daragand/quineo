/**
 * Service d'envoi d'emails via Resend.
 * Utilisé côté serveur uniquement.
 */
import { Resend } from 'resend'
import React from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import { CartonsPdfDocument, type CartonPdfData } from './cartonPdf'

// Resend client — instancié une seule fois
const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = 'Quineo <commandes@quineo.fr>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://quineo.fr'

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

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

// ─────────────────────────────────────────
// Envoi
// ─────────────────────────────────────────

export async function sendOrderConfirmation(opts: OrderMailOptions): Promise<void> {
  const {
    to, firstName, lastName, sessionName, sessionDate,
    associationName, displayCode, cartons, amount, paiementId,
  } = opts

  const ref = paiementId.slice(0, 8).toUpperCase()

  const dateStr = sessionDate
    ? new Date(sessionDate).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : null

  // Génère le PDF des cartons côté serveur
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfBuffer = await renderToBuffer(
    React.createElement(CartonsPdfDocument, { cartons, sessionName }) as any
  )

  const html = buildHtml({
    firstName, lastName, sessionName, dateStr, associationName,
    displayCode, cartons, amount, ref,
  })

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
// Template HTML
// ─────────────────────────────────────────

function buildHtml(p: {
  firstName:       string
  lastName:        string
  sessionName:     string
  dateStr:         string | null
  associationName: string
  displayCode?:    string | null
  cartons:         CartonPdfData[]
  amount:          number
  ref:             string
}): string {
  const { firstName, lastName, sessionName, dateStr, associationName, displayCode, cartons, amount, ref } = p

  const amountStr = amount === 0
    ? 'Gratuit'
    : `${amount.toFixed(2).replace('.', ',')} €`

  const cartonBadges = cartons
    .map(c =>
      `<span style="display:inline-block;background:#1e293b;color:#EF9F27;font-weight:700;` +
      `font-size:13px;padding:4px 10px;border-radius:4px;margin:3px;font-family:monospace,sans-serif;` +
      `letter-spacing:.08em;">${c.serial}</span>`
    )
    .join('')

  const displayBlock = displayCode
    ? `<tr><td style="padding:0 28px 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#0b1220;border-radius:8px;padding:16px 20px;">
          <tr>
            <td>
              <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:rgba(255,255,255,.45);margin-bottom:6px;">Le jour du loto</div>
              <div style="font-size:13px;color:rgba(255,255,255,.75);margin-bottom:12px;">
                Suivez le tirage en direct depuis chez vous — code de session :
                <strong style="color:#EF9F27;font-size:15px;letter-spacing:.12em;">${displayCode}</strong>
              </div>
              <a href="${APP_URL}/display" style="display:inline-block;background:#EF9F27;color:#2C1500;font-weight:700;font-size:12px;padding:8px 18px;border-radius:7px;text-decoration:none;">
                Ouvrir l&apos;écran de suivi →
              </a>
            </td>
          </tr>
        </table>
      </td></tr>`
    : ''

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Confirmation de commande — ${sessionName}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">

  <!-- ── Header ── -->
  <tr>
    <td style="background:#0b1220;border-radius:12px 12px 0 0;padding:24px 28px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <span style="display:inline-block;background:#EF9F27;color:#412402;font-weight:900;font-size:15px;width:30px;height:30px;line-height:30px;text-align:center;border-radius:6px;vertical-align:middle;">Q</span>
            <span style="color:#fff;font-size:14px;font-weight:700;margin-left:9px;vertical-align:middle;letter-spacing:.04em;">Quineo</span>
          </td>
          <td align="right">
            <span style="background:rgba(255,255,255,.08);color:rgba(255,255,255,.45);font-size:11px;padding:3px 10px;border-radius:4px;font-family:monospace;">Réf. ${ref}</span>
          </td>
        </tr>
      </table>

      <!-- Icône + titre -->
      <table cellpadding="0" cellspacing="0" style="margin-top:20px;">
        <tr>
          <td style="vertical-align:middle;padding-right:12px;">
            <div style="width:34px;height:34px;background:#276749;border-radius:50%;text-align:center;line-height:34px;">
              <span style="color:white;font-size:16px;">✓</span>
            </div>
          </td>
          <td style="vertical-align:middle;">
            <div style="color:#fff;font-size:22px;font-weight:800;letter-spacing:-.02em;">Commande confirmée !</div>
            <div style="color:rgba(255,255,255,.5);font-size:12px;margin-top:3px;">${sessionName}${dateStr ? ` · ${dateStr}` : ''}</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- ── Body ── -->
  <tr>
    <td style="background:#fff;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none;">
      <table width="100%" cellpadding="0" cellspacing="0">

        <!-- Salutation -->
        <tr>
          <td style="padding:28px 28px 20px;">
            <p style="margin:0;font-size:14px;color:#1e293b;line-height:1.6;">
              Bonjour <strong>${firstName} ${lastName}</strong>,<br/>
              Votre commande pour le loto <strong>${sessionName}</strong> organisé par <strong>${associationName}</strong> est confirmée.
            </p>
          </td>
        </tr>

        <!-- Résumé commande -->
        <tr>
          <td style="padding:0 28px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
              <tr><td style="padding:16px 18px;">
                <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#64748b;margin-bottom:10px;">Détails</div>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="font-size:13px;color:#475569;padding:3px 0;">Nombre de cartons</td>
                    <td align="right" style="font-size:13px;font-weight:700;color:#1e293b;">${cartons.length}</td>
                  </tr>
                  <tr>
                    <td style="font-size:13px;color:#475569;padding:10px 0 3px;border-top:1px solid #e2e8f0;margin-top:6px;">Total payé</td>
                    <td align="right" style="font-size:20px;font-weight:800;color:#EF9F27;padding-top:8px;border-top:1px solid #e2e8f0;">${amountStr}</td>
                  </tr>
                </table>
              </td></tr>
            </table>
          </td>
        </tr>

        <!-- Cartons -->
        <tr>
          <td style="padding:0 28px 20px;">
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#64748b;margin-bottom:8px;">
              Vos ${cartons.length} carton${cartons.length > 1 ? 's' : ''}
            </div>
            <div style="background:#0f172a;border-radius:8px;padding:14px 12px;">
              ${cartonBadges}
            </div>
          </td>
        </tr>

        <!-- Mention PDF -->
        <tr>
          <td style="padding:0 28px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border:1px solid rgba(239,159,39,.3);border-radius:8px;">
              <tr><td style="padding:12px 16px;">
                <span style="font-size:16px;vertical-align:middle;">📄</span>
                <span style="font-size:12px;color:#92400e;margin-left:8px;vertical-align:middle;">
                  Vos cartons sont en pièce jointe au format PDF — imprimez-les ou conservez-les sur votre téléphone.
                </span>
              </td></tr>
            </table>
          </td>
        </tr>

        <!-- Bloc suivi live -->
        ${displayBlock}

        <!-- Séparateur -->
        <tr><td style="padding:0 28px;">
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 16px;"/>
        </td></tr>

        <!-- Footer -->
        <tr>
          <td style="padding:0 28px 28px;text-align:center;">
            <p style="margin:0;font-size:11px;color:#94a3b8;line-height:1.7;">
              ${associationName} · Loto associatif régi par l&apos;art. L.322-4 du CSI<br/>
              Cet email est généré automatiquement, merci de ne pas y répondre.
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>

  <!-- Sub-footer -->
  <tr>
    <td style="padding:16px 0;text-align:center;">
      <span style="font-size:11px;color:#94a3b8;">Propulsé par <strong style="color:#64748b;">Quineo</strong></span>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`
}
