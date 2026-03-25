'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AuditLog extends Model {
    static associate(models) {
      AuditLog.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
      AuditLog.belongsTo(models.Session, { foreignKey: 'session_id', as: 'session' });
    }
  }

  AuditLog.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      references: { model: 'users', key: 'id' },
      comment: 'Null si action système',
    },
    session_id: {
      type: DataTypes.UUID,
      references: { model: 'sessions', key: 'id' },
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Ex : SESSION_STARTED, TIRAGE_COMPLETED, CARTON_SOLD…',
    },
    entity_type: {
      type: DataTypes.STRING,
      comment: 'Nom de la table concernée',
    },
    entity_id: {
      type: DataTypes.STRING,
      comment: "UUID de l'entité concernée",
    },
    details: {
      type: DataTypes.JSONB,
      comment: 'Données supplémentaires contextuelles',
    },
    ip_address: {
      type: DataTypes.STRING(45),
      comment: 'IPv4 ou IPv6',
    },
  }, {
    sequelize,
    modelName: 'AuditLog',
    tableName: 'audit_logs',
    underscored: true,
    timestamps: true,
    updatedAt: false,
  });

  return AuditLog;
};
