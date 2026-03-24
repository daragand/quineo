'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tirages', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false,
      },
      session_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'sessions', key: 'id' },
        onDelete: 'CASCADE',
      },
      lot_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'lots', key: 'id' },
        onDelete: 'RESTRICT',
      },
      winning_carton_id: {
        type: Sequelize.UUID,
        references: { model: 'cartons', key: 'id' },
        onDelete: 'SET NULL',
      },
      status: {
        type: Sequelize.ENUM('pending', 'running', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending',
      },
      started_at: {
        type: Sequelize.DATE,
      },
      completed_at: {
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

    await queryInterface.addIndex('tirages', ['lot_id'], {
      unique: true,
      name: 'tirages_lot_id_unique',
      // Un lot ne peut être tiré qu'une seule fois
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('tirages');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_tirages_status";');
  },
};
