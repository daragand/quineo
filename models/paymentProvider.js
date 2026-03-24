'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PaymentProvider extends Model {
    static associate(models) {
      PaymentProvider.belongsTo(models.Association, { foreignKey: 'association_id', as: 'association' });
      PaymentProvider.hasMany(models.Paiement, { foreignKey: 'provider_id', as: 'paiements' });
    }
  }

  PaymentProvider.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    association_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'associations', key: 'id' },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('stripe', 'paypal', 'sumup', 'other'),
      allowNull: false,
    },
    config: {
      type: DataTypes.JSONB,
      comment: 'Configuration du provider (clés API, webhooks…) — à chiffrer au niveau applicatif',
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    sequelize,
    modelName: 'PaymentProvider',
    tableName: 'payment_providers',
    underscored: true,
  });

  return PaymentProvider;
};
