/**
 * Blocs HTML réutilisables entre les templates d'email.
 */

import type { CartonPdfData } from '../cartonPdf'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://quinova.fr'

// ─────────────────────────────────────────
// Éléments atomiques
// ─────────────────────────────────────────

/** Pastilles des numéros de cartons. */
export function cartonBadgesHtml(cartons: CartonPdfData[]): string {
  return cartons
    .map(c =>
      `<span style="display:inline-block;background:#1A3045;color:#FFD84D;font-weight:700;` +
      `font-size:13px;padding:4px 10px;border-radius:4px;margin:3px;font-family:monospace,sans-serif;` +
      `letter-spacing:.08em;">${c.serial}</span>`
    )
    .join('')
}

/** Bloc "Suivez votre carton en direct" (lien /play). */
export function playBlockHtml(paiementId: string): string {
  return `<tr><td style="padding:0 28px 24px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D1E2C;border-radius:8px;padding:16px 20px;">
    <tr><td>
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:rgba(255,255,255,.45);margin-bottom:6px;">
        Suivez votre carton en direct
      </div>
      <div style="font-size:13px;color:rgba(255,255,255,.75);margin-bottom:12px;">
        Pendant le tirage, ouvrez ce lien sur votre téléphone : les numéros appelés s&apos;afficheront automatiquement sur vos cartons.
      </div>
      <a href="${APP_URL}/play/${paiementId}"
         style="display:inline-block;background:#FFD84D;color:#5C3A00;font-weight:700;font-size:12px;padding:8px 18px;border-radius:7px;text-decoration:none;">
        Ouvrir mes cartons interactifs →
      </a>
    </td></tr>
  </table>
</td></tr>`
}

/** Bloc "Le jour du loto" avec code display — absent si displayCode est vide. */
export function displayBlockHtml(displayCode: string | null | undefined): string {
  if (!displayCode) return ''
  return `<tr><td style="padding:0 28px 24px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D1E2C;border-radius:8px;padding:16px 20px;">
    <tr><td>
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:rgba(255,255,255,.45);margin-bottom:6px;">
        Le jour du loto
      </div>
      <div style="font-size:13px;color:rgba(255,255,255,.75);margin-bottom:12px;">
        Suivez le tirage en direct depuis chez vous — code de session :
        <strong style="color:#FFD84D;font-size:15px;letter-spacing:.12em;">${displayCode}</strong>
      </div>
      <a href="${APP_URL}/display"
         style="display:inline-block;background:#FFD84D;color:#5C3A00;font-weight:700;font-size:12px;padding:8px 18px;border-radius:7px;text-decoration:none;">
        Ouvrir l&apos;écran de suivi →
      </a>
    </td></tr>
  </table>
</td></tr>`
}

// ─────────────────────────────────────────
// Layout de base
// ─────────────────────────────────────────

export interface LayoutParams {
  title:           string
  ref:             string
  /** HTML du bandeau coloré (icône + titre) dans le header navy */
  headerHero:      string
  /** HTML des lignes <tr> du body blanc */
  bodyRows:        string
  associationName: string
}

/**
 * Enveloppe HTML complète : fond gris, carte blanche, header navy, footer.
 * Utilisez `headerHero` pour personnaliser la couleur et l'icône du header.
 */
export function emailLayout(p: LayoutParams): string {
  const { title, ref, headerHero, bodyRows, associationName } = p
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">

  <!-- Header navy -->
  <tr>
    <td style="background:#0D1E2C;border-radius:12px 12px 0 0;padding:24px 28px;">
      <!-- Logo + ref -->
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <span style="display:inline-block;background:#FFD84D;color:#5C3A00;font-weight:900;font-size:15px;width:30px;height:30px;line-height:30px;text-align:center;border-radius:6px;vertical-align:middle;">Q</span>
            <span style="color:#fff;font-size:14px;font-weight:700;margin-left:9px;vertical-align:middle;letter-spacing:.04em;">Quinova</span>
          </td>
          <td align="right">
            <span style="background:rgba(255,255,255,.08);color:rgba(255,255,255,.45);font-size:11px;padding:3px 10px;border-radius:4px;font-family:monospace;">Réf.&nbsp;${ref}</span>
          </td>
        </tr>
      </table>
      <!-- Hero -->
      ${headerHero}
    </td>
  </tr>

  <!-- Body blanc -->
  <tr>
    <td style="background:#fff;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none;">
      <table width="100%" cellpadding="0" cellspacing="0">

        ${bodyRows}

        <!-- Séparateur -->
        <tr><td style="padding:0 28px;">
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 16px;"/>
        </td></tr>

        <!-- Footer légal -->
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

  <!-- Sub-footer Quinova -->
  <tr>
    <td style="padding:16px 0;text-align:center;">
      <span style="font-size:11px;color:#94a3b8;">Propulsé par <strong style="color:#64748b;">Quinova</strong></span>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`
}
