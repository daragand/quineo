'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DrawEvent extends Model {
    static associate(models) {
      DrawEvent.belongsTo(models.Tirage, { foreignKey: 'tirage_id', as: 'tirage' });
    }
  }

  DrawEvent.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    tirage_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'tirages', key: 'id' },
    },
    number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 90 },
      comment: 'Numéro tiré (1-90)',
    },
    sequence: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Ordre du numéro dans le tirage',
    },
    drawn_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    sequelize,
    modelName: 'DrawEvent',
    tableName: 'draw_events',
    underscored: true,
    timestamps: true,
    updatedAt: false,
    indexes: [
      { unique: true, fields: ['tirage_id', 'number'] },
      { unique: true, fields: ['tirage_id', 'sequence'] },
    ],
  });

  return DrawEvent;
};
