import { emailLayout } from './shared'

export interface PasswordResetEmailParams {
  firstName: string
  resetUrl:  string
}

export function buildPasswordResetHtml({ firstName, resetUrl }: PasswordResetEmailParams): string {
  const headerHero = `
    <div style="margin-top:20px;">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:rgba(255,255,255,.45);margin-bottom:6px;">
        Réinitialisation du mot de passe
      </div>
      <div style="font-size:22px;font-weight:800;color:#fff;line-height:1.2;">
        Accès à votre compte Quineo
      </div>
    </div>`

  const bodyRows = `
    <tr>
      <td style="padding:28px 28px 8px;">
        <p style="margin:0;font-size:14px;color:#334155;line-height:1.7;">
          Bonjour ${firstName || 'utilisateur'},
        </p>
        <p style="margin:14px 0 0;font-size:14px;color:#334155;line-height:1.7;">
          Vous avez demandé la réinitialisation de votre mot de passe.
          Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:20px 28px 24px;">
        <a href="${resetUrl}"
           style="display:inline-block;background:#EF9F27;color:#2C1500;font-weight:700;font-size:13px;padding:12px 24px;border-radius:8px;text-decoration:none;">
          Réinitialiser mon mot de passe →
        </a>
      </td>
    </tr>
    <tr>
      <td style="padding:0 28px 20px;">
        <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.7;">
          Ce lien est valable <strong>1 heure</strong>.
          Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email — votre mot de passe reste inchangé.
        </p>
      </td>
    </tr>`

  return emailLayout({
    title:           'Réinitialisation de votre mot de passe — Quineo',
    ref:             'RESET',
    headerHero,
    bodyRows,
    associationName: 'Quineo',
  })
}
