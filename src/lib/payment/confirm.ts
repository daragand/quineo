/**
 * confirm.ts — Confirmation d'un paiement : marque les cartons comme 'sold',
 * le paiement comme 'completed', et envoie l'email de confirmation.
 * Appelé depuis les webhooks ET depuis la vérification au retour.
 */

import { db }                    from '@/lib/db'
import { sendOrderConfirmation } from '@/lib/mailer'

export async function confirmPayment(paiementId: string, providerReference?: string): Promise<boolean> {
  const paiement = await db.Paiement.findOne({
    where: { id: paiementId, status: 'pending' },
  })
  if (!paiement) return false   // déjà confirmé ou introuvable

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = paiement.toJSON() as any

  await db.sequelize.transaction(async (t: import('sequelize').Transaction) => {
    // Mettre à jour le paiement
    await paiement.update(
      {
        status:    'completed',
        paid_at:   new Date(),
        reference: providerReference ?? p.reference,
      },
      { transaction: t },
    )

    // Récupérer les carton IDs liés à ce paiement
    const pcRows = await db.PaiementCarton.findAll({
      where:      { paiement_id: paiementId },
      attributes: ['carton_id'],
      transaction: t,
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cartonIds = pcRows.map((r: import('sequelize').Model) => (r.toJSON() as any).carton_id as string)

    // Marquer les cartons comme vendus
    await db.Carton.update(
      { status: 'sold' },
      { where: { id: cartonIds, status: 'reserved' }, transaction: t },
    )
  })

  // ── Envoyer l'email de confirmation ──────────────────────────────────────

  try {
    // Recharger les données nécessaires à l'email
    const participant = await db.Participant.findOne({
      where:      { id: p.participant_id },
      attributes: ['first_name', 'last_name', 'email'],
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const part = participant?.toJSON() as any

    const pcRows = await db.PaiementCarton.findAll({
      where:      { paiement_id: paiementId },
      attributes: ['carton_id'],
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cartonIds = pcRows.map((r: import('sequelize').Model) => (r.toJSON() as any).carton_id as string)

    const cartons = await db.Carton.findAll({
      where:      { id: cartonIds },
      attributes: ['id', 'serial_number', 'grid', 'session_id'],
      order:      [['serial_number', 'ASC']],
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const firstCarton = cartons[0]?.toJSON() as any
    if (!firstCarton) return true

    const session = await db.Session.findOne({
      where:   { id: firstCarton.session_id },
      include: [{ model: db.Association, as: 'association', attributes: ['name'] }],
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = session?.toJSON() as any

    const cartonPdfData = cartons.map((c: import('sequelize').Model) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cj = c.toJSON() as any
      return { id: cj.id as string, serial: cj.serial_number as string, grid: (cj.grid as number[][]) ?? [] }
    })

    await sendOrderConfirmation({
      to:              part?.email ?? '',
      firstName:       part?.first_name ?? '',
      lastName:        part?.last_name ?? '',
      sessionName:     (s?.name as string) ?? '',
      sessionDate:     (s?.date as string | null) ?? null,
      associationName: (s?.association?.name as string) ?? '',
      displayCode:     (s?.display_code as string | null) ?? null,
      cartons:         cartonPdfData,
      amount:          parseFloat(p.amount),
      paiementId,
    })
  } catch (err) {
    console.error('[payment/confirm] email error:', err)
  }

  return true
}

/**
 * Libère les réservations expirées (> 30 min) et marque les paiements échoués.
 * À appeler au début de chaque tentative de commande.
 */
export async function releaseExpiredReservations(sessionId: string): Promise<void> {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)

  // Trouver les paiements pending expirés liés à cette session
  const expiredPaiements = await db.sequelize.query(
    `SELECT DISTINCT p.id
     FROM paiements p
     JOIN paiement_cartons pc ON pc.paiement_id = p.id
     JOIN cartons c ON c.id = pc.carton_id
     WHERE p.status = 'pending'
       AND p.created_at < :cutoff
       AND c.session_id = :session_id`,
    {
      replacements: { cutoff: thirtyMinutesAgo, session_id: sessionId },
      type:         'SELECT',
    },
  ) as Array<{ id: string }>

  if (expiredPaiements.length === 0) return

  const paiementIds = expiredPaiements.map(r => r.id)

  // Récupérer les carton IDs à libérer
  const pcRows = await db.PaiementCarton.findAll({
    where:      { paiement_id: paiementIds },
    attributes: ['carton_id'],
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cartonIds = pcRows.map((r: import('sequelize').Model) => (r.toJSON() as any).carton_id as string)

  await db.sequelize.transaction(async (t: import('sequelize').Transaction) => {
    // Libérer les cartons
    if (cartonIds.length > 0) {
      await db.Carton.update(
        { status: 'available', participant_id: null },
        { where: { id: cartonIds, status: 'reserved' }, transaction: t },
      )
    }

    // Marquer les paiements comme échoués
    await db.Paiement.update(
      { status: 'failed' },
      { where: { id: paiementIds, status: 'pending' }, transaction: t },
    )
  })
}
