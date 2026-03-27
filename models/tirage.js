'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Tirage extends Model {
    static associate(models) {
      Tirage.belongsTo(models.Session, { foreignKey: 'session_id', as: 'session' });
      Tirage.belongsTo(models.Lot,     { foreignKey: { name: 'lot_id', allowNull: true }, as: 'lot' });   // legacy — nullable
      Tirage.belongsTo(models.Carton,  { foreignKey: 'winning_carton_id', as: 'winning_carton' });
      Tirage.hasMany(models.DrawEvent, { foreignKey: 'tirage_id',  as: 'draw_events' });
      Tirage.hasMany(models.TirageLot, { foreignKey: 'tirage_id',  as: 'tirage_lots' });
      Tirage.belongsToMany(models.Lot, {
        through:    models.TirageLot,
        foreignKey: 'tirage_id',
        otherKey:   'lot_id',
        as:         'lots',
      });
    }
  }

  Tirage.init({
    id: {
      type:         DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey:   true,
    },
    session_id: {
      type:      DataTypes.UUID,
      allowNull: false,
    },
    lot_id: {
      type:      DataTypes.UUID,
      allowNull: true,   // nullable — utiliser tirage_lots
    },
    winning_carton_id: {
      type: DataTypes.UUID,
    },
    type: {
      type:         DataTypes.ENUM('quine', 'double_quine', 'carton_plein', 'pause'),
      allowNull:    false,
      defaultValue: 'quine',
    },
    order: {
      type:         DataTypes.INTEGER,
      allowNull:    false,
      defaultValue: 0,
    },
    status: {
      type:         DataTypes.ENUM('draft', 'ready', 'pending', 'running', 'completed', 'cancelled'),
      allowNull:    false,
      defaultValue: 'draft',
    },
    started_at:   { type: DataTypes.DATE },
    completed_at: { type: DataTypes.DATE },
  }, {
    sequelize,
    modelName:   'Tirage',
    tableName:   'tirages',
    underscored: true,
  });

  return Tirage;
};
