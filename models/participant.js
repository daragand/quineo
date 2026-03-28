'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Participant extends Model {
    static associate(models) {
      Participant.hasMany(models.Carton, { foreignKey: 'participant_id', as: 'cartons' });
      Participant.hasMany(models.Paiement, { foreignKey: 'participant_id', as: 'paiements' });
    }
  }

  Participant.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    first_name: {
      type: DataTypes.STRING,
    },
    last_name: {
      type: DataTypes.STRING,
    },
    phone: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
      validate: { isEmail: true },
    },
    birth_date: {
      type: DataTypes.DATEONLY,
    },
  }, {
    sequelize,
    modelName: 'Participant',
    tableName: 'participants',
    underscored: true,
  });

  return Participant;
};
