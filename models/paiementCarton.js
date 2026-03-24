'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PaiementCarton extends Model {
    static associate(models) {
      PaiementCarton.belongsTo(models.Paiement, { foreignKey: 'paiement_id', as: 'paiement' });
      PaiementCarton.belongsTo(models.Carton, { foreignKey: 'carton_id', as: 'carton' });
      PaiementCarton.belongsTo(models.CartonPack, { foreignKey: 'carton_pack_id', as: 'carton_pack' });
    }
  }

  PaiementCarton.init({
    paiement_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      references: { model: 'paiements', key: 'id' },
    },
    carton_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      references: { model: 'cartons', key: 'id' },
    },
    carton_pack_id: {
      type: DataTypes.UUID,
      references: { model: 'carton_packs', key: 'id' },
      comment: 'Forfait appliqué, null si achat unitaire',
    },
  }, {
    sequelize,
    modelName: 'PaiementCarton',
    tableName: 'paiement_cartons',
    underscored: true,
    timestamps: true,
    updatedAt: false,
  });

  return PaiementCarton;
};
