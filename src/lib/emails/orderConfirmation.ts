/**
 * Template : confirmation de commande (avec PDF en pièce jointe).
 */

import type { CartonPdfData } from '../cartonPdf'
import {
  cartonBadgesHtml,
  playBlockHtml,
  displayBlockHtml,
  emailLayout,
} from './shared'

export interface OrderConfirmationParams {
  firstName:       string
  lastName:        string
  sessionName:     string
  dateStr:         string | null
  associationName: string
  displayCode?:    string | null
  cartons:         CartonPdfData[]
  amount:          number
  ref:             string
  paiementId:      string
}

export function buildOrderConfirmationHtml(p: OrderConfirmationParams): string {
  const {
    firstName, lastName, sessionName, dateStr,
    associationName, displayCode, cartons, amount, ref, paiementId,
  } = p

  const amountStr = amount === 0
    ? 'Gratuit'
    : `${amount.toFixed(2).replace('.', ',')} €`

  const headerHero = `
    <table cellpadding="0" cellspacing="0" style="margin-top:20px;">
      <tr>
        <td style="vertical-align:middle;padding-right:12px;">
          <div style="width:34px;height:34px;background:#276749;border-radius:50%;text-align:center;line-height:34px;">
            <span style="color:white;font-size:16px;">✓</span>
          </div>
        </td>
        <td style="vertical-align:middle;">
          <div style="color:#fff;font-size:22px;font-weight:800;letter-spacing:-.02em;">Commande confirmée !</div>
          <div style="color:rgba(255,255,255,.5);font-size:12px;margin-top:3px;">
            ${sessionName}${dateStr ? ` · ${dateStr}` : ''}
          </div>
        </td>
      </tr>
    </table>`

  const bodyRows = `
    <!-- Salutation -->
    <tr>
      <td style="padding:28px 28px 20px;">
        <p style="margin:0;font-size:14px;color:#1e293b;line-height:1.6;">
          Bonjour <strong>${firstName} ${lastName}</strong>,<br/>
          Votre commande pour le loto <strong>${sessionName}</strong> organisé par
          <strong>${associationName}</strong> est confirmée.
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
                <td style="font-size:13px;color:#475569;padding:10px 0 3px;border-top:1px solid #e2e8f0;">Total payé</td>
                <td align="right" style="font-size:20px;font-weight:800;color:#FFD84D;padding-top:8px;border-top:1px solid #e2e8f0;">${amountStr}</td>
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
          ${cartonBadgesHtml(cartons)}
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

    <!-- Cartons interactifs -->
    ${playBlockHtml(paiementId)}

    <!-- Écran de suivi live -->
    ${displayBlockHtml(displayCode)}`

  return emailLayout({
    title:           `Confirmation de commande — ${sessionName}`,
    ref,
    headerHero,
    bodyRows,
    associationName,
  })
}
