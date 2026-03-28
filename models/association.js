'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Association extends Model {
    static associate(models) {
      Association.hasMany(models.User, { foreignKey: 'association_id', as: 'users' });
      Association.hasMany(models.Session, { foreignKey: 'association_id', as: 'sessions' });
      Association.hasMany(models.PaymentProvider, { foreignKey: 'association_id', as: 'payment_providers' });
    }
  }

  Association.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    siret: {
      type: DataTypes.STRING(14),
    },
    email: {
      type: DataTypes.STRING,
      validate: { isEmail: true },
    },
    phone: {
      type: DataTypes.STRING,
    },
    address: {
      type: DataTypes.TEXT,
    },
    logo_url: {
      type: DataTypes.STRING,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    require_birth_date: {
      type:         DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    sequelize,
    modelName: 'Association',
    tableName: 'associations',
    underscored: true,
  });

  return Association;
};
