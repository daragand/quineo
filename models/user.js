'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsTo(models.Association, { foreignKey: 'association_id', as: 'association' });
      User.hasMany(models.UserSession, { foreignKey: 'user_id', as: 'user_sessions' });
      User.hasMany(models.AuditLog, { foreignKey: 'user_id', as: 'audit_logs' });
    }
  }

  User.init({
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
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    first_name: {
      type: DataTypes.STRING,
    },
    last_name: {
      type: DataTypes.STRING,
    },
    role: {
      type: DataTypes.ENUM('admin', 'operator', 'viewer'),
      allowNull: false,
      defaultValue: 'operator',
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    underscored: true,
  });

  return User;
};
