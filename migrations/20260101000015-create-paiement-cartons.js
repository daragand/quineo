'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('paiement_cartons', {
      paiement_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        references: { model: 'paiements', key: 'id' },
        onDelete: 'CASCADE',
      },
      carton_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        references: { model: 'cartons', key: 'id' },
        onDelete: 'RESTRICT',
      },
      carton_pack_id: {
        type: Sequelize.UUID,
        references: { model: 'carton_packs', key: 'id' },
        onDelete: 'SET NULL',
        comment: 'Forfait appliqué, NULL si achat unitaire',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('paiement_cartons');
  },
};
