/**
 * Template : rappel J-1.
 */

import type { CartonPdfData } from '../cartonPdf'
import {
  cartonBadgesHtml,
  playBlockHtml,
  emailLayout,
} from './shared'

export interface ReminderParams {
  firstName:       string
  lastName:        string
  sessionName:     string
  dateStr:         string | null
  associationName: string
  displayCode?:    string | null
  cartons:         CartonPdfData[]
  ref:             string
  paiementId:      string
}

export function buildReminderHtml(p: ReminderParams): string {
  const {
    firstName, lastName, sessionName, dateStr,
    associationName, displayCode, cartons, ref, paiementId,
  } = p

  const displayLine = displayCode
    ? `<p style="margin:8px 0 0;font-size:12px;color:rgba(255,255,255,.6);">
        Code de session pour l&apos;écran de suivi :
        <strong style="color:#EF9F27;letter-spacing:.12em;">${displayCode}</strong>
       </p>`
    : ''

  const headerHero = `
    <table cellpadding="0" cellspacing="0" style="margin-top:20px;">
      <tr>
        <td style="vertical-align:middle;padding-right:12px;">
          <div style="width:34px;height:34px;background:#854F0B;border-radius:50%;text-align:center;line-height:34px;font-size:18px;">⏰</div>
        </td>
        <td style="vertical-align:middle;">
          <div style="color:#fff;font-size:22px;font-weight:800;letter-spacing:-.02em;">C&apos;est demain !</div>
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
          Le loto <strong>${sessionName}</strong> organisé par <strong>${associationName}</strong>
          a lieu demain. Préparez vos cartons !
        </p>
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

    <!-- Cartons interactifs + code display -->
    <tr>
      <td style="padding:0 28px 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#0b1220;border-radius:8px;padding:16px 20px;">
          <tr><td>
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:rgba(255,255,255,.45);margin-bottom:6px;">
              Suivez votre carton en direct
            </div>
            <div style="font-size:13px;color:rgba(255,255,255,.75);margin-bottom:12px;">
              Pendant le tirage, ouvrez ce lien : les numéros s&apos;afficheront automatiquement sur vos cartons.
            </div>
            <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://quineo.fr'}/play/${paiementId}"
               style="display:inline-block;background:#EF9F27;color:#2C1500;font-weight:700;font-size:12px;padding:8px 18px;border-radius:7px;text-decoration:none;">
              Ouvrir mes cartons interactifs →
            </a>
            ${displayLine}
          </td></tr>
        </table>
      </td>
    </tr>`

  return emailLayout({
    title:           `C'est demain — ${sessionName}`,
    ref,
    headerHero,
    bodyRows,
    associationName,
  })
}
