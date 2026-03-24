'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserSession extends Model {
    static associate(models) {
      UserSession.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
      UserSession.belongsTo(models.Session, { foreignKey: 'session_id', as: 'session' });
    }
  }

  UserSession.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    session_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'sessions', key: 'id' },
    },
    role: {
      type: DataTypes.ENUM('admin', 'operator', 'caller', 'cashier'),
      allowNull: false,
      defaultValue: 'operator',
    },
  }, {
    sequelize,
    modelName: 'UserSession',
    tableName: 'user_sessions',
    underscored: true,
    indexes: [
      { unique: true, fields: ['user_id', 'session_id'] },
    ],
  });

  return UserSession;
};
