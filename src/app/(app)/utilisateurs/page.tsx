'use client'

import { useState } from 'react'
import { Badge }  from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input }  from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

// ─────────────────────────────────────────
// Types & données de démo
// ─────────────────────────────────────────

type UserRole = 'admin' | 'operator' | 'viewer'

interface UserRow {
  id:         string
  name:       string
  email:      string
  role:       UserRole
  lastSeen:   string | null
  active:     boolean
}

const DEMO_USERS: UserRow[] = [
  { id: '1', name: 'Julien Marchetti', email: 'julien@amis-quartier.fr', role: 'admin',    lastSeen: '2025-03-25T09:12:00', active: true  },
  { id: '2', name: 'Sophie Renard',    email: 'sophie@amis-quartier.fr', role: 'operator', lastSeen: '2025-03-24T18:30:00', active: true  },
  { id: '3', name: 'Marc Girard',      email: 'marc@amis-quartier.fr',   role: 'operator', lastSeen: '2025-03-22T14:05:00', active: true  },
  { id: '4', name: 'Claire Dumont',    email: 'claire@amis-quartier.fr', role: 'viewer',   lastSeen: '2025-02-18T10:00:00', active: true  },
  { id: '5', name: 'Thomas Brun',      email: 'thomas@amis-quartier.fr', role: 'operator', lastSeen: null,                  active: false },
]

const ROLE_LABELS: Record<UserRole, string> = {
  admin:    'Administrateur',
  operator: 'Opérateur',
  viewer:   'Lecteur',
}

const ROLE_DESC: Record<UserRole, string> = {
  admin:    'Accès complet — gestion, config, finances',
  operator: 'Création sessions, tirage, caisse',
  viewer:   'Lecture seule — rapports et historiques',
}

const ROLE_COLORS: Record<UserRole, { bg: string; color: string }> = {
  admin:    { bg: '#FFF8EE', color: '#633806' },
  operator: { bg: '#EEF4FC', color: '#0C447C' },
  viewer:   { bg: '#f0f2f5', color: '#4a5568' },
}

const AVATAR_COLORS = ['#185FA5', '#3B6D11', '#534AB7', '#854F0B', '#EF9F27']
function avatarColor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % AVATAR_COLORS.length
  return AVATAR_COLORS[h]
}
function initials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

function relativeTime(iso: string | null) {
  if (!iso) return 'Jamais connecté'
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1)  return 'Il y a moins d\'une heure'
  if (h < 24) return `Il y a ${h}h`
  const d = Math.floor(h / 24)
  if (d < 7)  return `Il y a ${d} jour${d > 1 ? 's' : ''}`
  return `Il y a plus d'une semaine`
}

// ─────────────────────────────────────────
// Modal invitation
// ─────────────────────────────────────────

function InviteModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail]   = useState('')
  const [role, setRole]     = useState<UserRole>('operator')
  const [sent, setSent]     = useState(false)

  function handleSend() {
    if (!email.includes('@')) return
    setSent(true)
    setTimeout(onClose, 1500)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Inviter un utilisateur"
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,.4)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="rounded-[14px] overflow-hidden w-full"
        style={{ maxWidth: 420, background: 'var(--color-card)', border: '.5px solid var(--color-sep)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-[20px] py-[14px]"
          style={{ borderBottom: '.5px solid var(--color-sep)' }}>
          <div className="font-bold" style={{ fontSize: 14, color: 'var(--color-text-primary)' }}>
            Inviter un utilisateur
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-full flex items-center justify-center cursor-pointer transition-colors duration-[150ms] hover:bg-[var(--color-bg)]"
            style={{ width: 26, height: 26, border: 'none', background: 'transparent', color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', fontSize: 16 }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-[20px] py-[18px]">
          {sent ? (
            <div className="text-center py-[16px]">
              <div className="font-bold mb-[4px]" style={{ fontSize: 14, color: 'var(--color-qgreen-text)' }}>
                Invitation envoyée ✓
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                Un email a été envoyé à {email}
              </div>
            </div>
          ) : (
            <>
              <div className="mb-[12px]">
                <Input
                  label="Adresse email"
                  type="email"
                  placeholder="prenom@association.fr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-label="Email de l'invité"
                />
              </div>
              <div className="mb-[16px]">
                <Select
                  label="Rôle"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  aria-label="Rôle"
                  options={[
                    { value: 'admin',    label: 'Administrateur' },
                    { value: 'operator', label: 'Opérateur' },
                    { value: 'viewer',   label: 'Lecteur' },
                  ]}
                />
                <div className="mt-[6px] rounded-[6px] px-[10px] py-[7px]"
                  style={{ background: 'var(--color-bg)', fontSize: 11, color: 'var(--color-text-secondary)' }}>
                  {ROLE_DESC[role]}
                </div>
              </div>
              <div className="flex gap-[8px]">
                <Button variant="primary" size="sm" fullWidth onClick={handleSend}>
                  Envoyer l&apos;invitation
                </Button>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  Annuler
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// Page
// ─────────────────────────────────────────

export default function UtilisateursPage() {
  const [showInvite, setShowInvite] = useState(false)
  const [search, setSearch]         = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  const filtered = DEMO_USERS.filter((u) => {
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    return matchRole && matchSearch
  })

  return (
    <div>
      {/* ── En-tête ── */}
      <div className="flex items-center justify-between mb-[20px]">
        <div>
          <h1 className="font-display leading-none" style={{ fontSize: 28, color: 'var(--color-text-primary)' }}>
            Utilisateurs
          </h1>
          <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 3 }}>
            {DEMO_USERS.filter((u) => u.active).length} membre{DEMO_USERS.filter((u) => u.active).length > 1 ? 's' : ''} actif{DEMO_USERS.filter((u) => u.active).length > 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowInvite(true)}>
          + Inviter un membre
        </Button>
      </div>

      {/* ── Rôles — explication rapide ── */}
      <div className="grid gap-[8px] mb-[20px]" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {(['admin', 'operator', 'viewer'] as UserRole[]).map((r) => {
          const c = ROLE_COLORS[r]
          const count = DEMO_USERS.filter((u) => u.role === r).length
          return (
            <div key={r} className="rounded-[8px] px-[14px] py-[10px]"
              style={{ background: 'var(--color-card)', border: `.5px solid var(--color-sep)` }}>
              <div className="flex items-center justify-between mb-[2px]">
                <span className="font-bold rounded-[4px] px-[7px] py-[1px]"
                  style={{ fontSize: 10, ...c }}>{ROLE_LABELS[r]}</span>
                <span className="font-display" style={{ fontSize: 20, color: 'var(--color-amber)' }}>{count}</span>
              </div>
              <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', marginTop: 3 }}>
                {ROLE_DESC[r]}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Filtres ── */}
      <div className="flex gap-[8px] mb-[14px]">
        <div style={{ flex: 1, maxWidth: 260 }}>
          <Input type="text" placeholder="Nom ou email…" value={search}
            onChange={(e) => setSearch(e.target.value)} aria-label="Rechercher un utilisateur" />
        </div>
        <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
          aria-label="Filtrer par rôle" style={{ width: 160 }}
          options={[
            { value: 'all',      label: 'Tous les rôles' },
            { value: 'admin',    label: 'Administrateur' },
            { value: 'operator', label: 'Opérateur' },
            { value: 'viewer',   label: 'Lecteur' },
          ]} />
      </div>

      {/* ── Liste ── */}
      <div className="rounded-[10px] overflow-hidden"
        style={{ background: 'var(--color-card)', border: '.5px solid var(--color-sep)' }}>

        {filtered.length === 0 && (
          <div className="text-center py-[32px]"
            style={{ fontSize: 13, color: 'var(--color-text-hint)' }}>
            Aucun utilisateur trouvé
          </div>
        )}

        {filtered.map((u, i) => {
          const rColor = ROLE_COLORS[u.role]
          return (
            <div key={u.id}
              className="flex items-center gap-[14px] px-[16px] py-[12px] transition-colors duration-[150ms] hover:bg-[var(--color-bg)]"
              style={{ borderBottom: i < filtered.length - 1 ? '.5px solid var(--color-sep)' : undefined }}>

              {/* Avatar */}
              <div
                className="rounded-full flex items-center justify-center flex-shrink-0 font-bold"
                style={{
                  width: 36, height: 36,
                  background: u.active ? avatarColor(u.name) : 'var(--color-sep)',
                  fontSize: 12,
                  color: u.active ? 'white' : 'var(--color-text-hint)',
                  opacity: u.active ? 1 : 0.6,
                }}
                aria-hidden="true"
              >
                {initials(u.name)}
              </div>

              {/* Infos */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-[7px]">
                  <span className="font-bold" style={{ fontSize: 13, color: u.active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>
                    {u.name}
                  </span>
                  {!u.active && (
                    <Badge variant="draft">Désactivé</Badge>
                  )}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                  {u.email}
                </div>
              </div>

              {/* Rôle */}
              <span className="font-bold rounded-[4px] px-[8px] py-[2px] flex-shrink-0"
                style={{ fontSize: 10, ...rColor }}>
                {ROLE_LABELS[u.role]}
              </span>

              {/* Dernière connexion */}
              <span className="flex-shrink-0" style={{ fontSize: 11, color: 'var(--color-text-hint)', minWidth: 140, textAlign: 'right' }}>
                {relativeTime(u.lastSeen)}
              </span>

              {/* Actions */}
              <div className="flex gap-[4px] flex-shrink-0">
                <Button variant="ghost" size="sm">Modifier</Button>
                {u.active && (
                  <Button variant="ghost" size="sm">Désactiver</Button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal */}
      {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}
    </div>
  )
}
