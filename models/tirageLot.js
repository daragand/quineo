'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TirageLot extends Model {
    static associate(models) {
      TirageLot.belongsTo(models.Tirage, { foreignKey: 'tirage_id', as: 'tirage' });
      TirageLot.belongsTo(models.Lot,    { foreignKey: 'lot_id',    as: 'lot' });
    }
  }

  TirageLot.init({
    tirage_id: { type: DataTypes.UUID, allowNull: false, primaryKey: true },
    lot_id:    { type: DataTypes.UUID, allowNull: false, primaryKey: true },
    order:     { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  }, {
    sequelize,
    modelName:  'TirageLot',
    tableName:  'tirage_lots',
    underscored: true,
    timestamps:  false,
  });

  return TirageLot;
};
