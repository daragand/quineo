// ─────────────────────────────────────────
// Statuts & enums
// ─────────────────────────────────────────

export type SessionStatus  = 'draft' | 'open' | 'running' | 'closed' | 'cancelled'
export type TirageType     = 'quine' | 'double_quine' | 'carton_plein'
export type MultiRule      = 'sudden_death' | 'share_lot' | 'each_wins' | 'redraw'
export type PaymentMethod  = 'CASH' | 'EXTERNAL_TERMINAL' | 'ONLINE' | 'FREE'
export type LotStatus      = 'pending' | 'drawn' | 'cancelled'
export type CartonStatus   = 'available' | 'sold' | 'cancelled'
export type UserRole       = 'admin' | 'operator' | 'viewer'
export type UserSessionRole= 'admin' | 'operator' | 'caller' | 'cashier'
export type ProviderType   = 'stripe' | 'paypal' | 'sumup' | 'other'
export type PaiementMethod = 'CASH' | 'EXTERNAL_TERMINAL' | 'ONLINE' | 'FREE'
export type PaiementStatus = 'pending' | 'completed' | 'refunded' | 'failed'

// ─────────────────────────────────────────
// Entités principales
// ─────────────────────────────────────────

export interface Association {
  id: string
  name: string
  siret?: string
  email?: string
  phone?: string
  address?: string
  logo_url?: string
  active: boolean
  created_at: string
  updated_at: string
}

export interface Session {
  id: string
  association_id: string
  name: string
  date?: string
  status: SessionStatus
  max_cartons?: number
  description?: string
  created_at: string
  updated_at: string
  // Relations optionnelles (eager load)
  association?: Association
  lots?: Lot[]
  carton_packs?: CartonPack[]
  partners?: Partner[]
}

export interface Lot {
  id: string
  session_id: string
  name: string
  description?: string
  order: number
  value?: number
  image_url?: string
  status: LotStatus
  created_at: string
  updated_at: string
}

export interface CartonPack {
  id: string
  session_id: string
  label: string
  quantity: number
  price: number
  price_unit?: number   // GENERATED par Postgres
  is_active: boolean
  display_order: number
  max_per_person?: number
  created_at: string
}

export interface Carton {
  id: string
  session_id: string
  participant_id?: string
  serial_number: string
  grid: number[][]    // 3x9
  status: CartonStatus
  created_at: string
  updated_at: string
}

export interface Participant {
  id: string
  first_name?: string
  last_name?: string
  phone?: string
  email?: string
  created_at: string
  updated_at: string
  // Calculé
  cartons_count?: number
}

export interface Tirage {
  id: string
  session_id: string
  lot_id: string
  winning_carton_id?: string
  status: 'pending' | 'running' | 'completed' | 'cancelled'
  started_at?: string
  completed_at?: string
  created_at: string
  updated_at: string
  // Relations
  lot?: Lot
  draw_events?: DrawEvent[]
  winning_carton?: Carton
}

export interface DrawEvent {
  id: string
  tirage_id: string
  number: number       // 1–90
  sequence: number
  drawn_at: string
  created_at: string
}

export interface Partner {
  id: string
  session_id: string
  name: string
  logo_url?: string
  website_url?: string
  order: number
  active: boolean
  created_at: string
  updated_at: string
}

export interface PaymentProvider {
  id: string
  association_id: string
  name: string
  type: ProviderType
  config?: Record<string, unknown>
  active: boolean
  created_at: string
  updated_at: string
}

export interface MultiWinnerRule {
  session_id: string
  lot_id?: string
  rule_type: 'split' | 'redraw' | 'first_complete'
  description?: string
}

// ─────────────────────────────────────────
// Types UI / formulaires
// ─────────────────────────────────────────

/** Résumé affiché dans la sidebar récap de création de session */
export interface SessionDraft {
  name: string
  date?: string
  max_cartons?: number
  packs_count: number
  lots_count: number
  partners_count: number
  enabled_methods: PaymentMethod[]
}

/** Ligne du panier caisse/public */
export interface CartLine {
  pack: CartonPack
  quantity: number
  subtotal: number
}
