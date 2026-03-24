'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Session extends Model {
    static associate(models) {
      Session.belongsTo(models.Association, { foreignKey: 'association_id', as: 'association' });
      Session.hasMany(models.UserSession, { foreignKey: 'session_id', as: 'user_sessions' });
      Session.hasMany(models.Lot, { foreignKey: 'session_id', as: 'lots' });
      Session.hasMany(models.CartonPack, { foreignKey: 'session_id', as: 'carton_packs' });
      Session.hasMany(models.Carton, { foreignKey: 'session_id', as: 'cartons' });
      Session.hasMany(models.Tirage, { foreignKey: 'session_id', as: 'tirages' });
      Session.hasMany(models.Partner, { foreignKey: 'session_id', as: 'partners' });
      Session.hasMany(models.MultiWinnerRule, { foreignKey: 'session_id', as: 'multi_winner_rules' });
      Session.hasMany(models.AuditLog, { foreignKey: 'session_id', as: 'audit_logs' });
    }
  }

  Session.init({
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
    date: {
      type: DataTypes.DATEONLY,
    },
    status: {
      type: DataTypes.ENUM('draft', 'open', 'running', 'closed', 'cancelled'),
      allowNull: false,
      defaultValue: 'draft',
    },
    max_cartons: {
      type: DataTypes.INTEGER,
    },
    description: {
      type: DataTypes.TEXT,
    },
  }, {
    sequelize,
    modelName: 'Session',
    tableName: 'sessions',
    underscored: true,
  });

  return Session;
};
