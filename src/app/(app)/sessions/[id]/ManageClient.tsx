'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { MetricCard } from '@/components/dashboard/MetricCard'
import type { SessionStatus } from '@/types/session'

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

interface LotRow {
  id:     string
  name:   string
  value?: number
  status: 'pending' | 'drawn' | 'cancelled'
}

interface PackRow {
  id:           string
  label:        string
  quantity:     number
  price:        number
  is_active:    boolean
}

interface PackFormState {
  label:    string
  quantity: string
  price:    string
}

const EMPTY_FORM: PackFormState = { label: '', quantity: '1', price: '' }

interface SessionManageData {
  id:            string
  name:          string
  date?:         string
  description?:  string
  max_cartons?:  number
  status:        SessionStatus
  cartonsSold:   number
  revenue:       number
  lots:          LotRow[]
  packs:         PackRow[]
  display_code?: string
}

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

const STATUS_LABELS: Record<SessionStatus, string> = {
  draft:     'Brouillon',
  open:      'Ventes ouvertes',
  running:   'En cours',
  closed:    'Terminée',
  cancelled: 'Annulée',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

// Transitions possibles depuis un statut donné
const NEXT_STATUSES: Partial<Record<SessionStatus, { status: SessionStatus; label: string; variant: 'primary' | 'secondary' | 'danger' }[]>> = {
  open:    [
    { status: 'running',   label: 'Démarrer le tirage',  variant: 'primary'   },
    { status: 'cancelled', label: 'Annuler la session',   variant: 'danger'    },
  ],
  running: [
    { status: 'closed',    label: 'Clôturer la session', variant: 'primary'   },
    { status: 'cancelled', label: 'Annuler la session',  variant: 'danger'    },
  ],
}

// ─────────────────────────────────────────
// ConfirmDialog
// ─────────────────────────────────────────

interface ConfirmDialogProps {
  title:     string
  message:   string
  onConfirm: () => void
  onCancel:  () => void
  loading?:  boolean
}

function ConfirmDialog({ title, message, onConfirm, onCancel, loading }: ConfirmDialogProps) {
  return (
    <div
      style={{
        position:       'fixed',
        inset:          0,
        zIndex:         1000,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        background:     'rgba(0,0,0,.35)',
        backdropFilter: 'blur(2px)',
      }}
    >
      <div
        className="rounded-[12px] flex flex-col gap-[16px]"
        style={{
          background: 'var(--color-card)',
          border:     '.5px solid var(--color-border)',
          padding:    '24px 28px',
          maxWidth:   420,
          width:      '90%',
          boxShadow:  '0 8px 32px rgba(0,0,0,.18)',
        }}
      >
        <div className="font-display" style={{ fontSize: 18, color: 'var(--color-text-primary)' }}>
          {title}
        </div>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>
          {message}
        </p>
        <div className="flex justify-end gap-[8px]">
          <button
            onClick={onCancel}
            disabled={loading}
            className="rounded-[7px] px-[14px] py-[7px] font-bold hover:opacity-70 transition-opacity disabled:opacity-40"
            style={{ fontSize: 13, background: 'var(--color-bg)', border: '.5px solid var(--color-border)', color: 'var(--color-text-secondary)', cursor: loading ? 'wait' : 'pointer' }}
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="rounded-[7px] px-[14px] py-[7px] font-bold transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{ fontSize: 13, background: 'var(--color-qred)', color: '#fff', border: 'none', cursor: loading ? 'wait' : 'pointer' }}
          >
            {loading ? 'En cours…' : 'Confirmer'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// Composant
// ─────────────────────────────────────────

type ConfirmState = { action: 'status'; nextStatus: SessionStatus } | { action: 'delete' }

export function ManageSessionClient({ session }: { session: SessionManageData }) {
  const router = useRouter()
  const [statusLoading, setStatusLoading] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [error, setError] = useState('')
  const [codeLoading, setCodeLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [confirm, setConfirm] = useState<ConfirmState | null>(null)

  // Pack management state
  const [showPackForm, setShowPackForm] = useState(false)
  const [packForm, setPackForm] = useState<PackFormState>(EMPTY_FORM)
  const [packFormError, setPackFormError] = useState('')
  const [packSaving, setPackSaving] = useState(false)
  const [editingPackId, setEditingPackId] = useState<string | null>(null)
  const [deletingPackId, setDeletingPackId] = useState<string | null>(null)

  async function handleGenerateCode() {
    setCodeLoading(true)
    const res = await fetch(`/api/sessions/${session.id}/display-code`, { method: 'POST' })
    setCodeLoading(false)
    if (res.ok) router.refresh()
  }

  async function handleCopyCode() {
    if (!session.display_code) return
    await navigator.clipboard.writeText(session.display_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function openAddPack() {
    setEditingPackId(null)
    setPackForm(EMPTY_FORM)
    setPackFormError('')
    setShowPackForm(true)
  }

  function openEditPack(pack: PackRow) {
    setEditingPackId(pack.id)
    setPackForm({ label: pack.label, quantity: String(pack.quantity), price: String(pack.price) })
    setPackFormError('')
    setShowPackForm(true)
  }

  function cancelPackForm() {
    setShowPackForm(false)
    setEditingPackId(null)
    setPackForm(EMPTY_FORM)
    setPackFormError('')
  }

  async function handleSavePack() {
    const label    = packForm.label.trim()
    const quantity = parseInt(packForm.quantity, 10)
    const price    = parseFloat(packForm.price)

    if (!label)             return setPackFormError('Le libellé est requis.')
    if (!quantity || quantity < 1) return setPackFormError('La quantité doit être ≥ 1.')
    if (isNaN(price) || price < 0) return setPackFormError('Le prix doit être un nombre positif.')

    setPackSaving(true)
    setPackFormError('')

    const url    = editingPackId
      ? `/api/sessions/${session.id}/carton-packs/${editingPackId}`
      : `/api/sessions/${session.id}/carton-packs`
    const method = editingPackId ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label, quantity, price }),
    })

    setPackSaving(false)
    if (!res.ok) {
      const data = await res.json()
      setPackFormError(data.error ?? 'Erreur lors de la sauvegarde.')
      return
    }
    cancelPackForm()
    router.refresh()
  }

  async function handleDeletePack(packId: string) {
    setDeletingPackId(packId)
    await fetch(`/api/sessions/${session.id}/carton-packs/${packId}`, { method: 'DELETE' })
    setDeletingPackId(null)
    router.refresh()
  }

  async function handleTogglePack(pack: PackRow) {
    await fetch(`/api/sessions/${session.id}/carton-packs/${pack.id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ is_active: !pack.is_active }),
    })
    router.refresh()
  }

  const cartonsProgress = session.max_cartons && session.max_cartons > 0
    ? Math.round((session.cartonsSold / session.max_cartons) * 100)
    : undefined

  const lotsTotal = session.lots.length
  const lotsDrawn = session.lots.filter(l => l.status === 'drawn').length

  async function handleStatusChange(nextStatus: SessionStatus) {
    setConfirm(null)
    setStatusLoading(nextStatus)
    setError('')
    const res = await fetch(`/api/sessions/${session.id}/status`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ status: nextStatus }),
    })
    setStatusLoading(null)
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Erreur lors du changement de statut')
      return
    }
    router.refresh()
  }

  async function handleDelete() {
    setDeleteLoading(true)
    const res = await fetch(`/api/sessions/${session.id}`, { method: 'DELETE' })
    setDeleteLoading(false)
    setConfirm(null)
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Erreur lors de la suppression')
      return
    }
    router.push('/sessions')
  }

  function requestConfirm(c: ConfirmState) {
    setError('')
    setConfirm(c)
  }

  const transitions = NEXT_STATUSES[session.status] ?? []
  const badgeVariant: 'active' | 'running' | 'draft' | 'closed' | 'cancelled' =
    session.status === 'open' ? 'active'
    : session.status === 'running' ? 'running'
    : session.status === 'closed' ? 'closed'
    : session.status === 'cancelled' ? 'cancelled'
    : 'draft'

  // Labels pour la modale de confirmation
  const confirmProps: Omit<ConfirmDialogProps, 'onConfirm' | 'onCancel'> | null = confirm === null ? null
    : confirm.action === 'delete'
      ? {
          title:   'Supprimer la session',
          message: 'Cette session sera définitivement supprimée avec tous ses lots, cartons et tirages associés. Cette action est irréversible.',
          loading: deleteLoading,
        }
      : confirm.nextStatus === 'closed'
        ? {
            title:   'Clôturer la session',
            message: 'La session sera marquée comme terminée. Le tirage ne pourra plus être relancé.',
            loading: statusLoading !== null,
          }
        : confirm.nextStatus === 'cancelled'
          ? {
              title:   'Annuler la session',
              message: 'La session sera annulée définitivement. Cette action est irréversible.',
              loading: statusLoading !== null,
            }
          : {
              title:   'Confirmer',
              message: 'Voulez-vous continuer ?',
              loading: statusLoading !== null,
            }

  return (
    <div className="flex flex-col gap-[14px]">

      {/* ── En-tête ── */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-[10px]">
          <Link href="/sessions">
            <Button variant="ghost" size="sm">← Retour</Button>
          </Link>
          <div>
            <div className="flex items-center gap-[8px]">
              <h1
                className="font-display leading-none"
                style={{ fontSize: 26, color: 'var(--color-text-primary)' }}
              >
                {session.name}
              </h1>
              <Badge variant={badgeVariant}>{STATUS_LABELS[session.status]}</Badge>
            </div>
            {session.date && (
              <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 3 }}>
                {formatDate(session.date)}
              </p>
            )}
          </div>
        </div>

        {/* Actions de statut */}
        <div className="flex items-center gap-[8px]">
          {transitions.map((t) => (
            <Button
              key={t.status}
              variant={t.variant}
              size="sm"
              disabled={statusLoading !== null || deleteLoading}
              loading={statusLoading === t.status}
              onClick={() => requestConfirm({ action: 'status', nextStatus: t.status })}
            >
              {t.label}
            </Button>
          ))}
          {session.status === 'draft' && (
            <Button
              variant="danger"
              size="sm"
              disabled={deleteLoading}
              loading={deleteLoading}
              onClick={() => requestConfirm({ action: 'delete' })}
            >
              Supprimer
            </Button>
          )}
          <Link href={`/sessions/${session.id}/edit`}>
            <Button variant="secondary" size="sm">Modifier</Button>
          </Link>
        </div>
      </div>

      {/* Erreur statut */}
      {error && (
        <div
          className="rounded-[7px] px-[12px] py-[8px]"
          style={{ background: '#FEF2F2', fontSize: 12, color: 'var(--color-qred)', border: '.5px solid var(--color-qred)' }}
        >
          {error}
        </div>
      )}

      {/* ── Métriques ── */}
      <div className="grid gap-[10px]" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <MetricCard
          label="Cartons vendus"
          value={String(session.cartonsSold)}
          progress={cartonsProgress}
          sub={
            session.max_cartons
              ? `${cartonsProgress ?? 0} % sur ${session.max_cartons} max`
              : 'Pas de maximum défini'
          }
        />
        <MetricCard
          label="Recettes"
          value={session.revenue > 0 ? `${session.revenue.toLocaleString('fr-FR')} €` : '0 €'}
        />
        <MetricCard
          label="Lots attribués"
          value={lotsTotal > 0 ? `${lotsDrawn} / ${lotsTotal}` : '—'}
          sub={lotsTotal > 0 ? `${lotsTotal - lotsDrawn} lot${lotsTotal - lotsDrawn > 1 ? 's' : ''} restant${lotsTotal - lotsDrawn > 1 ? 's' : ''}` : 'Aucun lot'}
        />
      </div>

      {/* ── Contenu principal ── */}
      <div className="grid gap-[12px]" style={{ gridTemplateColumns: '1.4fr 1fr' }}>

        {/* Lots */}
        <Card
          title="Lots"
          headerRight={
            <Link href="/lots" className="font-bold hover:opacity-70 transition-opacity"
              style={{ fontSize: 11, color: 'var(--color-qblue)' }}>
              Gérer →
            </Link>
          }
        >
          {session.lots.length === 0 ? (
            <p style={{ fontSize: 11, color: 'var(--color-text-hint)' }}>
              Aucun lot configuré.{' '}
              <Link href="/lots" style={{ color: 'var(--color-qblue)' }}>Ajouter un lot →</Link>
            </p>
          ) : (
            <ul className="list-none m-0 p-0">
              {session.lots.map((lot, i) => (
                <li
                  key={lot.id}
                  className="flex items-center gap-[10px] py-[8px]"
                  style={{ borderTop: i === 0 ? 'none' : '.5px solid var(--color-sep)' }}
                >
                  <div
                    aria-hidden="true"
                    className="flex-shrink-0 rounded-[5px] flex items-center justify-center"
                    style={{ width: 30, height: 30, background: 'var(--color-bg)', border: '.5px solid var(--color-border)' }}
                  >
                    <svg viewBox="0 0 16 16" width="13" height="13" fill="none" aria-hidden="true">
                      <rect x="1" y="3" width="14" height="10" rx="1.5" stroke="var(--color-amber)" strokeWidth="1.3" />
                      <circle cx="8" cy="8" r="2.5" stroke="var(--color-amber)" strokeWidth="1.2" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold truncate" style={{ fontSize: 12, color: 'var(--color-text-primary)' }}>
                      {lot.name}
                    </div>
                  </div>
                  {lot.value !== undefined && (
                    <span className="font-display flex-shrink-0" style={{ fontSize: 16, color: 'var(--color-amber)' }}>
                      {lot.value} €
                    </span>
                  )}
                  <Badge variant={lot.status === 'drawn' ? 'won' : lot.status === 'pending' ? 'pending' : 'cancelled'} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Colonne droite */}
        <div className="flex flex-col gap-[12px]">

          {/* Raccourcis */}
          <Card title="Accès rapide">
            <div className="grid gap-[8px]" style={{ gridTemplateColumns: '1fr 1fr' }}>
              {[
                { href: '/tirage',  label: 'Tirage',   icon: '🎱' },
                { href: '/caisse',  label: 'Caisse',   icon: '🏧' },
                { href: '/cartons', label: 'Cartons',  icon: '🃏' },
                { href: '/lots',    label: 'Lots',     icon: '🎁' },
              ].map(({ href, label, icon }) => (
                <Link key={href} href={href}>
                  <div
                    className="rounded-[8px] px-[12px] py-[10px] flex items-center gap-[8px] cursor-pointer hover:bg-[var(--color-qblue-bg)] transition-colors duration-[150ms]"
                    style={{ background: 'var(--color-bg)', border: '.5px solid var(--color-sep)' }}
                  >
                    <span style={{ fontSize: 16 }}>{icon}</span>
                    <span className="font-bold" style={{ fontSize: 12, color: 'var(--color-text-primary)' }}>
                      {label}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          {/* Code de diffusion */}
          <Card title="Code de diffusion">
            {session.display_code ? (
              <div className="flex flex-col gap-[10px]">
                <div className="flex items-center justify-between">
                  <span
                    className="font-display tracking-[.2em]"
                    style={{ fontSize: 36, color: 'var(--color-amber)', letterSpacing: '.22em' }}
                  >
                    {session.display_code}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="rounded-[6px] px-[10px] py-[5px] font-bold transition-opacity hover:opacity-70"
                    style={{ fontSize: 11, background: 'var(--color-bg)', border: '.5px solid var(--color-border)', color: 'var(--color-text-secondary)', cursor: 'pointer' }}
                  >
                    {copied ? 'Copié ✓' : 'Copier'}
                  </button>
                </div>
                <p style={{ fontSize: 11, color: 'var(--color-text-hint)', margin: 0 }}>
                  Communiquez ce code aux participants pour qu&apos;ils suivent le loto sur{' '}
                  <span style={{ color: 'var(--color-text-secondary)' }}>quineo.fr/display</span>
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-[8px]">
                <p style={{ fontSize: 11, color: 'var(--color-text-hint)', margin: 0 }}>
                  Aucun code généré. Les participants ne peuvent pas rejoindre l&apos;écran de diffusion.
                </p>
                <button
                  onClick={handleGenerateCode}
                  disabled={codeLoading}
                  className="rounded-[7px] px-[12px] py-[7px] font-bold transition-opacity hover:opacity-90 disabled:opacity-40"
                  style={{ fontSize: 12, background: 'var(--color-amber)', color: '#2C1500', border: 'none', cursor: codeLoading ? 'wait' : 'pointer', alignSelf: 'flex-start' }}
                >
                  {codeLoading ? 'Génération…' : 'Générer un code →'}
                </button>
              </div>
            )}
          </Card>

          {/* Forfaits */}
          <Card
            title="Forfaits cartons"
            headerRight={
              <button
                onClick={openAddPack}
                className="font-bold hover:opacity-70 transition-opacity"
                style={{ fontSize: 11, color: 'var(--color-qblue)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                + Ajouter
              </button>
            }
          >
            {/* Formulaire ajout / modification */}
            {showPackForm && (
              <div
                className="rounded-[8px] p-[12px] mb-[10px] flex flex-col gap-[8px]"
                style={{ background: 'var(--color-bg)', border: '.5px solid var(--color-sep)' }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                  {editingPackId ? 'Modifier le forfait' : 'Nouveau forfait'}
                </div>
                <input
                  type="text"
                  placeholder="Libellé (ex. Carton individuel)"
                  value={packForm.label}
                  onChange={e => setPackForm(f => ({ ...f, label: e.target.value }))}
                  className="rounded-[6px] px-[9px] py-[6px] w-full"
                  style={{ fontSize: 12, border: '.5px solid var(--color-border)', background: 'var(--color-card)', color: 'var(--color-text-primary)', outline: 'none' }}
                />
                <div className="flex gap-[8px]">
                  <input
                    type="number"
                    placeholder="Qté cartons"
                    min={1}
                    value={packForm.quantity}
                    onChange={e => setPackForm(f => ({ ...f, quantity: e.target.value }))}
                    className="rounded-[6px] px-[9px] py-[6px] flex-1"
                    style={{ fontSize: 12, border: '.5px solid var(--color-border)', background: 'var(--color-card)', color: 'var(--color-text-primary)', outline: 'none' }}
                  />
                  <input
                    type="number"
                    placeholder="Prix (€)"
                    min={0}
                    step={0.5}
                    value={packForm.price}
                    onChange={e => setPackForm(f => ({ ...f, price: e.target.value }))}
                    className="rounded-[6px] px-[9px] py-[6px] flex-1"
                    style={{ fontSize: 12, border: '.5px solid var(--color-border)', background: 'var(--color-card)', color: 'var(--color-text-primary)', outline: 'none' }}
                  />
                </div>
                {packFormError && (
                  <p style={{ fontSize: 11, color: 'var(--color-qred)', margin: 0 }}>{packFormError}</p>
                )}
                <div className="flex gap-[6px] justify-end">
                  <button
                    onClick={cancelPackForm}
                    className="rounded-[6px] px-[10px] py-[5px] font-bold hover:opacity-70 transition-opacity"
                    style={{ fontSize: 11, background: 'var(--color-bg)', border: '.5px solid var(--color-border)', color: 'var(--color-text-secondary)', cursor: 'pointer' }}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSavePack}
                    disabled={packSaving}
                    className="rounded-[6px] px-[10px] py-[5px] font-bold transition-opacity hover:opacity-90 disabled:opacity-40"
                    style={{ fontSize: 11, background: 'var(--color-amber)', color: '#2C1500', border: 'none', cursor: packSaving ? 'wait' : 'pointer' }}
                  >
                    {packSaving ? 'Enregistrement…' : 'Enregistrer'}
                  </button>
                </div>
              </div>
            )}

            {session.packs.length === 0 && !showPackForm ? (
              <p style={{ fontSize: 11, color: 'var(--color-text-hint)' }}>Aucun forfait configuré.</p>
            ) : (
              <ul className="list-none m-0 p-0">
                {session.packs.map((pack, i) => (
                  <li
                    key={pack.id}
                    className="flex items-center justify-between py-[7px]"
                    style={{ borderTop: i === 0 ? 'none' : '.5px solid var(--color-sep)', opacity: pack.is_active ? 1 : 0.5 }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-bold" style={{ fontSize: 12, color: pack.is_active ? 'var(--color-text-primary)' : 'var(--color-text-hint)' }}>
                        {pack.label}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>
                        {pack.quantity} carton{pack.quantity > 1 ? 's' : ''}
                        {!pack.is_active && <span style={{ color: 'var(--color-text-hint)' }}> · inactif</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-[8px]">
                      <div className="font-display" style={{ fontSize: 16, color: 'var(--color-amber)' }}>
                        {pack.price} €
                      </div>
                      <button
                        onClick={() => handleTogglePack(pack)}
                        title={pack.is_active ? 'Désactiver' : 'Activer'}
                        className="rounded-[5px] px-[6px] py-[3px] font-bold transition-opacity hover:opacity-70"
                        style={{ fontSize: 10, background: 'var(--color-bg)', border: '.5px solid var(--color-border)', color: 'var(--color-text-hint)', cursor: 'pointer' }}
                      >
                        {pack.is_active ? 'OFF' : 'ON'}
                      </button>
                      <button
                        onClick={() => openEditPack(pack)}
                        title="Modifier"
                        className="rounded-[5px] px-[6px] py-[3px] transition-opacity hover:opacity-70"
                        style={{ fontSize: 10, background: 'var(--color-bg)', border: '.5px solid var(--color-border)', color: 'var(--color-qblue)', cursor: 'pointer' }}
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => handleDeletePack(pack.id)}
                        disabled={deletingPackId === pack.id}
                        title="Supprimer"
                        className="rounded-[5px] px-[6px] py-[3px] transition-opacity hover:opacity-70 disabled:opacity-30"
                        style={{ fontSize: 10, background: 'var(--color-bg)', border: '.5px solid var(--color-border)', color: 'var(--color-qred)', cursor: deletingPackId === pack.id ? 'wait' : 'pointer' }}
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

        </div>
      </div>

      {/* ── Modale de confirmation ── */}
      {confirm !== null && confirmProps !== null && (
        <ConfirmDialog
          {...confirmProps}
          onConfirm={
            confirm.action === 'delete'
              ? handleDelete
              : () => handleStatusChange(confirm.nextStatus)
          }
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}
