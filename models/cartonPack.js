'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CartonPack extends Model {
    static associate(models) {
      CartonPack.belongsTo(models.Session, { foreignKey: 'session_id', as: 'session' });
      CartonPack.hasMany(models.PaiementCarton, { foreignKey: 'carton_pack_id', as: 'paiement_cartons' });
    }
  }

  CartonPack.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    session_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'sessions', key: 'id' },
      // ON DELETE CASCADE défini en migration
    },
    label: {
      type: DataTypes.STRING(80),
      allowNull: false,
      comment: 'Ex : "Lot de 4 cartons"',
    },
    quantity: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    price: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    price_unit: {
      type: DataTypes.DECIMAL(6, 2),
      comment: 'GENERATED ALWAYS AS (price / quantity) STORED — calculé par PostgreSQL, lecture seule',
      set() {
        // Colonne générée côté DB, Sequelize ne doit pas l'écrire
      },
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    display_order: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 0,
    },
    max_per_person: {
      type: DataTypes.SMALLINT,
      comment: 'Limite par participant, NULL = illimité',
    },
  }, {
    sequelize,
    modelName: 'CartonPack',
    tableName: 'carton_packs',
    underscored: true,
    timestamps: true,
    updatedAt: false,
  });

  return CartonPack;
};
