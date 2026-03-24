'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Partner extends Model {
    static associate(models) {
      Partner.belongsTo(models.Session, { foreignKey: 'session_id', as: 'session' });
    }
  }

  Partner.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    session_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'sessions', key: 'id' },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    logo_url: {
      type: DataTypes.STRING,
    },
    website_url: {
      type: DataTypes.STRING,
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    sequelize,
    modelName: 'Partner',
    tableName: 'partners',
    underscored: true,
  });

  return Partner;
};
