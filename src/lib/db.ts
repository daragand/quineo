/**
 * Singleton Sequelize — charge les modèles CommonJS depuis /models
 * et expose une instance réutilisable dans les Route Handlers Next.js.
 */

import type { Sequelize, Model, ModelStatic } from 'sequelize'

// ─────────────────────────────────────────
// Types des modèles exposés par models/index.js
// ─────────────────────────────────────────

export interface DbModels {
  sequelize:       Sequelize
  Sequelize:       typeof import('sequelize').Sequelize
  Association:     ModelStatic<Model>
  User:            ModelStatic<Model>
  Session:         ModelStatic<Model>
  Lot:             ModelStatic<Model>
  CartonPack:      ModelStatic<Model>
  Carton:          ModelStatic<Model>
  Participant:     ModelStatic<Model>
  Paiement:        ModelStatic<Model>
  PaiementCarton:  ModelStatic<Model>
  Tirage:          ModelStatic<Model>
  DrawEvent:       ModelStatic<Model>
  Partner:         ModelStatic<Model>
  PaymentProvider: ModelStatic<Model>
  UserSession:     ModelStatic<Model>
  MultiWinnerRule: ModelStatic<Model>
  AuditLog:        ModelStatic<Model>
}

// ─────────────────────────────────────────
// Singleton (HMR-safe sur Next.js dev)
// ─────────────────────────────────────────

declare global {
  // eslint-disable-next-line no-var
  var __db: DbModels | undefined
}

function loadDb(): DbModels {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('../../models') as DbModels
}

export const db: DbModels = global.__db ?? loadDb()

if (process.env.NODE_ENV !== 'production') {
  global.__db = db
}
