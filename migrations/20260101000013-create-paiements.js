'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('paiements', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false,
      },
      participant_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'participants', key: 'id' },
        onDelete: 'RESTRICT',
      },
      provider_id: {
        type: Sequelize.UUID,
        references: { model: 'payment_providers', key: 'id' },
        onDelete: 'SET NULL',
        comment: 'NULL pour les paiements CASH et FREE',
      },
      method: {
        type: Sequelize.ENUM('CASH', 'EXTERNAL_TERMINAL', 'ONLINE', 'FREE'),
        allowNull: false,
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      status: {
        type: Sequelize.ENUM('pending', 'completed', 'refunded', 'failed'),
        allowNull: false,
        defaultValue: 'pending',
      },
      reference: {
        type: Sequelize.STRING,
        comment: 'Référence externe (ID transaction provider)',
      },
      paid_at: {
        type: Sequelize.DATE,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('paiements');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_paiements_method";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_paiements_status";');
  },
};
