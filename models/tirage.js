'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Tirage extends Model {
    static associate(models) {
      Tirage.belongsTo(models.Session, { foreignKey: 'session_id', as: 'session' });
      Tirage.belongsTo(models.Lot, { foreignKey: 'lot_id', as: 'lot' });
      Tirage.belongsTo(models.Carton, { foreignKey: 'winning_carton_id', as: 'winning_carton' });
      Tirage.hasMany(models.DrawEvent, { foreignKey: 'tirage_id', as: 'draw_events' });
    }
  }

  Tirage.init({
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
    lot_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'lots', key: 'id' },
    },
    winning_carton_id: {
      type: DataTypes.UUID,
      references: { model: 'cartons', key: 'id' },
    },
    status: {
      type: DataTypes.ENUM('pending', 'running', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
    },
    started_at: {
      type: DataTypes.DATE,
    },
    completed_at: {
      type: DataTypes.DATE,
    },
  }, {
    sequelize,
    modelName: 'Tirage',
    tableName: 'tirages',
    underscored: true,
  });

  return Tirage;
};
