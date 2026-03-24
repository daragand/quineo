'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Paiement extends Model {
    static associate(models) {
      Paiement.belongsTo(models.Participant, { foreignKey: 'participant_id', as: 'participant' });
      Paiement.belongsTo(models.PaymentProvider, { foreignKey: 'provider_id', as: 'provider' });
      Paiement.hasMany(models.PaiementCarton, { foreignKey: 'paiement_id', as: 'paiement_cartons' });
    }
  }

  Paiement.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    participant_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'participants', key: 'id' },
    },
    provider_id: {
      type: DataTypes.UUID,
      references: { model: 'payment_providers', key: 'id' },
      comment: 'Null pour les paiements CASH et FREE',
    },
    method: {
      type: DataTypes.ENUM('CASH', 'EXTERNAL_TERMINAL', 'ONLINE', 'FREE'),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'refunded', 'failed'),
      allowNull: false,
      defaultValue: 'pending',
    },
    reference: {
      type: DataTypes.STRING,
      comment: 'Référence externe (ID transaction provider)',
    },
    paid_at: {
      type: DataTypes.DATE,
    },
  }, {
    sequelize,
    modelName: 'Paiement',
    tableName: 'paiements',
    underscored: true,
  });

  return Paiement;
};
