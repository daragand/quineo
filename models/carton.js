'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Carton extends Model {
    static associate(models) {
      Carton.belongsTo(models.Session, { foreignKey: 'session_id', as: 'session' });
      Carton.belongsTo(models.Participant, { foreignKey: 'participant_id', as: 'participant' });
      Carton.hasMany(models.PaiementCarton, { foreignKey: 'carton_id', as: 'paiement_cartons' });
      Carton.hasOne(models.Tirage, { foreignKey: 'winning_carton_id', as: 'tirage_gagne' });
    }
  }

  Carton.init({
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
    participant_id: {
      type: DataTypes.UUID,
      references: { model: 'participants', key: 'id' },
    },
    serial_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    grid: {
      type: DataTypes.JSONB,
      allowNull: false,
      comment: 'Grille de jeu 3x9 : tableau 2D de nombres (0 = case vide)',
    },
    status: {
      type: DataTypes.ENUM('available', 'reserved', 'sold', 'cancelled'),
      allowNull: false,
      defaultValue: 'available',
    },
  }, {
    sequelize,
    modelName: 'Carton',
    tableName: 'cartons',
    underscored: true,
    indexes: [
      { unique: true, fields: ['session_id', 'serial_number'] },
    ],
  });

  return Carton;
};
