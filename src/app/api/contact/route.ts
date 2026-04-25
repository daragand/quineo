import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { Resend } from 'resend'
import { rateLimit, getClientIp, tooManyRequests, LIMITS } from '@/lib/rate-limit'

const resend = new Resend(process.env.RESEND_API_KEY)

const ContactSchema = z.object({
  name:    z.string().min(2).max(100),
  email:   z.string().email(),
  subject: z.string().min(2).max(200),
  message: z.string().min(10).max(3000),
})

export async function POST(req: NextRequest) {
  const ip    = getClientIp(req)
  const limit = await rateLimit(`contact:${ip}`, LIMITS.contact)
  if (!limit.success) return tooManyRequests(limit)

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 })
  }

  const parsed = ContactSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides', details: parsed.error.flatten() }, { status: 422 })
  }

  const { name, email, subject, message } = parsed.data

  try {
    await resend.emails.send({
      from:    'Quineo <noreply@quineo.fr>',
      to:      'contact@quineo.fr',
      replyTo: email,
      subject: `[Contact Quineo] ${subject}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
          <h2 style="color:#0D1E2C;margin-bottom:16px;">Nouveau message via le formulaire de contact</h2>
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            <tr>
              <td style="padding:8px 12px;background:#f8fafc;font-weight:700;color:#64748b;width:30%;">Nom</td>
              <td style="padding:8px 12px;border-left:1px solid #e2e8f0;">${name}</td>
            </tr>
            <tr>
              <td style="padding:8px 12px;background:#f8fafc;font-weight:700;color:#64748b;">Email</td>
              <td style="padding:8px 12px;border-left:1px solid #e2e8f0;"><a href="mailto:${email}">${email}</a></td>
            </tr>
            <tr>
              <td style="padding:8px 12px;background:#f8fafc;font-weight:700;color:#64748b;">Sujet</td>
              <td style="padding:8px 12px;border-left:1px solid #e2e8f0;">${subject}</td>
            </tr>
          </table>
          <div style="margin-top:20px;padding:16px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#64748b;margin-bottom:8px;">Message</div>
            <p style="margin:0;font-size:13px;color:#1e293b;line-height:1.6;white-space:pre-wrap;">${message}</p>
          </div>
          <p style="margin-top:20px;font-size:11px;color:#94a3b8;">
            Ce message a été envoyé depuis le formulaire de contact de quineo.fr
          </p>
        </div>
      `,
    })
  } catch {
    return NextResponse.json({ error: "Erreur lors de l'envoi du message" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
