'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class MultiWinnerRule extends Model {
    static associate(models) {
      MultiWinnerRule.belongsTo(models.Session, { foreignKey: 'session_id', as: 'session' });
      MultiWinnerRule.belongsTo(models.Lot, { foreignKey: 'lot_id', as: 'lot' });
    }
  }

  MultiWinnerRule.init({
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
      references: { model: 'lots', key: 'id' },
      comment: 'Null = règle globale applicable à toute la session',
    },
    rule_type: {
      type: DataTypes.ENUM('split', 'redraw', 'first_complete'),
      allowNull: false,
      comment: 'split : partage du lot | redraw : retirer | first_complete : premier carton complet',
    },
    description: {
      type: DataTypes.TEXT,
    },
  }, {
    sequelize,
    modelName: 'MultiWinnerRule',
    tableName: 'multi_winner_rules',
    underscored: true,
  });

  return MultiWinnerRule;
};
