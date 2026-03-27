'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Lot extends Model {
    static associate(models) {
      Lot.belongsTo(models.Session, { foreignKey: 'session_id', as: 'session' });
      Lot.hasOne(models.Tirage,     { foreignKey: 'lot_id',     as: 'tirage' });
      Lot.belongsToMany(models.Tirage, {
        through:    models.TirageLot,
        foreignKey: 'lot_id',
        otherKey:   'tirage_id',
        as:         'tirages',
      });
    }
  }

  Lot.init({
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
    description: {
      type: DataTypes.TEXT,
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    value: {
      type: DataTypes.DECIMAL(10, 2),
    },
    image_url: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.ENUM('pending', 'drawn', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
    },
  }, {
    sequelize,
    modelName: 'Lot',
    tableName: 'lots',
    underscored: true,
  });

  return Lot;
};
