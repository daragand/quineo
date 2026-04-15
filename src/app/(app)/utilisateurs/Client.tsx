'use client'

import { useState } from 'react'
import { Badge }  from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input }  from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

export type UserRole = 'admin' | 'operator' | 'viewer'

export interface UserRow {
  id:        string
  name:      string
  email:     string
  role:      UserRole
  updatedAt: string | null
  active:    boolean
}

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

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
  admin:    { bg: '#FFF7D6', color: '#7A5000' },
  operator: { bg: '#E5F3FA', color: '#2F72A0' },
  viewer:   { bg: '#f0f2f5', color: '#4a5568' },
}

const AVATAR_COLORS = ['#4A90B8', '#2BBFA4', '#534AB7', '#B84000', '#FFD84D']
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
  return 'Il y a plus d\'une semaine'
}

// ─────────────────────────────────────────
// Modal invitation
// ─────────────────────────────────────────

function InviteModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void
  onSuccess: (user: UserRow) => void
}) {
  const [email,      setEmail]      = useState('')
  const [firstName,  setFirstName]  = useState('')
  const [lastName,   setLastName]   = useState('')
  const [role,       setRole]       = useState<UserRole>('operator')
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState('')
  const [sent,       setSent]       = useState(false)

  async function handleSend() {
    if (!email.includes('@')) { setError('Adresse email invalide'); return }
    setLoading(true)
    setError('')
    const res = await fetch('/api/utilisateurs', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, role, first_name: firstName || undefined, last_name: lastName || undefined }),
    })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Erreur lors de la création')
      return
    }
    const data = await res.json()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const u = data.user as any
    onSuccess({
      id:        u.id,
      name:      [u.first_name, u.last_name].filter(Boolean).join(' ') || email,
      email:     u.email,
      role:      u.role,
      active:    u.active,
      updatedAt: null,
    })
    setSent(true)
    setTimeout(onClose, 1500)
  }

  return (
    <div
      role="dialog" aria-modal="true" aria-label="Inviter un utilisateur"
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,.4)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="rounded-[14px] overflow-hidden w-full"
        style={{ maxWidth: 420, background: 'var(--color-card)', border: '.5px solid var(--color-sep)' }}>
        <div className="flex items-center justify-between px-[20px] py-[14px]"
          style={{ borderBottom: '.5px solid var(--color-sep)' }}>
          <div className="font-bold" style={{ fontSize: 14, color: 'var(--color-text-primary)' }}>
            Inviter un utilisateur
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer"
            className="rounded-full flex items-center justify-center cursor-pointer transition-colors duration-[150ms] hover:bg-[var(--color-bg)]"
            style={{ width: 26, height: 26, border: 'none', background: 'transparent', color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', fontSize: 16 }}>
            ×
          </button>
        </div>
        <div className="px-[20px] py-[18px]">
          {sent ? (
            <div className="text-center py-[16px]">
              <div className="font-bold mb-[4px]" style={{ fontSize: 14, color: 'var(--color-qgreen-text)' }}>
                Utilisateur créé ✓
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                Compte créé pour {email}
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-[10px] mb-[12px]" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <Input label="Prénom" placeholder="Jean" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                <Input label="Nom" placeholder="Dupont" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
              <div className="mb-[12px]">
                <Input label="Adresse email" type="email" placeholder="jean.dupont@association.fr"
                  value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="mb-[16px]">
                <Select label="Rôle" value={role} onChange={(e) => setRole(e.target.value as UserRole)}
                  options={[
                    { value: 'admin',    label: 'Administrateur' },
                    { value: 'operator', label: 'Opérateur' },
                    { value: 'viewer',   label: 'Lecteur' },
                  ]} />
                <div className="mt-[6px] rounded-[6px] px-[10px] py-[7px]"
                  style={{ background: 'var(--color-bg)', fontSize: 11, color: 'var(--color-text-secondary)' }}>
                  {ROLE_DESC[role]}
                </div>
              </div>
              {error && (
                <div className="mb-[10px] rounded-[6px] px-[10px] py-[7px]"
                  style={{ background: '#FEF2F2', fontSize: 12, color: 'var(--color-qred)' }}>
                  {error}
                </div>
              )}
              <div className="flex gap-[8px]">
                <Button variant="primary" size="sm" fullWidth onClick={handleSend} disabled={loading}>
                  {loading ? 'Création…' : 'Créer le compte'}
                </Button>
                <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>Annuler</Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// Modal édition
// ─────────────────────────────────────────

function EditModal({
  user,
  onClose,
  onSuccess,
}: {
  user: UserRow
  onClose: () => void
  onSuccess: (updated: Partial<UserRow>) => void
}) {
  const nameParts = user.name.split(' ')
  const [firstName, setFirstName] = useState(nameParts[0] ?? '')
  const [lastName,  setLastName]  = useState(nameParts.slice(1).join(' ') ?? '')
  const [role,      setRole]      = useState<UserRole>(user.role)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')

  async function handleSave() {
    setLoading(true)
    setError('')
    const res = await fetch(`/api/utilisateurs/${user.id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ first_name: firstName || undefined, last_name: lastName || undefined, role }),
    })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Erreur lors de la mise à jour')
      return
    }
    onSuccess({
      role,
      name: [firstName, lastName].filter(Boolean).join(' ') || user.email,
    })
    onClose()
  }

  return (
    <div
      role="dialog" aria-modal="true" aria-label="Modifier l'utilisateur"
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,.4)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="rounded-[14px] overflow-hidden w-full"
        style={{ maxWidth: 380, background: 'var(--color-card)', border: '.5px solid var(--color-sep)' }}>
        <div className="flex items-center justify-between px-[20px] py-[14px]"
          style={{ borderBottom: '.5px solid var(--color-sep)' }}>
          <div className="font-bold" style={{ fontSize: 14, color: 'var(--color-text-primary)' }}>
            Modifier — {user.name}
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer"
            className="rounded-full flex items-center justify-center cursor-pointer hover:bg-[var(--color-bg)]"
            style={{ width: 26, height: 26, border: 'none', background: 'transparent', fontSize: 16, fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>
            ×
          </button>
        </div>
        <div className="px-[20px] py-[18px] flex flex-col gap-[10px]">
          <div className="grid gap-[10px]" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <Input label="Prénom" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            <Input label="Nom" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <Select label="Rôle" value={role} onChange={(e) => setRole(e.target.value as UserRole)}
            options={[
              { value: 'admin',    label: 'Administrateur' },
              { value: 'operator', label: 'Opérateur' },
              { value: 'viewer',   label: 'Lecteur' },
            ]} />
          {error && (
            <div className="rounded-[6px] px-[10px] py-[7px]"
              style={{ background: '#FEF2F2', fontSize: 12, color: 'var(--color-qred)' }}>
              {error}
            </div>
          )}
          <div className="flex gap-[8px]">
            <Button variant="primary" size="sm" fullWidth onClick={handleSave} disabled={loading}>
              {loading ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>Annuler</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// Composant principal
// ─────────────────────────────────────────

export function UtilisateursClient({ initialUsers }: { initialUsers: UserRow[] }) {
  const [users,       setUsers]       = useState<UserRow[]>(initialUsers)
  const [showInvite,  setShowInvite]  = useState(false)
  const [editUser,    setEditUser]    = useState<UserRow | null>(null)
  const [search,      setSearch]      = useState('')
  const [roleFilter,  setRoleFilter]  = useState('all')
  const [toggling,    setToggling]    = useState<string | null>(null)

  const filtered = users.filter((u) => {
    const matchRole   = roleFilter === 'all' || u.role === roleFilter
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                        u.email.toLowerCase().includes(search.toLowerCase())
    return matchRole && matchSearch
  })

  function handleInviteSuccess(user: UserRow) {
    setUsers((prev) => [...prev, user])
  }

  function handleEditSuccess(id: string, updated: Partial<UserRow>) {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, ...updated } : u))
  }

  async function toggleActive(user: UserRow) {
    setToggling(user.id)
    const res = await fetch(`/api/utilisateurs/${user.id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ active: !user.active }),
    })
    setToggling(null)
    if (res.ok) {
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, active: !user.active } : u))
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-[20px]">
        <div>
          <h1 className="font-display leading-none" style={{ fontSize: 28, color: 'var(--color-text-primary)' }}>
            Utilisateurs
          </h1>
          <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 3 }}>
            {users.filter((u) => u.active).length} membre{users.filter((u) => u.active).length > 1 ? 's' : ''} actif{users.filter((u) => u.active).length > 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowInvite(true)}>
          + Inviter un membre
        </Button>
      </div>

      {/* Rôles */}
      <div className="grid gap-[8px] mb-[20px]" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {(['admin', 'operator', 'viewer'] as UserRole[]).map((r) => {
          const c = ROLE_COLORS[r]
          const count = users.filter((u) => u.role === r).length
          return (
            <div key={r} className="rounded-[8px] px-[14px] py-[10px]"
              style={{ background: 'var(--color-card)', border: '.5px solid var(--color-sep)' }}>
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

      {/* Filtres */}
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

      {/* Liste */}
      <div className="rounded-[10px] overflow-hidden"
        style={{ background: 'var(--color-card)', border: '.5px solid var(--color-sep)' }}>
        {filtered.length === 0 && (
          <div className="text-center py-[32px]" style={{ fontSize: 13, color: 'var(--color-text-hint)' }}>
            Aucun utilisateur trouvé
          </div>
        )}
        {filtered.map((u, i) => {
          const rColor = ROLE_COLORS[u.role]
          return (
            <div key={u.id}
              className="flex items-center gap-[14px] px-[16px] py-[12px] transition-colors duration-[150ms] hover:bg-[var(--color-bg)]"
              style={{ borderBottom: i < filtered.length - 1 ? '.5px solid var(--color-sep)' : undefined }}>
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
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-[7px]">
                  <span className="font-bold"
                    style={{ fontSize: 13, color: u.active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>
                    {u.name}
                  </span>
                  {!u.active && <Badge variant="draft">Désactivé</Badge>}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{u.email}</div>
              </div>
              <span className="font-bold rounded-[4px] px-[8px] py-[2px] flex-shrink-0"
                style={{ fontSize: 10, ...rColor }}>{ROLE_LABELS[u.role]}</span>
              <span className="flex-shrink-0"
                style={{ fontSize: 11, color: 'var(--color-text-hint)', minWidth: 140, textAlign: 'right' }}>
                {relativeTime(u.updatedAt)}
              </span>
              <div className="flex gap-[4px] flex-shrink-0">
                <Button variant="ghost" size="sm" onClick={() => setEditUser(u)}>
                  Modifier
                </Button>
                <Button
                  variant="ghost" size="sm"
                  disabled={toggling === u.id}
                  onClick={() => toggleActive(u)}
                >
                  {toggling === u.id ? '…' : u.active ? 'Désactiver' : 'Réactiver'}
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {showInvite && (
        <InviteModal
          onClose={() => setShowInvite(false)}
          onSuccess={handleInviteSuccess}
        />
      )}
      {editUser && (
        <EditModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onSuccess={(updated) => handleEditSuccess(editUser.id, updated)}
        />
      )}
    </div>
  )
}
